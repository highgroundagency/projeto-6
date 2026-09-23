# AV1 de machine learning: roteiro e material de apoio

**O original é a rota `/ml` do site.** Vinte slides na identidade do projeto, com as setas do
teclado, as notas do apresentador na tecla `n`, o cronômetro do ensaio e a impressão na tecla
`p`. Este documento é a versão para ler e ensaiar longe do navegador. O PDF em `/ml/pdf`,
baixável pelo próprio deck, é a reserva para o dia em que a rede falhar; as capturas ficam em
`docs/ml-av1/`.

A fonte única do texto é `src/content/apresentacao-ml.ts`, e a seção 3 é **gerada** por
`npm run roteiro`: não edite aquele trecho à mão. Um teste confere que este arquivo contém o
título e a fala de cada slide.

## 1. De onde vêm os números

Nenhum número dos slides foi digitado. O caderno `ml/notebooks/07-numeros-da-apresentacao.ipynb`
repete as contas dos cadernos 01 e 02, com o mesmo código, e grava
`src/content/ml/apresentacao.json`; os gráficos do site são desenhados a partir dele, na
identidade do projeto, em vez de colar a imagem do matplotlib. `src/content/apresentacao-ml.test.ts`
confere o JSON contra as **saídas impressas** dos cadernos 01 e 02, que é o que a professora lê
ao abrir os cadernos. Mudou a análise lá, rode o 07 de novo e o teste diz se o slide ficou para
trás.

A base é `ml/data/base nova completa.csv`, a planilha de desempenho por unidade que a
Secretaria autorizou (ADR-044). A menor coisa que aparece em qualquer slide é a unidade de
saúde, por tipo e distrito.

## 2. Como apresentar

- **Tempo:** 11:05 somando os slides. A disciplina não fixou o tempo da AV1. Se a professora
  pedir menos, os primeiros a sair são o 2 (roteiro), o 13 (inconsistências) e o 15 (insights),
  cujo conteúdo a fala dos vizinhos já cobre: o deck cai para cerca de 10 minutos.
- **A ordem é a da avaliação.** Cada slide traz, no alto, a etapa que ele cumpre: 1 problema,
  2 dataset, 3 EDA, 4 tratamento, 5 feature engineering. Se a professora perguntar por um
  critério, o número da etapa diz onde ele está.
- **O slide que mais vale:** o 14, das seis linhas que não fecham a conta. É o ponto em que a
  exploração achou erro na planilha do cliente, e é o argumento do produto com evidência.
- **As perguntas prováveis** estão nas notas do último slide, com a resposta.
- **O PDF:** `npm run build` e depois `npm run pitch-pdf -- ml` gera `docs/ml-av1.pdf` e as
  capturas em `docs/ml-av1/`. Sem terminal, a tecla `p` no deck imprime a versão que está na
  tela, uma página por slide.

## 3. Slide a slide

<!-- roteiro-ml:inicio -->

### Slide 1: prumo

- **Começa em** 0:00 · **dura** 0:25 · **abertura e fechamento** · **16 palavras na tela**
- **Frase da tela:** a planilha da gratificação da saúde do Recife, lida com aprendizado de máquina
- **O que a tela mostra:** Wordmark, a pílula da AV1 e os nomes do grupo da disciplina.
- **A fala:**
  1. Somos o grupo da AV1. O trabalho parte do Prumo, o projeto que refaz a conta da gratificação por desempenho da Secretaria de Saúde do Recife.
  1. Vamos mostrar as cinco primeiras etapas, na ordem que a avaliação pede.
  1. A base é a planilha real da Secretaria, cedida com autorização e sem nenhum dado de pessoa: a menor coisa que aparece é a unidade de saúde.

### Slide 2: o caminho de hoje

- **Começa em** 0:25 · **dura** 0:10 · **abertura e fechamento** · **28 palavras na tela**
- **Frase da tela:** as cinco etapas da avaliação, cada uma com os números da planilha
- **O que a tela mostra:** As cinco etapas numeradas, lado a lado.
- **A fala:**
  1. São cinco paradas, na ordem dos critérios da AV1: problema, dataset, exploração, tratamento e features novas.
  1. Feature é cada coluna que o modelo recebe como entrada.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem de onde vêm os números: das contas dos cadernos 01 e 02. O caderno 07 repete essas contas para desenhar os gráficos e acrescenta algumas conferências, como o que as seis linhas fora da regra têm em comum. O caderno 07 diz quais são.

### Slide 3: uma planilha decide a gratificação

- **Começa em** 0:35 · **dura** 0:30 · **etapa 1, entendimento do problema** · **65 palavras na tela**
- **Frase da tela:** cada unidade de saúde ganha nota em quatro indicadores, e o resultado geral é a soma com peso
- **O que a tela mostra:** A faixa dos quatro pesos (20, 20, 20, 40), a conta escrita e a frase da Secretaria.
- **A fala:**
  1. A Secretaria paga uma gratificação às equipes das unidades de saúde conforme o desempenho. A regra está na Portaria Conjunta 001 de 2024.
  1. Cada unidade recebe nota em quatro indicadores. Os três primeiros pesam 20% cada, e o desempenho da unidade pesa 40%. O resultado geral é essa soma com peso.
  1. Quando perguntamos como a conta é feita hoje, a resposta foi: é tudo manual, via PROCV e afins.

### Slide 4: o que o modelo responde

- **Começa em** 1:05 · **dura** 0:35 · **etapa 1, entendimento do problema** · **51 palavras na tela**
- **Frase da tela:** objetivo: descobrir o que separa as unidades que ficam abaixo de 90%, e quais unidades se parecem
- **O que a tela mostra:** Três cartões: classificar, prever o número e agrupar, cada um com o alvo.
- **A fala:**
  1. O objetivo não é substituir a conta da portaria. É mostrar o que separa as unidades que ficam abaixo de 90%, e quais se parecem.
  1. Classificar é responder sim ou não: a unidade fica abaixo de 90%? O alvo é a coluna abaixo_90. Regressão é prever o número, o resultado geral. Agrupar é juntar parecidas sem resposta certa definida antes, por isso não tem alvo.
  1. Por que 90%: quase todas as USF param em 0,897 ou em 0,947, e o corte de 90% separa os dois patamares.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem o que separa os dois patamares: na USF as outras notas são quase iguais para todas. O que leva de 0,897 a 0,947 é o ind1 subir de 0,5 para 0,75, que vale 0,2 vezes a diferença. O corte fica logo acima do patamar de baixo.

### Slide 5: para que serve a resposta

- **Começa em** 1:40 · **dura** 0:35 · **etapa 1, entendimento do problema** · **86 palavras na tela**
- **Frase da tela:** quatro usos para a gestão da Secretaria, e um limite que não se negocia
- **O que a tela mostra:** Quatro cartões de uso e, embaixo, o limite.
- **A fala:**
  1. Primeiro, prioridade: a gestão vê primeiro quem fica abaixo de 90% e qual indicador deixa a unidade ali.
  1. Segundo: o modelo mostra em que indicadores as unidades de fato se diferenciam. Quanto cada ponto rende, a portaria já diz.
  1. Terceiro, e esse já aconteceu antes de qualquer modelo: refazer a conta da portaria e comparar com o lançado achou 6 linhas que seguem outra conta.
  1. Quarto: o agrupamento compara cada unidade com as parecidas. E o limite: nada disso entra na conta da gratificação.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem como o modelo antecipa o risco antes de fechar o mês: nesta base, não antecipa. As notas usadas são as do mês já fechado e não há coluna de data. Antecipar pediria lançamentos parciais, que a base não tem.

### Slide 6: a planilha real, como chegou

- **Começa em** 2:15 · **dura** 0:35 · **etapa 2, detalhamento do dataset** · **63 palavras na tela**
- **Frase da tela:** enviada pela Secretaria com autorização e sem nenhum dado de pessoa: uma linha por unidade de saúde, mais as dos distritos
- **O que a tela mostra:** O funil de linhas: 244, 196, 190, com o motivo de cada corte, e a ficha do arquivo.
- **A fala:**
  1. A origem é a planilha de desempenho da Secretaria, exportada em CSV. Entrou com autorização registrada e foi varrida atrás de CPF, e-mail e telefone antes de qualquer análise: não tem nenhum.
  1. São 244 linhas e 260 colunas, um retrato de um período só.
  1. 48 linhas são dos próprios distritos, 6 por distrito, avaliadas com outra versão dos indicadores: saem. Sobram 196 unidades.
  1. As 6 NDI e SAE seguem outra conta, que o slide 14 mostra, e também saem. Ficam 190 para os modelos.

### Slide 7: 260 colunas, sete papéis

- **Começa em** 2:50 · **dura** 0:35 · **etapa 2, detalhamento do dataset** · **61 palavras na tela**
- **Frase da tela:** o começo do nome diz o que a coluna guarda; os números chegam como texto, com % e vírgula
- **O que a tela mostra:** Barras com as colunas de cada papel e, ao lado, os tipos antes e depois da conversão.
- **A fala:**
  1. Cada coluna tem nome no padrão papel e indicador. O papel diz o que ela guarda: meta, nota, numerador, denominador, valor lançado, nota consolidada e o resultado geral.
  1. Na leitura crua o pandas acha 201 colunas de texto. Duas são texto de verdade, o tipo e o distrito; as outras 199 são número guardado com porcento e vírgula.
  1. Depois da conversão ficam 2 categóricas nominais e 258 numéricas. Delas, 78 são contagens, então discretas, e 96 são constantes nas unidades.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem pelo indicador 5: ele está na planilha, mas não entra na conta do resultado da unidade. A conta da portaria fecha só com os quatro primeiros.

### Slide 8: a tabela que o modelo lê

- **Começa em** 3:25 · **dura** 0:35 · **etapa 2, detalhamento do dataset** · **76 palavras na tela**
- **Frase da tela:** as notas dos quatro indicadores, três categóricas e dois alvos tirados do resultado geral
- **O que a tela mostra:** A ficha das colunas modeladas, com o tipo de cada uma, e a barra das duas classes.
- **A fala:**
  1. A tabela modelada fica com poucas colunas: o tipo de unidade, a família, que é a primeira palavra do tipo, o distrito, as quatro notas e o resultado geral.
  1. Tipo, família e distrito são categóricas nominais, sem ordem. O ind1 e o ind2 são discretos, andam por faixa; o ind3, o ind4 e o resultado são numéricos.
  1. Os alvos: o resultado geral para a regressão, e abaixo_90 para a classificação. Nas 190, são 101 com 90% ou mais e 89 abaixo, quase equilibradas.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem por que o caderno 01 mostra 54% e 46%: ele conta as 196 unidades, antes de tirar as seis NDI e SAE.
  - Se perguntarem por que 17 tipos e não 20: saíram DS, NDI e SAE.
  - Se perguntarem pela separação estratificada: treino e teste mantêm a mesma proporção das duas classes. O peso de classe dá mais importância à classe menor no treino; aqui quase não muda nada, porque as classes estão quase iguais.

### Slide 9: as notas andam em degraus

- **Começa em** 4:00 · **dura** 0:40 · **etapa 3, análise exploratória (EDA)** · **35 palavras na tela**
- **Frase da tela:** cada indicador vira nota por faixa, então poucos valores se repetem muito nas 196 unidades
- **O que a tela mostra:** Cinco histogramas, um por nota, com a assimetria e o valor mais comum.
- **A fala:**
  1. Estes são os histogramas das 196 unidades, com a assimetria embaixo: perto de zero é curva equilibrada, longe de zero a cauda puxa para um lado.
  1. Quase nada é curva. O ind2 vale 0,5 em 191 unidades, o ind3 vale 1,89 em 171, o ind4 vale 0,8 em 132.
  1. O resultado se concentra em 0,897 e 0,947, com cauda longa à direita: assimetria de 3,84. A cauda vem das MAC 1 e 2 e das seis NDI e SAE do slide 14; sem essas seis, a assimetria cai para 1,94.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem por que o ind3 passa de 1: é o valor que a planilha lança, 189% ou 311%. Os cadernos usam como vem, com a meta em 1.

### Slide 10: o tipo separa, o distrito não

- **Começa em** 4:40 · **dura** 0:45 · **etapa 3, análise exploratória (EDA)** · **40 palavras na tela**
- **Frase da tela:** resultado geral por família de unidade e por distrito sanitário, com a linha dos 90%
- **O que a tela mostra:** Dois conjuntos de caixas (boxplot), família e distrito, na mesma escala, com o corte de 90%.
- **A fala:**
  1. Cada linha é um grupo. A caixa vai do primeiro ao terceiro quartil e o traço é a mediana. O tamanho da caixa se chama IQR; os pontos soltos estão a mais de uma vez e meia esse tamanho para fora da caixa. A linha laranja é o corte de 90%.
  1. Por família, as caixas mudam de lugar: a MAC vai de 0,65 a 1,27. NDI e SAE, com asterisco, são as seis linhas do slide 14.
  1. Por distrito, as medianas ficam todas entre 0,897 e 0,947. As caixas do I e do III se esticam para cima por causa das MAC. O tipo explica o resultado; o distrito, quase nada.

### Slide 11: o ind3 anda junto com o resultado

- **Começa em** 5:25 · **dura** 0:50 · **etapa 3, análise exploratória (EDA)** · **43 palavras na tela**
- **Frase da tela:** correlação entre as notas nas 196 unidades, e as colunas cruas mais ligadas ao resultado geral
- **O que a tela mostra:** O mapa de calor 5 por 5 das notas e as barras das colunas cruas, com o valor sem as seis ao lado.
- **A fala:**
  1. Correlação vai de menos 1 a 1: perto de 1 as duas sobem juntas, perto de menos 1 uma sobe quando a outra desce, perto de zero não há relação em linha reta.
  1. O ind3, satisfação do usuário, tem 0,79 com o resultado; os outros três ficam entre 0,16 e 0,36. Entre si as notas quase não se correlacionam: nenhuma repete a outra.
  1. À direita, as colunas cruas mais ligadas ao resultado, e na última coluna o mesmo número sem as seis NDI e SAE. Os blocos do ind4 e o indicador 5 só aparecem por causa delas: sem elas, caem para perto de zero.
  1. As features novas partem das notas que lideram sem as seis: ind3, ind4 e ind1.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem pelos pontos do ind3 no topo: são a nota vezes 0,2, e repetem uma coluna que já está na tabela. Ficam acima da nota só por causa das cinco linhas com peso 80%.
  - Se perguntarem por que o ind3 pesa tanto se o ind4 tem 40%: é a nota que mais varia. Nas 190, 0,2 vezes um desvio de 0,36 pesa mais que 0,4 vezes o desvio de 0,06 do ind4.

### Slide 12: nada falta, e quase todo outlier é tipo

- **Começa em** 6:15 · **dura** 0:40 · **etapa 3, análise exploratória (EDA)** · **51 palavras na tela**
- **Frase da tela:** 0% de ausentes nas 63.440 células; o IQR marca sobretudo os tipos que pontuam diferente
- **O que a tela mostra:** O mapa de ausentes inteiro limpo e as barras de outliers por nota, com a divisão por família.
- **A fala:**
  1. Nenhuma célula vazia: zero ausentes nas 63.440 células, 0% em cada coluna, antes e depois de converter texto em número.
  1. A regra do IQR, a do slide anterior, marca muita gente porque as notas andam em degraus. No ind2 e no ind3 quase todas têm o mesmo valor, o IQR dá zero, e qualquer valor diferente vira outlier.
  1. No resultado geral são 29: 18 MAC, que pontuam de outro jeito e ficam; as 6 NDI e SAE do slide 14, que saem; e 5 USF, UCIS e UBT com nota real, que ficam.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem por que não tirar os outliers: são tipos de unidade reais, não erro de medida. Nas features a árvore não se incomoda com eles; no alvo da regressão, que usa erro ao quadrado, o erro das MAC vai ser olhado à parte.

### Slide 13: o que o olho não pega

- **Começa em** 6:55 · **dura** 0:40 · **etapa 3, análise exploratória (EDA)** · **81 palavras na tela**
- **Frase da tela:** problemas da planilha que a conversão precisou resolver antes de qualquer conta
- **O que a tela mostra:** Seis cartões, cada um com o tamanho do problema em número grande.
- **A fala:**
  1. A planilha foi feita para gente ler. 199 colunas de número chegam como texto, por causa do porcento e da vírgula.
  1. Em 49 delas o porcento aparece em umas linhas e não em outras. Na maioria é a linha de distrito escrevendo contagem como porcentagem; só em 6 a mistura acontece dentro das unidades. Entre elas, 4 metas escritas de dois jeitos, como 20 e 2000%.
  1. As quatro últimas colunas são os pontos, a nota vezes o peso. 3 repetem o nome da nota; o ind4 só vem assim, e é dividido por 0,4 para virar nota.

### Slide 14: seis linhas seguem outra conta

- **Começa em** 7:35 · **dura** 0:50 · **etapa 3, análise exploratória (EDA)** · **52 palavras na tela**
- **Frase da tela:** cada ponto é uma unidade: o resultado que os pesos da portaria dão, contra o que a planilha lançou
- **O que a tela mostra:** A dispersão esperado contra lançado, com a diagonal, e a tabela das seis unidades fora dela.
- **A fala:**
  1. Pela portaria, o resultado é 0,2 vezes cada um dos três primeiros indicadores mais 0,4 vezes o quarto. Refizemos a conta nas 196 unidades.
  1. 190 caem em cima da diagonal: a conta fecha. 6 não, em laranja, e são todas as NDI e SAE da base.
  1. Nas seis, o lançado é a soma dos pontos dividida por 1,7, sempre. Em 5 delas o ind3 entra nos pontos com peso 80% em vez de 20%; na SAE do distrito I, com 20%.
  1. É um padrão, não um erro solto: ou essas unidades têm regra própria que não achamos na portaria, ou é erro. Isso vai para a Secretaria. Até lá, saem da modelagem.

### Slide 15: o que a exploração ensinou

- **Começa em** 8:25 · **dura** 0:15 · **etapa 3, análise exploratória (EDA)** · **88 palavras na tela**
- **Frase da tela:** seis achados e o que cada um mudou depois
- **O que a tela mostra:** Seis cartões numerados: o achado e a consequência.
- **A fala:**
  1. Em resumo, seis achados, e cada um virou uma decisão.
  1. O mais forte é o quinto: a exploração achou sozinha seis linhas que seguem outra conta, e isso virou pergunta para a Secretaria.

### Slide 16: cada problema, uma decisão

- **Começa em** 8:40 · **dura** 0:30 · **etapa 4, tratamento e pré-processamento** · **86 palavras na tela**
- **Frase da tela:** o que a planilha recebeu antes de qualquer modelo, e por quê
- **O que a tela mostra:** Uma tabela de três colunas: problema, decisão e justificativa.
- **A fala:**
  1. Primeiro, o tipo de dado: uma função tira o porcento e a vírgula de milhar e divide por 100 quando tinha porcento. As colunas viram número e nenhum ausente aparece.
  1. Ausentes: nenhum. O caderno deixa a mediana do tipo de unidade como rede, para uma planilha futura com buraco. Duplicados: nenhuma linha repetida.
  1. Os outliers que são tipo real ficam. Saem as 48 linhas de distrito e as 6 NDI e SAE. Resultado: 190 unidades.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem pelas colunas de nome repetido: são os pontos, e serviram de conferência. Pontos divididos pela nota dão 0,2 no indicador 1, que é o peso da portaria.

### Slide 17: como a categoria vira número

- **Começa em** 9:10 · **dura** 0:50 · **etapa 4, tratamento e pré-processamento** · **85 palavras na tela**
- **Frase da tela:** one-hot onde não há ordem, código onde a árvore dá conta, número onde a ordem é real
- **O que a tela mostra:** Três cartões de encoding, a padronização e as caixas das MAC por nível.
- **A fala:**
  1. Família e distrito viram one-hot: uma coluna de 0 e 1 para cada valor. O distrito vem em algarismo romano, mas o I não é menor que o II; label encoding inventaria essa ordem.
  1. O tipo tem 17 valores nas 190 unidades. Label encoding guarda tudo numa coluna e serve porque os modelos são de árvore, que decidem por perguntas em sequência e não leem o código como distância.
  1. O número do tipo é ordinal dentro da família. O gráfico mostra: as MAC 1 e 2 ficam todas acima de 1; as MAC 3 e 4, todas abaixo do corte de 90%.
  1. Padronização só no K-Means, que junta as unidades mais próximas e por isso mede distância.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem por que o tipo pode ter código e o distrito não: com 8 valores o one-hot sai barato; com 17, muitos com uma unidade só, ele gera colunas quase vazias. A árvore separa o código em faixas, então a ordem falsa custa alguns cortes a mais, não um erro.
  - Se perguntarem pelo nível 0: é o marcador dos tipos sem número, como CAPS e UBT. O nível só tem ordem dentro da família, e a família em one-hot deixa a árvore separar esses casos.
  - Se perguntarem pela padronização num modelo supervisionado: a escala seria ajustada só no treino, para a média do teste não vazar.

### Slide 18: seis features novas

- **Começa em** 10:00 · **dura** 1:00 · **etapa 5, feature engineering** · **81 palavras na tela**
- **Frase da tela:** todas partem das notas mais ligadas ao resultado; nenhuma usa a coluna do resultado geral
- **O que a tela mostra:** Ficha das seis features: como se calcula, por quê, a distribuição e a assimetria.
- **A fala:**
  1. As features novas partem das notas que lideram sem as seis linhas, ind3, ind4 e ind1, e dos lançamentos por trás delas.
  1. A taxa do ind1 é a versão contínua dele: a nota só vale 0, 0,5 ou 0,75, e a taxa mostra quão perto a unidade está de mudar de degrau.
  1. O produto do ind3 pelo ind4 marca quem vai bem nas duas. O ind3 abaixo da meta é o que derruba as MAC 3 e 4.
  1. A feature indicadores na meta conta quantas notas chegam a 100%; o desvio mede quão desigual a unidade é; e a média dos blocos do ind4 enxerga variação que a nota final esconde, porque o ind4 da USF é sempre 0,8.
  1. Nenhuma usa a coluna do resultado. Mas o resultado é a soma das notas, então o modelo vai reaprender a regra, e o último slide assume isso.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem se o ind3 abaixo da meta repete o tipo: sim, nesta base ela coincide com ser MAC 3 ou 4. Fica porque é barata para a árvore, e sai se atrapalhar.
  - Se perguntarem pelo desvio: o ind3 está em outra escala, então na prática o desvio repete o ind3. Para a entrega final, a ideia é calcular o desvio sobre as notas divididas pela meta.

### Slide 19: o que as features novas acrescentam

- **Começa em** 11:00 · **dura** 0:50 · **etapa 5, feature engineering** · **73 palavras na tela**
- **Frase da tela:** nas 190 modeladas, a correlação de cada coluna com o resultado geral e com a classe abaixo de 90%
- **O que a tela mostra:** Barras divergentes das dez colunas nos dois alvos, a redundância e as três descartadas.
- **A fala:**
  1. Agora nas 190 modeladas, sem as seis linhas. Por isso o ind3 aparece com 0,91, e não 0,79 como no slide 11.
  1. O produto ind3 por ind4 é a coluna mais ligada ao resultado, 0,93. Para a classe, a taxa do ind1 fica logo atrás do ind1: −0,63 contra −0,70. Negativo aqui é bom: quanto maior, menor a chance de ficar abaixo.
  1. Redundância: desvio e produto andam quase juntos com o ind3. Para prever, a árvore aguenta; para ler a importância, ela se divide entre as parecidas.
  1. Três candidatas saíram: o log do ind4, que quase não muda a assimetria; o subindicador 2.3, do qual o ind2 é função direta; e o porte, sem relação linear com o resultado.

### Slide 20: o que levar daqui

- **Começa em** 11:50 · **dura** 0:35 · **abertura e fechamento** · **79 palavras na tela**
- **Frase da tela:** três destaques, o que vem depois e onde está cada entrega
- **O que a tela mostra:** Três destaques, os próximos passos, onde ler cada entrega e perguntas.
- **A fala:**
  1. Três coisas para levar. Primeira: a exploração achou sozinha seis linhas que seguem outra conta, e isso virou pergunta para a Secretaria.
  1. Segunda: como o resultado é soma das notas, qualquer modelo vai aprender a regra e ter métrica alta. A gente diz isso, em vez de vender previsão.
  1. Terceira: o ind3 é o que mais varia no resultado geral, e o ind1 é o que mais separa quem fica abaixo de 90%. Os próximos passos já estão nos cadernos 3 a 6.
- **Se perguntarem** (fora do tempo):
  - Se perguntarem pelos resultados: a classificação acerta as 48 unidades do teste, F1 de 1, contra 54% de acerto de quem chuta sempre a classe maior. A regressão erra em média 0,004, contra 0,07 de prever a média. O K-Means acha 4 grupos, com silhueta de 0,71.
  - Se perguntarem o que o modelo diz que mais pesa: na classificação, o desvio entre os indicadores vem primeiro e o ind1 em segundo; nas USF o desvio só muda quando o ind1 muda, então contam a mesma história. Na regressão, o ind3 pesa 73%.
  - Se perguntarem por que F1: o erro que importa é deixar passar uma unidade abaixo de 90%, e o F1 junta precisão e recall dessa classe. Com as classes quase equilibradas, acurácia e F1 contam a mesma história, e os cadernos mostram as duas.
  - Se perguntarem se tirar as seis é esconder dado: não. Elas estão documentadas e viraram achado; só não ensinam o modelo porque seguem outra conta.
  - Se perguntarem se a métrica alta é vazamento: nenhuma feature usa a coluna do resultado, mas o resultado é feito das notas. Por isso o objetivo é explicar o que separa as unidades, não prever.

<!-- roteiro-ml:fim -->
