# Prumo

Registro do projeto e MVP do sistema de cálculo da **gratificação por desempenho da
Secretaria de Saúde do Recife (SESAU)**.

CESAR School · Sistemas de Informação · 2026.2 · Projeto 6 · Equipe 2

---

## O problema

Desde 2023 a SESAU paga gratificação variável a gestores, supervisores e coordenadores com
base em indicadores definidos em portaria. São dezenas de indicadores, várias áreas
responsáveis e múltiplas regras de cálculo, consolidados **manualmente em planilhas** pela
Comissão de Avaliação de Metas. O processo é frágil: inconsistências passam despercebidas,
não há rastreabilidade, a manutenção é difícil e tudo depende do conhecimento de poucas
pessoas.

> **Como tornar o cálculo da gratificação confiável, transparente, sustentável e auditável?**

A resposta do produto: **regra de pontuação como dado versionado** e **memória de cálculo
auditável** — qualquer número exibido responde "de onde veio?" em um clique.

## As rotas

| Rota | O que é |
| --- | --- |
| `/` | A página: problema, equipe, marcos e o registro semanal em sanfona — o artefato avaliado |
| `/sistema` | O MVP funcionando, com a base 100% sintética do seed |
| `/registro` | Redirecionamento para `/#registro`, para não quebrar link já compartilhado |
| `/pitch` | Os dezessete slides do Kick-off, liberados com o ciclo `ko`: setas, notas com `n` e a memória de cálculo real no slide da demonstração |
| `/ml` | Os slides da AV1 de machine learning, com PDF de reserva em `/ml/pdf`. Os números vêm da base por unidade da SESAU, em `ml/data/` |
| `/sr1` | O deck do SR1, no mesmo desenho do Kick-off, com PDF de reserva em `/sr1/pdf` |
| `/arquitetura` | Os quatro níveis do C4, desenhados para caber num projetor |
| `/transparencia-ia` | O registro de uso de IA, lido de `docs/uso-de-ia.md` |

O site tem duas realidades: a **pública** (o recorte visível hoje) e a **completa** (tudo
que a equipe já construiu). O recorte avança sozinho conforme o cronograma, uma semana à
frente. Ver `docs/releases.md`.

## Começando

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`. O painel administrativo fica em `/admin/entrar` — nenhuma
página do site aponta para lá, ver ADR-015.

### Variáveis de ambiente

Copie `.env.example` para `.env.local`. Nada é obrigatório para rodar localmente.

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_DRIVE_URL` | Link da pasta do projeto no Drive. Sem valor, o link não aparece |
| `ADMIN_SENHA` | Senha do painel (padrão `0321`) |
| `ADMIN_COOKIE_SECRET` | Assinatura do cookie de sessão. **Obrigatória em produção** |
| `RELEASE_ADIANTAMENTO_DIAS` | Quantos dias à frente o site mostra (padrão `7`) |
| `RELEASE_OVERRIDE` | Fixa o release num ciclo específico |
| `RELEASE_TRAVAS` | JSON de travas por ciclo |

## Verificação

```bash
npm run verificar
```

Roda, nesta ordem: `tsc --noEmit` → Vitest → `next build` → verificação de vazamento →
conferência do dossiê. O end-to-end fica em `npm run e2e`.

O que está coberto, contado em 25/09:

- **602 testes de unidade** — aritmética de data no fuso do projeto, motor de releases,
  config store, sessão do admin, completude do registro, motor de cálculo (55 casos), base
  sintética, a fronteira de `ml/data/` e os números ditos nos decks, conferidos contra os
  documentos de onde vêm.
- **23 verificações que exigem um PostgreSQL real** — 21 das políticas de RLS por perfil e
  dos invariantes de gatilho, aplicando as migrações reais num banco descartável
  (`npm run testar-rls`), e 2 da semeadura. Puladas automaticamente sem `DATABASE_URL_TESTE`.
- **164 verificações de vazamento** — nenhum conteúdo de release futuro no HTML, no payload
  RSC ou no bundle do cliente; rota não liberada responde 404, inclusive `/pitch`.
- **130 testes end-to-end** — jornadas críticas em desktop e em 360px, os decks incluídos.
- **Tipagem como portão** — um ciclo publicado sem responsáveis, com lista vazia ou com
  integrante inexistente **não compila**.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · zod · Vitest · Playwright · Deploy na
Vercel. **Sem banco**: os dados do app são sintéticos e vivem em memória.

Quase nenhum JavaScript de aplicação chega ao navegador: as telas são Server Components e
os formulários são HTML puro.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Diagramas C4, fluxo de dados e decisões de infraestrutura |
| [`docs/releases.md`](docs/releases.md) | Como operar o que o professor vê — manual da equipe |
| [`docs/seguranca.md`](docs/seguranca.md) | STRIDE, OWASP Top 10 e análise do próprio painel admin |
| [`docs/nuvem.md`](docs/nuvem.md) | Onde cada componente executa, pipeline, doze fatores e limites de escala |
| [`docs/privacidade.md`](docs/privacidade.md) | LGPD, base legal, Privacy by Design, direitos dos titulares e identificação indireta na base da SESAU |
| [`docs/decisoes.md`](docs/decisoes.md) | ADRs — os porquês, em cinco linhas cada |
| [`docs/banco.md`](docs/banco.md) | O schema PostgreSQL que existe mas não está ligado: por quê, o que contém e como usá-lo |
| [`docs/validacao.md`](docs/validacao.md) | O que é testado e os instrumentos de validação com o cliente |
| [`docs/uso-de-ia.md`](docs/uso-de-ia.md) | Registro semanal de uso de IA, com quem validou |
| [`CLAUDE.md`](CLAUDE.md) | Regras da casa para quem for mexer no código |

## Dados

**Dado de pessoa nunca entra neste repositório.** CPF, nome, matrícula, e-mail e telefone
ficam de fora sem exceção. É lei (LGPD), não permissão que o cliente possa dar.

**O site e o sistema rodam com base 100% sintética.** Unidades, indicadores, metas, gerentes
e lançamentos do seed (`src/lib/seed/`) são fictícios, gerados por script com semente fixa.
O teste `src/lib/seed/seed.test.ts` falha se um identificador pessoal aparecer nela.

**A base de desempenho por unidade da SESAU está em `ml/data/`**, no arquivo
`base nova completa.csv`, com autorização da Secretaria (ADR-044). É dado institucional:
tipo de unidade, distrito, indicador e número, sem nome de ninguém. Só os cadernos da lente
de ML leem o arquivo. O app lê apenas os JSONs que eles gravam (`src/content/ml/`), e a
autorização não se estende ao seed. O teste
`src/lib/dados-do-cliente.test.ts` varre `ml/data/` inteiro, linha a linha, atrás de CPF,
e-mail, telefone e coluna que identifique pessoa. O risco de identificação indireta que
sobra está analisado em [`docs/privacidade.md`](docs/privacidade.md).
