#!/bin/bash
# ValidateService: se isto falhar, o CodeDeploy marca o deploy como falho e
# reinstala a revisão anterior (auto rollback no grupo de implantação).
source "$(dirname "$0")/comum.sh"

log "esperando o health check do app"
estado=desconhecido
for _ in $(seq 1 60); do
  estado=$(docker inspect -f '{{.State.Health.Status}}' "$CONTEINER_APP" 2>/dev/null || echo ausente)
  [ "$estado" = healthy ] && break
  if [ "$estado" = unhealthy ] || [ "$estado" = ausente ]; then break; fi
  sleep 2
done

if [ "$estado" != healthy ]; then
  log "ERRO: app $estado"
  docker logs --tail 80 "$CONTEINER_APP" 2>&1 || true
  exit 1
fi

em_execucao=$(docker inspect -f '{{ index .Config.Labels "prumo.commit" }}' "$CONTEINER_APP")
if [ "$em_execucao" != "$COMMIT_SHA" ]; then
  log "ERRO: rodando $em_execucao, esperado $COMMIT_SHA"
  exit 1
fi

if [ "$(docker inspect -f '{{.State.Running}}' "$CONTEINER_CADDY" 2>/dev/null)" != true ]; then
  log "ERRO: Caddy fora do ar"
  docker logs --tail 80 "$CONTEINER_CADDY" 2>&1 || true
  exit 1
fi

# O 80 tem de redirecionar para o 443, e nunca servir a página.
DOMINIO=$(parametro_implantacao DOMINIO)
codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -H "Host: $DOMINIO" http://127.0.0.1/)
case "$codigo" in
  301 | 308) log "HTTP redireciona para HTTPS ($codigo)" ;;
  *)
    log "ERRO: HTTP respondeu $codigo, esperado redirecionamento"
    exit 1
    ;;
esac

# HTTPS pelo Caddy até o app. No primeiro deploy o certificado pode levar
# alguns segundos para sair; o estágio Fumaca, de fora, é quem reprova TLS.
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null --max-time 10 --resolve "$DOMINIO:443:127.0.0.1" "https://$DOMINIO/api/status"; then
    log "HTTPS ok em https://$DOMINIO"
    exit 0
  fi
  sleep 3
done
log "aviso: HTTPS ainda sem resposta valida; o estagio Fumaca vai conferir de fora"
