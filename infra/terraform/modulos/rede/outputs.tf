output "vpc_id" {
  description = "ID da VPC."
  value       = aws_vpc.principal.id
}

output "subrede_publica_id" {
  description = "ID da sub-rede pública onde mora a instância."
  value       = aws_subnet.publica.id
}
