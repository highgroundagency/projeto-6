# O pipeline, estágio por estágio:
#
#   Fonte ─> CI (seguranca ‖ qualidade ‖ jornadas) ─> Imagem ─> [Aprovacao] ─> Implantacao ─> Fumaca
#
# CI: as fitness functions. Os três projetos rodam em paralelo e qualquer um
#     que falhe para o pipeline antes de existir imagem.
# Imagem: a imagem só vai para o ECR depois de passar pelo Trivy.
# Implantacao: CodeDeploy na EC2, com rollback automático se a validação falhar.
# Fumaca: confere de fora, pela internet, o que está no ar.

data "aws_caller_identity" "atual" {}
data "aws_region" "atual" {}

locals {
  conta  = data.aws_caller_identity.atual.account_id
  regiao = data.aws_region.atual.region

  # O CodePipeline resolve isto para o SHA do commit que disparou a execução.
  variaveis_commit = jsonencode([
    { name = "COMMIT_SHA", value = "#{Fonte.CommitId}", type = "PLAINTEXT" },
  ])
}

data "aws_iam_policy_document" "confianca_pipeline" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["codepipeline.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [local.conta]
    }
  }
}

resource "aws_iam_role" "pipeline" {
  name               = "${var.nome}-codepipeline"
  assume_role_policy = data.aws_iam_policy_document.confianca_pipeline.json
}

data "aws_iam_policy_document" "pipeline" {
  statement {
    sid = "Artefatos"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetBucketVersioning",
      "s3:PutObject",
      "s3:PutObjectAcl",
    ]
    resources = [aws_s3_bucket.artefatos.arn, "${aws_s3_bucket.artefatos.arn}/*"]
  }

  statement {
    sid = "ChaveDoAmbiente"
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [var.chave_kms_arn]
  }

  statement {
    sid = "ConexaoGitHub"
    actions = [
      "codestar-connections:UseConnection",
      "codeconnections:UseConnection",
    ]
    resources = [local.conexao_arn]
  }

  statement {
    sid       = "CodeBuild"
    actions   = ["codebuild:StartBuild", "codebuild:BatchGetBuilds"]
    resources = [for projeto in aws_codebuild_project.etapa : projeto.arn]
  }

  statement {
    sid = "CodeDeploy"
    actions = [
      "codedeploy:CreateDeployment",
      "codedeploy:GetApplication",
      "codedeploy:GetApplicationRevision",
      "codedeploy:GetDeployment",
      "codedeploy:GetDeploymentConfig",
      "codedeploy:RegisterApplicationRevision",
    ]
    resources = [
      var.codedeploy_aplicacao_arn,
      "arn:aws:codedeploy:${local.regiao}:${local.conta}:deploymentgroup:${var.codedeploy_aplicacao}/*",
      "arn:aws:codedeploy:${local.regiao}:${local.conta}:deploymentconfig:*",
    ]
  }
}

resource "aws_iam_role_policy" "pipeline" {
  name   = "pipeline"
  role   = aws_iam_role.pipeline.id
  policy = data.aws_iam_policy_document.pipeline.json
}

resource "aws_codepipeline" "principal" {
  name           = var.nome
  role_arn       = aws_iam_role.pipeline.arn
  pipeline_type  = "V2"
  execution_mode = "QUEUED"

  artifact_store {
    type     = "S3"
    location = aws_s3_bucket.artefatos.bucket

    encryption_key {
      type = "KMS"
      id   = var.chave_kms_arn
    }
  }

  stage {
    name = "Fonte"

    action {
      name             = "GitHub"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      namespace        = "Fonte"
      output_artifacts = ["fonte"]

      configuration = {
        ConnectionArn        = local.conexao_arn
        FullRepositoryId     = var.repositorio_github
        BranchName           = var.branch # usado no início manual (Release change)
        OutputArtifactFormat = "CODEBUILD_CLONE_REF"
        # Quem dispara é o bloco `trigger` abaixo, não a detecção implícita:
        # é o par que a documentação da AWS prevê para gatilho com filtro.
        DetectChanges = "false"
      }
    }
  }

  # A regra, declarada: push na branch configurada inicia o pipeline. Nenhum
  # outro evento (pull request, outra branch) inicia. Para conferir o que está
  # valendo na AWS: `aws codepipeline get-pipeline --query pipeline.triggers`.
  trigger {
    provider_type = "CodeStarSourceConnection"

    git_configuration {
      source_action_name = "GitHub"

      push {
        branches {
          includes = [var.branch]
        }
      }
    }
  }

  stage {
    name = "CI"

    dynamic "action" {
      for_each = ["seguranca", "qualidade", "jornadas"]
      content {
        name            = title(action.value)
        category        = "Test"
        owner           = "AWS"
        provider        = "CodeBuild"
        version         = "1"
        run_order       = 1
        input_artifacts = ["fonte"]

        configuration = {
          ProjectName          = aws_codebuild_project.etapa[action.value].name
          EnvironmentVariables = local.variaveis_commit
        }
      }
    }
  }

  stage {
    name = "Imagem"

    action {
      name             = "ConstruirVarrerPublicar"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["fonte"]
      output_artifacts = ["pacote"]

      configuration = {
        ProjectName          = aws_codebuild_project.etapa["imagem"].name
        EnvironmentVariables = local.variaveis_commit
      }
    }
  }

  dynamic "stage" {
    for_each = var.exigir_aprovacao ? [1] : []
    content {
      name = "Aprovacao"

      action {
        name     = "LiberarProducao"
        category = "Approval"
        owner    = "AWS"
        provider = "Manual"
        version  = "1"

        configuration = {
          CustomData = "Imagem do commit #{Fonte.CommitId} passou no CI e no Trivy. Liberar para producao?"
        }
      }
    }
  }

  stage {
    name = "Implantacao"

    action {
      name            = "EC2"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "CodeDeploy"
      version         = "1"
      input_artifacts = ["pacote"]

      configuration = {
        ApplicationName     = var.codedeploy_aplicacao
        DeploymentGroupName = var.codedeploy_grupo
      }
    }
  }

  stage {
    name = "Fumaca"

    action {
      name            = "ConferirProducao"
      category        = "Test"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["fonte"]

      configuration = {
        ProjectName          = aws_codebuild_project.etapa["fumaca"].name
        EnvironmentVariables = local.variaveis_commit
      }
    }
  }
}
