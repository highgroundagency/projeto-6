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

- **Começa em** 0:00 · **dura** 0:20 · **abertura e fechamento** · **16 palavras na tela**
- **Frase da tela:** a planilha da gratificação da saúde do Recife, lida com aprendizado de máquina
- **O que a tela mostra:** Wordmark, a pílula da AV1 e os nomes do grupo da disciplina.
- **A fala:**
  1. Somos o grupo do Prumo, o projeto que refaz a conta da gratificação por desempenho da Secretaria de Saúde do Recife.
  1. Nesta AV1 a gente mostra as cinco primeiras etapas do trabalho de machine learning, na ordem que a avaliação pede.
  1. A base é a planilha real que a Secretaria usa hoje, cedida com autorização dela. Não tem nenhum dado de pessoa: a menor coisa que aparece é a unidade de saúde.

### Slide 2: o caminho de hoje

- **Começa em** 0:20 · **dura** 0:10 · **abertura e fechamento** · **28 palavras na tela**
- **Frase da tela:** as cinco etapas da avaliação, cada uma com os números da planilha
- **O que a tela mostra:** As cinco etapas numeradas, lado a lado.
- **A fala:**
  1. São cinco paradas, na mesma ordem dos critérios da AV1: problema, dataset, exploração, tratamento e features novas.
  1. Todo número que aparece nos slides sai dos cadernos 01 e 02. O caderno 07 só repete as contas para desenhar os gráficos.

### Slide 3: uma planilha decide a gratificação

- **Começa em** 0:30 · **dura** 0:40 · **etapa 1, entendimento do problema** · **65 palavras na tela**
- **Frase da tela:** cada unidade de saúde ganha nota em quatro indicadores, e o resultado geral é a soma com peso
- **O que a tela mostra:** A faixa dos quatro pesos (20, 20, 20, 40), a conta escrita e a frase da Secretaria.
- **A fala:**
  1. A Secretaria de Saúde do Recife paga uma gratificação às equipes das unidades de saúde conforme o desempenho. A regra está na Portaria Conjunta 001 de 2024.
  1. Cada unidade recebe nota em quatro indicadores: medicamentos e material hospitalar, gestão do trabalho, satisfação do usuário e desempenho da unidade.
  1. Os três primeiros pesam 20% cada, e o desempenho da unidade pesa 40%. O resultado geral é essa soma com peso.
  1. Quando perguntamos como a conta é feita hoje, a resposta foi: é tudo manual, via PROCV. É uma planilha grande, montada à mão, que ninguém de fora consegue conferir.

### Slide 4: o que o modelo responde

- **Começa em** 1:10 · **dura** 0:40 · **etapa 1, entendimento do problema** · **52 palavras na tela**
- **Frase da tela:** objetivo: descobrir quais indicadores mais pesam para uma unidade ficar abaixo de 90%, e quais unidades se parecem
- **O que a tela mostra:** Três cartões: classificar, prever o número e agrupar, cada um com o alvo.
- **A fala:**
  1. O objetivo não é substituir a conta da portaria: essa conta o sistema já refaz. É mostrar onde a gestão deve olhar.
  1. São três perguntas. Classificar é responder sim ou não: a unidade fica abaixo de 90% no resultado geral? O alvo é a coluna abaixo_90, que vale 1 quando fica.
  1. Por que 90%: quase todas as USF param em dois patamares, 0,897 e 0,947. O corte de 90% cai exatamente entre os dois.
  1. Regressão é prever o número em si, o resultado geral. E agrupar é juntar unidades parecidas sem uma resposta certa definida antes: por isso o agrupamento não tem alvo.

### Slide 5: para que serve a resposta

- **Começa em** 1:50 · **dura** 0:30 · **etapa 1, entendimento do problema** · **84 palavras na tela**
- **Frase da tela:** quatro usos para a gestão da Secretaria, e um limite que não se negocia
- **O que a tela mostra:** Quatro cartões de uso e, embaixo, o limite.
- **A fala:**
  1. Primeiro uso, prioridade: antes de fechar o mês, a gestão olha primeiro para as unidades com risco de ficar abaixo de 90%.
  1. Segundo: a importância das features diz em qual indicador uma melhora rende mais.
  1. Terceiro, e esse já aconteceu: comparar o resultado que a regra espera com o que foi lançado acha erro de planilha. A exploração achou 6 linhas assim.
  1. Quarto: o agrupamento junta unidades de perfil parecido, e cada uma passa a ser comparada com as semelhantes.
  1. E o limite: nada do modelo entra na conta da gratificação, e ele agrupa unidades, nunca pessoas. Quem decide o valor continua sendo a regra.

### Slide 6: a planilha real, como chegou

- **Começa em** 2:20 · **dura** 0:35 · **etapa 2, detalhamento do dataset** · **63 palavras na tela**
- **Frase da tela:** enviada pela Secretaria com autorização e sem nenhum dado de pessoa: uma linha por unidade de saúde, mais as dos distritos
- **O que a tela mostra:** O funil de linhas: 244, 196, 190, com o motivo de cada corte.
- **A fala:**
  1. A origem é a própria planilha de desempenho que a Secretaria usa, exportada em CSV. Ela entrou no projeto com autorização registrada, e foi varrida atrás de CPF, e-mail e telefone antes de qualquer análise: não tem nenhum.
  1. São 244 linhas e 260 colunas.
  1. 48 linhas são do próprio distrito sanitário, marcadas como DS. O distrito é avaliado com outra versão dos indicadores, então sai da modelagem. Sobram 196 unidades de saúde.
  1. 6 dessas unidades têm um resultado que não segue os pesos da portaria. Elas saem também, e sobram 190 para os modelos.

### Slide 7: 260 colunas, sete papéis

- **Começa em** 2:55 · **dura** 0:35 · **etapa 2, detalhamento do dataset** · **57 palavras na tela**
- **Frase da tela:** o começo do nome diz o que a coluna guarda; os números chegam como texto, com % e vírgula
- **O que a tela mostra:** Barras com as colunas de cada papel e, ao lado, os tipos antes e depois da conversão.
- **A fala:**
  1. Cada coluna tem um nome no padrão papel e indicador. O papel diz o que ela guarda: a meta, a nota, o numerador, o denominador, o valor lançado, a nota consolidada e o resultado geral.
  1. Na leitura crua o pandas acha 201 colunas de texto. Não é texto de verdade: é número guardado com sinal de porcento e vírgula de milhar.
  1. Depois da conversão ficam 2 categóricas, o tipo de unidade com 20 valores e o distrito com 8, e 258 numéricas contínuas.
  1. Das 260, 96 são constantes nas unidades, a maioria metas. Elas não ensinam nada ao modelo.

### Slide 8: a tabela que o modelo lê

- **Começa em** 3:30 · **dura** 0:40 · **etapa 2, detalhamento do dataset** · **74 palavras na tela**
- **Frase da tela:** as notas dos quatro indicadores, três categóricas e dois alvos tirados do resultado geral
- **O que a tela mostra:** A ficha das colunas modeladas, com o tipo de cada uma, e a barra das duas classes.
- **A fala:**
  1. Das colunas da planilha, a tabela modelada fica com poucas: o tipo de unidade, a família, que é a primeira palavra do tipo, o distrito, as quatro notas e o resultado geral.
  1. Tipo, família e distrito são categóricas nominais: não existe ordem entre os valores. As notas e o resultado são numéricos contínuos.
  1. Os alvos: o resultado geral para a regressão, e abaixo_90 para a classificação.
  1. As classes estão quase equilibradas: 101 unidades com 90% ou mais e 89 abaixo. Mesmo assim, treino e teste são separados de forma estratificada, com peso de classe e F1 como métrica.

### Slide 9: as notas andam em degraus

- **Começa em** 4:10 · **dura** 0:35 · **etapa 3, análise exploratória (EDA)** · **35 palavras na tela**
- **Frase da tela:** cada indicador vira nota por faixa, então poucos valores se repetem muito nas 196 unidades
- **O que a tela mostra:** Cinco histogramas, um por nota, com a assimetria e o valor mais comum.
- **A fala:**
  1. Estes são os histogramas de cada nota nas 196 unidades de saúde, com a assimetria embaixo. Assimetria perto de zero é uma curva equilibrada; longe de zero, a cauda puxa para um lado.
  1. Quase nada aqui é curva. O ind2 vale 0,5 em 191 unidades; o ind3 vale 1,89 em 171; o ind4 vale 0,8 em 132.
  1. O resultado geral se concentra em dois valores, 0,897 e 0,947, e tem uma cauda longa à direita: assimetria de 3,84.
  1. Essa cauda vem de poucos tipos de unidade: MAC 1 e 2, NDI e SAE. O próximo slide mostra de onde ela sai.

### Slide 10: o tipo separa, o distrito não

- **Começa em** 4:45 · **dura** 0:30 · **etapa 3, análise exploratória (EDA)** · **31 palavras na tela**
- **Frase da tela:** resultado geral por família de unidade e por distrito sanitário, com a linha dos 90%
- **O que a tela mostra:** Dois conjuntos de caixas (boxplot), família e distrito, na mesma escala, com o corte de 90%.
- **A fala:**
  1. Cada linha é um grupo. A caixa vai do primeiro ao terceiro quartil, o traço de dentro é a mediana e os pontos soltos são os que o IQR marca como fora. A linha laranja é o corte de 90%.
  1. Por família, as caixas mudam muito de lugar: a MAC vai de 0,65 a 1,27, e NDI e SAE passam de 1,5.
  1. Por distrito, as caixas ficam todas em volta de 0,90 a 0,95.
  1. Conclusão: o tipo de unidade explica muito mais o resultado do que o distrito. Por isso o tipo ganha duas colunas no tratamento: o código e o nível.

### Slide 11: o ind3 anda junto com o resultado

- **Começa em** 5:15 · **dura** 0:35 · **etapa 3, análise exploratória (EDA)** · **37 palavras na tela**
- **Frase da tela:** correlação entre as notas nas 196 unidades, e as colunas cruas mais ligadas ao resultado geral
- **O que a tela mostra:** O mapa de calor 5 por 5 das notas e as barras das colunas cruas mais correlacionadas.
- **A fala:**
  1. Correlação vai de menos 1 a 1. Perto de 1, as duas colunas sobem juntas; perto de menos 1, uma sobe quando a outra desce; perto de zero, não há relação em linha reta.
  1. O ind3, satisfação do usuário, tem 0,79 com o resultado geral. Os outros três ficam entre 0,16 e 0,36. Entre si as notas quase não se correlacionam, então nenhuma repete a outra.
  1. À direita, as colunas cruas que mais se ligam ao resultado, entre as 161 numéricas que variam nas unidades. A primeira são os pontos do próprio ind3, que entram na soma: por isso ela não pode ser feature, vazaria o alvo.
  1. Depois vêm blocos do indicador 4 e a nota do indicador 5, que está na planilha mas não entra na conta da unidade. É daqui que partem as features novas.

### Slide 12: nada falta, e o outlier não é erro

- **Começa em** 5:50 · **dura** 0:35 · **etapa 3, análise exploratória (EDA)** · **44 palavras na tela**
- **Frase da tela:** zero ausentes nas 63.440 células; o IQR marca como outlier os tipos que pontuam diferente
- **O que a tela mostra:** O mapa de ausentes inteiro limpo e as barras de outliers por nota.
- **A fala:**
  1. A planilha não tem nenhuma célula vazia: zero ausentes nas 63.440 células, antes e depois de converter texto em número. O mapa de ausentes sai inteiro limpo.
  1. Para outlier usamos a regra do IQR: fica fora quem passa de uma vez e meia a distância entre o primeiro e o terceiro quartil.
  1. Como as notas andam em degraus, o IQR fica estreito e marca muita gente: 29 unidades no resultado geral, 18 delas MAC.
  1. Esses pontos não são erro de medida: são tipos de unidade pontuados de outro jeito. Por isso ficam na base. Os modelos de árvore também não se incomodam com eles.

### Slide 13: o que o olho não pega

- **Começa em** 6:25 · **dura** 0:30 · **etapa 3, análise exploratória (EDA)** · **69 palavras na tela**
- **Frase da tela:** problemas da planilha que a conversão precisou resolver antes de qualquer conta
- **O que a tela mostra:** Seis cartões, cada um com o tamanho do problema em número grande.
- **A fala:**
  1. A planilha foi feita para gente ler, não para máquina. 201 colunas chegam como texto porque o número vem com porcento ou vírgula.
  1. Pior: 49 colunas misturam os dois jeitos, 0,8 numa linha e 80% na outra. E 4 metas estão escritas de dois jeitos, como 20 e 2000%, que depois da conversão dão o mesmo número.
  1. As linhas de distrito usam vírgula de milhar, como 1,821.4. E 96 colunas são constantes nas unidades.
  1. Por fim, as quatro últimas colunas repetem o nome de outras: são os pontos, a nota vezes o peso. O indicador 4 só aparece assim, e precisa ser dividido por 0,4 para virar nota.

### Slide 14: seis linhas não fecham a conta

- **Começa em** 6:55 · **dura** 0:45 · **etapa 3, análise exploratória (EDA)** · **43 palavras na tela**
- **Frase da tela:** cada ponto é uma unidade: o resultado que os pesos da portaria dão, contra o que a planilha lançou
- **O que a tela mostra:** A dispersão esperado contra lançado, com a diagonal e as seis unidades fora dela.
- **A fala:**
  1. Pela portaria, o resultado geral é 0,2 vezes cada um dos três primeiros indicadores mais 0,4 vezes o quarto. Refizemos essa conta para as 196 unidades.
  1. 190 caem em cima da diagonal: a conta fecha. 6 não: três NDI e três SAE, em laranja.
  1. Em 5 delas, os pontos do indicador 3 saem com peso 80% em vez de 20%. Na sexta, o resultado nem bate com a soma dos próprios pontos.
  1. Essas seis saem da modelagem, porque o modelo aprenderia uma regra que não existe. E o achado vira argumento do produto: a planilha se contradiz sozinha.

### Slide 15: o que a exploração ensinou

- **Começa em** 7:40 · **dura** 0:25 · **etapa 3, análise exploratória (EDA)** · **86 palavras na tela**
- **Frase da tela:** seis achados e o que cada um mudou depois
- **O que a tela mostra:** Seis cartões numerados: o achado e a consequência.
- **A fala:**
  1. Resumindo a exploração em seis achados.
  1. O tipo de unidade explica o resultado, e o distrito quase nada. O ind3 é a nota que mais anda com o resultado. As notas andam em degraus, e por isso o IQR exagera.
  1. Não falta nenhum valor, mas quase tudo chega como texto. Seis linhas não seguem a conta. E as classes estão quase equilibradas.
  1. Cada achado virou uma decisão, e é isso que o tratamento mostra agora.

### Slide 16: cada problema, uma decisão

- **Começa em** 8:05 · **dura** 0:40 · **etapa 4, tratamento e pré-processamento** · **89 palavras na tela**
- **Frase da tela:** o que a planilha recebeu antes de qualquer modelo, e por quê
- **O que a tela mostra:** Uma tabela de três colunas: problema, decisão e justificativa.
- **A fala:**
  1. Primeiro, o tipo: uma função converte texto em número, tirando o porcento e a vírgula de milhar e dividindo por 100 quando tinha porcento. As colunas viram número e nenhum ausente aparece.
  1. Ausentes: não havia nenhum. O caderno deixa o preenchimento pela mediana do tipo de unidade como rede, para o dia em que uma planilha nova vier com buraco.
  1. Duplicados: nenhuma linha repetida, o que faz sentido, porque cada linha é uma unidade. As colunas de nome repetido, que são os pontos, serviram para conferir o peso: pontos divididos pela nota dão 0,2 no indicador 1.
  1. Outliers ficam, porque são tipos reais. O que sai são as 48 linhas de distrito e as 6 que não fecham a conta. Resultado: 190 unidades.

### Slide 17: categoria vira número sem inventar ordem

- **Começa em** 8:45 · **dura** 0:35 · **etapa 4, tratamento e pré-processamento** · **85 palavras na tela**
- **Frase da tela:** one-hot onde não há ordem, código onde a árvore dá conta, número onde a ordem é real
- **O que a tela mostra:** Três cartões de encoding, a padronização e as caixas das MAC por nível.
- **A fala:**
  1. Família, com 6 valores, e distrito, com 8, viram one-hot: uma coluna de 0 e 1 para cada valor. O distrito vem em algarismo romano, mas o distrito I não é menor que o II; label encoding inventaria essa ordem.
  1. O tipo de unidade tem 17 valores, vários com uma ou duas unidades. One-hot criaria 17 colunas quase vazias. Label encoding guarda tudo numa coluna, e serve porque os modelos são de árvore.
  1. O número no fim do tipo é ordinal de verdade, e vira coluna numérica. O gráfico mostra por quê: MAC 1 e 2 ficam acima de 1,2; MAC 3 e 4 ficam abaixo de 0,8.
  1. Padronização só no K-Means, que mede distância. As árvores não dependem de escala, então a base salva fica na escala original. Num modelo supervisionado, a escala seria ajustada só no treino, para o teste não vazar.

### Slide 18: seis features novas

- **Começa em** 9:20 · **dura** 0:40 · **etapa 5, feature engineering** · **84 palavras na tela**
- **Frase da tela:** todas partem das notas mais ligadas ao resultado, e nenhuma usa o resultado geral: o alvo não vaza
- **O que a tela mostra:** Ficha das seis features: como se calcula, por quê, a distribuição e a assimetria.
- **A fala:**
  1. As features novas partem das colunas que a exploração mostrou mais ligadas ao resultado: as notas dos indicadores 3, 4 e 1, e os lançamentos por trás delas.
  1. A taxa do ind1 é a versão contínua dele: a nota só vale 0, 0,5 ou 0,75, mas a taxa de atendimento mostra quão perto a unidade está de subir ou cair de degrau.
  1. O produto do ind3 pelo ind4 marca quem vai bem nas duas ao mesmo tempo. O ind3 abaixo da meta é o que derruba as MAC 3 e 4.
  1. Indicadores na meta conta quantas notas chegam a 100%. O desvio mede quão desigual a unidade é. E a média dos blocos do ind4 enxerga variação que a nota final esconde, já que o ind4 da USF é quase sempre 0,8.
  1. Nenhuma usa o resultado geral. Se usasse, o modelo estaria colando a resposta.

### Slide 19: o que as features novas acrescentam

- **Começa em** 10:00 · **dura** 0:40 · **etapa 5, feature engineering** · **76 palavras na tela**
- **Frase da tela:** correlação de cada coluna com o resultado geral e com a classe abaixo de 90%, com as notas de origem ao lado
- **O que a tela mostra:** Barras divergentes das dez colunas nos dois alvos, a redundância e as três descartadas.
- **A fala:**
  1. Cada coluna aparece com a correlação com o resultado geral, à esquerda, e com a classe abaixo de 90%, à direita. As novas estão marcadas.
  1. O produto ind3 por ind4 é a coluna mais ligada ao resultado geral de todas, 0,93, acima do próprio ind3. Para a classe, a taxa do ind1 fica logo atrás do ind1: −0,63 contra −0,70.
  1. Correlação negativa com abaixo de 90% é boa notícia: quanto maior a feature, menor a chance de ficar abaixo.
  1. Redundância: o desvio e o produto andam quase juntos com o ind3, 0,97 e 0,96. Para árvore isso não atrapalha; num modelo linear, ficaria só uma delas.
  1. E três candidatas foram testadas e descartadas: o log do ind4, que quase não muda a assimetria; o subindicador 2.3, do qual o ind2 é função direta; e o porte da unidade, que não tem relação com o resultado.

### Slide 20: o que levar daqui

- **Começa em** 10:40 · **dura** 0:25 · **abertura e fechamento** · **75 palavras na tela**
- **Frase da tela:** três destaques, o que vem depois e onde está cada entrega
- **O que a tela mostra:** Três destaques, os próximos passos, onde ler cada entrega e perguntas.
- **A fala:**
  1. Três coisas para levar. Primeira: a planilha se contradiz, e a exploração achou isso sozinha: 6 linhas que não fecham a conta.
  1. Segunda: como o resultado é soma com peso das notas, qualquer modelo vai aprender a regra e ter métrica alta. A gente vai dizer isso, em vez de vender previsão.
  1. Terceira: o ind3 puxa o resultado geral, e o ind1 é o que mais separa quem fica abaixo de 90%.
  1. Os próximos passos já estão nos cadernos 3 a 6: classificação, regressão e agrupamento, cada um comparado com uma referência simples.
  1. Se perguntarem por que F1 e não acurácia: o F1 olha a classe que importa, abaixo de 90%, e não se deixa enganar por um modelo que só chuta a classe maior.
  1. Se perguntarem se tirar as seis linhas é esconder dado: não. Elas estão documentadas no caderno 02 e viraram achado; só não ensinam o modelo, porque seguem outra conta.
  1. Se perguntarem por que não padronizou tudo: árvore não depende de escala. A padronização entra no K-Means, que mede distância.
  1. Se perguntarem se a métrica alta é vazamento: nenhuma feature usa o resultado geral, mas o resultado é feito das notas. Por isso o objetivo é explicar o que pesa, não prever.

<!-- roteiro-ml:fim -->
