# Perguntas que a banca pode fazer, e a resposta curta

Para os seis. O professor pode perguntar a qualquer um de nós, sobre qualquer parte. Leia
tudo uma vez. Não precisa decorar: precisa saber que a resposta existe e onde ela mora.

Cada resposta aqui foi conferida contra o que está no site e no código. Nada é chute. Se a
pergunta for outra, vale a regra de ouro: **diga que não sabe e diga onde está.** Inventar no
palco é o único erro sem conserto.

As perguntas marcadas com ⚠ são armadilha: parecem simples e derrubam quem responde de
improviso.

---

## O problema e o cliente

**Em uma frase, qual é o problema?**
Desde 2023 a Secretaria de Saúde do Recife paga um bônus a quem gerencia unidades e distritos, conforme metas mensais que estão numa portaria. Todo mês, dezenas de números viram uma nota por gestor. Hoje essa conta é feita à mão, numa planilha, e quase ninguém consegue conferir.

**Quem é o cliente, e com quem vocês falaram de verdade?**
A Secretaria de Saúde do Recife (SESAU). Dentro dela, a SEAB e a SECOGE. Falamos com o representante da SECOGE em 22 de agosto, e a ata está no site, na Semana 3. Quem decide o resultado oficial é uma comissão de sete áreas, a CAM.

**Onde a planilha quebra?**
Mapeamos cinco etapas, e cada uma tem um furo: o número chega sem conferência, alguém copia à mão para a planilha mestre, a regra fica escondida na fórmula da célula, a conferência não deixa rastro, e a contestação vira troca de e-mail. O pior: ninguém consegue refazer o caminho de um número depois.

**Como vocês sabem que o problema existe, e não é impressão?**
Três fontes, com data. A portaria oficial, publicada no Diário Oficial do Recife em 21/09/2024. O caso escrito pela escola com o órgão. E a reunião de 22 de agosto, que virou ata no site.

**O que a portaria manda?**
Cinco indicadores, com peso que muda conforme a função. Ciclo mensal, prazos para enviar e para recorrer. Ela confirmou o nosso desenho e corrigiu dois pontos: como a nota de cada indicador é composta, e o que fazer quando falta um número. Os dois entram como versão 3 da regra na Semana 5.

**⚠ Vocês já conferiram se a conta de vocês bate com a conta real da Secretaria?**
Ainda não. É a principal coisa que falta. O órgão mandou uma planilha de um mês real, com os nomes trocados, e ela ficou fora do repositório de propósito. A conferência formal está marcada para a Semana 11. Enquanto a nossa conta não bater com a deles, o resto é promessa.

**⚠ Qual o tamanho do problema? Quantos gestores, quanto dinheiro?**
Não temos esses números, e não vamos chutar. O que sabemos: são cinco indicadores, a conta repete todo mês, e o cliente falou em cerca de trinta unidades por distrito. A nossa base de teste é pequena de propósito: três distritos e doze unidades, para provar que a conta fecha.

**⚠ Esses tipos de unidade e indicadores no sistema são os da portaria?**
Não, e é de propósito. Tudo na base é inventado: unidades com nome de ave, distritos com ponto cardeal. A portaria confirmou o mecanismo, que a regra muda por tipo de unidade. A lista certa entra depois, pelo cadastro da própria tela.

## O método

**Por que construir em vez de usar uma ferramenta pronta?**
Comparamos cinco tipos de ferramenta: painéis públicos, sistemas de metas do SUS, duas ferramentas de OKR e a planilha de hoje. Cada uma resolve um pedaço. Nenhuma junta as três coisas que este caso precisa: regra com versão, conta aberta e registro de quem mudou.

**⚠ Vocês entrevistaram a analista da comissão para fazer as personas?**
Não. As três personas saíram dos papéis descritos no caso e são personagens fictícios. A conversa foi com o representante do órgão. A entrevista com quem opera o processo está marcada para a Semana 11. Até lá, persona é hipótese declarada, não retrato de alguém.

**⚠ Por que o benchmarking não cita nenhum produto pelo nome?**
Porque comparamos categorias de ferramenta, não produtos. Nomear produto por produto exigiria um levantamento que não coube nesta semana. Isso está escrito como bloqueio no site, não escondido.

**Quando a matriz CSD foi feita?**
Nesta semana, a do Kick-off. O conteúdo já existia espalhado pelo projeto; o que faltava era juntar na matriz. O documento diz essa data com todas as letras.

**Qual a diferença entre suposição e dúvida na matriz?**
Suposição é o que assumimos para conseguir andar, e está declarado até dentro do código. Exemplo: que a unidade manda o número por planilha. Dúvida é o que ainda vamos perguntar à Secretaria. Exemplo: como redistribuir o peso quando falta um número.

**⚠ Como vocês somaram impacto, esforço e aderência? Qual a nota final da ideia vencedora?**
Não existe nota somada. São três notas de 1 a 5 para cada uma das oito alternativas, e elas servem para comparar, não para decidir sozinhas. A escolhida tirou 5 em impacto e 5 em aderência, com esforço 4. A decisão tem quatro razões escritas.

**⚠ Mostrem as folhas do brainwriting e os desenhos do Crazy 8's.**
Não temos isso publicado. O que está no site é o roteiro das três técnicas e as oito alternativas que saíram delas. A foto da dinâmica está pendente, e isso está escrito como bloqueio.

**⚠ Os wireframes vieram antes das telas ou depois?**
Depois, e o documento diz isso. Foram desenhados nesta semana a partir das telas que já existiam. A Semana 3 prometeu telas em papel e não publicou. Preferimos datar certo a fingir que existiam em agosto.

## A solução

**Em uma frase, o que o sistema faz? E o que ele não faz?**
A unidade informa os números do mês, o sistema calcula a nota e mostra a conta inteira, com o histórico de quem mudou o quê. Ficam de fora: folha de pagamento, login da prefeitura, dados históricos reais, aplicativo de celular e qualquer outra verba.

**⚠ Quantas telas o sistema tem? Posso abrir todas agora?**
Oito telas construídas, três no ar hoje: painel da SEAB, indicadores e regras, e lançamento. As outras cinco abrem nas semanas 6, 7, 9, 10 e 11. Não é tela faltando: o site só mostra cada tela na semana em que ela é entregue.

**Quem são os quatro papéis, e por que esses?**
Coordenação da SEAB, administrador, gerente distrital e gerente de unidade. Não fomos nós que escolhemos: foram os quatro que o cliente nomeou na reunião de 22 de agosto.

**⚠ Tem login? Se eu trocar o perfil na barra de endereço, vejo o que não é meu?**
O login é simulado: o perfil é escolhido num seletor, sem senha. Quem protege é o servidor, que devolve "página não existe" para tela que não é daquele papel. Há teste que confere as oito telas contra os quatro perfis. O controle de acesso de verdade está escrito no banco, que hoje está desligado. Dizemos isso no slide 15.

**⚠ Se eu preencher um lançamento agora e salvar, fica guardado?**
Fica só na memória do servidor, enquanto ele estiver de pé. Não há banco ligado. É limitação declarada, e a página de status do site mostra isso.

**O que é MVP e o que é promessa?**
O backlog tem 25 histórias. As 15 marcadas como obrigatórias precisam estar de pé até o SR1. Promessa é tudo que depende de confirmar com o cliente: a nossa conta ainda não foi conferida contra a planilha real.

## A conta

**Como a nota de uma unidade é calculada?**
A unidade informa os itens medidos. A média deles vira o valor do indicador, que é comparado com a meta e cai numa faixa que vale pontos. A nota é a soma dos pontos vezes os pesos, dividida pelo máximo possível, de 0 a 100. A faixa da nota diz qual percentual do bônus é devido.

**E se a unidade não lançar um indicador no mês?**
Hoje, na demonstração, o indicador entra com zero e a conta mostra "sem lançamento". A portaria manda redistribuir o peso entre os outros. Isso entra na versão 3 da regra, na Semana 5. Como redistribuir exatamente é a nossa maior dúvida para a Secretaria.

**⚠ Se a portaria mudar, vocês reescrevem o sistema?**
Não. A regra é guardada como dado, com número de versão. Muda a portaria, criamos uma versão nova. Cada mês guarda qual versão usou, então o mês que já fechou continua mostrando o mesmo resultado.

**Onde o sistema diverge da portaria hoje?**
Em dois pontos. Como a nota de cada indicador é composta, e o que fazer quando falta um número. Os dois entram na versão 3 da regra, na Semana 5. A tabela de comparação está no site, no Kick-off.

**Como vocês provam que a conta está certa?**
São 46 testes automáticos no motor: fronteira de faixa, arredondamento, pesos diferentes, nota perfeita fechando em 100. O que falta é a conferência contra a planilha real do cliente, prometida até o SR1.

**O que é a conta aberta?**
Ao lado de cada nota, a pessoa abre e vê de onde o número veio, item por item: valor, meta, pontos, peso e a conta final. Sai do mesmo cálculo que a tela mostra, então a explicação nunca diverge do número.

**⚠ O sistema calcula quanto a pessoa recebe em reais?**
Não. Ele vai até a nota de 0 a 100 e o percentual do bônus. Dinheiro e folha de pagamento ficam fora do escopo.

## Os dados e a inteligência artificial

**De onde vêm os dados?**
Todos são inventados por um programa nosso, sempre com o mesmo ponto de partida, então o mesmo número sai igual em qualquer máquina. Três distritos, doze unidades, nomes de ave.

**Por que não pediram a planilha real?**
Porque o projeto é acadêmico e não tem autorização para tratar dado de servidor. O órgão até mandou uma planilha com nomes trocados, e ela ficou fora do repositório por decisão registrada.

**⚠ Como garantem que nenhum dado real escapou?**
Não é promessa, é teste. Um teste varre a base inteira procurando CPF, e-mail, telefone e matrícula. Se achar, o código não passa.

**⚠ O modelo de inteligência artificial decide quem recebe?**
Não. Quem calcula é o motor de regras, que segue a portaria. O modelo fica numa tela separada e serve para dizer onde olhar. Nenhuma saída dele entra na nota.

**⚠ O que é linha de base, e por que um modelo perde para ela?**
Linha de base é o chute mais simples: sempre a resposta mais comum. Modelo que não ganha dela não aprendeu nada. O nosso modelo de "bate a meta" acerta 67% e o chute acerta 83%. Publicamos assim mesmo, porque esconder seria enganar.

**⚠ Se os dados são inventados, esses acertos significam algo?**
Menos do que parece, e a tela diz isso. Em base inventada o modelo aprende a regra do gerador, não a realidade. O que vale é o método: linha de base ao lado, limitação declarada. Com dado real, mede-se tudo de novo.

## Segurança e lei

**Quantas ameaças mapearam, e quantas resolveram?**
Catorze, pelo método STRIDE: dez resolvidas, duas parciais, uma aceita e declarada, uma que fica com a plataforma. Também passamos a lista OWASP: quatro cobertos, cinco parciais, um que não se aplica.

**O que a LGPD exige de um sistema que ajuda a decidir salário?**
A base legal é execução de política pública, artigo 7º, inciso III. E o artigo 20 dá ao servidor o direito de pedir revisão de decisão tomada por máquina. É por isso que a conta é aberta e contestável.

**Que dado pessoal existe na base hoje?**
Nenhum. Tudo é inventado e há teste que quebra se aparecer CPF, e-mail ou telefone.

**⚠ O que ainda não está protegido? Diga o pior.**
Quatro coisas, todas escritas: a senha do painel administrativo é a do briefing, e é pública; o limite de tentativas de login vive na memória; a política de segurança do navegador ainda permite script embutido; e o controle de acesso de verdade está no banco, que está desligado.

## Arquitetura

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
Cada um tem papel e frente declarados no site. Toda semana tem o bloco de responsáveis dizendo quem fez o quê. No pitch os seis falam, e há teste que quebra se alguém sumir.

**⚠ Quanto foi feito com inteligência artificial, e quem conferiu?**
Bastante, e está tudo escrito: o registro de uso de IA tem 46 linhas com data, o que foi gerado e os arquivos. A regra é "gerado não é entregue": nada entra sem revisão e sem teste. O ponto desconfortável: quem validou as 46 linhas foi sempre a mesma pessoa, o Gabriel.

**O que está em aberto hoje?**
Cinco coisas, todas declaradas: o ensaio com cronômetro; a foto da dinâmica de ideação; a regra oficial ainda não está no motor; o benchmarking não nomeia produtos; e falta subir o PDF no Drive da equipe.

**Como vão validar com o cliente?**
Semana 11, dia 21 de novembro. Entrevista de 45 minutos, com 15 de demonstração em que a pessoa faz quatro tarefas sozinha. Depois, um questionário. Os critérios de sucesso foram fixados antes de coletar.

**⚠ E se a Secretaria não abrir agenda?**
Resposta honesta: o risco está registrado, e o único mitigador é marcar com antecedência. Não há plano B escrito. O canal já funcionou duas vezes: a reunião de agosto e o envio da portaria em setembro.

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
Não temos promessa de adoção, e não vamos fingir. O que temos é conversa real: a reunião de agosto mudou o sistema, e em setembro eles mandaram a portaria e uma planilha real. Para virar uso de verdade falta banco ligado, login institucional e a conferência da nossa conta com a deles.

**O que fariam com mais um semestre?**
Primeiro, o que hoje é de faz de conta: ligar o banco, trocar o seletor de perfil por login. Depois, o que muda o produto: sentar com a Secretaria e conferir a conta contra a planilha real.

**Qual foi o erro que mais custou?**
Descrever a lente errada. A disciplina pedia Arquitetura na Nuvem e a gente se descrevia com Direito Digital. Uma auditoria achou isso na Semana 2 e a lente que faltava teve que ser escrita do zero.

---

## Se não souber

1. "Não sei de cabeça, mas está no site, na seção tal." E aponte.
2. Nunca prometa o que não existe. O site declara o que falta; use isso a seu favor.
3. Se for sobre número, prefira "está no documento" a chutar um valor.
