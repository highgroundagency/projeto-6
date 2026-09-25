# SR1: roteiro e material de apoio

**O original é a rota `/sr1` do site.** Dezesseis slides na identidade do projeto, com as setas
do teclado, as notas do apresentador na tecla `n` (com as respostas preparadas embaixo), o
cronômetro do ensaio e a impressão na tecla `p`. Este documento é a versão para ler e ensaiar
longe do navegador. O PDF em `/sr1/pdf`, baixável pelo próprio deck, é a reserva para o dia em
que a rede falhar; as capturas ficam em `docs/sr1/`.

A fonte única do texto é `src/content/apresentacao-sr1.ts`, e a seção 4 é **gerada** por
`npm run roteiro`: não edite aquele trecho à mão. Um teste confere que este arquivo contém o
título, a fala e as respostas de cada slide.

Este roteiro morava no site, como documento da Semana 6. Saiu de lá pela ADR-040, decisão 4:
material de preparação não é entrega. O site mostra o que a equipe entregou; o que a equipe
usa para se preparar fica no repositório.

## 1. O que falta confirmar antes do dia

- **O tempo.** Ninguém confirmou o tempo do SR1. No Kick-off a diretriz escrita era cinco
  minutos mais cinco, e o professor liberou dez. Por isso o deck tem duas versões:
  - **completa**, em `/sr1`: 16 slides, 9:00;
  - **curta**, em `/sr1?versao=curta`: 10 slides, 4:55, com a fala cortada nas primeiras
    linhas de cada slide. O link "versão de 5 min" no topo do deck troca de uma para a outra.
- **Os critérios.** A matriz pede pesquisa consolidada, escopo maduro, protótipo, desenvolvimento
  iniciado, evidências técnicas e plano de correção de rota. O mapa de onde cada um está fica no
  documento "Pacote de entrega do SR1", no ciclo SR1 do site.
- **As perguntas 1, 3 e 12** de `docs/perguntas-para-a-banca.md`: a nota olha o site no dia ou a
  demonstração; a pesquisa precisa ser primária; a correção de rota vem antes ou depois do
  retorno.

## 2. Como apresentar

- **Os sete falam, nas duas versões.** Ninguém fala menos de 30 segundos nem mais de um pouco
  mais de dois minutos. O teste `src/content/apresentacao-sr1.test.ts` confere isso e confere
  que a fala de cada slide cabe no tempo dele a uma fala calma.
- **Quem mexe na tela não é quem fala.** Na demonstração (slide 7), João Pedro fala e outra
  pessoa opera. Combinar quem antes do ensaio.
- **Antes de entrar na sala:** abrir `/sr1` e `/sistema` em abas separadas, baixar o PDF pelo
  link do deck e conferir que o projetor mostra a tela inteira. Se a rede cair, o slide 7 tem a
  mesma conta, parada, e o PDF também.
- **Ensaio:** com cronômetro (tecla `r` zera), os sete, o caminho da demonstração do começo ao
  fim e o PDF aberto. Só depois disso o registro da Semana 6 pode dizer que houve ensaio, com a
  data e o tempo medido.

## 3. O caminho da demonstração

Tudo com dados de teste. O que um visitante lança fica na sessão dele (ver a ADR sobre a escrita
por visitante), então ensaiar não estraga a tela de ninguém.

1. `/sistema`, papel **gerente de unidade**: escolher uma unidade de exemplo e lançar os números
   do mês aberto, com a origem de cada um.
2. Papel **coordenação da SEAB**: o painel mostra quem mandou e quem falta; avançar o mês uma
   etapa.
3. **Meu resultado** da USF Canário: a nota de junho pela regra 3 e a conta inteira embaixo.

## 4. Slide a slide

<!-- roteiro-sr1:inicio -->

### Slide 1: prumo

- **Começa em** 0:00 · **dura** 0:15 · **quem fala:** Gabriel · **10 palavras na tela**
- **na versão de 5 min:** 0:10, só a primeira fala
- **Frase da tela:** o cálculo da gratificação, aberto para qualquer um conferir
- **O que a tela mostra:** Wordmark, a pílula do SR1 e os nomes da equipe inteira.
- **A fala:**
  1. Bom dia. Somos a Equipe 2, e este é o Prumo. O cliente é a Secretaria de Saúde do Recife.
  1. Hoje os sete falam, e qualquer um de nós responde qualquer pergunta no fim.

### Slide 2: o caminho de hoje

- **Começa em** 0:15 · **dura** 0:10 · **quem fala:** Fernando · **35 palavras na tela**
- **fora da versão de 5 min**
- **Frase da tela:** do que a planilha mostrou ao que vem até o sr2.
- **O que a tela mostra:** As seis paradas do roteiro, numeradas.
- **A fala:**
  1. Seis paradas: o problema, a planilha do cliente, o sistema rodando, como sabemos que está certo, o que prometemos e o que vem.

### Slide 3: todo mês, uma conta feita à mão

- **Começa em** 0:25 · **dura** 0:30 · **quem fala:** Gabriel · **65 palavras na tela**
- **na versão de 5 min:** 0:25, a fala inteira
- **Frase da tela:** A regra está num documento oficial. A conta está numa planilha.
- **O que a tela mostra:** O caminho do dinheiro em cinco passos, e a frase da Secretaria sobre como a conta é feita.
- **A fala:**
  1. Quem dirige uma unidade de saúde no Recife recebe um extra no salário quando bate as metas do mês.
  1. A regra está numa portaria. A conta é feita numa planilha, e é aí que o processo quebra.
  1. Não é impressão nossa: perguntamos à Secretaria como a conta é feita hoje. A resposta foi esta da tela.
- **Se perguntarem** (fora do tempo):
  - A frase veio da Secretaria em 22 de setembro, junto com a planilha. Está registrada no repositório, com a data.

### Slide 4: a planilha deles, por dentro

- **Começa em** 0:55 · **dura** 0:40 · **quem fala:** Matheus · **59 palavras na tela**
- **na versão de 5 min:** 0:35, só as 3 primeiras falas
- **Frase da tela:** a base de desempenho da Secretaria: uma linha por unidade, sem dado de pessoa.
- **O que a tela mostra:** O funil de linhas até as unidades que seguem a regra, e três achados da leitura.
- **A fala:**
  1. A Secretaria autorizou o uso da base de desempenho dela. É uma linha por unidade de saúde, sem nome, CPF ou matrícula.
  1. São 244 linhas. Tirando as linhas de distrito, sobram 196 unidades de saúde.
  1. 190 seguem a conta da portaria. 6, de dois tipos que a portaria não nomeia, seguem outra: a soma dos pontos dividida por 1,7.
  1. E 199 colunas de número estão guardadas como texto. É o retrato de uma conta mantida à mão.
- **Se perguntarem** (fora do tempo):
  - O arquivo está em ml/data, com autorização da Secretaria registrada na ADR-044. Um teste varre o arquivo linha a linha atrás de CPF, e-mail e telefone.
  - NDI e SAE não estão entre os sete tipos da portaria. A gente não sabe ainda se a conta diferente é regra ou erro: é uma das perguntas para a Secretaria.

### Slide 5: três coisas que a gente tinha errado

- **Começa em** 1:35 · **dura** 0:40 · **quem fala:** Kerry · **59 palavras na tela**
- **na versão de 5 min:** 0:30, só as 3 primeiras falas
- **Frase da tela:** no kick-off, dissemos que parte da conta era aposta nossa. a planilha respondeu.
- **O que a tela mostra:** Três linhas, cada uma com o que a gente fazia e o que a planilha faz, e os tipos de unidade.
- **A fala:**
  1. No Kick-off a gente disse que parte da conta era aposta nossa. A planilha respondeu três apostas.
  1. A gente fazia a média dos valores. A planilha dá nota a cada item primeiro e faz a média das notas.
  1. Quando faltava um número, a gente zerava. A planilha tira da conta, e o peso sai junto, como manda o artigo 8º.
  1. E a nota é de 0 a 1, não de 0 a 10. Os tipos de unidade também estavam errados: são os sete da portaria.
- **Se perguntarem** (fora do tempo):
  - A planilha mostrou mais duas coisas: tem item em que passar do alvo também perde ponto, e numerador maior que denominador é erro, não nota cheia.

### Slide 6: a regra mudou, e maio não

- **Começa em** 2:15 · **dura** 0:40 · **quem fala:** João Henrique · **44 palavras na tela**
- **na versão de 5 min:** 0:30, só as 3 primeiras falas
- **Frase da tela:** a correção entrou como regra nova, com número de versão. mês fechado não muda.
- **O que a tela mostra:** A mesma unidade de teste em três contas: maio pela versão 2, maio pela versão 3 e junho pela versão 3.
- **A fala:**
  1. A correção entrou como uma regra nova, a versão 3, guardada como dado. O motor aprendeu o jeito novo sem esquecer o antigo.
  1. Maio fechou pela versão 2 e continua dando 86,67. Pela regra nova, maio daria 85.
  1. Mas mês fechado não muda quando a regra muda. Junho já usa a versão 3, e dá 70.
  1. Era para isso que a regra virou dado: a primeira mudança grande aconteceu sem tocar em resultado publicado.
- **Se perguntarem** (fora do tempo):
  - A classe de cada nota (satisfatório, excelente) vem da planilha. O percentual pago em cada classe ainda é suposição nossa: ele está num decreto que a gente ainda não tem.
  - Os indicadores do sistema ainda são de teste. O que entrou foi o jeito de calcular, que vale para qualquer indicador.

### Slide 7: do número à nota, ao vivo

- **Começa em** 2:55 · **dura** 1:45 · **quem fala:** João Pedro · **22 palavras na tela**
- **na versão de 5 min:** 1:20, só as 6 primeiras falas
- **Frase da tela:** o sistema rodando agora, com dados de teste.
- **O que a tela mostra:** O sistema ao vivo. De reserva, a nota de junho com a conta aberta, calculada na hora.
- **A fala:**
  1. Agora o sistema, ao vivo. Tudo o que aparece são dados de teste: nenhuma pessoa real.
  1. Primeiro, a unidade. Escolho uma unidade de exemplo e lanço os números do mês. Cada número diz de onde veio.
  1. Depois, a coordenação. O painel mostra quem já mandou e quem falta, e o mês avança uma etapa por vez.
  1. Por fim, o resultado. A nota de junho da USF Canário é 70, e embaixo está a conta inteira.
  1. Cada linha mostra o número que a unidade mandou, o alvo, a nota que ele ganhou e quanto pesa.
  1. A última linha fecha a conta na frente de todo mundo. Qualquer pessoa refaz no papel.
  1. Se a rede cair, esta tela é a mesma conta, parada. E o PDF de reserva tem ela também.
- **Se perguntarem** (fora do tempo):
  - Quem mexe na tela não é quem fala: assim a demonstração não depende de uma pessoa só.
  - O que um visitante lança fica na sessão dele. A demonstração de um não muda a tela de outro.

### Slide 8: cada um vê o que é seu

- **Começa em** 4:40 · **dura** 0:20 · **quem fala:** João Pedro · **35 palavras na tela**
- **fora da versão de 5 min**
- **Frase da tela:** quem manda o número não escolhe a meta.
- **O que a tela mostra:** Os quatro papéis e quantas telas cada um enxerga.
- **A fala:**
  1. São quatro papéis, e cada um só enxerga as telas dele. Quem manda o número não escolhe a meta.
  1. O que não é seu, para o sistema, não existe: a página responde que não foi encontrada.
- **Se perguntarem** (fora do tempo):
  - O login ainda é simulado: você escolhe o papel. Um teste percorre as oito telas contra os quatro papéis e falha se uma porta abrir para quem não devia.
  - A resposta é "não encontrado" e nunca "proibido" de propósito: da porta, não dá para saber se a tela existe.

### Slide 9: o prumo em quatro zooms

- **Começa em** 5:00 · **dura** 0:30 · **quem fala:** João Henrique · **66 palavras na tela**
- **fora da versão de 5 min**
- **Frase da tela:** do contexto ao código, no padrão C4. o desenho inteiro está no site.
- **O que a tela mostra:** Os quatro níveis do C4, com o motor de cálculo em destaque e o endereço da página.
- **A fala:**
  1. Desenhamos o sistema em quatro níveis de zoom, no padrão C4. O desenho inteiro está na página de arquitetura do site.
  1. O ponto que importa: o motor de cálculo não lê relógio, rede nem banco. Recebe números e devolve a nota com a conta.
  1. E um teste lê o código e falha se alguém fizer o motor olhar para fora.
- **Se perguntarem** (fora do tempo):
  - O banco de dados existe desenhado, com as regras de acesso testadas num Postgres de verdade, mas está desligado: o sistema roda em memória para qualquer pessoa clonar e rodar sem senha.

### Slide 10: como sabemos que a conta está certa

- **Começa em** 5:30 · **dura** 0:35 · **quem fala:** Fernando · **61 palavras na tela**
- **na versão de 5 min:** 0:30, só as 3 primeiras falas
- **Frase da tela:** teste automático a cada mudança, e mês fechado que continua dando o mesmo número.
- **O que a tela mostra:** Três contagens: testes do motor, versões da regra guardadas e meses fechados.
- **A fala:**
  1. Primeiro, 55 testes só para o motor, cobrindo as bordas de cada faixa e o arredondamento.
  1. Segundo, as 3 versões da regra continuam guardadas, e cada mês aponta para a que usou.
  1. Terceiro, cada envio de código ao repositório roda todos os testes de novo, sozinho.
  1. O que falta: conferir a nossa conta contra linhas reais da planilha. Está na correção de rota.
- **Se perguntarem** (fora do tempo):
  - O motor é uma função pura: mesma entrada, mesmo número, em qualquer dia. Recalcular fevereiro em dezembro dá o número de fevereiro.
  - A checagem automática também prova que conteúdo de semana futura não aparece no site antes da hora.

### Slide 11: a base de verdade, com aprendizado de máquina

- **Começa em** 6:05 · **dura** 0:35 · **quem fala:** Rafael · **64 palavras na tela**
- **fora da versão de 5 min**
- **Frase da tela:** três modelos sobre as 190 unidades. eles mostram o que pesa, não fazem a conta.
- **O que a tela mostra:** Os três modelos, cada um com o número principal e a referência ao lado.
- **A fala:**
  1. Na disciplina de aprendizado de máquina, usamos a base da Secretaria: as 190 unidades que seguem a regra.
  1. O classificador acerta 100%, e o chute mais simples acerta 54%. Ele acerta porque aprende a própria conta da portaria.
  1. Por isso o modelo diz o que mais pesa, e não calcula nada. Nenhum resultado dele entra na gratificação.
  1. O sistema continua com dados de teste. A base real fica nos cadernos.
- **Se perguntarem** (fora do tempo):
  - A apresentação completa de aprendizado de máquina está na página ml do site, com o PDF.
  - O agrupamento separa 4 grupos de unidades, nunca de pessoas, com silhueta de 0,71.

### Slide 12: o que pode dar errado, dito antes

- **Começa em** 6:40 · **dura** 0:30 · **quem fala:** Rafael · **68 palavras na tela**
- **na versão de 5 min:** 0:30, a fala inteira
- **Frase da tela:** login de faz de conta, banco desligado, e parte da regra ainda é suposição.
- **O que a tela mostra:** Os quatro riscos maiores, e as contagens de segurança.
- **A fala:**
  1. A gente prefere dizer o que falta antes que alguém pergunte. O registro de riscos inteiro está no site.
  1. O maior: o percentual pago em cada classe ainda é suposição. Ele está num decreto que a gente não tem.
  1. Os indicadores ainda são de teste, e o prazo para contestar a nota ainda não existe.
- **Se perguntarem** (fora do tempo):
  - Em segurança, 14 ameaças listadas uma a uma (STRIDE) e as 10 falhas mais comuns conferidas (OWASP), 5 ainda pela metade.
  - Uma unidade que é única no distrito pode apontar quem a dirige. Isso está na análise de privacidade, e é uma pergunta para a Secretaria.

### Slide 13: o que prometemos, e o que fizemos

- **Começa em** 7:10 · **dura** 0:35 · **quem fala:** Gabriel · **67 palavras na tela**
- **na versão de 5 min:** 0:15, só as 2 primeiras falas
- **Frase da tela:** os três compromissos do kick-off, cada um com o estado de hoje.
- **O que a tela mostra:** Os três compromissos do Kick-off, com quem puxou, o estado e o porquê.
- **A fala:**
  1. No Kick-off prometemos três coisas até hoje, com data e nome. Vamos prestar contas.
  1. As telas estão no ar: as 4.
  1. A regra oficial entrou em parte: o jeito de calcular da planilha está no sistema, mas os indicadores ainda são de teste.
  1. E a conferência com a Secretaria não aconteceu. As perguntas estão escritas, e a conferência da conta ficou para a Semana 11.

### Slide 14: a correção de rota

- **Começa em** 7:45 · **dura** 0:30 · **quem fala:** Matheus · **66 palavras na tela**
- **fora da versão de 5 min**
- **Frase da tela:** o que a planilha mudou nas quatro sprints, e o que continua fora.
- **O que a tela mostra:** O que entra nas sprints por causa da planilha, e o que fica para depois.
- **A fala:**
  1. A planilha mudou o plano. Entram os indicadores reais da portaria, o porte das unidades e o prazo de contestação.
  1. Entra também conferir a nossa conta contra linhas reais da planilha, com as perguntas que decidem a regra.
  1. Folha de pagamento, login da prefeitura e dado de pessoa continuam fora. O estado de cada história está no site.
- **Se perguntarem** (fora do tempo):
  - O retorno desta banca entra por cima de tudo isso, na primeira sprint.

### Slide 15: até o sr2

- **Começa em** 8:15 · **dura** 0:25 · **quem fala:** Kerry · **46 palavras na tela**
- **fora da versão de 5 min**
- **Frase da tela:** quatro sprints, uma semana com o cliente e a entrega final.
- **O que a tela mostra:** As sete paradas até o SR2, com a data de cada uma e a validação em destaque.
- **A fala:**
  1. Daqui até o SR2 são quatro sprints, uma semana de validação com o cliente e a entrega final.
  1. A semana que mais importa é a da validação: é quando a Secretaria confere se a nossa conta bate com a dela.

### Slide 16: prumo

- **Começa em** 8:40 · **dura** 0:20 · **quem fala:** Gabriel · **13 palavras na tela**
- **na versão de 5 min:** 0:10, só a primeira fala
- **Frase da tela:** o registro, os documentos, o sistema e esta apresentação estão no ar.
- **O que a tela mostra:** Wordmark, o endereço do site e a pergunta para a banca.
- **A fala:**
  1. Obrigado. Tudo o que mostramos está no site, e qualquer um de nós responde.
  1. O site tem um índice no topo com as oito seções, na ordem em que vocês pediram.

<!-- roteiro-sr1:fim -->
