# Configuração do app em execução, no SSM Parameter Store.
#
# Dois caminhos:
#   <caminho_app>/          vira o arquivo de ambiente do contêiner, chave a chave
#   <caminho_implantacao>/  é lido só pelos scripts do CodeDeploy (domínio, e-mail ACME)
#
# Os segredos nascem com recurso EFÊMERO e atributo write-only (value_wo): o
# valor gerado vai para a AWS e não fica no state do Terraform. Para girar um
# segredo, incremente `versao_segredos` e aplique; para trocar a senha por uma
# escolhida pela equipe, use o CLI (docs/pipeline.md).

ephemeral "random_password" "admin_senha" {
  length  = 24
  special = false
}

ephemeral "random_password" "cookie" {
  length  = 64
  special = false
}

resource "aws_ssm_parameter" "admin_senha" {
  name             = "${var.caminho_app}/ADMIN_SENHA"
  description      = "Senha do painel administrativo (/admin/entrar)"
  type             = "SecureString"
  key_id           = var.chave_kms_arn
  value_wo         = ephemeral.random_password.admin_senha.result
  value_wo_version = var.versao_segredos
}

resource "aws_ssm_parameter" "cookie" {
  name             = "${var.caminho_app}/ADMIN_COOKIE_SECRET"
  description      = "Assinatura HMAC do cookie de sessão e do diário do protótipo"
  type             = "SecureString"
  key_id           = var.chave_kms_arn
  value_wo         = ephemeral.random_password.cookie.result
  value_wo_version = var.versao_segredos
}

# Variáveis de ambiente que não são segredo (RELEASE_*, por exemplo).
resource "aws_ssm_parameter" "variaveis_app" {
  for_each = var.variaveis_app

  name  = "${var.caminho_app}/${each.key}"
  type  = "String"
  value = each.value
}

resource "aws_ssm_parameter" "implantacao" {
  for_each = var.configuracao_implantacao

  name  = "${var.caminho_implantacao}/${each.key}"
  type  = "String"
  value = each.value
}
