output "ip_publico" {
  description = "Elastic IP da instância."
  value       = aws_eip.servidor.public_ip
}

output "instancia_id" {
  description = "ID da instância (alvo do aws ssm start-session)."
  value       = aws_instance.servidor.id
}

output "tag_implantacao_chave" {
  description = "Chave da tag que identifica a instância para o CodeDeploy."
  value       = var.tag_implantacao
}

output "tag_implantacao_valor" {
  description = "Valor da tag que identifica a instância para o CodeDeploy."
  value       = var.nome
}

output "papel_arn" {
  description = "Papel IAM da instância."
  value       = aws_iam_role.servidor.arn
}
