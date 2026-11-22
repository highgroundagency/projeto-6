variable "zona" {
  description = "Nome da zona hospedada pública no Route 53, ex.: exemplo.click."
  type        = string
}

variable "dominio" {
  description = "Nome do site: a própria zona ou um subdomínio dela."
  type        = string
}

variable "ip" {
  description = "Elastic IP da instância."
  type        = string
}
