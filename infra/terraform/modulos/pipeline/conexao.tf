# Conexão com o GitHub (AWS CodeConnections).
#
# O Terraform cria a conexão no estado PENDENTE: a AWS exige que alguém com
# acesso ao repositório conclua o aperto de mão no console uma única vez
# (Developer Tools → Settings → Connections → "Update pending connection").
# Até lá, o estágio Fonte do pipeline falha. Ver docs/pipeline.md, passo 4.
#
# Se a organização já tem uma conexão aprovada, passe o ARN em
# `conexao_github_arn` e nada é criado aqui.

resource "aws_codestarconnections_connection" "github" {
  count = var.conexao_github_arn == "" ? 1 : 0

  name          = substr("${var.nome}-github", 0, 32)
  provider_type = "GitHub"
}

locals {
  conexao_arn = (
    var.conexao_github_arn != ""
    ? var.conexao_github_arn
    : aws_codestarconnections_connection.github[0].arn
  )
}
