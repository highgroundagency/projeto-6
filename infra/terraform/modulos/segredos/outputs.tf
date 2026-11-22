output "parametro_senha_admin" {
  description = "Nome do parâmetro com a senha do painel."
  value       = aws_ssm_parameter.admin_senha.name
}
