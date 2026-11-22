output "chave_arn" {
  description = "ARN da chave KMS do ambiente."
  value       = aws_kms_key.principal.arn
}
