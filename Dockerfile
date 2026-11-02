# Prumo: a aplicação num container, para rodar sem Node nem npm na máquina.
#
# Não é para usar sozinho: o docker-compose.yml sobe este container junto com
# o PostgreSQL e passa a DATABASE_URL. Ver docs/banco.md, seção "Tudo no Docker".
#
# Três estágios, para que mudar uma linha de código não reinstale as
# dependências: o `npm ci` só roda de novo quando o package-lock.json muda.

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Dependências, inclusive as de desenvolvimento: o `tsx` roda a migração na
#    subida do container.
FROM base AS dependencias
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 2. Build de produção. As fontes são versionadas (ADR-028), então o build não
#    precisa de rede.
FROM base AS build
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. O que roda. `src/`, `scripts/` e `db/` vão junto porque a subida aplica as
#    migrações e, com o banco vazio, carrega a base sintética.
FROM base AS app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000

# Migra (só o que é novo), semeia (só se o banco estiver vazio) e sobe o site.
CMD ["sh", "-c", "npx tsx scripts/db.ts preparar && exec npx next start -p 3000 -H 0.0.0.0"]
