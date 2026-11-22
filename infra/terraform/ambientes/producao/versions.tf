terraform {
  # 1.11: recurso efêmero e atributo write-only (os segredos não vão ao state).
  required_version = ">= 1.11"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
  }

  # Configuração parcial: bucket e região vêm do backend.hcl, que sai do
  # bootstrap (infra/terraform/bootstrap). Ver backend.hcl.exemplo.
  backend "s3" {
    key          = "prumo/producao/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
