# syntax=docker/dockerfile:1.7
#
# Imagem de produção do Prumo para a EC2 (docs/pipeline.md).
#
# Três estágios: dependências, build e execução. Só o último vai para o ECR, e
# ele não tem shell, npm nem gerenciador de pacotes: é o Node e o servidor
# autocontido do Next. Menos binário na imagem é menos CVE para o Trivy achar
# e menos ferramenta para quem invadir o contêiner.
#
# As imagens de base vêm do espelho público do ECR (os oficiais do Docker Hub
# replicados pela AWS) para o CodeBuild não esbarrar no limite de pulls
# anônimos do Docker Hub.

ARG NODE_IMAGEM=public.ecr.aws/docker/library/node:22.23-trixie-slim
ARG EXECUCAO_IMAGEM=gcr.io/distroless/nodejs22-debian13:nonroot

# ---------------------------------------------------------------------------
FROM ${NODE_IMAGEM} AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
FROM ${NODE_IMAGEM} AS build
WORKDIR /app

# NEXT_PUBLIC_* é embutido no bundle durante o build: precisa chegar aqui, não
# na execução. COMMIT_SHA vai para o /api/status, que o teste de fumaça lê.
ARG NEXT_PUBLIC_SITE_URL=""
ARG NEXT_PUBLIC_REPO_URL=""
ARG NEXT_PUBLIC_DRIVE_URL=""
ARG COMMIT_SHA="local"

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT=standalone \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_REPO_URL=${NEXT_PUBLIC_REPO_URL} \
    NEXT_PUBLIC_DRIVE_URL=${NEXT_PUBLIC_DRIVE_URL} \
    COMMIT_SHA=${COMMIT_SHA}

COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
FROM ${EXECUCAO_IMAGEM} AS execucao
WORKDIR /app

ARG COMMIT_SHA="local"

# CONFIG_SITE_SOMENTE_LEITURA: o contêiner roda com o sistema de arquivos
# somente leitura, como a Vercel. A configuração do release vem de variável
# de ambiente e do Git, nunca de arquivo gravado em execução (docs/releases.md).
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    CONFIG_SITE_SOMENTE_LEITURA=1 \
    COMMIT_SHA=${COMMIT_SHA}

# O servidor autocontido traz só os arquivos que o rastreador do Next achou,
# inclusive os de docs/ listados em outputFileTracingIncludes. Estáticos e
# public/ não entram no rastreamento e são copiados à parte.
COPY --from=build --chown=65532:65532 /app/.next/standalone ./
COPY --from=build --chown=65532:65532 /app/.next/static ./.next/static
COPY --from=build --chown=65532:65532 /app/public ./public

# 65532 é o usuário `nonroot` da imagem distroless; numérico para o
# Kubernetes/Docker conseguirem conferir que não é root sem ler o /etc/passwd.
USER 65532:65532
EXPOSE 3000

# A imagem distroless não tem curl nem shell: o próprio Node faz a checagem.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3000/api/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["server.js"]
