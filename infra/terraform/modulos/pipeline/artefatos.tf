# Bucket onde o CodePipeline passa artefatos de um estágio para o outro, e de
# onde o agente do CodeDeploy baixa a revisão. Privado, cifrado com a chave do
# ambiente, só por TLS, e os artefatos expiram: o histórico de verdade é o Git
# e o ECR.

resource "aws_s3_bucket" "artefatos" {
  bucket        = "${var.nome}-artefatos-${local.conta}"
  force_destroy = var.apagar_bucket_com_conteudo
}

resource "aws_s3_bucket_public_access_block" "artefatos" {
  bucket                  = aws_s3_bucket.artefatos.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.chave_kms_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id

  rule {
    id     = "expirar-artefatos"
    status = "Enabled"
    filter {}

    expiration {
      days = var.retencao_artefatos_dias
    }
    noncurrent_version_expiration {
      noncurrent_days = 7
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

data "aws_iam_policy_document" "artefatos_so_tls" {
  statement {
    sid     = "SoPorTLS"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.artefatos.arn,
      "${aws_s3_bucket.artefatos.arn}/*",
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

resource "aws_s3_bucket_policy" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id
  policy = data.aws_iam_policy_document.artefatos_so_tls.json

  depends_on = [aws_s3_bucket_public_access_block.artefatos]
}
