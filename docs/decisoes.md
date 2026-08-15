# Decisões de arquitetura (ADRs)

Cada decisão em cinco linhas: contexto, decisão, consequência.

---

## ADR-001 · Regra de pontuação é dado versionado, não código

**Contexto.** A portaria muda; se a regra estiver em `if`, cada mudança vira release.
**Decisão.** Regra é registro com faixas, vigência e versão. Alterar cria nova versão.
**Consequência.** Ciclo homologado reproduz o próprio resultado para sempre; a mudança fica
visível num diff; o preço é um modelo de dados mais elaborado e a necessidade de escolher a
regra vigente por competência.

---

## ADR-002 · Motor de cálculo é função pura

**Contexto.** O cálculo precisa ser auditável e testável nos casos-limite.
**Decisão.** `calcularAvaliacao` não faz I/O, não lê relógio e não sorteia nada.
**Consequência.** Testes cobrem fronteiras de faixa, arredondamento e troca de regra sem
subir infraestrutura; o mesmo insumo devolve sempre o mesmo número. Em troca, quem chama
precisa buscar os dados antes.

---

## ADR-003 · Peso normalizado só na divisão final

**Contexto.** Normalizar peso a peso antes de somar introduz erro de arredondamento — três
indicadores perfeitos com peso igual davam 99,9 em vez de 100.
**Decisão.** `score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100`.
**Consequência.** A memória de cálculo fecha exatamente na conta que ela mesma exibe, que é
o requisito central do produto. O campo `pesoNormalizado` permanece na memória apenas como
informação de leitura.

---

## ADR-004 · Configuração global vem de env var em produção até a F3

**Contexto.** O filesystem da Vercel é read-only; o driver de arquivo do config store não
funciona lá, e o Supabase só entra na F3.
**Decisão.** Em produção, o store é somente leitura e alimentado por env var; as mudanças
feitas no painel viram overlay assinado na sessão do próprio admin.
**Consequência.** O admin ajusta a própria visão à vontade; mudar o que o público vê exige
alterar variável e fazer redeploy. Está avisado na cara do operador, dentro do painel.

---

## ADR-005 · Conteúdo de ciclo nunca é Client Component

**Contexto.** Um componente cliente dentro de `content/ciclos/` geraria chunk próprio em
`.next/static`, descobrível mesmo sem estar referenciado.
**Decisão.** Arquivos de conteúdo são sempre Server Components; interatividade vem de
componentes compartilhados em `src/components/`.
**Consequência.** A garantia do §6.3 deixa de depender de disciplina e passa a ser
verificável — `scripts/verificar-vazamento.ts` confere HTML, payload RSC e bundle a cada
build. O custo é uma restrição real sobre o que o conteúdo pode fazer.

---

## ADR-006 · Formulários HTML puros em vez de estado no cliente

**Contexto.** Login, lançamento e ações do painel precisam ser simples, acessíveis e
seguros.
**Decisão.** Todo POST é `<form method="post">` para route handler, sem JavaScript.
**Consequência.** Funciona sem JS, simplifica a CSP e reduz o bundle a quase nada. Em troca,
cada ação recarrega a página e o feedback vem por query string.

---

## ADR-007 · Datas civis em string, nunca `Date`

**Contexto.** O cronograma é a fonte de verdade do projeto e o fuso é America/Recife;
`toISOString().slice(0,10)` erra o dia toda noite.
**Decisão.** Datas são `YYYY-MM-DD`; comparação é lexicográfica; a conversão do "agora" usa
`Intl.DateTimeFormat` com `timeZone`.
**Consequência.** Elimina uma classe inteira de bugs e faz os testes rodarem igual em
qualquer TZ de CI. Exige disciplina: nada de `new Date()` dentro de regra de negócio.

---

## ADR-008 · Checklist da matriz vive no Git, não em formulário

**Contexto.** O §7.3 diz que o painel não edita conteúdo. Status de entrega é conteúdo.
**Decisão.** `src/content/checklist.ts` guarda os status; o painel apenas exibe.
**Consequência.** Histórico de quem mudou o quê fica no Git — coerente com o que o projeto
defende — e o checklist continua funcionando em produção, onde não há escrita. O custo é
editar um arquivo em vez de clicar.

---

## ADR-009 · Botão primário usa tinta sobre laranja, não branco

**Contexto.** Branco sobre `#F15A24` dá 3,37:1, abaixo do mínimo AA para texto normal.
**Decisão.** Botão primário é laranja com texto em tinta (6,45:1). Cinza do briefing fica
para texto grande; texto pequeno secundário usa uma variante escurecida (5,36:1).
**Consequência.** A paleta do briefing é respeitada e o contraste passa em AA. A variante
`--color-cinza-forte` é adição nossa, documentada em `globals.css`.

---

## ADR-010 · Camada de escrita da F2 é em memória, e isso é declarado

**Contexto.** O protótipo precisa demonstrar transição de estado e lançamento antes de
existir banco.
**Decisão.** `src/lib/sistema/estado.ts` guarda alterações em memória do processo.
**Consequência.** A demonstração é real e completa, mas as alterações se perdem no reinício
— dito no próprio arquivo, em `seguranca.md` e nesta lista. Na F3 vira tabela com RLS,
mantendo a forma dos dados.
