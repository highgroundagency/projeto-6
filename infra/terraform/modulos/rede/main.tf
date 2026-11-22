# Rede do ambiente: uma VPC, uma sub-rede pública numa zona, saída direta pelo
# internet gateway (sem NAT: não há nada privado para esconder atrás dele).
#
# A limitação de portas acontece em duas camadas independentes:
#   1. NACL da sub-rede (sem estado): só 80 e 443 entram como conexão nova.
#   2. Security group da instância (com estado), no módulo `servidor`.
# Uma falha de configuração numa camada não abre a porta sozinha.

data "aws_availability_zones" "disponiveis" {
  state = "available"
}

locals {
  zona = coalesce(var.zona, data.aws_availability_zones.disponiveis.names[0])

  # Entrada: cada CIDR permitido × cada porta pública.
  entradas = {
    for par in setproduct(var.cidrs_entrada, var.portas_publicas) :
    "${par[1]}-${par[0]}" => { cidr = par[0], porta = par[1] }
  }
}

resource "aws_vpc" "principal" {
  cidr_block           = var.cidr_vpc
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = var.nome }
}

# O security group padrão da VPC nasce aberto entre seus membros. Zerado aqui,
# nenhum recurso cai nele por engano com acesso que ninguém pediu.
resource "aws_default_security_group" "fechado" {
  vpc_id = aws_vpc.principal.id
  tags   = { Name = "${var.nome}-padrao-fechado" }
}

resource "aws_internet_gateway" "principal" {
  vpc_id = aws_vpc.principal.id
  tags   = { Name = var.nome }
}

resource "aws_subnet" "publica" {
  vpc_id            = aws_vpc.principal.id
  cidr_block        = var.cidr_subrede
  availability_zone = local.zona

  # O IP público vem do Elastic IP associado à instância, não da sub-rede.
  map_public_ip_on_launch = false

  tags = { Name = "${var.nome}-publica" }
}

resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.principal.id
  tags   = { Name = "${var.nome}-publica" }
}

resource "aws_route" "saida_internet" {
  route_table_id         = aws_route_table.publica.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.principal.id
}

resource "aws_route_table_association" "publica" {
  subnet_id      = aws_subnet.publica.id
  route_table_id = aws_route_table.publica.id
}

# ---------------------------------------------------------------------------
# NACL: a primeira camada de portas
# ---------------------------------------------------------------------------

resource "aws_network_acl" "publica" {
  vpc_id     = aws_vpc.principal.id
  subnet_ids = [aws_subnet.publica.id]
  tags       = { Name = "${var.nome}-publica" }
}

# HTTP e HTTPS de quem pode acessar o site. O 80 existe para o desafio ACME do
# Let's Encrypt e para redirecionar ao 443; nenhuma página é servida nele.
resource "aws_network_acl_rule" "entrada_publica" {
  for_each = local.entradas

  network_acl_id = aws_network_acl.publica.id
  rule_number    = 100 + index(keys(local.entradas), each.key)
  egress         = false
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = each.value.cidr
  from_port      = each.value.porta
  to_port        = each.value.porta
}

# A NACL não tem estado: a resposta das conexões que a instância abre (ECR,
# SSM, Let's Encrypt) volta numa porta efêmera e precisa desta regra. O
# security group, que tem estado, continua recusando conexão nova nessas portas
# (a faixa inclui a 3389, por isso o Trivy reclama; o SG não a abre).
# trivy:ignore:AWS-0105
resource "aws_network_acl_rule" "entrada_retorno" {
  network_acl_id = aws_network_acl.publica.id
  rule_number    = 900
  egress         = false
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 1024
  to_port        = 65535
}

# Saída: HTTPS para os serviços da AWS e para o Let's Encrypt.
resource "aws_network_acl_rule" "saida_https" {
  network_acl_id = aws_network_acl.publica.id
  rule_number    = 100
  egress         = true
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 443
  to_port        = 443
}

# Saída: a resposta aos visitantes, que vai para a porta efêmera deles.
resource "aws_network_acl_rule" "saida_retorno" {
  network_acl_id = aws_network_acl.publica.id
  rule_number    = 900
  egress         = true
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 1024
  to_port        = 65535
}

# ---------------------------------------------------------------------------
# Flow logs: o registro do que tentou entrar e foi recusado
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "fluxo" {
  name              = "${var.prefixo_logs}/vpc-fluxo"
  retention_in_days = var.retencao_logs_dias
  kms_key_id        = var.chave_kms_arn
}

data "aws_iam_policy_document" "fluxo_confianca" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["vpc-flow-logs.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "fluxo" {
  name               = "${var.nome}-vpc-fluxo"
  assume_role_policy = data.aws_iam_policy_document.fluxo_confianca.json
}

data "aws_iam_policy_document" "fluxo_escrita" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
    ]
    resources = ["${aws_cloudwatch_log_group.fluxo.arn}:*"]
  }
}

resource "aws_iam_role_policy" "fluxo" {
  name   = "escrita-flow-logs"
  role   = aws_iam_role.fluxo.id
  policy = data.aws_iam_policy_document.fluxo_escrita.json
}

resource "aws_flow_log" "principal" {
  vpc_id                   = aws_vpc.principal.id
  traffic_type             = "ALL"
  log_destination_type     = "cloud-watch-logs"
  log_destination          = aws_cloudwatch_log_group.fluxo.arn
  iam_role_arn             = aws_iam_role.fluxo.arn
  max_aggregation_interval = 600
}
