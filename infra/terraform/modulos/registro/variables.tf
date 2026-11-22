variable "nome" {
  description = "Nome do repositório ECR."
  type        = string
}

variable "chave_kms_arn" {
  description = "Chave KMS que cifra as imagens."
  type        = string
}

variable "imagens_guardadas" {
  description = "Quantas imagens ficam no repositório. São elas que o rollback do CodeDeploy alcança."
  type        = number
  default     = 15
}

variable "apagar_com_imagens" {
  description = "Permite que o terraform destroy apague o repositório mesmo com imagens dentro."
  type        = bool
  default     = false
}
