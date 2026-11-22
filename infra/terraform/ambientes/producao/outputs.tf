output "url_site" {
  description = "Endereço público do site."
  value       = local.url_site
}

output "ip_publico" {
  description = "Elastic IP da instância (aponte o registro A do domínio para cá)."
  value       = module.servidor.ip_publico
}

output "pipeline" {
  description = "Nome do pipeline no CodePipeline."
  value       = module.pipeline.nome
}

output "conexao_github_status" {
  description = "Se PENDING, aprove a conexão no console antes do primeiro deploy (docs/pipeline.md)."
  value       = module.pipeline.conexao_github_status
}

output "conexao_github_arn" {
  description = "ARN da conexão com o GitHub."
  value       = module.pipeline.conexao_github_arn
}

output "comando_sessao" {
  description = "Shell na instância, sem SSH e sem porta 22."
  value       = "aws ssm start-session --region ${var.regiao} --target ${module.servidor.instancia_id}"
}

output "comando_senha_admin" {
  description = "Lê a senha do painel administrativo."
  value       = "aws ssm get-parameter --region ${var.regiao} --with-decryption --name ${module.segredos.parametro_senha_admin} --query Parameter.Value --output text"
}
