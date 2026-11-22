variable "nome" {
  description = "Prefixo dos recursos, ex.: prumo-producao."
  type        = string
}

variable "conta_id" {
  description = "ID da conta AWS (para montar ARNs do SSM)."
  type        = string
}

variable "prefixo_logs" {
  description = "Prefixo dos grupos de log, ex.: /prumo/producao."
  type        = string
}

variable "vpc_id" {
  description = "VPC da instância."
  type        = string
}

variable "subrede_id" {
  description = "Sub-rede pública da instância."
  type        = string
}

variable "tipo_instancia" {
  description = "Tipo da instância EC2. O build acontece no CodeBuild; aqui só roda o servidor Node e o Caddy."
  type        = string
  default     = "t3.small"
}

variable "disco_gb" {
  description = "Tamanho do disco raiz, em GB."
  type        = number
  default     = 20
}

variable "portas_publicas" {
  description = "Portas TCP abertas para a internet."
  type        = list(number)
  default     = [80, 443]
}

variable "cidrs_entrada" {
  description = "Quem pode abrir conexão nas portas públicas."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "chave_kms_arn" {
  description = "Chave KMS do ambiente (disco, logs, segredos, artefatos)."
  type        = string
}

variable "repositorio_ecr_arn" {
  description = "Repositório de onde a instância puxa a imagem."
  type        = string
}

variable "bucket_artefatos_arn" {
  description = "Bucket de artefatos do pipeline, de onde o agente do CodeDeploy baixa a revisão."
  type        = string
}

variable "caminho_parametros_app" {
  description = "Caminho SSM das variáveis do contêiner."
  type        = string
}

variable "caminho_parametros_implantacao" {
  description = "Caminho SSM da configuração de deploy."
  type        = string
}

variable "tag_implantacao" {
  description = "Chave da tag que o grupo do CodeDeploy usa para achar a instância."
  type        = string
  default     = "ImplantacaoPrumo"
}

variable "retencao_logs_dias" {
  description = "Por quantos dias os logs dos contêineres ficam guardados."
  type        = number
  default     = 30
}
