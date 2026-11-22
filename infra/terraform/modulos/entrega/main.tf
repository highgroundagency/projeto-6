# CodeDeploy: entrega a revisão na instância e roda os ganchos do appspec.
# Se a validação falhar, o próprio CodeDeploy reinstala a revisão anterior,
# que aponta para a imagem anterior pelo digest.

data "aws_iam_policy_document" "confianca" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["codedeploy.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "codedeploy" {
  name               = "${var.nome}-codedeploy"
  assume_role_policy = data.aws_iam_policy_document.confianca.json
}

resource "aws_iam_role_policy_attachment" "codedeploy" {
  role       = aws_iam_role.codedeploy.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

resource "aws_codedeploy_app" "app" {
  name             = var.nome
  compute_platform = "Server"
}

resource "aws_codedeploy_deployment_group" "producao" {
  app_name               = aws_codedeploy_app.app.name
  deployment_group_name  = "${var.nome}-ec2"
  service_role_arn       = aws_iam_role.codedeploy.arn
  deployment_config_name = "CodeDeployDefault.AllAtOnce"

  deployment_style {
    deployment_type   = "IN_PLACE"
    deployment_option = "WITHOUT_TRAFFIC_CONTROL"
  }

  ec2_tag_set {
    ec2_tag_filter {
      key   = var.tag_chave
      value = var.tag_valor
      type  = "KEY_AND_VALUE"
    }
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}
