# Repositório de imagens do app. Tag imutável: o SHA do commit aponta sempre
# para a mesma imagem, e o deploy usa o digest, não a tag. Uma imagem que
# chegou aqui já passou pelo Trivy no CodeBuild; o scan do ECR é a segunda
# opinião, contínua, sobre CVEs publicados depois do push.

resource "aws_ecr_repository" "app" {
  name                 = var.nome
  image_tag_mutability = "IMMUTABLE"
  force_delete         = var.apagar_com_imagens

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = var.chave_kms_arn
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Camadas sem tag somem em um dia"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Guarda as ultimas imagens para rollback"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.imagens_guardadas
        }
        action = { type = "expire" }
      },
    ]
  })
}
