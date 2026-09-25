# Perguntas para a SESAU

O que a equipe precisa perguntar ao cliente, e o que ele já respondeu.

Não confundir com [`perguntas-para-a-banca.md`](perguntas-para-a-banca.md), que é para os
professores. Estas aqui são sobre a regra, o processo e os dados, e só a Secretaria pode
responder.

A lista começou com dezessete. Cinco foram escolhidas para a conversa, porque numa reunião
não cabem dezessete. Duas voltaram respondidas, e a planilha que veio junto respondeu outras
duas sozinha.

---

## Respondidas

### 1. Dá para receber a planilha de um mês já fechado, mesmo anonimizada?

**Respondido: sim.** Chegou em 22/09, anonimizada. Sem nome, CPF, e-mail ou telefone, o que a
equipe conferiu antes de abrir o resto. Naquele dia, o arquivo ficou fora do repositório e
entrou só a regra extraída dele.

O que ela respondeu sozinha está no documento da Semana 5, `#doc-s5-planilha`.

Em 23/09, a base de desempenho por unidade da Secretaria entrou em
`ml/data/base nova completa.csv`, com autorização registrada na ADR-044. É dado
institucional, sem pessoa, e só os cadernos da lente de ML a leem. O teste
`src/lib/dados-do-cliente.test.ts` varre `ml/data/` inteiro, linha a linha. O seed do site
continua sintético. Falta a autorização por escrito para publicar a base num repositório
público: ver a pergunta 13, abaixo.

### 2. Quando o indicador tem vários subindicadores, a média é dos valores ou das notas?

**Respondido: das notas.** Cada subindicador vira nota primeiro, por uma régua de degraus
própria, e a média é dessas notas. Em alguns indicadores a média ainda passa por uma segunda
régua antes de virar a nota do indicador.

Era a divergência nº 1 da nossa tabela de conferência. Virou a `regra-v3`.

### 3. No art. 8º, o peso do indicador que saiu da conta é dividido entre quem?

**Respondido pela planilha: proporcionalmente, sobre o total dos pesos restantes.** A fórmula
do Resultado Geral soma as contribuições e divide pela soma dos pesos **de quem tem valor**.
É, linha por linha, o que o motor já fazia no modo `ignora`. A v3 liga esse modo.

### 5. Como a unidade manda o número hoje: planilha, sistema ou ofício?

**Respondido: "é tudo manual, via procv e afins".** Confirma a suposição declarada desde a
reunião de 22/08 e explica as três inconsistências que a planilha carrega.

---

## Ainda em aberto

### 4. O Indicador 3 é bimestral e o ciclo é mensal. Como fecha o mês sem medição?

Repete a nota do bimestre nos dois meses, sai da conta, ou aplica o art. 8º? É a única exceção
de periodicidade da portaria. O motor hoje não sabe tratá-la, e no seed todos os indicadores
são mensais.

### 6. Quais são os cortes exatos de "insatisfatório", "regular", "satisfatório" e "excelente"?

Na planilha a classificação foi **digitada à mão**, não calculada, então não dá para deduzir os
cortes das fórmulas. Pelos valores observados, o corte entre satisfatório e excelente está
entre 0,79 e 0,82, provavelmente 0,80. A `regra-v3` usa 0,80 como suposição declarada.

### 7. Quais são os percentuais de gratificação de cada classe?

Moram no Decreto nº 36.482/2023, que o art. 10 cita e a equipe não tem. Como é ato público,
talvez a gente consiga sozinho: por isso virou pedido de documento, não pergunta.

### 8. Os pesos dos subindicadores do Indicador 4 valem só para USF?

A planilha confirma os pesos da USF. Para CAPS, UBT, UCIS, CECON e MAC ela mostra média
simples. Queremos confirmar que é mesmo simples, e não uma tabela que ficou de fora.

### 9. A CAM homologa dentro de um sistema ou fora dele, em reunião?

A equipe leu o art. 6º como "fora", com quórum de quatro, e desenhou o perfil do sistema como
operacional. A planilha reforça a leitura: ela se versiona como "CAM 1.2", o que indica que a
comissão publica versões da régua por fora.

### 10. Como o gestor contesta hoje, na prática: papel, e-mail, formulário?

Os prazos do art. 9º a equipe conhece. Falta o caminho, e ele define se a tela de contestação
substitui o que existe ou conversa com ele.

### 11. Onde a comissão publica o resultado, e cada gestor é avisado?

O art. 6º diz que a CAM divulga. Não diz onde.

### 12. O sistema pode um dia receber dado real? Com que base legal, e quem responde?

O sistema roda com base sintética por decisão da equipe, porque decidir remuneração cai no
art. 20 da LGPD. A base por unidade em `ml/data/` só alimenta a lente de ML, não o sistema.
Também falta o prazo de retenção e quem é o controlador.

### 13. A autorização para a base em `ml/data/` cobre publicar num repositório público?

A ADR-044 registra que a Secretaria autorizou a base por unidade. Não temos isso por escrito,
e o repositório é público, assim como os slides de `/ml`. E 39 das 90 combinações de tipo de
unidade e distrito têm uma linha só: a linha aponta a unidade e, por ela, o gerente que
recebe a gratificação. Precisamos da autorização por escrito, e de saber se a Secretaria
prefere que essas linhas sejam generalizadas. A análise está em `docs/privacidade.md`.

---

## O que a planilha levantou de novo

Perguntas que não existiam antes de abrir o arquivo.

1. **Seis linhas seguem outra conta**, todas de NDI e SAE, dois tipos que a portaria não
   nomeia. Nelas, o resultado lançado é a soma dos pontos dividida por 1,7 (esta nota dizia
   que os pesos somavam 1,1, e estava errado). Em cinco delas, o Indicador 3 entra com peso
   80% em vez de 20%. É régua provisória para tipo novo, ou é erro?
2. **As linhas dos distritos usam uma função que só existe no Google Planilhas.** Aberto no
   Excel, o resultado não recalcula. A conta dos distritos depende do arquivo ficar no Google?
3. **Os tipos têm porte** (USF 1 a 8, MAC 1 a 4, CAPS II/III e CAPS III 24h). O porte muda a
   meta, o peso, ou os dois?
4. **A coluna "peso atual (excepcional)" difere da coluna da portaria** em pelo menos um
   subindicador, que hoje está com peso zero. Isso foi decidido quando, por quem, e vale até
   quando?

A quarta é a mais importante das quatro, e é a que mais dá razão ao produto: existe uma regra
em vigor diferente da regra publicada, e hoje ela mora numa coluna de planilha.
