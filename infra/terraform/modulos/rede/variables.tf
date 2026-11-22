variable "nome" {
  description = "Prefixo dos recursos, ex.: prumo-producao."
  type        = string
}

variable "prefixo_logs" {
  description = "Prefixo dos grupos de log, ex.: /prumo/producao."
  type        = string
}

variable "chave_kms_arn" {
  description = "Chave KMS que cifra os flow logs."
  type        = string
}

variable "cidr_vpc" {
  description = "Bloco de endereços da VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "cidr_subrede" {
  description = "Bloco de endereços da sub-rede pública."
  type        = string
  default     = "10.42.1.0/24"
}

variable "zona" {
  description = "Zona de disponibilidade. Vazio = a primeira disponível na região."
  type        = string
  default     = null
}

variable "portas_publicas" {
  description = "Portas TCP abertas para a internet. Só HTTP (ACME e redirecionamento) e HTTPS."
  type        = list(number)
  default     = [80, 443]
}

variable "cidrs_entrada" {
  description = "Quem pode abrir conexão nas portas públicas. Restringir isto também bloqueia a validação do Let's Encrypt."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "retencao_logs_dias" {
  description = "Por quantos dias os flow logs ficam guardados."
  type        = number
  default     = 30
}
