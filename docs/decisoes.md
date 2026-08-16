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

> **Superada pela ADR-016.** O raciocínio de contraste continua valendo e é por isso que o
> botão primário do tema escuro também não usa branco. O tema claro que ela descreve não
> existe mais.

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

---

## ADR-011 · O schema de banco existe, mas o app não depende dele

**Contexto.** A F3 integrou o Supabase ao runtime. Revisando, o custo não se pagava: quatro
contas de demonstração para mostrar o que o seletor de perfil já mostrava sem login, e o
middleware do Edge saltando de 34 kB para 94 kB em toda requisição de `/sistema`.
**Decisão.** Tirar o Supabase do app; manter `supabase/migrations/` e os testes de RLS como
artefato versionado.
**Consequência.** O projeto volta a rodar sem nenhuma credencial e perdeu ~1.300 linhas de
runtime e duas dependências. O schema continua aplicável a qualquer PostgreSQL por
`npm run semear`, e ligar um driver de banco depois é acrescentar um arquivo — a camada
`src/lib/dados/` ficou no lugar justamente para isso.

---

## ADR-012 · Critério da decisão: requisito do professor × escolha de stack

**Contexto.** A dúvida não era técnica, era de escopo: o Supabase é exigência da disciplina
ou preferência nossa?
**Decisão.** Separar o que o briefing atribui ao professor (registro §5, matriz de evidências
§4, pitch, pacotes de SR1/SR2, ML e Direito) do que ele lista como stack (§3, onde o Supabase
aparece ao lado de framer-motion e shadcn). Nada exige um banco específico; o MVP já cumpria
tudo com o seed.
**Consequência.** O critério fica registrado para as próximas decisões de tecnologia: o que
não for rastreável a um requisito é candidato a corte. Se o professor pedir persistência, o
schema já está escrito e testado.

---

## ADR-013 · As políticas de RLS foram testadas contra um PostgreSQL real

**Contexto.** Política de RLS escrita não é política funcionando: uma cláusula `using` errada
falha em silêncio e só aparece quando alguém lê o que não devia.
**Decisão.** `src/lib/supabase/rls.test.ts` aplica as migrações num banco limpo e exercita
cada perfil como o PostgREST faria, setando `request.jwt.claims` e assumindo o papel
`authenticated`.
**Consequência.** São 21 verificações que continuam rodando no CI mesmo com o app fora do
banco. Sem `DATABASE_URL_TESTE`, a suíte é pulada e o resto dos testes segue — nada trava
para quem não tem Postgres à mão.

---

## ADR-014 · Invariantes de negócio são gatilho, não política

**Contexto.** RLS filtra por usuário, mas a service role a ignora. Trilha append-only e
máquina de estados não podem depender de quem está conectado.
**Decisão.** No schema, trilha imutável, transição de ciclo um passo por vez, janela de
lançamento e regra imutável são gatilhos em `plpgsql`.
**Consequência.** Nem um script com a chave mais privilegiada reescreve a trilha ou reabre um
ciclo homologado — o script de semeadura teve que obedecer à mesma ordem de estados que a
interface. No app, sem banco, essas garantias dependem de `src/lib/sistema/estado.ts` ser o
único caminho de escrita, o que é mais fraco e está declarado em docs/seguranca.md.

---

## ADR-015 · Avançar fase exige sessão de admin, e o controle some para os demais

**Contexto.** Sem Supabase, o `/sistema` voltou a rodar sem autenticação. O estado do ciclo
vive em variáveis de módulo (`src/lib/sistema/estado.ts`) — memória do processo, compartilhada
por todos os visitantes daquela instância — e a transição não tem volta pela interface. A tela
da CAM ainda oferecia o botão a qualquer um, desabilitado, com a legenda "Só o perfil CAM
avança o estado do ciclo": um convite a trocar o perfil no seletor e clicar. Um clique alheio
deixaria a janela de lançamento fechada para todo mundo, inclusive para o professor.

**Decisão.** `/api/sistema/ciclo` chama `exigirAdmin()` antes de qualquer coisa, e o formulário
de transição só é renderizado quando `ContextoSistema.admin` é verdadeiro. O ponto do rodapé
que apontava para `/admin/entrar` saiu. Lançamento, contestação e o seletor de perfil continuam
abertos: são o MVP que o professor precisa navegar, são aditivos e aparecem na trilha.

**Consequência.** A demonstração deixa de ser adulterável por quem passa pelo site, e a prévia
"ver como visitante" ficou fiel — `admin` também é `false` nela, então o admin enxerga
exatamente os controles que o visitante enxergaria. O que **não** muda: o repositório é público
e `docs/seguranca.md` descreve o painel, porque o §7 exige essa análise. Quem protege de fato é
`ADMIN_SENHA` trocada em produção, não o esconderijo — enquanto ela for `0321`, isto é
arrumação de interface, não controle de acesso. A resposta é 404, não 403, pela mesma razão de
`exigirAdmin` em `/admin`: não confirmar o mecanismo a quem não deveria conhecê-lo.

---

## ADR-016 · Identidade "folha de especificação": escuro, monoespaçado, um acento

**Contexto.** O visual anterior era claro e sans-serif, com a mono reservada aos números. Ele
funcionava e não dizia nada: parecia um site institucional qualquer. O produto é uma memória
de cálculo auditável, e a página deveria parecer o que o produto é.

**Decisão.** Modo escuro (`#0A0B0A`), tudo monoespaçado (Martian Mono no display, JetBrains
Mono no resto), blocos delimitados por hairline de 1px com `margin-top: -1px` para as bordas
colapsarem como tabela, raio zero exceto em pílulas, e **um único acento**. O acento é o
laranja da CESAR tirado do arquivo da logo — `#F7580B`, não o `#F15A24` do briefing, que não
bate com o asset real. O verde da referência original foi descartado: dois acentos numa
página com a logo laranja matam a identidade.

**Consequência.** Contraste conferido em todos os pares que a identidade usa: acento sobre
fundo 5,97:1, texto apagado sobre fundo 6,00:1, acento sobre o preenchimento de pílula 5,47:1,
`ink` sobre acento sólido 5,97:1 — todos acima de 4,5:1. A escala tipográfica do briefing
original teve que ser recalibrada: mono tem avanço fixo e bem mais largo, e a headline mínima
de 2,5rem estourava 360px. O que se perdeu: a paleta clara do §12 do briefing deixou de
existir, e a ADR-009 foi superada. O que se ganhou: uma tela que a banca reconhece de longe.

---

## ADR-017 · Reveal no scroll sem JavaScript

**Contexto.** A identidade pede que os blocos entrem com fade e deslocamento. O site inteiro
funciona sem JavaScript (ADR-006) e não queríamos abrir exceção por causa de animação.

**Decisão.** `animation-timeline: view()` em CSS, dentro de `@supports`. Onde houver suporte,
o bloco anima conforme o scroll; onde não houver, ele já nasce visível.

**Consequência.** Zero bytes de JS e nenhum observer. Em contrapartida, o conteúdo abaixo da
dobra fica em `opacity: 0` até ser rolado — o que confunde captura de tela de página inteira
e exigiria cuidado se algum dia houver impressão. `prefers-reduced-motion` desliga tudo e
força opacidade cheia.

---

## ADR-018 · O site é uma página só, e por isso a raiz deixou de ser estática

**Contexto.** O registro morava em `/registro` e a raiz era uma bifurcação: o professor tinha
que escolher por onde entrar antes de saber o que havia de cada lado. Duas páginas para um
site que cabe numa.

**Decisão.** A raiz passa a conter tudo — problema, equipe, marcos e o registro semanal, cada
semana num `<details>` que abre com a setinha. A mais recente já vem aberta. `/registro` vira
redirecionamento para `/#registro`, para não quebrar link já compartilhado. O único caminho
que sai da página é o sistema.

**Consequência.** A raiz **deixou de ser estática**: o gate de release lê cookie e depende do
calendário, então HTML assado no build congelaria o release ou vazaria semana futura. Ganhou
`force-dynamic` e uma renderização por requisição — o preço de ter o registro ali.

Duas armadilhas ficaram documentadas no código. A primeira: `<details>` fechado **continua no
DOM**, então a sanfona não é mecanismo de ocultação; semana não liberada não pode ser
renderizada, dobrada ou não, e o gate segue acontecendo antes do carregador. A segunda: as
checagens de vazamento caíram de 120 para 90 porque `/registro` saiu da lista de rotas
conferidas — não é cobertura perdida, é a mesma rota deixando de ser conferida duas vezes.

O acordeão é `<details>` nativo, não Radix: zero JavaScript, teclado de graça, e nenhum
componente cliente perto de conteúdo de ciclo (ADR-005 e ADR-006).

**Nenhuma semana abre por padrão.** A primeira versão abria a mais recente. O uso real é
outro: o professor volta toda semana procurando UMA linha, e qualquer semana aberta empurra
as demais para fora da tela. A semana corrente vem marcada com uma pílula, o que resolve
achar sem ocupar espaço — e ela nem sempre é a do topo, porque o release roda sete dias à
frente.

**O que saiu por repetição.** O bloco de números (30 indicadores / 10 áreas / 2 regras)
dizia o mesmo que o subtítulo do hero e que o bloco "o problema" — e dizia com os números da
base sintética, que são os mais fracos dos três. O bloco "memória de cálculo" repetia a
headline e o card "gestor confere"; a fórmula migrou para dentro do fluxo, onde ela pertence,
e a segunda chamada para o sistema saiu junto. A logo da CESAR ficou só no hero. O subtítulo
do hero foi reescrito para dizer o que o sistema **faz**, já que o problema tem bloco próprio.
