variable "regiao" {
  description = "Região da AWS."
  type        = string
  default     = "sa-east-1"
}

variable "projeto" {
  description = "Nome curto do projeto, usado em todos os nomes."
  type        = string
  default     = "prumo"
}

variable "ambiente" {
  description = "Nome do ambiente."
  type        = string
  default     = "producao"
}

variable "repositorio_github" {
  description = "Repositório no formato dono/nome."
  type        = string
  default     = "highgroundagency/projeto-6"
}

variable "branch" {
  description = "Branch que dispara o pipeline."
  type        = string
  default     = "main"
}

variable "conexao_github_arn" {
  description = "ARN de uma conexão CodeConnections já aprovada. Vazio = cria uma nova."
  type        = string
  default     = ""
}

variable "tipo_instancia" {
  description = "Tipo da instância EC2."
  type        = string
  default     = "t3.small"
}

variable "dominio" {
  description = "Domínio do site, com o registro A já apontando para o Elastic IP. Vazio = <ip>.sslip.io."
  type        = string
  default     = ""
}

variable "zona_route53" {
  description = "Zona pública do Route 53, nesta conta, onde o Terraform cria o registro A do domínio. Vazio = o registro é criado à mão."
  type        = string
  default     = ""

  validation {
    condition     = var.zona_route53 == "" || var.dominio == var.zona_route53 || endswith(var.dominio, ".${var.zona_route53}")
    error_message = "O domínio precisa ser a própria zona ou um subdomínio dela."
  }
}

variable "email_acme" {
  description = "E-mail de contato da conta ACME no Let's Encrypt (avisos de expiração). Opcional."
  type        = string
  default     = ""
}

variable "cidrs_entrada" {
  description = "Quem pode acessar 80 e 443. Restringir também bloqueia a validação do Let's Encrypt."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "exigir_aprovacao" {
  description = "Aprovação manual entre a imagem pronta e o deploy."
  type        = bool
  default     = false
}

variable "variaveis_app" {
  description = "Variáveis do app que não são segredo (RELEASE_ADIANTAMENTO_DIAS, RELEASE_TRAVAS...)."
  type        = map(string)
  default     = {}
}

variable "versao_segredos" {
  description = "Incremente para girar ADMIN_SENHA e ADMIN_COOKIE_SECRET."
  type        = number
  default     = 1
}

variable "retencao_logs_dias" {
  description = "Retenção dos logs no CloudWatch."
  type        = number
  default     = 30
}
