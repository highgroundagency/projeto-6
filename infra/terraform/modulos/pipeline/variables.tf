variable "nome" {
  description = "Prefixo dos recursos, ex.: prumo-producao."
  type        = string
}

variable "prefixo_logs" {
  description = "Prefixo dos grupos de log, ex.: /prumo/producao."
  type        = string
}

variable "chave_kms_arn" {
  description = "Chave KMS do ambiente."
  type        = string
}

variable "repositorio_github" {
  description = "Repositório no formato dono/nome."
  type        = string
}

variable "branch" {
  description = "Branch que dispara o pipeline."
  type        = string
  default     = "main"
}

variable "conexao_github_arn" {
  description = "ARN de uma conexão CodeConnections já aprovada. Vazio = o módulo cria uma (pendente até a aprovação no console)."
  type        = string
  default     = ""
}

variable "repositorio_ecr_url" {
  description = "URL do repositório ECR."
  type        = string
}

variable "repositorio_ecr_arn" {
  description = "ARN do repositório ECR."
  type        = string
}

variable "codedeploy_aplicacao" {
  description = "Nome da aplicação no CodeDeploy."
  type        = string
}

variable "codedeploy_aplicacao_arn" {
  description = "ARN da aplicação no CodeDeploy."
  type        = string
}

variable "codedeploy_grupo" {
  description = "Nome do grupo de implantação."
  type        = string
}

variable "dominio" {
  description = "Domínio público do site, conferido pelo teste de fumaça."
  type        = string
}

variable "url_site" {
  description = "URL pública do site (vira NEXT_PUBLIC_SITE_URL no build)."
  type        = string
}

variable "url_repositorio" {
  description = "URL pública do repositório (vira NEXT_PUBLIC_REPO_URL no build)."
  type        = string
  default     = ""
}

variable "exigir_aprovacao" {
  description = "Insere um estágio de aprovação manual antes do deploy."
  type        = bool
  default     = false
}

variable "imagem_codebuild" {
  description = "Imagem gerenciada do CodeBuild (Ubuntu 24.04, com Node 22 e Docker)."
  type        = string
  default     = "aws/codebuild/standard:8.0"
}

variable "retencao_logs_dias" {
  description = "Por quantos dias os logs do CodeBuild ficam guardados."
  type        = number
  default     = 30
}

variable "retencao_artefatos_dias" {
  description = "Por quantos dias os artefatos do pipeline ficam no bucket."
  type        = number
  default     = 30
}

variable "apagar_bucket_com_conteudo" {
  description = "Permite que o terraform destroy apague o bucket de artefatos com conteúdo."
  type        = bool
  default     = false
}
