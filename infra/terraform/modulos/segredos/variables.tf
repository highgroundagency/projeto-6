variable "caminho_app" {
  description = "Caminho SSM das variáveis do contêiner, ex.: /prumo/producao/app."
  type        = string
}

variable "caminho_implantacao" {
  description = "Caminho SSM da configuração dos scripts de deploy, ex.: /prumo/producao/implantacao."
  type        = string
}

variable "chave_kms_arn" {
  description = "Chave KMS dos SecureString."
  type        = string
}

variable "versao_segredos" {
  description = "Incremente para gerar e gravar segredos novos (rotação)."
  type        = number
  default     = 1
}

variable "variaveis_app" {
  description = "Variáveis de ambiente do app que não são segredo, ex.: { RELEASE_ADIANTAMENTO_DIAS = \"7\" }."
  type        = map(string)
  default     = {}

  validation {
    condition = alltrue([
      for chave in keys(var.variaveis_app) :
      !contains(["ADMIN_SENHA", "ADMIN_COOKIE_SECRET", "CHAVE_VITRINE"], chave)
    ])
    error_message = "Segredo não entra por aqui: ADMIN_SENHA e ADMIN_COOKIE_SECRET são gerados pelo módulo, e CHAVE_VITRINE é gravada pelo CLI."
  }
}

variable "configuracao_implantacao" {
  description = "Valores lidos pelos scripts do CodeDeploy (DOMINIO, EMAIL_ACME)."
  type        = map(string)
}
