output "aplicacao" {
  description = "Nome da aplicação no CodeDeploy."
  value       = aws_codedeploy_app.app.name
}

output "grupo" {
  description = "Nome do grupo de implantação."
  value       = aws_codedeploy_deployment_group.producao.deployment_group_name
}

output "aplicacao_arn" {
  description = "ARN da aplicação no CodeDeploy."
  value       = aws_codedeploy_app.app.arn
}
