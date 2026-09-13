# As perguntas que nós temos para a banca

O Kick-off é formativo: a nota não vem dele, o direcionamento sim. São três semanas até o
SR1, em 3 de outubro. Estas são as perguntas cuja resposta muda o que fazemos nessas três
semanas.

Numa arguição dá para fazer duas ou três perguntas. Por isso a lista está em ordem: as
primeiras são as que valem a vez.

**Regra para quem perguntar:** nunca faça uma destas sem dizer junto o que a gente faria de
qualquer jeito. Chegar sem posição é pior que não perguntar. A posição está escrita embaixo
de cada uma.

---

## As três que valem a vez

### 1. No SR1, o que vocês avaliam: o site como ele está no ar naquele dia, ou a demonstração ao vivo?

Em 3 de outubro o site publica quatro das oito telas, porque cada tela abre na semana em que
é entregue. As outras quatro existem prontas desde antes, e só aparecem em outubro e
novembro.

**Nossa posição.** Manter o calendário e demonstrar ao vivo o que ainda não abriu, dizendo em
voz alta que existe desde antes. Se quiserem navegar sozinhos, temos um link que abre tudo.

**O que muda.** Se a nota olha o site na data, a Semana 6 vira semana de abrir telas. Se olha
a demonstração, ela vai inteira para a regra da portaria e os testes do motor.

**Aviso que vale dizer junto:** se cada avaliador for navegar por conta própria, precisamos
isolar a escrita antes do dia. Hoje ela vive na memória do servidor e é compartilhada, então
um lançamento de um pode sumir ou aparecer para outro.

### 2. Para a evidência técnica de segurança e nuvem, vale o que está funcionando ou o que está desenhado e testado?

O login é simulado e a tela diz isso. O controle de acesso de verdade está escrito como
políticas no banco, passa em 23 verificações contra um Postgres real, e está desligado do
site.

**Nossa posição.** Chegar ao SR1 assim, apresentando as 14 ameaças mapeadas, as 10 resolvidas
e as limitações escritas. Autenticação institucional entra na lista do que falta para virar
produção, não como entrega do semestre.

**O que muda.** Se a lente exige controle funcionando, as duas semanas viram semana de ligar
banco e autenticação, e a regra oficial da portaria escorrega para depois do SR1. Se o modelo
de ameaça basta, esse tempo vai para o motor e para as telas.

### 3. Nossas personas vieram do caso e de uma reunião com o cliente, sem entrevista com usuário. Isso fecha "pesquisa consolidada" no SR1?

A conversa real foi em 22 de agosto, com a secretaria. A entrevista com quem opera o processo
está marcada para 21 de novembro, depois do SR1.

**Nossa posição.** Manter as personas com a origem declarada dentro do próprio documento, e
tratar a Semana 11 como o momento de confrontá-las com quem opera o processo hoje.

**O que muda.** Se o SR1 exige pesquisa primária, pedimos agenda à secretaria ainda esta
semana e duas pessoas passam a Semana 6 nisso. Se não exige, seguimos o plano e não
competimos pela agenda da comissão agora.

Esta é a única da lista que obriga a agir **nesta semana** se a resposta for sim.

---

## Se sobrar tempo

### 4. Evidência que chega atrasada pontua na semana em que era devida, ou entra no pacote do SR1?

A matriz CSD e os wireframes foram feitos na semana do Kick-off, e datamos assim, sem
retroagir. O registro da dinâmica de ideação continua sem foto.

**Nossa posição.** Nunca retrodatar. A data verdadeira fica no documento, mesmo que custe na
semana vencida.

**O que muda.** Se o peso é por semana, usamos as Semanas 5 e 6 para cobrir atraso. Se conta o
pacote do SR1, o tempo fica no desenvolvimento.

### 5. O sistema rodando cumpre o item de protótipo de baixa ou média fidelidade?

Temos o sistema navegável e quatro wireframes, estes desenhados depois das telas, o que está
escrito no site.

**Nossa posição.** Tratar o sistema como o protótipo, e os wireframes como registro do
caminho. Não vamos produzir tela de média fidelidade só para preencher item.

**O que muda.** Se a etapa intermediária é cobrada, uma pessoa passa a Semana 6 desenhando em
vez de fechar as telas de lançamento e resultado.

### 6. Nosso registro é um site próprio versionado, não um Google Site. Isso conta como a entrega?

O Drive entraria só como espelho do PDF.

**Nossa posição.** Manter o site do repositório como o artefato avaliado, e criar a pasta no
Drive como espelho até o SR1.

**O que muda.** Se o Google Site for exigido mesmo, entra a tarefa de espelhar oito seções e a
biblioteca inteira em outra ferramenta. Se bastar o link do Drive, é preencher uma variável.

### 7. A planilha real do cliente não pode entrar no repositório. Aceitam um comparativo só com as diferenças por indicador, sem nome de unidade e sem valor de origem?

Em 5 de setembro o órgão mandou uma planilha de um mês real, com os nomes trocados. Ela ficou
fora do Git porque tem gente dentro, e o repositório é público. Conferir nossa conta contra a
dela é a maior lacuna que temos.

**Nossa posição.** Publicar um documento só com as diferenças em percentual. A planilha bruta
não entra no repositório em hipótese nenhuma.

**O que muda.** Se o comparativo derivado bastar, essa conferência sobe na fila e entra no
SR1. É a única parte da validação que não depende da agenda da comissão, porque a planilha já
está com a gente.

---

## Uma que vence antes do SR1

### 8. Na AV1 de aprendizado de máquina, em 30 de setembro, base gerada por nós conta como dado do projeto?

Tudo é gerado por programa, com semente fixa, e o próprio caderno conclui que as métricas
medem a consistência do gerador e não a rede real.

**Nossa posição.** Seguir com a base gerada, publicando cada modelo ao lado do chute mais
simples, inclusive o que perde.

**O que muda.** Se a AV1 exige dado real ou aberto, as duas semanas até 30 de setembro viram
buscar uma base pública de saúde e refazer a análise. É a data mais curta da lista.

---

## Reserva

### 9. Desempenho, na lente de nuvem, exige número medido, ou o desenho com a falta de medição declarada atende?

**Nossa posição.** Não inventar teste de carga. Apresentamos o desenho e dizemos que não
medimos. **Muda:** se exige medição, entra instrumentar e rodar carga antes do SR1.

### 10. Se a comissão não abrir agenda até novembro, vale rodar o mesmo roteiro com participantes substitutos? E existe caminho institucional da escola para pedir essa reunião?

**Nossa posição.** Seguir pelo contato que já respondeu duas vezes, e enviar pedido com data e
pauta ainda em setembro. **Muda:** se houver caminho institucional, o pedido formal sai esta
semana e vira evidência datada no SR1.

### 11. Nosso benchmarking compara categorias de ferramenta e não nomeia produto. Vocês esperam concorrentes nomeados?

**Nossa posição.** Nomear produto que ninguém da equipe usou seria pior que não nomear. Se for
para nomear, publicamos três com fonte e data de acesso.

### 12. O plano de correção de rota do SR1 é o que levamos para a banca, ou o registro do que faremos depois do retorno dela?

**Nossa posição.** Publicar antes, com planejado contra realizado, e deixar o bloco do retorno
da banca para preencher no dia.

### 13. Nosso registro de uso de IA tem 48 linhas com o mesmo validador. Isso pesa na avaliação individual?

**Nossa posição.** Não reescrever o histórico. A partir daqui, cada frente valida e assina a
própria linha. **Muda:** se pesa, entra revisão cruzada por frente antes de 3 de outubro.

---

## O que a gente decidiu não perguntar

Onze candidatas foram cortadas, e o motivo vale para a próxima vez:

- **O repositório já responde.** Se a resposta está numa ADR ou no código, perguntar mostra
  que a equipe não leu o próprio projeto.
- **A resposta não muda tarefa nenhuma até 3 de outubro.** Curiosidade não é pergunta de
  arguição.
- **Quem responde é o cliente, não o professor.** Regra da portaria e processo real vão para
  a secretaria.
- **Terceiriza decisão nossa.** "O que vocês acham que a gente deve fazer" entrega ao
  professor um trabalho que é do time.
- **É pedido de elogio disfarçado.** "Vocês acharam bom o que fizemos" é conversa, não
  pergunta.
