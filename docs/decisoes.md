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

---

## ADR-019 · Documento de entrega é TSX renderizado, não PDF anexado

**Contexto.** SWOT, personas, mapa de empatia e backlog estavam escritos num bloco
"Detalhamento" no fim de cada semana, e as evidências apontavam para `/registro#s2` — uma
URL que deixou de existir quando o registro virou seção da raiz. Quem avaliasse teria que
rolar um bloco longo procurando o documento certo, ou clicar num link morto.

**Decisão.** Documento vira peça de primeira classe: `ModuloCiclo.documentos` é uma lista de
`{ id, titulo, resumo, Conteudo }`, e cada um abre numa sanfona própria dentro da semana. A
evidência correspondente aponta para a âncora `#doc-<ciclo>-<id>`.

**Consequência.** O professor clica no título e lê ali — sem PDF, sem aba nova, sem download,
sem link que expira. O documento fica versionado em TSX: um diff mostra o que mudou na SWOT
entre duas semanas, coisa que anexo binário não dá. Dois testes novos seguram o arranjo: um
recusa âncora sem documento correspondente, outro exige id único e resumo em cada documento.

O custo é real e vale dizer: escrever documento em TSX é mais trabalhoso que exportar um PDF
do Figma ou do Docs, e quem escreve precisa usar os primitivos de `components/conteudo.tsx`
em vez de formatar à vontade. Em troca, o documento é conteúdo do site — pesquisável,
responsivo, acessível e sujeito às mesmas checagens do resto.

**O selo saiu junto.** Com todos os blocos validados, a pílula "validado" repetida 40 vezes
não informava nada. O `Selo` agora só renderiza em rascunho: o carimbo existe para avisar do
que ainda não foi revisado, e ausência de aviso é a informação.

---

## ADR-020 · Semanas futuras são planejamento declarado, não relato

**Contexto.** Pediu-se o registro preenchido até a Semana 12. Só que essas semanas não
aconteceram — a Semana 5 é 19/09 e hoje é agosto. O registro é o artefato factual que a
banca avalia: escrever "Avanços" de uma semana futura é afirmar que algo ocorreu.

**Decisão.** Escrever as dez semanas restantes como **plano**, usando o mecanismo que o
projeto já tinha: todos os blocos com selo `rascunho`, que a interface exibe como pílula
visível — e as semanas já vividas, validadas, não exibem selo nenhum. A distinção fica na
tela, não num rodapé que ninguém lê. O bloco `feedback` fica em `nenhum` em todas elas:
retorno de professor ou de cliente é fala de terceiro, e escrever por eles seria fabricar
evidência, não planejar.

**Consequência.** O semestre inteiro fica navegável, o professor vê que houve planejamento
até o SR2, e ninguém confunde plano com relato. O custo é disciplina de manutenção: quando a
semana chegar, alguém precisa reescrever o bloco contra o que de fato aconteceu e trocar o
selo — se não fizer, o site fica dizendo "rascunho" numa semana já vencida, que é o sintoma
correto de um registro desatualizado.

---

## ADR-021 · A vitrine abre com prazo, não com interruptor

**Contexto.** Para uma apresentação, o site inteiro precisa ficar visível por algumas horas.
`RELEASE_OVERRIDE=sr2` já faz isso — e fica aberto até alguém lembrar de fechar. Numa semana
de entrega, ninguém lembra.

**Decisão.** `RELEASE_ABERTO_ATE` recebe um instante ISO 8601. Enquanto o relógio não passar
dele, TODO visitante enxerga os 18 ciclos e as oito telas; depois, o recorte volta sozinho.
`janelaAberta` é função pura com o "agora" injetado, e a faixa do topo anuncia a vitrine
para todo mundo — não só para quem tem sessão.

**Consequência.** Isto **suspende a garantia do §6.3 de propósito**, e é a única coisa no
projeto que faz isso: com a janela aberta, conteúdo de semana futura chega ao HTML do
visitante. É o comportamento pedido, tem prazo, e se anuncia. `verificar-vazamento` roda sem
a variável e continua provando o comportamento normal — 90 verificações.

Valor ausente, vazio ou malformado fecha a janela. Uma env var digitada errada não pode
derrubar o site e, muito menos, abri-lo por acidente: `'amanhã de manhã'` resulta em fechada,
com teste que prova.

**Visibilidade e calendário são coisas separadas, e as duas precisam andar.** A primeira
versão desta janela só liberava o que estava visível — e não bastava: com todos os ciclos no
ar mas o relógio em agosto, o topo continuava dizendo "próximo marco: Kick-off, faltam 27
dias" e o SR2 aparecia como "a realizar". `RELEASE_DATA_SIMULADA` move o calendário do site
inteiro, e só funciona com a janela aberta — quando o prazo vence, a data volta junto com a
visibilidade, sem ninguém precisar lembrar.

**A vitrine é versionada, e a env var só a corrige.** `src/content/vitrine.ts` carrega o
prazo e a data simulada no próprio código, então abrir a vitrine é um `git push`, e não uma
visita ao painel da Vercel para colar dois valores e pedir redeploy. `RELEASE_ABERTO_ATE` e
`RELEASE_DATA_SIMULADA` continuam existindo e vencem o valor versionado, para quem opera
conseguir consertar uma data errada às pressas sem abrir o editor.

Consequência que precisou de conserto em três lugares: com a vitrine aberta por padrão,
`verificar-vazamento` e o Playwright passariam a medir a exceção em vez do comportamento
normal, e a garantia do §6.3 ficaria sem prova justamente nos dias em que ela mais importa.
Os dois fecham a janela explicitamente por env var, e os testes de unidade recebem a vitrine
por parâmetro em vez de ler a global.

**A simulação achou um bug.** Com o site em janeiro de 2027, a pílula "esta semana" grudou no
SR2. `cicloCorrente` devolve o último ciclo já vencido, o que está certo para "qual foi o
último" e errado para "qual é esta semana" — e a diferença só aparece depois do fim do
cronograma. Nasceu daí `ehSemanaCorrente`, que exige que o dia caia dentro dos sete dias do
ciclo, com teste que fixa exatamente esse caso.

---

## ADR-022 · Modelos treinam offline; o site lê o resultado versionado

**Contexto.** A tela de analytics precisava sair de heurística para modelo treinado. Rodar
scikit-learn dentro do Next não é opção: o site é serverless, e carregar o runtime de ML a
cada requisição custaria segundos de cold start para exibir números que só mudam entre
deploys.

**Decisão.** `ml/` treina offline em Python e escreve `src/content/ml/resultados.json`, que é
versionado. O app lê o JSON por `src/lib/ml.ts` e nunca infere em tempo real. O pacote carrega
semente, commit, versão do sklearn e data do treino.

**Consequência.** A tela fica instantânea e — o que importa mais — o número fica auditável:
qualquer pessoa reproduz rodando `python ml/gerador.py && python ml/exportar.py`. O custo é
que o JSON precisa ser regerado quando o gerador ou os modelos mudarem; não há automação que
force isso, e é uma pendência honesta.

**Três decisões metodológicas ficaram no código, não só no notebook.** A separação
treino/teste é **temporal**, nunca aleatória — sortear linhas deixaria o modelo ver
competências futuras do mesmo indicador, que é o erro clássico de vazamento em série
temporal. Todo modelo é publicado **com a linha de base ao lado**, porque acurácia sem
referência engana num alvo desbalanceado. E o clustering agrupa **áreas**, nunca pessoas.

**O resultado negativo fica publicado.** O classificador de "vai bater a meta" não supera o
palpite de chutar a classe majoritária — só 5 dos 30 indicadores batem a meta no mês de
teste, e não há sinal a extrair. A tela diz isso em vermelho. Ao lado dele fica a mesma
família de modelo numa pergunta bem posta ("vai melhorar?"), que supera a referência com F1
de 0,80. Publicar as duas é a diferença entre relatar e escolher a métrica depois de ver o
resultado.

**E o limite que a lente de Direito impôs à de ML:** nenhuma saída dos modelos entra no
cálculo da gratificação. O art. 20 da LGPD dá ao titular direito a revisão de decisão
automatizada, e gratificação afeta remuneração — por isso o motor de cálculo é determinístico
e auditável, e o ML fica fora dele, sinalizando onde olhar sem decidir nada.

---

## ADR-023 · O sistema é uma página só, e o perfil deixa de ser decoração

**Contexto.** Cada uma das oito funcionalidades era uma rota (`/sistema/cam`,
`/sistema/auditoria`, e assim por diante). Clicar num item do menu levava embora, e de lá não
havia caminho de volta a não ser o botão do navegador. A barra do topo eram links de texto
sem forma de botão, repetindo uma grade de cartões logo abaixo: duas navegações para o mesmo
lugar, e nenhuma delas parecendo clicável. Quem usou descreveu como "completamente
desorganizado", e estava certo.

Havia um problema mais sério embaixo desse. **Cinco das oito telas não olhavam o perfil.**
`indicadores`, `meu-resultado`, `auditoria`, `painel-gestao` e `analytics` renderizavam
inteiras para qualquer um: o filtro existia só na montagem do menu, então quem digitasse a
URL entrava. O briefing pede perfis de acesso; o que existia era ordenação de menu com outro
nome.

**Decisão.** Três mudanças que só fazem sentido juntas.

1. **`/sistema` monta tudo.** O corpo de cada tela virou componente em
   `src/components/sistema/telas/`, sem gate por dentro, e a página os empilha em `<details>`,
   o mesmo padrão do registro semanal (ADR-006). As oito rotas antigas continuam existindo e
   redirecionam para `/sistema?abrir=<id>#tela-<id>`.

2. **`exigirPerfil` ao lado de `exigirFeature`.** Além do gate de release, a tela confere se a
   funcionalidade pertence ao perfil ativo, e responde **404**, não 403, pela mesma razão de
   `/admin`: da porta, "ainda não liberado" e "não é seu" precisam ser indistinguíveis. O
   redirecionamento das rotas antigas vem depois do gate, nunca antes. Um teste percorre as
   oito telas contra os quatro perfis, sem amostragem.

3. **Sumário grudado no topo, com ícone e borda.** Só as telas do perfil. Nada em cinza, nada
   de "indisponível": o que não é seu não aparece. Os cartões duplicados sumiram.

**Por que `abrir=` e não a âncora sozinha.** Existe uma regra nova de HTML que manda expandir
um `<details>` quando a navegação aponta para dentro dele. Ela funciona ao carregar a página
com fragmento, e não em todo caminho de clique nem em todo navegador — medimos. Um item de
sumário que rola até um bloco fechado é pior do que um que não rola. Com `abrir=` quem decide
é o servidor, e o resultado é igual em qualquer navegador, com ou sem JavaScript.

**A query string ganhou espaço de nomes.** Oito telas dividindo uma URL fariam `ciclo`
significar quatro coisas ao mesmo tempo, e um lançamento bem-sucedido pintaria a faixa verde
também no dashboard da CAM, que não fez nada. Cada tela leva um prefixo (`aud_ciclo`,
`gest_ciclo`, `res_ciclo`), a faixa de resultado carrega `de=<tela>`, e os formulários levam
campos ocultos que preservam o estado das vizinhas. É feio na barra de endereço e é a única
forma de o estado de uma tela não vazar para a outra.

**Consequência.** A armadilha da ADR-018 vale aqui em dobro: **sanfona fechada não esconde
HTML.** O que protege é a ordem dos gates em `page.tsx` — release, depois perfil, e só então o
componente é montado. Inverter isso derrubaria o §6.2 sem que nada aparentasse quebrar. A
verificação de vazamento ganhou uma checagem para exatamente esse caso: nenhuma sanfona de
tela fora do perfil aparece no HTML de `/sistema`.

O custo é que uma requisição renderiza as oito telas, abertas ou não. Para um MVP com base
sintética em memória isso não pesa; com banco de verdade, cada tela precisaria carregar sob
demanda.
