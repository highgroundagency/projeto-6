# Ambiente de produção do Prumo na AWS: a composição dos módulos.
#
#   criptografia ─┬─> rede ──────┐
#                 ├─> registro ──┼─> servidor ─> entrega ─> pipeline
#                 └─> segredos <─┘   (o domínio sai do Elastic IP)
#
# Passo a passo de criação e operação: docs/pipeline.md.

provider "aws" {
  region = var.regiao

  default_tags {
    tags = {
      Projeto       = var.projeto
      Ambiente      = var.ambiente
      GerenciadoPor = "terraform"
      Repositorio   = var.repositorio_github
    }
  }
}

data "aws_caller_identity" "atual" {}

locals {
  nome         = "${var.projeto}-${var.ambiente}"
  prefixo_logs = "/${var.projeto}/${var.ambiente}"

  caminho_app         = "/${var.projeto}/${var.ambiente}/app"
  caminho_implantacao = "/${var.projeto}/${var.ambiente}/implantacao"

  # Sem domínio próprio, o sslip.io resolve <ip-com-hifens>.sslip.io para o
  # próprio IP, e isso basta para o Let's Encrypt emitir um certificado.
  dominio = (
    var.dominio != ""
    ? var.dominio
    : "${replace(module.servidor.ip_publico, ".", "-")}.sslip.io"
  )
  url_site = "https://${local.dominio}"
}

module "criptografia" {
  source = "../../modulos/criptografia"

  nome         = local.nome
  prefixo_logs = local.prefixo_logs
}

module "rede" {
  source = "../../modulos/rede"

  nome               = local.nome
  prefixo_logs       = local.prefixo_logs
  chave_kms_arn      = module.criptografia.chave_arn
  cidrs_entrada      = var.cidrs_entrada
  retencao_logs_dias = var.retencao_logs_dias
}

module "registro" {
  source = "../../modulos/registro"

  nome          = local.nome
  chave_kms_arn = module.criptografia.chave_arn
}

module "servidor" {
  source = "../../modulos/servidor"

  nome                           = local.nome
  conta_id                       = data.aws_caller_identity.atual.account_id
  prefixo_logs                   = local.prefixo_logs
  vpc_id                         = module.rede.vpc_id
  subrede_id                     = module.rede.subrede_publica_id
  tipo_instancia                 = var.tipo_instancia
  cidrs_entrada                  = var.cidrs_entrada
  chave_kms_arn                  = module.criptografia.chave_arn
  repositorio_ecr_arn            = module.registro.arn
  bucket_artefatos_arn           = module.pipeline.bucket_artefatos_arn
  caminho_parametros_app         = local.caminho_app
  caminho_parametros_implantacao = local.caminho_implantacao
  retencao_logs_dias             = var.retencao_logs_dias
}

# Registro A (e CAA) do domínio próprio, quando a zona está no Route 53 desta
# conta. Criado no mesmo apply que o Elastic IP: quando o primeiro deploy subir
# o Caddy, o DNS já resolve e o Let's Encrypt consegue validar.
module "dns" {
  source = "../../modulos/dns"
  count  = var.zona_route53 != "" && var.dominio != "" ? 1 : 0

  zona    = var.zona_route53
  dominio = var.dominio
  ip      = module.servidor.ip_publico
}

module "segredos" {
  source = "../../modulos/segredos"

  caminho_app         = local.caminho_app
  caminho_implantacao = local.caminho_implantacao
  chave_kms_arn       = module.criptografia.chave_arn
  versao_segredos     = var.versao_segredos
  variaveis_app       = var.variaveis_app

  configuracao_implantacao = {
    DOMINIO    = local.dominio
    EMAIL_ACME = var.email_acme != "" ? var.email_acme : "-"
  }
}

module "entrega" {
  source = "../../modulos/entrega"

  nome      = local.nome
  tag_chave = module.servidor.tag_implantacao_chave
  tag_valor = module.servidor.tag_implantacao_valor
}

module "pipeline" {
  source = "../../modulos/pipeline"

  nome                     = local.nome
  prefixo_logs             = local.prefixo_logs
  chave_kms_arn            = module.criptografia.chave_arn
  repositorio_github       = var.repositorio_github
  branch                   = var.branch
  conexao_github_arn       = var.conexao_github_arn
  repositorio_ecr_url      = module.registro.url
  repositorio_ecr_arn      = module.registro.arn
  codedeploy_aplicacao     = module.entrega.aplicacao
  codedeploy_aplicacao_arn = module.entrega.aplicacao_arn
  codedeploy_grupo         = module.entrega.grupo
  dominio                  = local.dominio
  url_site                 = local.url_site
  url_repositorio          = "https://github.com/${var.repositorio_github}"
  exigir_aprovacao         = var.exigir_aprovacao
  retencao_logs_dias       = var.retencao_logs_dias
}
