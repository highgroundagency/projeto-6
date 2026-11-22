# A instância pública que roda o app.
#
# Superfície exposta, de fora para dentro:
#   internet ── 80/443 ──> Caddy (TLS, redireciona 80 → 443) ── rede docker ──> app:3000
#
# - Security group: entram 80 e 443; sai só 443. Sem 22: não há chave SSH,
#   o sshd é desligado no boot, e o acesso administrativo é pelo SSM Session
#   Manager, que sai da instância pelo 443 e não abre porta nenhuma.
# - O app não publica porta no host; só o Caddy publica, e só 80 e 443.
# - IMDSv2 obrigatório com um salto: contêiner não alcança a credencial da
#   instância.

data "aws_region" "atual" {}

data "aws_ssm_parameter" "ami_al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# ---------------------------------------------------------------------------
# Security group: a segunda camada de portas
# ---------------------------------------------------------------------------

resource "aws_security_group" "servidor" {
  name        = "${var.nome}-servidor"
  description = "Prumo: so HTTP e HTTPS entram; so HTTPS sai"
  vpc_id      = var.vpc_id

  tags = { Name = "${var.nome}-servidor" }
}

# É um servidor web público por requisito: 80 e 443 abertos para a internet.
resource "aws_vpc_security_group_ingress_rule" "publica" {
  for_each = {
    for par in setproduct(var.cidrs_entrada, var.portas_publicas) :
    "${par[1]}-${par[0]}" => { cidr = par[0], porta = par[1] }
  }

  security_group_id = aws_security_group.servidor.id
  description       = each.value.porta == 80 ? "HTTP: desafio ACME e redirecionamento" : "HTTPS: o site"
  ip_protocol       = "tcp"
  from_port         = each.value.porta
  to_port           = each.value.porta
  cidr_ipv4         = each.value.cidr
}

# Saída só em 443: ECR, S3, SSM, CodeDeploy, CloudWatch e Let's Encrypt.
# DNS e NTP da Amazon não passam pelo security group. O destino é 0.0.0.0/0
# porque os endpoints públicos da AWS e do Let's Encrypt não têm IP fixo; a
# restrição está na porta. Endpoints de VPC trocariam isso por ~US$ 50/mês.
# trivy:ignore:AWS-0104
resource "aws_vpc_security_group_egress_rule" "https" {
  security_group_id = aws_security_group.servidor.id
  description       = "HTTPS para servicos da AWS e Lets Encrypt"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

# ---------------------------------------------------------------------------
# Papel da instância
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "confianca_ec2" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "servidor" {
  name               = "${var.nome}-servidor"
  assume_role_policy = data.aws_iam_policy_document.confianca_ec2.json
}

# Session Manager: o substituto do SSH.
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.servidor.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "servidor" {
  statement {
    sid       = "LoginNoEcr"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "PullDaImagemDoApp"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = [var.repositorio_ecr_arn]
  }

  statement {
    sid = "ConfiguracaoDoApp"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]
    resources = [
      "arn:aws:ssm:${data.aws_region.atual.region}:${var.conta_id}:parameter${var.caminho_parametros_app}",
      "arn:aws:ssm:${data.aws_region.atual.region}:${var.conta_id}:parameter${var.caminho_parametros_app}/*",
      "arn:aws:ssm:${data.aws_region.atual.region}:${var.conta_id}:parameter${var.caminho_parametros_implantacao}",
      "arn:aws:ssm:${data.aws_region.atual.region}:${var.conta_id}:parameter${var.caminho_parametros_implantacao}/*",
    ]
  }

  statement {
    sid       = "DecifrarSegredosEArtefatos"
    actions   = ["kms:Decrypt"]
    resources = [var.chave_kms_arn]
  }

  # O agente do CodeDeploy baixa a revisão do bucket de artefatos do pipeline.
  statement {
    sid       = "RevisaoDoCodeDeploy"
    actions   = ["s3:GetObject", "s3:GetObjectVersion"]
    resources = ["${var.bucket_artefatos_arn}/*"]
  }

  statement {
    sid = "AgenteDoCodeDeploy"
    actions = [
      "codedeploy-commands-secure:GetDeploymentSpecification",
      "codedeploy-commands-secure:PollHostCommand",
      "codedeploy-commands-secure:PutHostCommandAcknowledgement",
      "codedeploy-commands-secure:PutHostCommandComplete",
    ]
    resources = ["*"]
  }

  # O driver awslogs do Docker roda no host e escreve com o papel da instância.
  statement {
    sid       = "LogsDosConteineres"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.app.arn}:*"]
  }
}

resource "aws_iam_role_policy" "servidor" {
  name   = "execucao-do-app"
  role   = aws_iam_role.servidor.id
  policy = data.aws_iam_policy_document.servidor.json
}

resource "aws_iam_instance_profile" "servidor" {
  name = "${var.nome}-servidor"
  role = aws_iam_role.servidor.name
}

# ---------------------------------------------------------------------------
# Logs dos contêineres
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "app" {
  name              = "${var.prefixo_logs}/app"
  retention_in_days = var.retencao_logs_dias
  kms_key_id        = var.chave_kms_arn
}

# ---------------------------------------------------------------------------
# A instância
# ---------------------------------------------------------------------------

# Servidor web público por requisito. O IP automático existe só para o boot
# alcançar a internet antes de o Elastic IP ser associado; depois o EIP assume.
resource "aws_instance" "servidor" {
  ami                         = data.aws_ssm_parameter.ami_al2023.value
  instance_type               = var.tipo_instancia
  subnet_id                   = var.subrede_id
  vpc_security_group_ids      = [aws_security_group.servidor.id]
  iam_instance_profile        = aws_iam_instance_profile.servidor.name
  associate_public_ip_address = true
  monitoring                  = true

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "disabled"
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.disco_gb
    encrypted             = true
    kms_key_id            = var.chave_kms_arn
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/inicializacao.sh.tftpl", {
    regiao              = data.aws_region.atual.region
    caminho_app         = var.caminho_parametros_app
    caminho_implantacao = var.caminho_parametros_implantacao
    grupo_logs          = aws_cloudwatch_log_group.app.name
  })

  tags = {
    Name                  = "${var.nome}-servidor"
    (var.tag_implantacao) = var.nome
  }

  lifecycle {
    # Uma AMI nova não deve recriar a máquina num apply qualquer. Para
    # atualizar o sistema operacional, troque de propósito (docs/pipeline.md).
    ignore_changes = [ami, user_data]
  }
}

resource "aws_eip" "servidor" {
  domain = "vpc"
  tags   = { Name = "${var.nome}-servidor" }
}

resource "aws_eip_association" "servidor" {
  instance_id   = aws_instance.servidor.id
  allocation_id = aws_eip.servidor.id
}

# Recuperação automática se o hardware por trás da instância falhar.
resource "aws_cloudwatch_metric_alarm" "recuperacao" {
  alarm_name          = "${var.nome}-servidor-recuperacao"
  alarm_description   = "Recupera a instancia quando a checagem de sistema falha"
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_System"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  dimensions          = { InstanceId = aws_instance.servidor.id }
  alarm_actions       = ["arn:aws:automate:${data.aws_region.atual.region}:ec2:recover"]
}
