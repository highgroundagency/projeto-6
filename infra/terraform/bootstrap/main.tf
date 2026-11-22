# Bootstrap: o bucket que guarda o state do ambiente.
#
# Roda uma vez, com state local (este diretório é o único que não tem backend
# remoto: ele cria o backend). O lock usa o arquivo .tflock do próprio S3
# (use_lockfile), sem tabela do DynamoDB.

terraform {
  required_version = ">= 1.11"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "regiao" {
  description = "Região do bucket de state."
  type        = string
  default     = "sa-east-1"
}

variable "projeto" {
  description = "Nome curto do projeto."
  type        = string
  default     = "prumo"
}

provider "aws" {
  region = var.regiao

  default_tags {
    tags = {
      Projeto       = var.projeto
      GerenciadoPor = "terraform"
      Finalidade    = "state-do-terraform"
    }
  }
}

data "aws_caller_identity" "atual" {}

# O state carrega ARNs e IDs, não os segredos do app (eles são write-only), mas
# ainda assim é privado, versionado e só por TLS.
resource "aws_s3_bucket" "state" {
  bucket = "${var.projeto}-tfstate-${data.aws_caller_identity.atual.account_id}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Cifra com a chave gerenciada da AWS, não com a CMK do ambiente: a CMK nasce
# depois, dentro do state que este bucket guarda.
# trivy:ignore:AWS-0132
resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    id     = "versoes-antigas"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

data "aws_iam_policy_document" "so_tls" {
  statement {
    sid     = "SoPorTLS"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.state.arn,
      "${aws_s3_bucket.state.arn}/*",
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "state" {
  bucket     = aws_s3_bucket.state.id
  policy     = data.aws_iam_policy_document.so_tls.json
  depends_on = [aws_s3_bucket_public_access_block.state]
}

output "bucket" {
  description = "Bucket do state."
  value       = aws_s3_bucket.state.bucket
}

output "backend_hcl" {
  description = "Conteúdo do backend.hcl do ambiente."
  value       = "bucket = \"${aws_s3_bucket.state.bucket}\"\nregion = \"${var.regiao}\"\n"
}
