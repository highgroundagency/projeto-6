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

---

## ADR-024 · O tutorial passou a conduzir, e o seletor de perfil ganhou o primeiro JavaScript

**Contexto.** O tutorial por papel da ADR-023 era uma lista numerada dentro de uma sanfona.
Ensinava e não conduzia: a pessoa lia os nove passos e depois se virava sozinha, procurando na
tela o botão que o texto descrevia. Quem usou pediu um tutorial que "leve a pessoa pelo
sistema mesmo, conduzindo e mostrando os botões".

Na mesma conversa veio outra queixa, menor e mais óbvia: trocar o papel no seletor exigia um
segundo clique num botão "Trocar". Escolher um papel numa lista já é a ação; pedir confirmação
para uma troca que não destrói nada é cerimônia sem função.

**Decisão.** `?passo=N` põe `/sistema` em modo tutorial. Sai o sumário, saem os papéis, saem as
outras sete telas. Fica a tela do passo, montada e aberta, com o elemento exato de que o texto
fala contornado em laranja e etiquetado, e uma barra grudada no rodapé com progresso, o que
fazer, o porquê dobrado e os botões de anterior, próximo e sair.

O destaque é um `<style>` injetado que casa com `#alvo-<nome>`. As telas não sabem que existe
tutorial: elas só declaram `alvo="cam-funil"` num `Painel`, que vira `id="alvo-cam-funil"`. O
mesmo `id` serve de âncora, então o navegador para exatamente no elemento contornado. Um
atributo, dois usos, nenhum nome duplicado, e um teste que falha se um passo apontar para alvo
que não existe.

**Tudo no servidor.** Cada passo tem URL própria, o botão "voltar" do navegador funciona, e dá
para mandar "olha o passo 4" por mensagem. Um passeio em overlay faria mais efeito e
dependeria de medir posições no cliente, que é frágil justamente no celular.

**O seletor de perfil virou o primeiro componente cliente do projeto.** `onChange` envia o
formulário; sem JavaScript, um `<noscript>` devolve o botão. É a primeira exceção à ADR-006, e
ela é pequena de propósito: nada do sistema depende desse JavaScript para funcionar, é só
conforto.

**Consequência.** A barra do guia é `sticky bottom-0`, não `fixed`. Com `fixed` era preciso
adivinhar um `padding-bottom` que compensasse a altura dela, e a altura muda com o texto e com
a tela: no celular a primeira versão comeu dois terços da janela. Grudada, ela flutua enquanto
se rola e entra no fluxo no fim da página, sem tapar nada.

---

## ADR-025 · A terceira lente era Nuvem, e o projeto estava chamando de Direito

**Contexto.** Uma auditoria do repositório contra os dois PDFs da disciplina encontrou uma
divergência que ninguém tinha visto. A Matriz Integrada nomeia as disciplinas-alvo no próprio
título: **Segurança da Informação, Aprendizado de Máquina e Arquitetura Nativa na Nuvem**. O
texto dos critérios pede infraestrutura em oito das treze semanas, com as palavras
"componentes de infraestrutura", "integração entre componentes" e "infraestrutura de
execução".

O projeto vinha se descrevendo como cobrindo "Projeto, Machine Learning e Direito Digital". A
palavra "Direito" não aparece na matriz; "LGPD" também não.

**Decisão.** Entra a lente que faltava, sem tirar a que sobrava. `docs/nuvem.md` e dois
documentos no registro, na Semana 5 (onde cada componente executa, pipeline ponta a ponta,
doze fatores) e na Semana 12 (trade-offs, escala e o que falta para virar produção). A lente
de Direito continua: um sistema que decide remuneração cai no art. 20 da LGPD, e a análise de
privacidade sustenta metade dos critérios de Segurança da Informação.

**Consequência.** A auditoria virou dado versionado em `src/content/auditoria.ts`: cada
exigência do professor com o texto literal, o estado e o caminho no repositório onde ela está
atendida. Vinte e quatro requisitos rastreados, dezoito atendidos, cinco parciais e um fora de
escopo declarado. O dossiê renderiza essa tabela, então a auditoria envelhece junto com o
código em vez de virar uma conversa perdida.

**A ressalva mais importante ficou escrita na própria lente:** nenhuma métrica de produção foi
medida. Os números de escala em `docs/nuvem.md` são raciocínio de capacidade, não benchmark, e
dizer o contrário seria inventar evidência, que é exatamente o que este projeto passou o
semestre inteiro recusando.

---

## ADR-026 · A copy fala com quem não é da área, e o selo de rascunho saiu de cena

**Contexto.** Quem usou o site relatou, com razão, que a linguagem era de especialista:
"memória de cálculo" não dizia para que servia, "ciclo", "homologação" e "publicação" eram
palavras soltas, o subtítulo do hero ("a regra vira dado versionado, e cada valor abre até a
origem que o gerou") só fazia sentido para quem já sabia o que era dado versionado. E as
semanas futuras exibiam a pílula "rascunho", que fala do processo interno da equipe e parecia
defeito para quem lê. O usuário-alvo declarado passou a ser alguém de pouca escolaridade, que
é de fato quem opera parte do processo real.

**Decisão.** Uma passada de linguagem no site inteiro, com três regras práticas:

1. **Palavra do processo ganha tradução ao lado, não substituição.** "Homologado" continua
   existindo, porque é o nome real da etapa na portaria; mas todo lugar que o exibe tem a
   explicação em uma frase a um clique ("A conta foi feita e a comissão aprovou o resultado").
   Nasceu `EXPLICACAO_ESTADO` em `calculo/tipos.ts`, exibido no dashboard da CAM e na seção
   "como funciona" da página inicial.
2. **Metáfora do cotidiano no lugar do termo de sistema.** Score virou "nota do mês (score)";
   competência virou "mês"; anonimizar virou "esconder os nomes"; evidência virou "de onde
   veio"; trilha append-only virou "histórico que ninguém consegue apagar". O termo técnico
   fica entre parênteses quando precisa continuar rastreável.
3. **Toda tabela diz como se lê.** A memória de cálculo ganhou um parágrafo "como ler" antes
   da tabela, porque mostrar a conta sem dizer para que ela serve era exatamente a reclamação.

**A seção "o ciclo" virou "como funciona".** Explica primeiro o site em duas frases (diário
do projeto + programa de exemplo) e depois desenha o fluxo do mês com uma frase de explicação
embaixo de cada etapa e ações numeradas (1 informa, 2 faz a conta, 3 confere).

**O selo "rascunho" não renderiza mais.** O dado continua nos arquivos de ciclo e o teste
continua exigindo validador em bloco validado; só a pílula saiu da frente do visitante. É a
segunda vida do mesmo aprendizado da ADR sobre "validado": selo que fala do processo interno
da equipe não é informação para quem avalia o produto.

**Consequência.** Os tutoriais foram reescritos por inteiro na mesma língua (25 passos), e a
tela é sempre descrita pelo que a pessoa VÊ ("cada barra mostra", "o cartão do topo"), não
pelo que o sistema é. O custo declarado: a copy ficou menos densa em vocabulário de auditoria,
que era parte da identidade "folha de especificação". A identidade visual fica; o vocabulário
passa a servir o leitor, não o contrário.

---

## ADR-027 · Modo claro por cookie, pintado no servidor

**Contexto.** A identidade nasceu como "folha de especificação em modo escuro" (ADR-016), e
modo escuro sozinho é uma escolha estética imposta a quem lê. Num sistema que vai ser aberto
em sala, projetado em reunião e usado em telas ruins de repartição, ter só o escuro é
limitação, não posição.

**Decisão.** Dois temas, com o mesmo desenho. Nada de layout muda entre eles: mudam onze
tokens de cor. O escuro segue no `@theme`; o claro vive em `[data-tema='claro']`.

**A escolha vive num cookie e é aplicada PELO SERVIDOR**, no atributo `data-tema` do `<html>`.
O caminho comum (ler `localStorage` no cliente) pinta a página no tema errado por um quadro
antes de corrigir, e o remendo habitual para isso é um script inline bloqueante no `<head>`.
Aqui o HTML já chega pintado, e há teste que busca o HTML cru e exige `data-tema="claro"`
dentro dele. O botão é um `<form>` que dá POST e volta, como o seletor de perfil: funciona sem
JavaScript.

**O acento muda de valor no claro, e isso é decisão.** O laranja da CESAR (#F7580B) dá 5,97:1
sobre o fundo escuro e apenas 3,2:1 sobre papel: reprovaria em AA como texto. No claro ele vira
#A83C05, o mesmo laranja com menos luz, que devolve exatamente os mesmos 5,97:1. A cor crua da
marca continua disponível em `--color-laranja`, para preenchimento e para a logo, onde
contraste de texto não se aplica. `--color-ink` inverte junto: no escuro é texto escuro sobre
laranja claro, no claro é texto branco sobre laranja escuro.

**Consequência declarada: ler cookie no layout raiz torna toda rota dinâmica.** O site já era
`force-dynamic` nas páginas que importam por causa do gate de release; o que se perde são as
duas últimas páginas pré-renderizadas, `/registro` e `/transparencia-ia`. Trocar a estática
delas por ausência de piscada é o negócio que este ADR aceita.

**O teste de contraste dobrou de tamanho e ganhou uma trava nova:** ele agora percorre os oito
pares nos dois temas (19 casos), e falha se o tema claro esquecer de redefinir qualquer token
de cor do escuro. Token esquecido herdaria o valor do escuro em silêncio, e o resultado seria
texto branco sobre papel branco.

**Um defeito antigo apareceu no caminho.** Quatro caixas de seleção usavam
`accent-[color:var(--color-laranja)]`, e `--color-laranja` nunca existiu: o valor resolvia
para inválido e o navegador caía no azul do sistema. Ou seja, nenhuma caixa de seleção do
projeto jamais foi laranja. O token passou a existir de fato, e as caixas apontam para
`--color-acento`, que acompanha o tema.

---

## ADR-028 · As fontes passam a ser arquivo versionado, não download de build

**Contexto.** O CI falhou cinco vezes em dois dias, em `main` e na branch de trabalho, e
nenhuma das falhas tinha a ver com o código. O sinal que denunciou isso foi o mais estranho
possível: **o mesmo commit passava numa branch e quebrava na outra**, minutos depois, sem
uma linha de diferença entre as duas execuções.

A causa está no `next/font/google`. Ele não é um link para o Google no navegador de quem
visita, e nisso a escolha original estava certa: ele baixa o `.woff2` e serve do próprio
domínio, sem expor o visitante. O problema é *quando* ele baixa. É **em todo build**, contra
`fonts.gstatic.com`, e sem cache entre execuções do runner. Quando a rede do GitHub Actions
engasgava, o log era este:

```
Failed to fetch font file from `https://fonts.gstatic.com/s/martianmono/...woff2`.
Retrying 3/3...
NextFontError: Failed to fetch `Martian Mono` from Google Fonts.
> Build failed because of webpack errors
```

Três tentativas, todas falhas, build morto. Duas vezes derrubou o passo `Build de produção`
do job `verificar`; três vezes derrubou o `webServer` do Playwright, que compila o projeto
antes de abrir o navegador, e aí o job `e2e` nem chegou a rodar um teste.

**Decisão.** Os cinco arquivos passam a viver em `src/fontes/`, e o layout usa
`next/font/local`. São os mesmos recortes de antes, o subconjunto latin, que já cobre todo o
português: Martian Mono nos pesos 500 e 600, JetBrains Mono nos pesos 400, 500 e 600. Noventa
e seis kilobytes no repositório, uma vez, contra um download a cada build de cada máquina.

O build deixa de ter qualquer dependência de rede. Isso vale para o CI, mas vale igualmente
para quem clonar o repositório e rodar `npm run build` num café com wi-fi ruim, ou daqui a
três anos, quando a URL daquele `.woff2` já não responder.

**Consequência.** `src/lib/fontes.test.ts` guarda as duas metades da correção: ninguém volta
a importar de `next/font/google`, e todo arquivo declarado no layout existe no disco e começa
com a assinatura `wOF2`. A verificação de assinatura é o que impede o caso chato, uma fonte
truncada ou uma página de erro salva no lugar do arquivo, de passar como se estivesse certa.

**O que isto não conserta.** Trocar de peso ou de família deixou de ser editar uma linha:
agora exige baixar o arquivo e commitá-lo. É o custo aceito, e é pequeno perto de um CI que
falha por sorte da rede. As falhas antigas continuam no histórico do Actions, vermelhas: elas
não eram defeito do projeto e não há o que reescrever nelas.

---

## ADR-029 · Teste de ponta a ponta não escreve data nem id de ciclo à mão

**Contexto.** Ao conferir o CI, três testes de Playwright falharam por conta própria, sem
ninguém ter tocado no código que eles exercitam. Dois diziam, com o id escrito na mão, que o
visitante **não** podia ver a `s4`. A `s4` entra no ar em 29/08, e o motor de releases adianta
sete dias: em 22/08 ela virou pública, e a afirmação virou falsa sozinha.

Um teste com data embutida não fica errado no dia em que falha. Ele já nasceu errado e apenas
cobra a conta depois, quando ninguém se lembra do porquê. É a pior forma de vermelho: parece
regressão, não é, e queima o tempo de quem for investigar.

**O terceiro era diferente e pior.** `getByText('esta semana')` casa por substring, e o corpo
das semanas diz "Nenhum bloqueio n*esta semana*" e "Registro d*esta semana* ainda não
publicado". O `.first()` pegava um desses, dentro de sanfona fechada, portanto invisível. O
teste reprovava enquanto a pílula funcionava perfeitamente. Passou até hoje por sorte de
ordem no DOM, não por estar certo.

**Decisão.** `e2e/cronograma.ts` calcula, da mesma fonte única de verdade que a aplicação usa,
qual ciclo está público e qual é o primeiro ainda oculto. Os testes pedem "um ciclo oculto",
nunca "a s4". O terceiro passou a usar `{ exact: true }`.

O helper ignora os imprensados: eles têm carregador `null` de propósito, então procurar o
marcador de um deles não acha nada nem para o admin. O registry é `server-only` e não pode ser
importado do Playwright, então a dedução usa `tipo: 'pausa'` do cronograma, e
`cronograma.test.ts` guarda a equivalência entre os dois. Sem essa guarda, o dia em que as
duas listas divergissem apareceria como um marcador não encontrado no Playwright, que não diz
nada a quem lê.

**Consequência.** As 78 jornadas passam e continuam passando na semana que vem, sem manutenção
de calendário. O que sobrou embutido é deliberado: o teste da vitrine fixa `2026-10-03` porque
o ponto dele é justamente simular uma data, e ali o número é o objeto do teste, não uma
suposição sobre quando alguém vai rodá-lo.

---

## ADR-030 · Um link com chave abre a visão completa, sem senha e sem painel

**Contexto.** Ver o projeto completo, com todas as entregas e o sistema inteiro como
estarão depois do SR2, exigia o ritual do painel: abrir `/admin/entrar`, digitar a senha,
marcar "ver como visitante", preencher uma data simulada. Para OPERAR o site esse ritual se
justifica; para só olhar, que é o uso de todo dia, ele é atrito puro. O pedido foi direto:
"um link separado, que só eu tenha, que dá para ver o sistema completo como se estivéssemos
em 2027".

**Decisão.** Uma URL-capacidade: `/vitrine/<chave>`. A chave vem de `CHAVE_VITRINE`, fora
do código, porque o repositório é público e chave versionada seria um link público com
outro nome. Chave certa grava um cookie assinado (`prumo_vitrine`, 150 dias) e aquele
navegador passa a ver o site como se a janela da vitrine (ADR-021) estivesse aberta só para
ele: todos os ciclos, todas as telas, com a mesma data simulada da vitrine. Uma faixa
discreta no topo diz o que está acontecendo e dá a saída (`/vitrine/sair`).

O link é deliberadamente MENOS que o painel: não dá sessão de admin, não mostra a faixa de
modo completo, não avança ciclo. Visão, não operação. O painel continua existindo para
operar.

Reuso em vez de invenção: a conferência da chave é a mesma da senha (HMAC dos dois lados,
comparação em tempo constante), o cookie usa a mesma assinatura da sessão, a rota usa o mesmo
mecanismo de limite de tentativas do login (num balde próprio, para um não zerar nem
bloquear o outro), e a visão reaproveita o caminho da janela da vitrine em `obterVisao`,
com a sessão de admin vencendo o cookie para a prévia de visitante não mentir. O que a decisão acrescentou de novo são ~90 linhas de módulo e duas
rotas.

**Consequência.** Falha fechado três vezes: sem `CHAVE_VITRINE`, sem `ADMIN_COOKIE_SECRET`
ou com chave errada, a resposta é o mesmo 404 de rota inexistente (§6.2: da porta, "não
configurado", "não existe" e "não é seu" são indistinguíveis). O §6.3 fica suspenso só para
o portador do cookie, como já ficava para todos com a janela aberta; o script de vazamento
roda sem cookie e continua provando o comportamento público. A análise de superfície de
ataque, incluindo a assimetria de revogação (trocar a chave não mata cookies já emitidos;
trocar o segredo mata), está em docs/seguranca.md.

---

## ADR-031 · O sistema ganhou pele própria: sans do aparelho, cartões, fundo neutro

**Contexto.** A identidade "folha de especificação" (ADR-016) nasceu para o registro: uma
banca técnica lendo um artefato acadêmico. O /sistema tem outro leitor, o servidor público
que informa números e confere a própria nota, e o feedback de uso foi direto: tudo
monoespaçado e minúsculo cansa, os formulários pareciam confusos, faltava símbolo, faltava
modernidade. A referência pedida foi a Apple.

**Decisão.** O /sistema tem identidade visual própria, ligada por um atributo de escopo
(`data-pele="sistema"`) no layout. A pele: letra do próprio aparelho (SF no iPhone e no Mac,
Segoe no Windows, Roboto no Android), em caixa natural; fundo neutro com cartões
arredondados e sombra sutil; campos de formulário com preenchimento e canto; botões-pílula;
ícone em cada painel e em cada aviso; trilho de etapas com marca de concluído. O site
continua folha de especificação: são duas peles, uma por camada, cada uma com o leitor
certo.

**Como, sem bifurcar o código.** Por REMAPEAMENTO de token: a pele redefine
`--color-fundo`, `--color-linha` etc. para os valores `--color-sis-*`, e os utilitários
continuam os mesmos. Os valores moram nos dois blocos de tema de `globals.css`, então a
regra 10 continua valendo (cor nova nos dois blocos, contraste medido por teste: oito pares
novos da pele, AA nos dois temas). A regra 11 também: um acento só, o laranja, que na pele
escura clareia um degrau (`#fb6b1f`) porque o tom do site daria 4,3:1 sobre o cartão
`#1c1c1e`, exatamente como o claro já fazia desde a ADR-027. As regras de escopo ficam fora
de `@layer` de propósito: CSS sem camada vence utilitário do Tailwind, e é isso que permite
reestilizar sem tocar em componente do site.

**Consequência.** Nenhuma fonte nova baixada (a sans do aparelho custa zero byte e zero
rede, coerente com a ADR-028). O tutorial, os gates e as jornadas continuam os mesmos: as
88 passam sem mudança de comportamento. O custo aceito: a partir daqui, quem mexe no
/sistema pensa em DUAS aparências para o mesmo componente compartilhado, e o teste de
contraste é quem segura as duas paletas no chão.

---

## ADR-032 · A arquitetura ganhou página no site, com o prompt que a redesenha

**Contexto.** Os diagramas C4 de contexto e contêineres existiam desde o início em
`docs/arquitetura.md`, em Mermaid, legíveis só por quem abre o repositório e sabe o que
procurar. A equipe pediu o contrário: um lugar simples, no próprio site, onde qualquer
colega entenda os desenhos sem clonar nada. É a regra da casa nº 5 aplicada à própria
arquitetura: documento de entrega é página, nunca arquivo para ir buscar.

**Decisão.** Rota pública `/arquitetura`, no molde da `/transparencia-ia` (página própria,
link no rodapé). Quatro blocos: a explicação do que é C4 em linguagem simples (quatro níveis
de zoom, como um mapa); o desenho de contexto redesenhado na identidade do site (quem usa,
o sistema, com quem conversa); o de contêineres, com o schema guardado em borda TRACEJADA e
pílula "não ligado", porque desenho de arquitetura que esconde o que está desligado ensina
errado; e o caminho de um número, reusando o componente de fluxo vertical da página inicial.
Fecha com uma sanfona contendo o prompt completo que regenera os três diagramas em Mermaid
em qualquer IA, com os fatos e as regras de honestidade embutidos.

**Por que expor antes da Semana 5.** A matriz pede arquitetura na Semana 5, e o registro
daquela semana continuará sendo a entrega formal. A página não fura o recorte do §6.3: os
mesmos diagramas já eram públicos em `docs/arquitetura.md` num repositório aberto, e a
página não contém conteúdo de ciclo (a varredura de vazamento passou a incluir a rota, e as
checagens subiram de 94 para 122).

**Consequência.** O prompt vive no código, não numa conversa perdida: quando a arquitetura
mudar, o diff da página denuncia o desenho desatualizado. O custo aceito é manter dois
formatos do mesmo desenho (a página e o Mermaid do docs); o teste de ponta a ponta da página
e a nota de sincronia neste ADR são o lembrete.

**Adendo (25/08).** A pedido da equipe, a página trocou de pele e cresceu: veste a pele do
sistema (ADR-031), perdeu a aula sobre C4 (ficaram só os desenhos, com um eyebrow dizendo o
nível), ganhou o quarto desenho, um diagrama de classes com os campos REAIS de
`src/lib/calculo/tipos.ts` e as ligações entre as classes, e ganhou uma porta na página
inicial (seção "Arquitetura", com chamada). O conteúdo mudou-se para
`src/components/arquitetura.tsx`, compartilhado.

**Segundo adendo (25/08).** Os níveis 1 e 2 deixaram de ser cartões empilhados e viraram
DIAGRAMAS ESPACIAIS de verdade, com a gramática do C4 clássico de ferramenta: caixas
espalhadas, o tipo entre colchetes ([pessoa], [sistema], [contêiner]), setas com rótulo,
fronteira tracejada, cilindro para banco (tracejado para o guardado e desligado). São SVG
renderizados no servidor (`src/components/arquitetura-c4.tsx`), com posições em constantes
calculadas à mão, deliberadamente: motor de layout seria dependência e aleatoriedade. As
cores saem dos tokens, então os dois temas funcionam; em tela estreita o desenho rola na
horizontal, como toda tabela larga do site.

---

## ADR-033 · O CSS da casa entrou em camada, e um bug de três meses apareceu

**Contexto.** Ao aplicar o acento na página de arquitetura, `border-2 border-acento` rendeu
uma borda cinza. A investigação achou a causa em `globals.css`: a regra universal
`* { border-color: var(--color-linha) }` estava FORA de qualquer `@layer`. Regra de cascata
do CSS: estilo sem camada vence estilo em camada, não importa a especificidade. Como todos
os utilitários do Tailwind vivem em camada, a regra universal vencia TODA utilidade de cor
de borda do site, desde sempre: `border-acento`, `border-ok/40`, `border-alerta/40` e
`border-transparent` nunca tiveram efeito, em lugar nenhum. O mesmo valia para `.rotulo` e
`.pilula` engolindo `text-acento` e afins. Ninguém percebeu porque a hairline é discreta e
o resultado parecia intenção, a mesma anatomia do bug do `--color-laranja` (ADR-027).

**Decisão.** A regra universal de borda entrou em `@layer base`, e `.rotulo`/`.pilula` em
`@layer components`. A ordem de camadas do Tailwind (theme, base, components, utilities)
volta a valer como todo mundo já assumia: o padrão da casa vale até alguém escrever um
utilitário por cima, e aí o utilitário vence. O bloco da pele do sistema (ADR-031) continua
fora de camada DE PROPÓSITO, porque o papel dele é exatamente vencer utilitário; a diferença
é que agora isso está escrito e é escolha, não acidente.

**Consequência.** Utilidades escritas ao longo do semestre inteiro "ligaram" de uma vez:
avisos de ok e alerta ganharam a borda tonalizada que o código sempre pediu, botões
fantasma perderam a borda que nunca deveriam ter tido, e o acento voltou a poder contornar
uma caixa. As 92 jornadas, os 459 testes e as 35 checagens de contraste passaram depois da
mudança. Fica a lição, que agora é regra de revisão: CSS novo em `globals.css` nasce DENTRO
de uma camada, a menos que vencer utilitário seja o objetivo declarado no comentário.

---

## ADR-034 · A reunião com o cliente remodelou o domínio, e o MVP acompanhou já

**Contexto.** Em 22/08 a equipe teve a primeira conversa real com o representante do órgão
(SECOGE/SESAU). Ela corrigiu o entendimento em quatro pontos que não são detalhe de tela:
(1) o que se preenche é o SUBINDICADOR, valor direto ou numerador/denominador, e o
indicador é calculado; (2) a régua depende do TIPO da unidade (USF, CAPS, UPA,
policlínica): a depender do tipo, só alguns indicadores valem, e os pesos mudam; (3) a
rede é secretaria → distrito sanitário → unidade, e o gerente distrital também é avaliado,
pela agregação das unidades; (4) os atores são gerente de unidade, gerente distrital,
administrador da plataforma e coordenação da SEAB. Veio ainda um pedido novo: janela de
revisão de cinco dias no fim do mês, com histórico. A ata sintetizada está na Semana 3 do
registro, sem nomes de pessoa.

**Decisão.** Remodelar o núcleo agora, em vez de acumular semanas sobre o modelo antigo.
`Area` deu lugar a `Distrito`/`TipoUnidade`/`Unidade`; `Gestor` virou `Gerente` com
escopo; `Indicador` perdeu meta e peso próprios e ganhou `Subindicador`; a APLICABILIDADE
(tipo × indicador → meta e peso) mora na regra versionada, porque "muda de ano em ano" é
exatamente o que regra versionada resolve; o ciclo ganhou `revisaoInicio` como PERÍODO
dentro do lançamento aberto, sem sexto estado. O motor compõe o indicador pela média
simples dos subindicadores apurados e calcula o distrital como média das unidades — as
duas fórmulas são SUPOSIÇÕES declaradas, a validar com a planilha prometida; se vierem
diferentes, viram versão nova da regra, não reescrita. Os quatro perfis do sistema
passaram a ser os do cliente; o perfil "auditoria" saiu e a TELA de trilha ficou com o
administrador e a SEAB, porque fiscalizar virou capacidade de papel existente, não papel
próprio, até o cliente dizer o contrário.

**Consequência.** Duas dívidas declaradas, com dono e data: o schema PostgreSQL guardado
segue no domínio anterior (a semeadura usa a fotografia congelada de
`src/lib/dados/dominio-v1.ts`; pendência em `banco.md`) e os modelos de ML seguem
treinados no recorte antigo, com aviso na própria tela de analytics e re-treino no marco
"ML: entrega parcial" do cronograma. Renomear os ids de perfil invalida cookies antigos do
seletor simulado, que caem no padrão sem erro. O custo de remodelar cedo foi um fim de
semana de refatoração; o custo de adiar seria pago com juros a cada tela nova.

## ADR-035 · A régua oficial chegou, e o pitch virou uma rota do site

**Contexto.** Em 05/09 o órgão enviou dois arquivos: o Diário Oficial de 21/09/2024 com a
Portaria Conjunta nº 001/2024, que regulamenta a gratificação, e uma planilha anonimizada de
um ciclo real, para a equipe conferir a régua. Sete dias antes do Kick-off, o roteiro do pitch
que existia no registro estava escrito no vocabulário anterior à ADR-034, e o briefing do
pitch trazia afirmações que o repositório não sustentava: que a comissão "não existe mais",
que o ML usa fonte pública, que há um registro de riscos numerado, que as personas têm nome.

**Decisão.** Três coisas, na ordem em que custam menos para desfazer. (1) A portaria entra no
repositório, transcrita em `docs/portaria-001-2024.md`, porque é ato público; a planilha NÃO
entra, porque tem gente, mesmo com o nome trocado, e o repositório é público. Ela fica como
referência privada da equipe. Os nomes dos membros da comissão, publicados nas portarias nº
002 e nº 003 do mesmo Diário, também ficaram fora. (2) O pitch é conteúdo do projeto e vive
onde o conteúdo vive: `src/content/pitch.ts` é a fonte única (slides, tempos, quem fala,
notas), a rota `/pitch` renderiza os nove slides e o registro do ciclo `ko` mostra a mesma
tabela. É a primeira rota protegida por ciclo, e não por funcionalidade: `podeVer(visao,
'ko')` decide, e oculto é 404, como nas telas. O deck é aprimoramento progressivo: sem
JavaScript é uma pilha imprimível; com JavaScript, o segundo componente cliente do projeto
mostra um slide por vez e escuta o teclado, recebendo só o total de slides, nunca texto, para
nada do Kick-off chegar ao bundle antes da hora. A demonstração do slide 4 é o componente real
da memória de cálculo, com o motor real, e uma captura estática de reserva no mesmo slide.
O PDF e as capturas saem da própria rota, por Playwright, na identidade do site. (3) O motor
não muda agora. A portaria confirma o núcleo do modelo (subindicadores com fórmula, régua por
tipo de unidade, nota do distrito como média das unidades) e diverge em dois pontos: manda
tirar a média das NOTAS dos subindicadores, cada uma já graduada, onde o motor tira a média dos
valores e gradua depois; e o art. 8º manda desconsiderar o que não pôde ser aferido e
REDISTRIBUIR o peso, onde o seed usa `zera_com_aviso`. As duas viram `regra-v3` na Semana 5,
com o prazo de recurso do art. 9º, e o slide 7 diz isso em voz alta, porque honestidade no
palco vale mais do que um motor remendado a sete dias do pitch.

**Consequência.** Uma bomba-relógio desarmada de passagem: `scripts/verificar-vazamento.ts`
testava `perfis.includes('cam')`, perfil extinto na ADR-034, e a comparação era sempre falsa;
quando a s5 fosse liberada (12/09, pelo adiantamento de sete dias), três telas responderiam
3xx onde o script exigia 404 e o `npm run verificar` quebraria no dia do Kick-off.
`PERFIL_PADRAO` passou a morar em `features.ts`, que Node puro consegue importar. Cada número
dito no pitch é conferido por teste contra o arquivo de onde vem, para o número da tela e o
número do repositório não se separarem. As 39 linhas de `docs/uso-de-ia.md` que estavam
pendentes foram assinadas por quem as validou. E o nome de cada integrante aparece no pitch
como quem fala, nunca como quem construiu: a equipe construiu.

## ADR-036 · O deck ficou usável: teclado que sobrevive ao clique, tela que cabe, texto que a fala carrega

**Contexto.** O deck do Kick-off subiu no dia 09/09 e foi usado de verdade no dia seguinte. O
uso derrubou quatro coisas que os testes não pegavam. **A seta não passava o slide:** o guard
de teclado ignorava a tecla sempre que o foco estivesse num `button`, `a` ou `summary`, e
como quem apresenta clica, o primeiro clique na seta da tela, no botão de tema ou na memória
de cálculo desligava setas, notas, tela cheia e cronômetro até alguém clicar no fundo da
página. O script que gera o PDF navega sem nunca clicar, então a suíte inteira passava por
cima do defeito. **O slide da demonstração mostrava 38% do que tinha:** 1008px de conteúdo
numa caixa de 384px, com a tabela e a linha `(104) ÷ (12 × 10) × 100 = 86.67` abaixo da linha
d'água, num slide chamado "a nota com a conta aberta". **A tela tinha 1.127 palavras** para
4:55 de fala, e a auditoria mostrou que quase todas eram a nota do apresentador transcrita: as
três personas repetiam as notas quase palavra por palavra, e o slide dos marcos dizia a mesma
coisa três vezes. **E não havia caminho até o pitch:** o único link vivia dentro de uma
sanfona fechada, três rolagens abaixo da dobra.

**Decisão.** Cinco mudanças, cada uma com a sua rede.

A regra do teclado saiu do `useEffect` e virou `src/components/pitch/teclado.ts`, função pura
sobre a tecla e o elemento em foco, com tabela de testes: só campo de texto engole tecla, a
barra de espaço respeita o controle focado (senão daria dois passos numa tecla só) e os botões
devolvem o foco ao corpo, mas só no clique de mouse, para não roubar o lugar de quem navega
com Tab.

O texto de tela virou dado em `src/content/pitch.ts`, com teto de palavras por slide imposto
em teste. O componente escolhe a forma do visual; as palavras vêm do conteúdo, e um segundo
teste falha se alguém escrever prosa dentro do JSX. Passou de 1.127 para menos de 400 palavras.
O que saiu da tela não sumiu: já estava nas notas.

A demonstração passou a caber, copiando o que a folha de impressão já fazia certo: esconde o
que a fala cobre e reduz a escala. `zoom` e não `transform: scale`, porque zoom participa do
layout e a caixa encolhe de verdade. O `overflow` continua ali como rede, para o navegador que
ignora `zoom` e para o dia em que a memória ganhar uma linha, e há teste de ponta a ponta
provando que, no caminho normal, nem a caixa nem a página rolam em 1280x720 e em 1366x768.

O topo do site ganhou um botão para `/pitch` **com prazo**: dez dias depois do Kick-off ele
some sozinho, por uma função pura que lê a data do cronograma. O começo da janela é o próprio
portão do ciclo, senão o botão apontaria para um 404. Destaque sem prazo vira entulho, e
ninguém lembra de tirar. No celular ele fica só com o ícone, porque com a palavra o cabeçalho
estourava 360px.

**E o PDF virou rota, não arquivo.** Aqui a decisão foi contra a saída mais fácil. Gravar
`public/pitch-kickoff.pdf` era uma linha e entregava o download sem risco de runtime, mas
`public/` não passa por `obterVisao()`: o deck inteiro, num arquivo só, responderia 200 nos
dias em que `/pitch` responde 404. Descobrimos que **as nove capturas já faziam exatamente
isso** desde que existiam. Então as capturas voltaram para `docs/`, o PDF é servido por
`/pitch/pdf` com o mesmo portão da página, e o verificador de vazamento passou a provar as
duas coisas, além de varrer o bundle atrás de qualquer frase de slide, e não só do título.

**Consequência.** O custo honesto da rota é que ela lê o arquivo do disco em tempo de
execução, e o rastreador da Vercel não enxerga `readFile(join(process.cwd(), ...))`: sem a
linha em `outputFileTracingIncludes`, funciona no repositório e devolve 404 no deploy. Um
teste confere que a linha existe, e a falha degrada para 404, nunca para erro de servidor. A
mesma linha cobriu `docs/*.md`, que `/transparencia-ia` já lia daquele jeito havia semanas sem
ninguém ter notado o risco. De quebra, dois defeitos velhos caíram: a pílula "esta semana"
nunca aparecia nas semanas imprensadas, o que deixava a suíte vermelha de 05/09 a 11/09 e
teria voltado ao verde sozinha no sábado, escondendo o problema; e a linha de ajuda das teclas
aparecia justamente para quem estava sem JavaScript, anunciando quatro atalhos mortos.

