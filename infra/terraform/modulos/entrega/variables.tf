variable "nome" {
  description = "Prefixo dos recursos, ex.: prumo-producao."
  type        = string
}

variable "tag_chave" {
  description = "Chave da tag que identifica a instância de destino."
  type        = string
}

variable "tag_valor" {
  description = "Valor da tag que identifica a instância de destino."
  type        = string
}
