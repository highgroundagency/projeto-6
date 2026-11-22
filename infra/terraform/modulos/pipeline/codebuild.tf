# Os cinco projetos do CodeBuild. O que cada um faz está no buildspec
# versionado em infra/codebuild/: o Terraform só diz ONDE roda, com que
# máquina e com que permissão. Mudar um passo do pipeline é um commit, não um
# terraform apply.

locals {
  projetos = {
    seguranca = {
      descricao    = "CI: Gitleaks, Trivy (dependencias, segredos, licencas, IaC), Hadolint e Terraform"
      buildspec    = "infra/codebuild/seguranca.yml"
      computacao   = "BUILD_GENERAL1_SMALL"
      privilegiado = false
      minutos      = 20
      papel        = aws_iam_role.verificacao.arn
      variaveis    = {}
    }
    qualidade = {
      descricao    = "CI: lint, tipos, testes (com Postgres para RLS), build, vazamento e dossie"
      buildspec    = "infra/codebuild/qualidade.yml"
      computacao   = "BUILD_GENERAL1_MEDIUM"
      privilegiado = true # sobe o Postgres dos testes de RLS num contêiner
      minutos      = 30
      papel        = aws_iam_role.verificacao.arn
      variaveis    = {}
    }
    jornadas = {
      descricao    = "CI: jornadas criticas no Playwright contra o build de producao"
      buildspec    = "infra/codebuild/jornadas.yml"
      computacao   = "BUILD_GENERAL1_MEDIUM"
      privilegiado = false
      minutos      = 30
      papel        = aws_iam_role.verificacao.arn
      variaveis    = {}
    }
    imagem = {
      descricao    = "Build da imagem, Trivy na imagem, SBOM, push no ECR e pacote do CodeDeploy"
      buildspec    = "infra/codebuild/imagem.yml"
      computacao   = "BUILD_GENERAL1_MEDIUM"
      privilegiado = true # docker build
      minutos      = 30
      papel        = aws_iam_role.imagem.arn
      variaveis = {
        REPOSITORIO_ECR      = var.repositorio_ecr_url
        NEXT_PUBLIC_SITE_URL = var.url_site
        NEXT_PUBLIC_REPO_URL = var.url_repositorio
      }
    }
    fumaca = {
      descricao    = "Pos-deploy: versao no ar, TLS, cabecalhos de seguranca e portas fechadas"
      buildspec    = "infra/codebuild/fumaca.yml"
      computacao   = "BUILD_GENERAL1_SMALL"
      privilegiado = false
      minutos      = 15
      papel        = aws_iam_role.verificacao.arn
      variaveis = {
        DOMINIO = var.dominio
      }
    }
  }
}

resource "aws_cloudwatch_log_group" "codebuild" {
  name              = "${var.prefixo_logs}/codebuild"
  retention_in_days = var.retencao_logs_dias
  kms_key_id        = var.chave_kms_arn
}

resource "aws_codebuild_project" "etapa" {
  for_each = local.projetos

  name           = "${var.nome}-${each.key}"
  description    = each.value.descricao
  service_role   = each.value.papel
  build_timeout  = each.value.minutos
  encryption_key = var.chave_kms_arn

  artifacts {
    type = "CODEPIPELINE"
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = each.value.buildspec
  }

  environment {
    type                        = "LINUX_CONTAINER"
    compute_type                = each.value.computacao
    image                       = var.imagem_codebuild
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = each.value.privilegiado

    dynamic "environment_variable" {
      for_each = each.value.variaveis
      content {
        name  = environment_variable.key
        value = environment_variable.value
      }
    }
  }

  cache {
    type  = "LOCAL"
    modes = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_CUSTOM_CACHE"]
  }

  logs_config {
    cloudwatch_logs {
      group_name  = aws_cloudwatch_log_group.codebuild.name
      stream_name = each.key
    }
  }
}

# ---------------------------------------------------------------------------
# Papéis: um para quem só lê e verifica, outro para quem publica imagem
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "confianca_codebuild" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [local.conta]
    }
  }
}

data "aws_iam_policy_document" "codebuild_base" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.codebuild.arn}:*"]
  }

  statement {
    sid = "ArtefatosDoPipeline"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:PutObject",
    ]
    resources = ["${aws_s3_bucket.artefatos.arn}/*"]
  }

  statement {
    sid       = "BucketDeArtefatos"
    actions   = ["s3:GetBucketAcl", "s3:GetBucketLocation"]
    resources = [aws_s3_bucket.artefatos.arn]
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

  # O artefato da fonte é uma referência de clone (CODEBUILD_CLONE_REF): o
  # CodeBuild clona o repositório com histórico, para o Gitleaks varrer tudo.
  statement {
    sid = "CloneDoRepositorio"
    actions = [
      "codestar-connections:UseConnection",
      "codestar-connections:GetConnectionToken",
      "codeconnections:UseConnection",
      "codeconnections:GetConnectionToken",
      "codeconnections:GetConnection",
    ]
    resources = [local.conexao_arn]
  }

  # Relatórios JUnit (Vitest, Gitleaks) aparecem na aba Reports do CodeBuild.
  statement {
    sid = "Relatorios"
    actions = [
      "codebuild:CreateReportGroup",
      "codebuild:CreateReport",
      "codebuild:UpdateReport",
      "codebuild:BatchPutTestCases",
      "codebuild:BatchPutCodeCoverages",
    ]
    resources = ["arn:aws:codebuild:${local.regiao}:${local.conta}:report-group/${var.nome}-*"]
  }
}

resource "aws_iam_role" "verificacao" {
  name               = "${var.nome}-codebuild-verificacao"
  assume_role_policy = data.aws_iam_policy_document.confianca_codebuild.json
}

resource "aws_iam_role_policy" "verificacao" {
  name   = "verificacao"
  role   = aws_iam_role.verificacao.id
  policy = data.aws_iam_policy_document.codebuild_base.json
}

data "aws_iam_policy_document" "codebuild_imagem" {
  source_policy_documents = [data.aws_iam_policy_document.codebuild_base.json]

  statement {
    sid       = "LoginNoEcr"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "PushDaImagem"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]
    resources = [var.repositorio_ecr_arn]
  }
}

resource "aws_iam_role" "imagem" {
  name               = "${var.nome}-codebuild-imagem"
  assume_role_policy = data.aws_iam_policy_document.confianca_codebuild.json
}

resource "aws_iam_role_policy" "imagem" {
  name   = "imagem"
  role   = aws_iam_role.imagem.id
  policy = data.aws_iam_policy_document.codebuild_imagem.json
}
