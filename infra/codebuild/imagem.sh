#!/usr/bin/env bash
# Estágio Imagem: build, Trivy na imagem, SBOM, push no ECR e o pacote que o
# CodeDeploy entrega na EC2.
#
# A imagem só é publicada se passar pelo Trivy, e o deploy referencia o
# DIGEST, não a tag: o que foi varrido é exatamente o que vai rodar.
set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 1

: "${REPOSITORIO_ECR:?defina REPOSITORIO_ECR (conta.dkr.ecr.regiao.amazonaws.com/nome)}"
COMMIT_SHA=${COMMIT_SHA:-${CODEBUILD_RESOLVED_SOURCE_VERSION:-$(git rev-parse HEAD)}}
SEVERIDADE=${SEVERIDADE:-HIGH,CRITICAL}
RELATORIOS=${RELATORIOS:-relatorios}
PACOTE=${PACOTE:-pacote}
JUNIT="@${TRIVY_CONTRIB:-/opt/trivy/contrib}/junit.tpl"

REGISTRO=${REPOSITORIO_ECR%%/*}
NOME_REPOSITORIO=${REPOSITORIO_ECR#*/}
REGIAO=$(echo "$REGISTRO" | cut -d. -f4)
TAG=$COMMIT_SHA
IMAGEM="$REPOSITORIO_ECR:$TAG"

rm -rf "$PACOTE"
mkdir -p "$RELATORIOS" "$PACOTE"

aws ecr get-login-password --region "$REGIAO" |
  docker login --username AWS --password-stdin "$REGISTRO"

# Reexecução do mesmo commit: a tag é imutável no ECR, então reaproveita a
# imagem que já está lá, mas varre de novo (pode ter saído CVE desde o push).
if aws ecr describe-images --region "$REGIAO" --repository-name "$NOME_REPOSITORIO" \
  --image-ids imageTag="$TAG" >/dev/null 2>&1; then
  echo "imagem $TAG ja existe no ECR: reaproveitando"
  docker pull "$IMAGEM"
  PUBLICAR=false
else
  docker build --pull \
    --build-arg COMMIT_SHA="$COMMIT_SHA" \
    --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-}" \
    --build-arg NEXT_PUBLIC_REPO_URL="${NEXT_PUBLIC_REPO_URL:-}" \
    --build-arg NEXT_PUBLIC_DRIVE_URL="${NEXT_PUBLIC_DRIVE_URL:-}" \
    --label org.opencontainers.image.revision="$COMMIT_SHA" \
    --label org.opencontainers.image.source="${NEXT_PUBLIC_REPO_URL:-}" \
    --tag "$IMAGEM" .
  PUBLICAR=true
fi

# Fitness function da imagem: nenhuma CVE alta ou crítica com correção, nem
# segredo esquecido numa camada. Reprovou, a imagem nunca chega ao ECR.
echo "=== Trivy na imagem"
trivy image --scanners vuln,secret --severity "$SEVERIDADE" --ignore-unfixed \
  --format template --template "$JUNIT" --output "$RELATORIOS/trivy-imagem.xml" "$IMAGEM" >/dev/null 2>&1 || true
trivy image --scanners vuln,secret --severity "$SEVERIDADE" --ignore-unfixed --exit-code 1 "$IMAGEM"

# SBOM: a lista do que está dentro da imagem, guardada junto da revisão.
trivy image --format cyclonedx --output "$PACOTE/sbom.cdx.json" "$IMAGEM"

if [ "$PUBLICAR" = true ]; then
  docker push "$IMAGEM"
fi

DIGEST=$(aws ecr describe-images --region "$REGIAO" --repository-name "$NOME_REPOSITORIO" \
  --image-ids imageTag="$TAG" --query 'imageDetails[0].imageDigest' --output text)
docker logout "$REGISTRO" >/dev/null

# O pacote do CodeDeploy: appspec, scripts, Caddyfile e a referência imutável
# da imagem. Nada do código-fonte vai para a EC2; ele já está dentro da imagem.
cp -r infra/codedeploy/. "$PACOTE/"
chmod +x "$PACOTE"/scripts/*.sh
cat >"$PACOTE/imagem.env" <<EOF
IMAGEM=$REPOSITORIO_ECR@$DIGEST
COMMIT_SHA=$COMMIT_SHA
EOF

echo "pacote pronto: $REPOSITORIO_ECR@$DIGEST (commit $COMMIT_SHA)"
