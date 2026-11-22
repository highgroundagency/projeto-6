variable "nome" {
  description = "Prefixo dos recursos, ex.: prumo-producao."
  type        = string
}

variable "prefixo_logs" {
  description = "Prefixo dos grupos de log que podem usar a chave, ex.: /prumo/producao."
  type        = string
}
