# Perguntas que a banca pode fazer, e a resposta curta

Para os sete. O professor pode perguntar a qualquer um de nós, sobre qualquer parte. Leia
tudo uma vez. Não precisa decorar: precisa saber que a resposta existe e onde ela mora.

**Versão do SR1 (03/10), conferida contra o código em 25/09.** A primeira versão foi a do
Kick-off. Onde um número pode mudar, a data vai junto.

Cada resposta aqui foi conferida contra o que está no site e no código. Nada é chute. Se a
pergunta for outra, vale a regra de ouro: **diga que não sabe e diga onde está.** Inventar no
palco é o único erro sem conserto.

As perguntas marcadas com ⚠ são armadilha: parecem simples e derrubam quem responde de
improviso.

**Onde apontar.** O registro em `/`, o sistema em `/sistema`, a arquitetura em
`/arquitetura`, os slides do SR1 em `/sr1`, os da AV1 de ML em `/ml` e o uso de IA em
`/transparencia-ia`.

---

## O problema e o cliente

**Em uma frase, qual é o problema?**
Desde 2023 a Secretaria de Saúde do Recife paga um bônus a quem gerencia unidades e distritos, conforme metas mensais que estão numa portaria. Todo mês, dezenas de números viram uma nota por gestor. Hoje essa conta é feita à mão, numa planilha, e quase ninguém consegue conferir.

**Quem é o cliente, e com quem vocês falaram de verdade?**
A Secretaria de Saúde do Recife (SESAU). Dentro dela, a SEAB e a SECOGE. Falamos com o representante da SECOGE em 22 de agosto, e a ata está no site, na Semana 3. Depois vieram a portaria e uma planilha, em 5 de setembro, e a planilha que eles usam hoje, em 22 de setembro. Quem decide o resultado oficial é uma comissão de sete áreas, a CAM.

**Onde a planilha quebra?**
Mapeamos cinco etapas, e cada uma tem um furo: o número chega sem conferência, alguém copia à mão para a planilha mestre, a regra fica escondida na fórmula da célula, a conferência não deixa rastro, e a contestação vira troca de e-mail. O pior: ninguém consegue refazer o caminho de um número depois. Em 22/09 a própria Secretaria resumiu: "é tudo manual, via procv e afins".

**Como vocês sabem que o problema existe, e não é impressão?**
Quatro fontes, com data. A portaria oficial, publicada no Diário Oficial do Recife em 21/09/2024. O caso escrito pela escola com o órgão. A reunião de 22 de agosto, que virou ata no site. E a planilha que a Secretaria usa hoje, enviada em 22/09.

**⚠ O que a planilha deles mostrou?**
Que a conta de hoje não é uma só. A base por unidade que a lente de ML lê tem 244 linhas: 48 de distrito e 196 de unidade. Das 196, 190 seguem a régua da portaria. As outras 6, todas de NDI e SAE, seguem outra conta: o resultado é a soma dos pontos dividida por 1,7. E as linhas de distrito usam uma função que só existe no Google Planilhas: abertas no Excel, não recalculam. Os números estão nos slides de `/ml`, lidos do caderno 07.

**O que a portaria manda?**
Cinco indicadores, com peso que muda conforme a função. Ciclo mensal, prazos para enviar e para recorrer. Ela confirmou o nosso desenho e corrigiu dois pontos: a média é das notas, não dos valores, e o indicador sem número sai da conta e leva o peso junto. Os dois estão no motor desde 23/09, na versão 3 da regra.

**⚠ Vocês já conferiram se a conta de vocês bate com a conta real da Secretaria?**
Em parte, e é a principal coisa que falta. Lemos a planilha deles fórmula a fórmula em 22/09, e o método da versão 3 saiu dela. Mas, até 25/09, nenhum teste confere o nosso motor contra linhas da planilha. Os oito indicadores do sistema ainda são de teste, e os cortes das classes e os percentuais do bônus são suposição nossa. Conferir a regra com a Secretaria foi compromisso do Kick-off para o SR1. As perguntas que decidem isso seguem abertas: 4 e 6 a 12 de `docs/perguntas-para-a-sesau.md`.

**⚠ Qual o tamanho do problema? Quantos gestores, quanto dinheiro?**
Dinheiro e número de gestores, não temos, e não vamos chutar. O que sabemos: são cinco indicadores, a conta repete todo mês, e a base por unidade que a Secretaria mandou tem 196 unidades em oito distritos. A base do sistema é pequena de propósito: três distritos e doze unidades, para provar que a conta fecha.

**⚠ Esses tipos de unidade e indicadores no sistema são os da portaria?**
Os tipos, sim. Os indicadores, não. Desde 23/09 o sistema usa os sete tipos da portaria: USF, UBT, UBT Mista, CAPS, CECON, UCIS e MAC. Antes tinha UPA e Policlínica, que a portaria não nomeia. Os indicadores continuam oito, inventados para teste, e a portaria tem cinco. O porte da unidade (USF 1 a 8, MAC 1 a 4) ficou de fora. As unidades têm nome de ave, e os distritos, de ponto cardeal.

## O método

**Por que construir em vez de usar uma ferramenta pronta?**
Comparamos cinco tipos de ferramenta: painéis públicos, sistemas de metas do SUS, duas ferramentas de OKR e a planilha de hoje. Cada uma resolve um pedaço. Nenhuma junta as três coisas que este caso precisa: regra com versão, conta aberta e registro de quem mudou.

**⚠ Vocês entrevistaram a analista da comissão para fazer as personas?**
Não. As três personas saíram dos papéis descritos no caso e são personagens fictícios. A conversa foi com o representante do órgão. A entrevista com quem opera o processo está marcada para a Semana 11. Até lá, persona é hipótese declarada, não retrato de alguém.

**⚠ Por que o benchmarking não cita nenhum produto pelo nome?**
Porque comparamos categorias de ferramenta, não produtos. Nomear produto por produto exigiria um levantamento que não fizemos. Isso está escrito como bloqueio no site, não escondido.

**Quando a matriz CSD foi feita?**
Na semana do Kick-off, e o documento diz essa data. O conteúdo já existia espalhado pelo projeto; faltava juntar. Em 23/09 ela foi atualizada com o que a planilha respondeu: duas suposições viraram certeza, e a dúvida do art. 8º foi respondida.

**Qual a diferença entre suposição e dúvida na matriz?**
Suposição é o que assumimos para conseguir andar, e está declarado até dentro do código. Exemplo: que a nota do distrito é a média simples das unidades. Dúvida é o que ainda vamos perguntar à Secretaria. Exemplo: por que existe um peso em vigor diferente do peso da portaria.

**⚠ Como vocês somaram impacto, esforço e aderência? Qual a nota final da ideia vencedora?**
Não existe nota somada. São três notas de 1 a 5 para cada uma das oito alternativas, e elas servem para comparar, não para decidir sozinhas. A escolhida tirou 5 em impacto e 5 em aderência, com esforço 4. A decisão tem quatro razões escritas.

**⚠ Mostrem as folhas do brainwriting e os desenhos do Crazy 8's.**
Não temos isso publicado. O que está no site é o roteiro das três técnicas e as oito alternativas que saíram delas. A foto da dinâmica está pendente, e isso está escrito como bloqueio.

**⚠ Os wireframes vieram antes das telas ou depois?**
Depois, e o documento diz isso. Foram desenhados na semana do Kick-off, a partir das telas que já existiam. A Semana 3 prometeu telas em papel e não publicou. Preferimos datar certo a fingir que existiam em agosto.

## A solução

**Em uma frase, o que o sistema faz? E o que ele não faz?**
A unidade informa os números do mês, o sistema calcula a nota e mostra a conta inteira, com o histórico de quem mudou o quê. Ficam de fora: folha de pagamento, login da prefeitura, dados históricos reais, aplicativo de celular e qualquer outra verba.

**⚠ Quantas telas o sistema tem? Posso abrir todas agora?**
Oito, e todas estão no ar. Três abriram na véspera do Kick-off: painel da SEAB, indicadores e regras, e lançamento. O meu resultado abriu em 19/09. As outras quatro, trilha de auditoria, painel da gestão, analytics e contestação, passaram a abrir com a Semana 6, antes do SR1. Todas foram construídas em agosto. Cada perfil vê só as suas, e a SEAB vê as oito.

**Quem são os quatro papéis, e por que esses?**
Coordenação da SEAB, administrador, gerente distrital e gerente de unidade. Não fomos nós que escolhemos: foram os quatro que o cliente nomeou na reunião de 22 de agosto.

**⚠ Tem login? Se eu trocar o perfil na barra de endereço, vejo o que não é meu?**
O login é simulado: o perfil é escolhido num seletor, sem senha. Quem protege é o servidor, que devolve "página não existe" para tela que não é daquele papel. Há teste que confere as oito telas contra os quatro perfis. O controle de acesso de verdade está escrito no banco, que hoje está desligado. Está dito em `docs/seguranca.md`.

**⚠ Se eu preencher um lançamento agora e salvar, fica guardado?**
Fica na memória do servidor, numa cópia só sua. A escrita do protótipo passou a ser isolada por visitante antes do SR1: o seu lançamento não aparece para outro avaliador. Não há banco ligado, então um reinício do servidor apaga tudo. É limitação declarada, e a página de status do site mostra o modo de dados.

**O que é MVP e o que é promessa?**
O backlog tem 26 histórias. As 16 marcadas como obrigatórias eram para estar de pé até o SR1, e o estado de cada uma está no backlog revisado, publicado no registro. Promessa é o que depende da Secretaria: os indicadores reais, os cortes das classes e a conferência da nossa conta contra a planilha deles.

## A conta

**Como a nota de uma unidade é calculada?**
Depende da versão da regra do mês, e hoje existem três. Na versão 3, que vale de junho em diante, cada item medido vira uma nota de 0 a 1 por uma régua de degraus. A nota do indicador é a média dessas notas, e em alguns ela passa por uma segunda régua. A nota do mês é a média das notas dos indicadores, ponderada pelos pesos. A tela mostra essa nota vezes 100: 0,85 aparece como 85. Nas versões 1 e 2, de janeiro a maio, a média dos itens vira o valor do indicador, que é comparado com a meta. O atingimento cai numa faixa que vale de 0 a 10 pontos, e a nota do mês é a soma dos pontos vezes os pesos, dividida pelo máximo possível, de 0 a 100. Nas três, a faixa da nota diz qual percentual do bônus é devido.

**⚠ A nota é de 0 a 1 ou de 0 a 100?**
As duas coisas, em lugares diferentes. Nas três versões, a nota do mês aparece de 0 a 100. O que muda é o meio da conta. Na versão 3, cada item e cada indicador têm nota de 0 a 1, como na planilha da Secretaria. Nas versões 1 e 2, cada indicador vale de 0 a 10 pontos. Essa escala de 0 a 10 era invenção nossa, e a planilha corrigiu.

**E se a unidade não lançar um indicador no mês?**
Depende da regra do mês. Nas versões 1 e 2, o indicador entra com zero e a conta mostra "sem lançamento". Na versão 3, ele sai da conta e leva o peso junto, como manda o art. 8º da portaria. A planilha da Secretaria faz exatamente isso: divide pela soma dos pesos de quem tem valor.

**⚠ Se a portaria mudar, vocês reescrevem o sistema?**
Não. A regra é guardada como dado, com número de versão. Muda a portaria, criamos uma versão nova. Cada mês guarda qual versão usou, então o mês que já fechou continua mostrando o mesmo resultado. Foi o que aconteceu em 23/09: a versão 3 entrou, e maio, que fechou pela versão 2, não mudou. Na USF Canário, maio continua 86,67. Pela versão 3, daria 85.

**Onde o sistema diverge da portaria hoje?**
O método já segue a portaria, desde a versão 3. O que ainda diverge: os indicadores são oito de teste, e a portaria tem cinco. O porte da unidade ficou de fora. O Indicador 3 é bimestral, e o motor só conhece o mês. O prazo de recurso do art. 9º não está implementado. E os cortes das classes e os percentuais do bônus são suposição nossa, porque moram no Decreto nº 36.482/2023, que não temos.

**Como vocês provam que a conta está certa?**
Com teste. Em 25/09 eram 55 testes automáticos só no motor: fronteira de faixa, arredondamento, pesos diferentes, nota perfeita fechando em 100 e o método de notas da versão 3. No projeto inteiro, eram 671 testes de unidade passando. Outro teste confere que o motor não lê relógio, não sorteia e não abre arquivo nem rede (`src/lib/pureza.test.ts`). O que falta é conferir o motor contra linhas reais da planilha da Secretaria. Prometemos isso para o SR1 e não cumprimos: o teste contra a base por unidade entrou nas sprints, e a conferência com a Secretaria ficou para a Semana 11 (documento de correção de rota).

**O que é a conta aberta?**
Ao lado de cada nota, a pessoa abre e vê de onde o número veio, item por item: valor, nota ou pontos, peso e a conta final. Sai do mesmo cálculo que a tela mostra, então a explicação nunca diverge do número.

**⚠ O sistema calcula quanto a pessoa recebe em reais?**
Não. Ele vai até a nota do mês e o percentual do bônus. Dinheiro e folha de pagamento ficam fora do escopo. E os percentuais de cada faixa ainda são suposição nossa, até termos o Decreto nº 36.482/2023.

## Os dados e a inteligência artificial

**De onde vêm os dados?**
Depende de onde você olha. O site e o sistema usam uma base inventada por um programa nosso, sempre com o mesmo ponto de partida, então o mesmo número sai igual em qualquer máquina. Três distritos, doze unidades, nomes de ave. A lente de machine learning usa outra: a base de desempenho por unidade que a Secretaria mandou, em `ml/data/`, com autorização registrada na ADR-044. Ela não tem nome de pessoa.

**⚠ A planilha real está no repositório?**
A base de desempenho por unidade, sim: `ml/data/base nova completa.csv`. A Secretaria autorizou, e a decisão está na ADR-044. É dado institucional: tipo de unidade, distrito, indicador e número. Só os cadernos de ML leem o arquivo; o sistema não. Dado de pessoa não entra nunca, e isso não é permissão que o cliente possa dar: é lei. O ponto fraco, dito antes que perguntem: falta a autorização por escrito para publicar num repositório público.

**⚠ Como garantem que nenhum dado de pessoa entrou?**
Com dois testes, não com promessa. Um varre a base inventada procurando CPF, e-mail, telefone e matrícula. O outro varre `ml/data/` inteiro, linha a linha, procurando CPF, e-mail, telefone e coluna com nome de pessoa. Se achar, o código não passa. O limite, dito com honestidade: o teste pega identificador direto, não identificação indireta. Essa está analisada à parte, em `docs/privacidade.md`.

**⚠ Sem nome, dá para descobrir quem é?**
Às vezes, sim, e está escrito. Das 90 combinações de tipo de unidade e distrito na base, 39 têm uma linha só. Essa linha aponta uma unidade, e cada unidade tem um gerente que recebe a gratificação por ela. Pela LGPD, art. 5º, I, pessoa identificável também conta. As opções são generalizar essas linhas ou justificar a publicação com autorização por escrito. A decisão é da equipe com a Secretaria.

**⚠ O modelo de inteligência artificial decide quem recebe?**
Não. Quem calcula é o motor de regras, que segue a portaria. O modelo fica numa tela separada e serve para dizer onde olhar. Nenhuma saída dele entra na nota.

**⚠ O que é linha de base, e os modelos ganham dela?**
Linha de base é o chute mais simples: sempre a resposta mais comum, ou sempre a média. Modelo que não ganha dela não aprendeu nada. Na base da Secretaria, os modelos ganham. A classificação acerta 100%, contra 54,2% do chute. A regressão erra em média 0,0044, contra 0,0701 do chute. O agrupamento separa as unidades em quatro grupos.

**⚠ No Kick-off, um modelo perdia para o chute. O que mudou?**
A base. No Kick-off, a lente de ML rodava sobre a base inventada, e o modelo de "bate a meta" acertava 67% contra 83% do chute. Em 23/09 ela passou para a base da Secretaria (ADR-043). O slide 14 do Kick-off guarda os números daquele dia, de propósito.

**⚠ Acertar 100% não é bom demais para ser verdade?**
É, e os cadernos dizem isso. O resultado geral é uma soma ponderada das mesmas notas que o modelo recebe. Então ele aprende a conta da portaria, e não prevê nada novo. Serve para mostrar quais indicadores pesam mais. A tela de analytics repete: nada ali muda nota.

## Segurança e lei

**Quantas ameaças mapearam, e quantas resolveram?**
Catorze, pelo método STRIDE: nove resolvidas, três parciais, uma aceita e declarada, uma que fica com a plataforma. Uma das parciais é vazar dado pessoal, por causa da identificação indireta na base da Secretaria. Também passamos a lista OWASP: quatro cobertos, cinco parciais, um que não se aplica.

**O que a LGPD exige de um sistema que ajuda a decidir salário?**
A base legal é execução de política pública, artigo 7º, inciso III. E o artigo 20 dá ao servidor o direito de pedir revisão de decisão tomada por máquina. É por isso que a conta é aberta e contestável.

**Que dado pessoal existe na base hoje?**
Na base do sistema, nenhum: ela é inventada. Na base da lente de ML, nenhum identificador direto, e há teste que confere. O risco que sobra é a identificação indireta, pelas 39 linhas únicas.

**⚠ O que ainda não está protegido? Diga o pior.**
Cinco coisas, todas escritas. A senha padrão do painel administrativo está no briefing e no repositório, e só a troca em produção protege. O limite de tentativas de login vive na memória. A política de segurança do navegador ainda permite script embutido. O controle de acesso de verdade está no banco, que está desligado. E a base da Secretaria é pública, com linhas que podem apontar uma unidade.

## Arquitetura

**Onde está o desenho da arquitetura?**
Em `/arquitetura`, nos quatro níveis do C4: o sistema visto de fora, as peças, a aplicação por dentro e o motor por dentro. O texto completo, com as características priorizadas e o estilo escolhido, está em `docs/arquitetura.md`.

**Cadê o banco de dados?**
Existe, está escrito e testado, mas desligado do site. Assim qualquer pessoa baixa o projeto e roda sem senha nenhuma. Ligar não exige refazer tela.

**O que precisa acontecer para ligar o banco?**
Três passos mapeados: escrever o conector do banco, escolher por configuração qual fonte usar, e ter login de verdade. E uma dívida: o banco ainda descreve o desenho anterior à reunião de 22 de agosto.

**Como o site decide o que fica visível em cada semana?**
Uma conta simples: o ciclo liberado é o último cuja data já chegou, com sete dias de antecedência. Semana não liberada nem chega a ser montada, e tela do sistema não liberada responde "não existe". Há um teste que prova isso a cada publicação.

**⚠ A semana futura está fechada na sanfona. Não basta abrir?**
Não. Sanfona fechada continua na página, então esconder ali não esconderia nada. O corte acontece antes: semana não liberada nem é montada.

**Por que o site é o registro, em vez de um Google Sites com PDF?**
Porque tudo fica versionado no mesmo lugar. Cada documento é lido dentro da página, sem baixar arquivo. E como está no Git, dá para ver o que mudou de uma semana para a outra.

## O projeto e a equipe

**Como dividiram o trabalho? Como sei que não foi um só?**
Cada um tem papel e frente declarados no site. Toda semana tem o bloco de responsáveis dizendo quem fez o quê. No Kick-off falaram os seis que vinham desde agosto, e há teste que quebra se alguém sumir.

**⚠ Vocês são seis ou sete? Por que o Kerry não falou no Kick-off?**
Sete. O Kerry Muniz entrou no dia do Kick-off, 12/09. Ele estava na capa daquele deck e não recebeu bloco de fala, porque o roteiro já estava dividido e ensaiado. Dar um a quem chegou naquele dia seria inventar participação. Da Semana 5 em diante ele aparece no registro, apoiando pesquisa e validação.

**⚠ O que vocês prometeram no Kick-off, e cumpriram?**
Três coisas até o SR1, cada uma com dono. A regra oficial dentro do sistema, com o João Henrique: em parte, porque o método da versão 3 entrou, mas os indicadores continuam de teste e os cortes são suposição. As primeiras telas no ar, com o João Pedro: feito, eram quatro em 19/09 e são oito agora. A regra conferida com a Secretaria, com o Matheus: não feito até 25/09, porque as perguntas que decidem isso seguem abertas. O plano de correção de rota, no registro do SR1, diz o que muda por causa disso.

**⚠ Quanto foi feito com inteligência artificial, e quem conferiu?**
Bastante, e está tudo escrito: o registro de uso de IA tinha 61 linhas até 23/09, com data, o que foi gerado e os arquivos. A regra é "gerado não é entregue": nada entra sem revisão e sem teste. A IA leu a planilha e a base da Secretaria, depois de uma varredura sem dado pessoal, e isso também está no registro. O ponto desconfortável: quem validou as 61 linhas foi sempre a mesma pessoa, o Gabriel.

**O que está em aberto hoje?**
Tudo declarado. As respostas da Secretaria que decidem a régua: os cortes das classes, o decreto dos percentuais e o Indicador 3 bimestral. Os cinco indicadores reais e o porte. O teste do motor contra a planilha deles. A autorização por escrito para publicar a base. O ensaio do SR1 com cronômetro. A foto da dinâmica de ideação, o benchmarking sem produtos e o link do Drive. A lista de riscos está publicada no registro.

**Como vão validar com o cliente?**
Semana 11, dia 21 de novembro. Entrevista de 45 minutos, com 15 de demonstração em que a pessoa faz quatro tarefas sozinha. Depois, um questionário. Os critérios de sucesso foram fixados antes de coletar.

**⚠ E se a Secretaria não abrir agenda?**
O risco está na lista de riscos do registro, e o único mitigador é marcar com antecedência. O canal já funcionou três vezes: a reunião de agosto, a portaria em 5 de setembro e a planilha em 22 de setembro.

**O cronograma é realista?**
São 18 ciclos: 12 semanas de trabalho, 3 marcos e 3 pausas. As pausas não têm entrega e existem para quando algo escorregar. Todas as datas moram num arquivo só, e há teste que confere.

**Olhando para trás, o que fariam diferente?**
Duas coisas. Ler o briefing e a matriz de avaliação na primeira semana, porque descobrimos peças faltando duas vezes. E falar com o cliente antes da Semana 3, porque aquela conversa mudou o coração do sistema.

## As perguntas cínicas

**⚠ No fundo isso não é uma planilha com CSS por cima?**
Não, por três coisas que planilha não faz. A regra é guardada com versão. Toda mudança fica num histórico que ninguém apaga, com autor, data, antes e depois. E cada número abre a conta que levou até ele.

**⚠ Quem vai manter isso depois que vocês entregarem?**
Plano de manutenção escrito não temos, e seria fácil inventar um agora. O que existe: repositório público, cada decisão com o porquê, testes que quebram quando alguém erra, e a lista do que falta para virar produção. Já houve uma tentativa anterior de automatizar essa conta e ela parou. É esse risco que o registro tenta reduzir.

**⚠ Vocês testaram com usuário de verdade?**
Com quem opera o processo na Secretaria, ainda não. Está marcado para a Semana 11. Já houve retorno de quem usou o site, e ele mudou o produto duas vezes: a navegação foi refeita e a linguagem foi simplificada.

**⚠ Qual a chance real de a prefeitura usar isso?**
Não temos promessa de adoção, e não vamos fingir. O que temos é conversa real: a reunião de agosto mudou o sistema, e em setembro eles mandaram a portaria e, duas vezes, a planilha que usam. Para virar uso de verdade falta banco ligado, login institucional e a conferência da nossa conta com a deles.

**O que fariam com mais um semestre?**
Primeiro, o que hoje é de faz de conta: ligar o banco, trocar o seletor de perfil por login. Depois, o que muda o produto: os cinco indicadores reais da portaria, e sentar com a Secretaria para conferir a conta contra a planilha deles.

**Qual foi o erro que mais custou?**
Descrever a lente errada. A disciplina pedia Arquitetura na Nuvem e a gente se descrevia com Direito Digital. Uma auditoria achou isso na Semana 2 e a lente que faltava teve que ser escrita do zero.

---

## Se não souber

1. "Não sei de cabeça, mas está no site, na seção tal." E aponte.
2. Nunca prometa o que não existe. O site declara o que falta; use isso a seu favor.
3. Se for sobre número, prefira "está no documento" a chutar um valor.
