#!/usr/bin/env bash
# Estágio Fumaca: fitness functions de produção, medidas de fora, pela
# internet, contra o site que acabou de subir. Validam o que nenhum teste
# local consegue: o certificado real, o security group real, a versão real.
#
# Uso local: DOMINIO=1-2-3-4.sslip.io COMMIT_SHA=<sha> bash infra/codebuild/fumaca.sh
set -uo pipefail

: "${DOMINIO:?defina DOMINIO}"
COMMIT_SHA=${COMMIT_SHA:-}
URL="https://$DOMINIO"
ESPERA_MAXIMA_S=${ESPERA_MAXIMA_S:-300}

# Portas que precisam estar fechadas para a internet: SSH, a porta do Node,
# a API do Caddy, Postgres, RDP e as alternativas HTTP de costume.
PORTAS_FECHADAS=${PORTAS_FECHADAS:-"22 2019 3000 3389 5432 8080 8443"}

falhas=()
etapa() {
  local nome=$1
  shift
  printf '\n=== %s\n' "$nome"
  if "$@"; then
    printf -- '--- ok: %s\n' "$nome"
  else
    printf -- '--- FALHOU: %s\n' "$nome"
    falhas+=("$nome")
  fi
}

# 1. A versão no ar é a do commit que o pipeline construiu. Espera alguns
#    minutos porque, no primeiro deploy, o Let's Encrypt ainda pode estar
#    emitindo o certificado.
versao_no_ar() {
  local esperado=${COMMIT_SHA:0:7} limite=$((SECONDS + ESPERA_MAXIMA_S)) corpo commit
  while [ "$SECONDS" -lt "$limite" ]; do
    if corpo=$(curl -fsS --max-time 10 "$URL/api/status" 2>/dev/null); then
      commit=$(echo "$corpo" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p')
      if [ -z "$esperado" ] || [ "$commit" = "$esperado" ]; then
        echo "no ar: commit $commit"
        return 0
      fi
      echo "no ar: $commit; esperando $esperado"
    else
      echo "ainda sem resposta HTTPS valida em $URL"
    fi
    sleep 10
  done
  return 1
}

# 2. Certificado aceito por um cliente comum e com mais de 14 dias de folga
#    (o Caddy renova com 30 dias; menos de 14 é renovação travada).
certificado_valido() {
  echo | openssl s_client -servername "$DOMINIO" -connect "$DOMINIO:443" -verify_return_error 2>/dev/null |
    openssl x509 -noout -subject -enddate -checkend $((14 * 24 * 3600))
}

# 3. O 80 nunca serve a página: redireciona para o 443.
http_redireciona() {
  local resposta codigo destino
  resposta=$(curl -s -o /dev/null --max-time 10 -w '%{http_code} %{redirect_url}' "http://$DOMINIO/")
  codigo=${resposta%% *}
  destino=${resposta#* }
  echo "http -> $codigo $destino"
  [[ "$codigo" =~ ^30[178]$ ]] && [[ "$destino" == https://* ]]
}

# 4. Os cabeçalhos de segurança do next.config.ts chegam ao navegador, e nada
#    anuncia tecnologia ou versão do servidor.
cabecalhos_de_seguranca() {
  local cabecalhos ok=0 nome
  cabecalhos=$(curl -fsS -D - -o /dev/null --max-time 10 "$URL/" | tr -d '\r' | tr '[:upper:]' '[:lower:]')
  for nome in strict-transport-security content-security-policy x-frame-options x-content-type-options referrer-policy permissions-policy; do
    if grep -q "^$nome:" <<<"$cabecalhos"; then echo "presente: $nome"; else echo "AUSENTE: $nome"; ok=1; fi
  done
  for nome in x-powered-by server via; do
    if grep -q "^$nome:" <<<"$cabecalhos"; then echo "VAZA: $(grep "^$nome:" <<<"$cabecalhos")"; ok=1; fi
  done
  return "$ok"
}

# 5. Limitação de portas, medida de fora: 443 aceita conexão, o resto não.
portas_limitadas() {
  local ip ok=0 porta
  ip=$(getent ahostsv4 "$DOMINIO" | awk 'NR==1 {print $1}')
  [ -n "$ip" ] || { echo "nao resolveu $DOMINIO"; return 1; }
  if timeout 5 bash -c "</dev/tcp/$ip/443" 2>/dev/null; then echo "aberta (esperado): 443"; else echo "FECHADA: 443"; ok=1; fi
  for porta in $PORTAS_FECHADAS; do
    if timeout 5 bash -c "</dev/tcp/$ip/$porta" 2>/dev/null; then
      echo "ABERTA: $porta"
      ok=1
    else
      echo "fechada (esperado): $porta"
    fi
  done
  return "$ok"
}

etapa "versao no ar e a do commit" versao_no_ar
etapa "certificado TLS valido" certificado_valido
etapa "HTTP redireciona para HTTPS" http_redireciona
etapa "cabecalhos de seguranca" cabecalhos_de_seguranca
etapa "so as portas publicas respondem" portas_limitadas

printf '\n===================================\n'
if [ "${#falhas[@]}" -gt 0 ]; then
  printf 'Producao reprovada em %d verificacao(oes):\n' "${#falhas[@]}"
  printf '  - %s\n' "${falhas[@]}"
  exit 1
fi
echo "Producao conferida: $URL"
