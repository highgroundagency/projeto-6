#!/bin/bash
# ApplicationStart: garante o Caddy e troca o contêiner do app.
#
# Só o Caddy publica porta no host (80 e 443). O app fica na rede interna do
# Docker, acessível pelo nome `app`, sem porta nenhuma no host.
source "$(dirname "$0")/comum.sh"

docker network inspect "$REDE" >/dev/null 2>&1 || docker network create "$REDE"

# ---------------------------------------------------------------------------
# Caddy: recriado só quando a configuração muda, para não renegociar TLS à toa
# ---------------------------------------------------------------------------

DOMINIO=$(parametro_implantacao DOMINIO)
EMAIL_ACME=$(parametro_implantacao EMAIL_ACME)
LINHA_EMAIL_ACME=""
if [ -n "$EMAIL_ACME" ] && [ "$EMAIL_ACME" != "-" ]; then
  LINHA_EMAIL_ACME="email $EMAIL_ACME"
fi

install -d -m 0755 /opt/prumo/caddy
install -m 0644 "$REVISAO/Caddyfile" /opt/prumo/caddy/Caddyfile

configuracao=$(printf '%s|%s|%s|%s' "$(sha256sum /opt/prumo/caddy/Caddyfile)" \
  "$DOMINIO" "$LINHA_EMAIL_ACME" "$CADDY_IMAGEM" | sha256sum | cut -c1-16)
atual=$(docker inspect -f '{{ index .Config.Labels "prumo.configuracao" }}' "$CONTEINER_CADDY" 2>/dev/null || true)
rodando=$(docker inspect -f '{{.State.Running}}' "$CONTEINER_CADDY" 2>/dev/null || echo false)

if [ "$configuracao" != "$atual" ] || [ "$rodando" != true ]; then
  log "subindo o Caddy para $DOMINIO"
  docker rm -f "$CONTEINER_CADDY" >/dev/null 2>&1 || true
  # shellcheck disable=SC2046
  docker run -d --name "$CONTEINER_CADDY" \
    --network "$REDE" \
    --restart unless-stopped \
    --publish 80:80 --publish 443:443 \
    --env DOMINIO="$DOMINIO" \
    --env LINHA_EMAIL_ACME="$LINHA_EMAIL_ACME" \
    --volume caddy-dados:/data \
    --volume caddy-config:/config \
    --volume /opt/prumo/caddy/Caddyfile:/etc/caddy/Caddyfile:ro \
    --read-only --tmpfs /tmp:rw,noexec,nosuid,size=16m \
    --cap-drop ALL --cap-add NET_BIND_SERVICE \
    --security-opt no-new-privileges:true \
    --memory 192m --pids-limit 128 \
    --label prumo.configuracao="$configuracao" \
    $(opcoes_log caddy) \
    "$CADDY_IMAGEM"
else
  log "Caddy sem mudanca de configuracao: mantido"
fi

# ---------------------------------------------------------------------------
# App: troca direta. O Caddy segura as requisições por até 30 s enquanto o
# contêiner novo sobe (lb_try_duration), então a troca não aparece como 502.
# ---------------------------------------------------------------------------

log "trocando o app para o commit ${COMMIT_SHA:0:7}"
docker rm -f "$CONTEINER_APP" >/dev/null 2>&1 || true
# shellcheck disable=SC2046
docker run -d --name "$CONTEINER_APP" \
  --network "$REDE" --network-alias app \
  --restart unless-stopped \
  --env-file "$ARQUIVO_AMBIENTE_APP" \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --tmpfs /app/.next/cache:rw,noexec,nosuid,size=128m,mode=1777 \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --memory 768m --pids-limit 256 \
  --label prumo.commit="$COMMIT_SHA" \
  $(opcoes_log "app-${COMMIT_SHA:0:7}-$(date -u +%Y%m%dT%H%M%S)") \
  "$IMAGEM"

# Imagens sem uso há mais de três dias saem do disco. O rollback não depende
# delas: ele baixa de novo do ECR pelo digest.
docker image prune --all --force --filter "until=72h" >/dev/null || true
