output "nome" {
  description = "Nome do pipeline."
  value       = aws_codepipeline.principal.name
}

output "bucket_artefatos_arn" {
  description = "ARN do bucket de artefatos."
  value       = aws_s3_bucket.artefatos.arn
}

output "conexao_github_arn" {
  description = "ARN da conexão com o GitHub."
  value       = local.conexao_arn
}

output "conexao_github_status" {
  description = "PENDING até alguém aprovar a conexão no console."
  value       = var.conexao_github_arn == "" ? aws_codestarconnections_connection.github[0].connection_status : "externa"
}
