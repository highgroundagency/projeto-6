# Prumo — regras da casa

Contexto para qualquer pessoa (ou agente) que for mexer neste repositório.

## O que é

Site do Projeto 6 da CESAR School (2026.2, Equipe 1). Duas camadas:

- **`/registro`** — o diário de bordo semanal. É o artefato avaliado pelo professor; ele
  substitui o Google Site.
- **`/sistema`** — MVP do cálculo da gratificação por desempenho da SESAU Recife.

## Regras que não se negociam

1. **Nenhum dado real** de pessoa ou da SESAU entra no repositório, no seed ou em prompt de
   IA. Tudo sintético. Há teste que falha se um CPF, e-mail ou telefone aparecer na base.
2. **Datas só mudam em `src/lib/cronograma.ts`.** É a fonte única de verdade; header,
   releases, registro e checklist derivam dela.
3. **Arquivos de `src/content/ciclos/` nunca contêm `'use client'`.** Um componente cliente
   ali geraria chunk próprio em `.next/static`, e conteúdo de release futuro vazaria. Se
   precisar de interatividade, use um componente compartilhado de `src/components/`.
4. **Conteúdo vive no Git, não em formulário.** O painel administrativo decide *quando* o
   que já existe fica visível; ele não edita texto.
5. **Data nunca é `Date`.** Sempre `YYYY-MM-DD` em string, comparada lexicograficamente. O
   "hoje" é injetado nas funções de regra, nunca lido dentro delas.
6. **Motor de cálculo é função pura.** Sem I/O, sem relógio, sem aleatoriedade.
7. **Um acento só.** `--color-acento` é o laranja da CESAR e aparece em no máximo três
   lugares por tela: número grande, chamada sólida e pílula/ícone do fluxo. Se precisar de
   mais uma cor para diferenciar alguma coisa, use hairline e caixa alta, não cor.

## A identidade em uma linha

Folha de especificação em modo escuro: tudo monoespaçado e minúsculo, blocos delimitados por
hairline de 1px que se encostam como tabela (`.bloco`, com `margin-top: -1px`), raio zero
exceto em pílulas, e o gradiente granulado como única imagem do site. Caixa alta só em rótulo
de estado ou etapa. Os detalhes e os contrastes conferidos estão na ADR-016.

## Idioma

Interface, documentação e commits em **português**. Os identificadores de código também são
em português — o briefing do projeto nomeia arquivos e funções assim (`cronograma.ts`,
`calcularAvaliacao`, `RegistroSemana`, `configuracao_site`), e misturar dois idiomas seria
pior que escolher um. Mantenha a consistência.

## Estrutura

```
src/
├── app/                 rotas (App Router)
├── components/
│   ├── base/            botão, selo, marca, rodapé, cabeçalho, fluxo, faixa do admin
│   ├── registro/        topo, trilhas, cartão do registro semanal
│   ├── sistema/         memória de cálculo, painéis
│   └── conteudo.tsx     primitivos usados pelo conteúdo dos ciclos
├── content/
│   ├── ciclos/          um arquivo por ciclo + registry server-only
│   ├── equipe.ts        os 6 integrantes e seus papéis
│   ├── checklist.ts     status das evidências da matriz
│   └── produto.ts       nome, problema, pergunta do projeto
└── lib/
    ├── cronograma.ts    FONTE ÚNICA DE VERDADE das datas
    ├── datas.ts         aritmética civil em America/Recife
    ├── releases.ts      motor de releases (puro)
    ├── visao.ts         resolve admin, data simulada e ciclos visíveis
    ├── features.ts      tela → ciclo que a libera
    ├── admin/           sessão, senha, rate limit, guard
    ├── calculo/         motor da gratificação (puro) e tipos
    ├── config/          config store com drivers
    ├── dados/           repositório (driver único: seed) e mapeadores
    ├── seed/            base sintética com semente fixa
    ├── supabase/        testes das políticas de RLS do schema guardado
    └── sistema/         identidade simulada e camada de escrita do protótipo

supabase/
├── migrations/          schema, gatilhos e políticas de RLS — versionado, NÃO ligado ao app
└── testes/              stubs para rodar as migrações num Postgres comum
```

## Onde os dados vivem

**Em memória.** O app não usa banco: `git clone && npm run dev` funciona sem nenhuma
credencial. As telas falam com `src/lib/dados/`, nunca com o seed direto — é o que mantém a
porta aberta para uma fonte persistente sem reescrever tela.

`supabase/migrations/` guarda um schema PostgreSQL completo, com RLS e gatilhos, testado
contra um banco real mas desligado da aplicação. O porquê está em `docs/decisoes.md`
(ADR-011 e ADR-012); o como usar, em `docs/banco.md`. Não presuma que ele está no caminho de
execução.

## Comandos

| Comando | Para quê |
| --- | --- |
| `npm run dev` | Desenvolvimento |
| `npm test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` — quebra se um ciclo publicado estiver incompleto |
| `npm run verificar-vazamento` | Prova que conteúdo futuro não vaza (exige `npm run build` antes) |
| `npm run e2e` | Playwright |
| `npm run testar-rls` | Políticas do schema guardado contra um Postgres real (exige `DATABASE_URL_TESTE`) |
| `npm run semear` | Semeia a base sintética num Postgres com o schema aplicado (exige `DATABASE_URL`) |
| `npm run verificar` | typecheck + testes + build + verificação de vazamento |

## Antes de abrir PR

1. `npm run verificar` verde.
2. Se mexeu em conteúdo de ciclo, confira o registro no navegador como **visitante**, não
   como admin.
3. Se usou IA, adicione a linha correspondente em `docs/uso-de-ia.md` — inclusive quem
   validou.

## Onde ler mais

`docs/releases.md` explica como operar o que o professor vê. `docs/decisoes.md` guarda os
porquês. `docs/seguranca.md` e `docs/privacidade.md` cobrem as análises exigidas pela
disciplina.
