#!/bin/bash
# AfterInstall: baixa a imagem pelo digest e monta o arquivo de ambiente do
# contêiner a partir do SSM. Tudo que pode falhar por rede falha aqui, antes
# de o contêiner antigo ser parado.
source "$(dirname "$0")/comum.sh"

: "${IMAGEM:?imagem.env sem IMAGEM: o pacote nao veio do estagio Imagem}"

REGISTRO=${IMAGEM%%/*}
log "baixando $IMAGEM"
aws ecr get-login-password --region "$REGIAO" |
  docker login --username AWS --password-stdin "$REGISTRO"
docker pull --quiet "$IMAGEM"
docker logout "$REGISTRO" >/dev/null
docker pull --quiet "$CADDY_IMAGEM"

# Cada parâmetro de $PARAMETROS_APP vira NOME=valor. O arquivo nasce com
# permissão 600 e só substitui o anterior se estiver completo.
log "montando o ambiente do app a partir de $PARAMETROS_APP"
umask 077
temporario=$(mktemp "$ARQUIVO_AMBIENTE_APP.XXXXXX")
trap 'rm -f "$temporario"' EXIT

aws ssm get-parameters-by-path --region "$REGIAO" --path "$PARAMETROS_APP" \
  --recursive --with-decryption \
  --query 'Parameters[*].[Name,Value]' --output text |
  while IFS=$'\t' read -r nome valor; do
    printf '%s=%s\n' "${nome##*/}" "$valor"
  done >"$temporario"

for obrigatoria in ADMIN_SENHA ADMIN_COOKIE_SECRET; do
  if ! grep -q "^$obrigatoria=" "$temporario"; then
    log "ERRO: $obrigatoria ausente em $PARAMETROS_APP"
    exit 1
  fi
done

mv "$temporario" "$ARQUIVO_AMBIENTE_APP"
trap - EXIT
log "ambiente pronto ($(wc -l <"$ARQUIVO_AMBIENTE_APP") variaveis)"
