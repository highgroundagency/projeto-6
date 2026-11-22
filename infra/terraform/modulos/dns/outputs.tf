output "fqdn" {
  description = "Nome que o registro A resolve."
  value       = aws_route53_record.site.fqdn
}
