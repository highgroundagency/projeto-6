# Uma chave KMS gerenciada pela equipe para tudo que o ambiente guarda em
# repouso: artefatos do pipeline, logs, segredos do SSM e imagens no ECR.
# Uma chave só, porque o ambiente é um só; rotação anual automática.

data "aws_caller_identity" "atual" {}
data "aws_region" "atual" {}
data "aws_partition" "atual" {}

locals {
  conta    = data.aws_caller_identity.atual.account_id
  regiao   = data.aws_region.atual.region
  particao = data.aws_partition.atual.partition
}

data "aws_iam_policy_document" "chave" {
  # A conta administra a chave; o uso por cada serviço é concedido por IAM,
  # nos papéis de cada módulo.
  statement {
    sid       = "AdministracaoPelaConta"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:${local.particao}:iam::${local.conta}:root"]
    }
  }

  # O CloudWatch Logs não usa papel IAM: precisa estar na política da chave,
  # e só para os grupos de log deste ambiente.
  statement {
    sid = "CloudWatchLogsDoAmbiente"
    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:Describe*",
    ]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["logs.${local.regiao}.amazonaws.com"]
    }
    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["arn:${local.particao}:logs:${local.regiao}:${local.conta}:log-group:${var.prefixo_logs}/*"]
    }
  }
}

resource "aws_kms_key" "principal" {
  description             = "${var.nome}: artefatos, logs, segredos e imagens"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  policy                  = data.aws_iam_policy_document.chave.json
}

resource "aws_kms_alias" "principal" {
  name          = "alias/${var.nome}"
  target_key_id = aws_kms_key.principal.key_id
}
