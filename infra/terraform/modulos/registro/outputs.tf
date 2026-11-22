output "url" {
  description = "URL do repositório, sem tag."
  value       = aws_ecr_repository.app.repository_url
}

output "arn" {
  description = "ARN do repositório."
  value       = aws_ecr_repository.app.arn
}
