# O domínio do site apontando para o Elastic IP, na zona do Route 53.
#
# Só é usado quando a zona está na mesma conta. Fora dela (Registro.br,
# Cloudflare...), o registro A é criado à mão com o output `ip_publico`.

data "aws_route53_zone" "zona" {
  name         = var.zona
  private_zone = false
}

resource "aws_route53_record" "site" {
  zone_id = data.aws_route53_zone.zona.zone_id
  name    = var.dominio
  type    = "A"
  ttl     = 300
  records = [var.ip]
}

# CAA: só o Let's Encrypt pode emitir certificado para este domínio. Uma
# autoridade que receber pedido de outra pessoa é obrigada a recusar.
resource "aws_route53_record" "caa" {
  zone_id = data.aws_route53_zone.zona.zone_id
  name    = var.dominio
  type    = "CAA"
  ttl     = 3600
  records = [
    "0 issue \"letsencrypt.org\"",
    "0 issuewild \";\"",
  ]
}
