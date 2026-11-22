#!/bin/bash
# Funções e caminhos compartilhados pelos ganchos do CodeDeploy.
# Incluído com `source`, nunca executado sozinho: as variáveis abaixo são
# usadas por quem inclui, por isso o shellcheck não as vê em uso aqui.
# shellcheck disable=SC2034

set -euo pipefail

REVISAO=/opt/prumo/revisao
ARQUIVO_AMBIENTE_APP=/opt/prumo/app.env
REDE=prumo
CONTEINER_APP=prumo-app
CONTEINER_CADDY=prumo-caddy
CADDY_IMAGEM=public.ecr.aws/docker/library/caddy:2.11-alpine

# Gravado pelo user_data no primeiro boot (módulo servidor do Terraform):
# REGIAO, PARAMETROS_APP, PARAMETROS_IMPLANTACAO, GRUPO_LOGS.
# shellcheck disable=SC1091
source /etc/prumo/implantacao.env

# Escrito pelo estágio Imagem do pipeline: IMAGEM (com digest) e COMMIT_SHA.
if [ -f "$REVISAO/imagem.env" ]; then
  # shellcheck disable=SC1091
  source "$REVISAO/imagem.env"
fi

log() { echo "[prumo] $*"; }

# parametro_implantacao NOME: lê um valor de configuração do deploy no SSM.
parametro_implantacao() {
  aws ssm get-parameter --region "$REGIAO" \
    --name "$PARAMETROS_IMPLANTACAO/$1" \
    --query Parameter.Value --output text
}

# opcoes_log FLUXO: driver awslogs para o CloudWatch, um fluxo por contêiner.
opcoes_log() {
  echo "--log-driver awslogs --log-opt awslogs-region=$REGIAO --log-opt awslogs-group=$GRUPO_LOGS --log-opt awslogs-stream=$1"
}
