# Retomada: onde o projeto parou

Nota de trabalho da equipe, escrita no fim da sessão de 19 a 23/09/2026. Não é entrega e não
é para a banca: existe para quem retomar o trabalho (pessoa ou agente) não precisar
redescobrir o que já foi decidido.

**Data da última sessão:** 23/09/2026. **Branch:** `claude/sesau-gratificacao-projeto-r7vj7x`,
já em `main` por fast-forward. **Último commit:** `6fd6841`.

---

## O fato que mudou tudo: a planilha chegou

Em 22/09 a Secretaria enviou a planilha anonimizada que usa hoje, e a resposta à pergunta
"como a conta é feita" foi: **"é tudo manual, via procv e afins"**.

O arquivo **não está no repositório e não deve entrar**. Foi varrido por CPF, e-mail e telefone
antes de qualquer análise e não tinha nenhum, mas continua sendo dado do cliente. O que entrou
foi a regra extraída das fórmulas.

### O que ela corrigiu

Três suposições que estavam declaradas no código como suposições estavam erradas:

1. **A média é das NOTAS**, não dos valores. Cada subindicador vira nota por uma régua de
   degraus, e a média é dessas notas. Alguns indicadores têm uma segunda gradação sobre a média.
2. **Indicador sem lançamento sai da conta e leva o peso junto.** É a redistribuição do art. 8º,
   e a fórmula do Resultado Geral da planilha faz exatamente isso: divide pela soma dos pesos
   de quem TEM valor.
3. **A nota é de 0 a 1**, não de 0 a 10.

E ensinou três coisas que não estavam em lista de dúvida nenhuma:

4. **Existe uma terceira direção.** Há subindicador em que passar do alvo também perde ponto.
5. **Numerador maior que denominador é ERRO**, escrito na célula, não desempenho acima de 100%.
6. **Os tipos de unidade são sete** (USF, UBT, UBT Mista, CAPS, CECON, UCIS, MAC), com porte.
   UPA e Policlínica, que a equipe tinha inventado, **não existem na portaria**.

### O achado que vale para a apresentação

A planilha se contradiz sozinha, e isso é o argumento do produto com evidência em vez de
retórica. Das 228 linhas:

- **190** seguem a régua certa (pesos 0,2 / 0,2 / 0,2 / 0,4, somando 1,0).
- **6** usam pesos que somam **1,1**, e são de dois tipos que a portaria não nomeia.
- **32**, as dos oito distritos, usam uma função que só existe no Google Planilhas: aberta no
  Excel ela **não recalcula**, mostra o último número gravado.

E há uma quarta coisa, na aba de pesos: **duas colunas**, a "da portaria" e a "atual,
excepcional", que não são iguais. Um subindicador está com **peso zero** onde a norma manda
0,2. Existe uma regra em vigor diferente da regra publicada, e hoje ela mora numa coluna de
planilha que ninguém versiona.

---

## O que foi feito nesta sessão

Oito commits, todos em `main`, todos com `npm run verificar` e `npm run e2e` verdes antes de
subir.

| Commit | O quê |
| --- | --- |
| `9be0aca` | Correção do bloco de evidências: a âncora do documento estava no próprio `<details>`, e navegador só abre `<details>` que seja ANCESTRAL do alvo. 33 evidências redundantes removidas |
| `8b19416` | O caminho para a apresentação sumia na virada da semana: dois lugares respondiam diferente à mesma pergunta. Agora os dois usam `pitchEmDestaque` |
| `284a9b9` | **Regra v3**: método de notas, régua de degraus, segunda gradação, terceira direção, rejeição de numerador maior que denominador. Tudo condicionado à versão da regra |
| `1fa092e` | Os sete tipos de unidade da portaria, com as regras v1 e v2 **re-chaveadas** para não zerar mês publicado |
| `628b773` | O documento da Semana 5 com o que a planilha ensinou, a matriz CSD atualizada e `docs/perguntas-para-a-sesau.md` |
| `7f5aa27` | C4 níveis 3 e 4 em `docs/arquitetura.md` (mermaid) |
| `b97c645` | Os três itens de texto da AV1 de Arquitetura, mais `src/lib/pureza.test.ts` |
| `6fd6841` | Os quatro níveis do C4 no site, em SVG, legíveis projetados |

### A decisão de arquitetura mais importante

Quando a planilha mostrou que o método estava errado, **reprodutibilidade e corretude entraram
em conflito direto**: corrigir para todos deixaria o sistema certo e mudaria números já
publicados, sobre os quais o prazo de recurso do art. 9º já correu.

**A equipe escolheu a reprodutibilidade.** Num sistema que decide remuneração, o número
publicado é um fato com prazo; se ele pode mudar depois, o prazo perde o sentido.

Como foi resolvido: o método virou campo da regra (`metodo`), não escolha do código. As regras
v1 e v2 seguem com o método antigo e devolvem os mesmos números de sempre; a v3 vale a partir
do ciclo que ainda estava aberto. **O preço aceito:** o motor carrega dois caminhos de cálculo
para sempre. Está na ADR-041.

### Números atuais

572 testes de unidade, 112 e2e, 123 verificações de vazamento, 56 linhas em `docs/uso-de-ia.md`
(e `CONTAGENS_PITCH.usosDeIa` tem de bater com esse número, há teste).

---

## O que está aberto

### Depende da Secretaria (está em `docs/perguntas-para-a-sesau.md`)

1. **Os cortes exatos das classes** (insatisfatório, regular, satisfatório, excelente). Na
   planilha eles foram **digitados à mão**, não calculados, então não dá para deduzir das
   fórmulas. A v3 usa 0,80 como suposição declarada.
2. **O Decreto nº 36.482/2023**, que tem os percentuais de cada classe. É ato público; talvez
   dê para conseguir sozinho, como foi com a portaria.
3. **O Indicador 3 é bimestral num ciclo mensal.** O motor não sabe tratar a exceção.
4. As quatro perguntas novas que a planilha levantou, incluindo quem decidiu a coluna
   "excepcional" e até quando ela vale.

### Trabalho técnico já identificado

- **Os indicadores continuam sintéticos.** A portaria tem cinco indicadores reais com
  subindicadores próprios; o catálogo tem oito inventados. Remodelar é trabalho maior, cabe
  depois do SR1.
- **O porte não entrou** (USF 1 a 8, MAC 1 a 4, CAPS II/III e CAPS III 24h).
- **O prazo da contestação não está implementado.** É invariante do domínio e está declarado
  como pendente em `docs/arquitetura.md`.
- **`supabase/migrations/` ainda tem `cam` no enum de perfil**, onde o aplicativo diz `seab`
  desde a ADR-034. Não quebra nada porque o schema está desligado, mas a divergência existe.
- **`NEXT_PUBLIC_DRIVE_URL` está vazio.** Enquanto não houver a URL da pasta do Drive da
  equipe, o link não aparece para o visitante.

### Decisões de visual que ficaram em aberto

- O acento laranja aparece uma vez no nível 3 do C4, na caixa do `calculo/motor.ts`. O nível 4
  ficou sem destaque para não estourar a regra 11. Trocar de lugar é um comando.
- A versão em mermaid do nível 3, em `docs/arquitetura.md`, mede 3283px de altura e serve para
  ler sentado, não para projetar. A versão boa é a do site, em `/arquitetura`.

---

## Sobre o termo CAM

Confusão que já apareceu e vai aparecer de novo:

- **A Comissão de Avaliação de Metas existe.** Está no art. 5º da portaria, e a própria planilha
  se versiona como "CAM 1.2". Dizer que ela não existe mais é **antifato nº 1** em
  `docs/pitch-kickoff.md`.
- **O que deixou de se chamar CAM foi o perfil do sistema**, que virou `seab` na ADR-034. O
  conteúdo dos ciclos foi corrigido: SEAB opera, CAM homologa.

---

## Regras da casa que mais pegam quem chega

Estão todas no `CLAUDE.md` da raiz, mas estas três são as que mais custam quando esquecidas:

1. **Nenhum dado real** de pessoa ou da SESAU entra no repositório, no seed ou em prompt de IA.
2. **Documento de entrega é TSX renderizado na página, nunca PDF.**
3. **Se usou IA, some uma linha em `docs/uso-de-ia.md` e bata `CONTAGENS_PITCH.usosDeIa`.** Há
   teste que falha.
