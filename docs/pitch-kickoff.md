# Pitch do Kick-off: roteiro corrigido, material de apoio e pendências

**O original é a rota `/pitch` do site.** Ela é liberada pelo motor de releases junto com o
ciclo `ko` (público desde 05/09, pelo adiantamento de sete dias), tem os dezessete slides, as
setas do teclado, as notas do apresentador com a tecla `n` e a conta de verdade dentro do
slide da demonstração. Este documento é a versão para ler e ensaiar longe do navegador; o PDF
em `/pitch/pdf`, baixável pelo próprio deck, é a reserva para o dia em que a rede falhar; as
capturas ficam em `docs/pitch/`.

A fonte única do que está aqui é `src/content/pitch.ts`, e a seção 2 é **gerada** por
`npm run roteiro`: não edite aquele trecho à mão. Um teste confere que este arquivo contém o
título e a fala de cada slide, então rodar o gerador faz parte de mudar o deck.

**NOVE MINUTOS, não cinco.** A diretriz escrita dá cinco minutos mais cinco para terminar; o
professor liberou dez. O briefing oficial do Kick-off cobra sete critérios, e três deles não
apareciam em slide nenhum na versão de 4:55: objetivos, as análises e a ideação. O deck
cresceu para cobrir os sete, com um minuto de margem.

## 1. O que o roteiro dizia e o que o repositório sustenta

O roteiro do briefing foi conferido linha a linha contra o código, os documentos e a portaria
que chegou em 05/09. Seis correções eram obrigatórias:

| # | O roteiro dizia | O que é verdade | Onde conferir |
| --- | --- | --- | --- |
| 1 | "A CAM não existe mais" | A Comissão de Avaliação de Metas **existe, e é instituída pelo art. 5º** da Portaria Conjunta nº 001/2024, com sete áreas (SECOGE, SEAB, SEAF, SEGTES, SERMAC, SEVS e SEPLAGTD). Ela consolida, valida e divulga (art. 6º). O que mudou foram os **perfis do sistema**: os quatro atores operacionais que o cliente nomeou em 22/08 | `docs/portaria-001-2024.md`; `src/lib/features.ts` |
| 2 | O ML usa Previne Brasil ou SISAB | **Nenhuma fonte pública** entra no `ml/`. A base é sintética, semente 20262, quatro modelos publicados com linha de base ao lado; o classificador de meta perde para o palpite majoritário (0,667 contra 0,833) e isso está na tela | `src/content/ml/resultados.json`; `ml/README.md` |
| 3 | "{{N_RISCOS}} riscos levantados" | Não há registro de riscos numerado. Há **14 ameaças STRIDE**, cada uma com estado; **10 itens OWASP** conferidos, 5 parciais; 6 princípios de privacy by design apontando para o arquivo onde estão | `docs/seguranca.md`; `docs/privacidade.md` |
| 4 | "Nada entra sem assinatura" | As 39 linhas de uso de IA estavam **todas pendentes** de assinatura. Foram assinadas por quem as validou; a 40ª é esta sessão | `docs/uso-de-ia.md` |
| 5 | Personas com nome próprio | As três personas são **papéis**, sem nome, e o repositório declara que nenhum dado real foi usado | `src/content/ciclos/s2.tsx` |
| 6 | `/registro` como página avaliada | É um **redirecionamento** para `/#registro`. A página avaliada é `/` | `src/app/registro/` |

E a portaria **confirma o coração do modelo**: subindicadores com fórmula numerador ÷
denominador × 100, "média simples das notas dos subindicadores", "da nota obtida multiplica-se
pelo peso", pesos que mudam por função e por tipo de unidade, metas mensais. Duas divergências
reais, ditas no slide 7 e resolvidas na Semana 5 como `regra-v3`: a média é das **notas** dos
subindicadores (o motor tira a média dos valores e gradua depois), e o art. 8º manda
**desconsiderar e redistribuir o peso** do que não pôde ser aferido (o seed usa
`zera_com_aviso`).

## 2. O roteiro, slide a slide

Nomes aparecem só como quem fala. Quem construiu o quê não é assunto do pitch: a equipe
construiu. As falas abaixo são as notas do apresentador da rota `/pitch`, na íntegra.

**A tela leva o mínimo e a fala leva o resto.** O deck começou com 1.127 palavras na tela para
4:55 de apresentação, quase todas repetindo estas notas: a plateia lia em vez de ouvir. O teto
por slide é de 70 palavras e é imposto em teste. Ele NÃO subiu quando o deck dobrou de
tamanho: são mais slides, não mais texto por slide. O que sumiu da tela está aqui embaixo.

**E nada de palavra difícil, na tela ou na fala.** Quem apresenta são os seis, e nem todos
estão dentro de cada parte do projeto: a pessoa precisa entender o slide enquanto lê. Por isso
saíram "consolidar", "régua", "homologar", "memória de cálculo" e "subindicador". Onde a sigla
vale ponto com a banca, ela entra entre parênteses depois da palavra simples, como em
"ameaças de segurança listadas uma a uma (STRIDE)". Há teste que recusa a volta delas.

<!-- roteiro:inicio -->

### Slide 1: prumo

- **Começa em** 0:00 · **dura** 0:20 · **quem fala:** Gabriel · **10 palavras na tela**
- **Frase da tela:** o cálculo da gratificação, aberto para qualquer um conferir
- **O que a tela mostra:** Wordmark, a pílula do marco e os seis nomes da equipe.
- **A fala:**
  1. Bom dia. Somos a Equipe 2 de Sistemas de Informação, e este é o Prumo.
  1. Estamos os seis aqui, e qualquer um de nós responde qualquer pergunta no fim.
  1. O cliente é a Secretaria de Saúde do Recife.

### Slide 2: o caminho de hoje

- **Começa em** 0:20 · **dura** 0:10 · **quem fala:** Fernando · **26 palavras na tela**
- **Frase da tela:** sete paradas, nove minutos.
- **O que a tela mostra:** As sete paradas do roteiro, numeradas.
- **A fala:**
  1. O caminho é este: o problema, o que a gente quer entregar, quem sofre com isso, o que a gente estudou, a ideia que venceu, o sistema rodando e o prazo.

### Slide 3: todo mês, uma conta feita à mão

- **Começa em** 0:30 · **dura** 0:40 · **quem fala:** Gabriel · **64 palavras na tela**
- **Frase da tela:** A prefeitura paga um extra no salário de quem bate as metas da saúde. A regra está num documento oficial. A conta está numa planilha.
- **O que a tela mostra:** O caminho do dinheiro em cinco passos, com o ponto que quebra em destaque.
- **A fala:**
  1. Desde 2023, quem dirige uma unidade de saúde no Recife pode receber um extra no salário quando bate as metas do mês.
  1. As metas estão numa portaria, que é o documento oficial da prefeitura. Ela diz o que medir, quanto vale cada coisa e qual é o alvo.
  1. O caminho é este da tela: as unidades mandam os números, a secretaria junta, uma comissão confere, e o pagamento entra na folha.
  1. O problema está no meio: a conferência é feita à mão, numa planilha. A regra está escrita; a conta, não.

### Slide 4: não é impressão nossa

- **Começa em** 1:10 · **dura** 0:30 · **quem fala:** Matheus · **39 palavras na tela**
- **Frase da tela:** cada coisa que a gente diz aqui tem de onde ter saído.
- **O que a tela mostra:** As três fontes da pesquisa, cada uma com a data.
- **A fala:**
  1. A primeira fonte é a portaria: o documento oficial que criou a gratificação, publicado no diário oficial do Recife. Ele está copiado inteiro dentro do nosso repositório.
  1. A segunda é o caso, escrito pela escola junto com o órgão, que descreve o processo de hoje e a tentativa anterior que foi abandonada.
  1. A terceira é a conversa: sentamos com a secretaria em 22 de agosto, e o que mudou ali está escrito na ata, no site.
  1. Nada do que vem a seguir é achismo nosso. Tudo aponta para uma dessas três.

### Slide 5: o que o sistema tem que fazer

- **Começa em** 1:40 · **dura** 0:35 · **quem fala:** Gabriel · **69 palavras na tela**
- **Frase da tela:** Tirar o cálculo da gratificação da planilha e entregar um sistema em que a conta de cada nota fica aberta: qualquer pessoa refaz o número e vê de onde ele veio.
- **O que a tela mostra:** O objetivo geral e os cinco específicos, cada um com o prazo.
- **A fala:**
  1. Em uma frase: tirar essa conta da planilha e deixar ela aberta.
  1. Aberta quer dizer que qualquer pessoa refaz o número no papel e vê de onde ele veio.
  1. Embaixo, o que isso exige, com prazo em cada um: a regra virar dado com versão, a conta aparecer em toda tela que mostra resultado, nada mudar sem ficar registrado, cada papel ver só o que é dele, e a nossa conta bater com a planilha do cliente.
  1. O último é o que vale mais: enquanto a conta do sistema não bater com a deles, o resto é promessa.

### Slide 6: três pessoas, o mesmo número

- **Começa em** 2:15 · **dura** 0:40 · **quem fala:** Matheus · **63 palavras na tela**
- **Frase da tela:** “Se mexer numa fórmula, tenho que conferir a planilha inteira de novo.”
- **O que a tela mostra:** A fala do mapa de empatia e os três cartões de quem é afetado.
- **A fala:**
  1. Essa frase é do mapa de empatia da analista, a pessoa que carrega o processo hoje. Ela resume o medo que move este projeto.
  1. As três pessoas da tela não foram inventadas por nós: saíram do caso e foram confirmadas na conversa com o cliente. São papéis, não gente de verdade.
  1. A primeira fecha a conta do mês, e é quem todo mundo procura quando alguém reclama do resultado.
  1. A segunda manda os números da unidade, sempre em cima do prazo, no meio de outras dez tarefas.
  1. A terceira recebe o valor no fim. Ela vê quanto ganhou e não vê como chegaram naquele número. É por ela que este projeto existe.

### Slide 7: o que sabemos, e o que ainda é chute

- **Começa em** 2:55 · **dura** 0:30 · **quem fala:** Matheus · **59 palavras na tela**
- **Frase da tela:** certeza tem fonte. aposta a gente declara. pergunta a gente leva para o cliente.
- **O que a tela mostra:** As três colunas da matriz, com a contagem e dois exemplos de cada.
- **A fala:**
  1. Separamos tudo o que sabemos em três colunas, e cada linha da primeira tem a fonte do lado: artigo da portaria, o caso ou a ata da reunião. Certeza sem origem é chute com voz firme.
  1. No meio, o que a gente assumiu para poder andar. Está escrito que é aposta, e está escrito dentro do código também.
  1. Na direita, o que ainda não sabemos, e a quem vamos perguntar. A maior delas: como redistribuir o peso quando falta um número.

### Slide 8: quem mais resolve isso, e o que joga a favor

- **Começa em** 3:25 · **dura** 0:35 · **quem fala:** Fernando · **58 palavras na tela**
- **Frase da tela:** cinco referências olhadas de perto, e o retrato honesto do projeto.
- **O que a tela mostra:** As referências com o veredito, e os quatro quadrantes da SWOT.
- **A fala:**
  1. Antes de decidir construir, olhamos o que já existe: painéis de transparência de prefeituras, sistemas de metas do SUS, ferramentas de acompanhamento de objetivos, e a própria planilha de hoje.
  1. Cada uma resolve um pedaço. Nenhuma junta as três coisas que este caso precisa ao mesmo tempo: regra com versão, conta aberta e registro de quem mudou.
  1. Do lado direito, o retrato do projeto (SWOT). A força é ter cliente real com regra escrita. A fraqueza é que ninguém da equipe conhece o processo por dentro.
  1. A ameaça maior está acontecendo: a portaria pode mudar, e de fato ela chegou agora e mexeu no nosso desenho. A gente conta isso daqui a pouco.

### Slide 9: como a gente gerou ideias

- **Começa em** 4:00 · **dura** 0:35 · **quem fala:** João Pedro · **30 palavras na tela**
- **Frase da tela:** três dinâmicas numa hora, com a regra de somar antes de criticar.
- **O que a tela mostra:** As três técnicas, com o tempo e o que cada uma produziu.
- **A fala:**
  1. A primeira é escrita e em silêncio: cada um anota três ideias e passa a folha, e quem recebe amplia a do colega. Sem discussão, ninguém é puxado pela opinião de quem falou primeiro.
  1. A segunda é a conversa aberta, juntando o que ficou parecido e dando nome a cada grupo.
  1. A terceira são oito desenhos de tela em oito minutos, cada um sozinho. É de lá que saem as primeiras telas em papel.
  1. De dezoito ideias no papel sobraram oito alternativas de verdade na mesa.

### Slide 10: por que essa ideia venceu

- **Começa em** 4:35 · **dura** 0:30 · **quem fala:** João Pedro · **51 palavras na tela**
- **Frase da tela:** sistema web com regra ajustável e a conta aberta
- **O que a tela mostra:** A alternativa escolhida, as quatro razões e o que ficou de comparação.
- **A fala:**
  1. Demos nota de 1 a 5 para cada alternativa em três coisas: o tamanho do impacto, o esforço para fazer e o quanto ela encosta no problema de verdade.
  1. A escolhida ganhou porque ataca a causa e não o sintoma: hoje a regra da portaria só existe dentro de fórmulas de planilha.
  1. O esforço é alto, mas dá para fatiar: lançar, calcular e mostrar a conta cabem até o SR1.
  1. E a planilha melhorada continua na tabela de propósito: ela é contra o que a gente vai medir o ganho, na validação com o cliente.

### Slide 11: do papel para a tela

- **Começa em** 5:05 · **dura** 0:35 · **quem fala:** João Pedro · **33 palavras na tela**
- **Frase da tela:** os quatro desenhos que vieram antes, e o que eles viraram.
- **O que a tela mostra:** Os quatro wireframes, um por tela, com a legenda de cada.
- **A fala:**
  1. Estes são os desenhos de baixa fidelidade das quatro telas centrais. Barra cinza no lugar de texto, de propósito: a conversa aqui é sobre onde cada coisa fica, não sobre a frase.
  1. A primeira é onde a unidade digita os números do mês.
  1. A segunda é a nota com a conta inteira embaixo, e é a tela que vocês vão ver rodando no slide seguinte.
  1. A terceira é o painel do distrito: quem já mandou, quem falta.
  1. A quarta é o resultado do gestor, com os meses anteriores do lado.

### Slide 12: a nota com a conta aberta

- **Começa em** 5:40 · **dura** 0:45 · **quem fala:** João Henrique · **15 palavras na tela**
- **Frase da tela:** Isto é o sistema rodando agora, não uma imagem.
- **O que a tela mostra:** A nota e a conta inteira, do sistema de verdade, para uma unidade de teste.
- **A fala:**
  1. O que está na tela é o sistema mesmo, rodando agora, com dados de teste. Nenhuma pessoa real aparece aqui.
  1. Em cima, a nota do mês: 86,67. Do lado, quanto isso vale em dinheiro.
  1. Embaixo, a conta inteira. Cada linha é uma coisa que a unidade informou, com o alvo dela, quanto ela vale e quanto entrou na nota.
  1. A última linha fecha a conta na frente de todo mundo. Qualquer pessoa consegue refazer essa continha no papel. É isso que a planilha não dá.
  1. Se faltar internet no dia, o PDF que a gente baixou antes tem esta mesma tela.

### Slide 13: cada mês guarda a regra que usou

- **Começa em** 6:25 · **dura** 0:35 · **quem fala:** João Henrique · **67 palavras na tela**
- **Frase da tela:** Se a regra mudar, o mês antigo continua igual.
- **O que a tela mostra:** O caminho de um número em quatro passos, e quem faz o quê.
- **A fala:**
  1. A regra não está escondida dentro do código: ela é um dado, com versão, igual a um documento.
  1. Quando a prefeitura mudar a portaria, a gente cria uma versão nova. Os meses que já fecharam continuam mostrando o mesmo resultado de antes, porque cada mês aponta para a versão que usou.
  1. O caminho de um número é o da tela: a unidade digita, o sistema calcula, a regra do mês diz qual é o alvo e quanto vale, e sai a nota de 0 a 100.
  1. São quatro pessoas no processo, e cada uma só faz a parte dela. Quem manda o número não escolhe o alvo.
  1. Toda mudança fica gravada com autor, data e o valor de antes. Nada é apagado.

### Slide 14: nenhum dado real. ainda.

- **Começa em** 7:00 · **dura** 0:30 · **quem fala:** Rafael · **56 palavras na tela**
- **Frase da tela:** Hoje o sistema roda com dados inventados por um programa. Qualquer pessoa roda de novo e vê os mesmos números.
- **O que a tela mostra:** O tamanho da base de teste, e o que os modelos acertam e erram.
- **A fala:**
  1. Tudo que vocês viram na tela anterior veio de um gerador que a gente escreveu. Ele usa sempre a mesma semente, então quem rodar de novo vê exatamente os mesmos números.
  1. Isso é de propósito: o repositório é público, e dado de servidor da prefeitura não entra nele.
  1. Na parte de inteligência artificial, treinamos quatro modelos fora do sistema. Publicamos cada um ao lado do resultado do chute mais simples possível.
  1. Um deles perde para o chute. A gente deixou publicado do mesmo jeito, porque esconder isso seria enganar.
  1. E nada do que o modelo diz entra na conta do dinheiro. A conta é a da portaria, sempre.

### Slide 15: o que pode dar errado, dito antes

- **Começa em** 7:30 · **dura** 0:30 · **quem fala:** Rafael · **63 palavras na tela**
- **Frase da tela:** O login é de faz de conta, o banco de dados está desligado e a conta ainda usa a regra que deduzimos.
- **O que a tela mostra:** Quatro contagens do que já foi mapeado, cada uma com o estado dela.
- **A fala:**
  1. A gente prefere dizer o que falta antes que alguém pergunte.
  1. Em segurança, listamos as ameaças uma a uma e dissemos o que já está resolvido e o que não está.
  1. Em privacidade, um sistema que decide salário entra na LGPD. Cada cuidado que tomamos aponta para o arquivo onde ele está no código.
  1. Em uso de inteligência artificial, cada linha tem o que foi gerado, onde entrou e o nome de quem conferiu.
  1. E a mais cara de admitir: a portaria oficial chegou esta semana, e ela manda fazer duas contas de um jeito um pouco diferente do nosso. Vamos arrumar na semana que vem. Preferimos falar isso aqui a ser pegos depois.

### Slide 16: as dezoito semanas, e onde estamos

- **Começa em** 8:00 · **dura** 0:35 · **quem fala:** Fernando · **42 palavras na tela**
- **Frase da tela:** cada entrega tem dono, data e estado, e o quadro inteiro está no site.
- **O que a tela mostra:** A linha do semestre com os marcos, e as entregas do próximo mês com dono.
- **A fala:**
  1. O semestre inteiro está planejado em dezoito semanas, e cada semana tem as entregas que ela precisa produzir.
  1. As quatro primeiras estão fechadas e publicadas no site, com o que foi feito, quem fez e o que travou.
  1. Hoje é o Kick-off. Daqui até o SR1 são três semanas, e cada uma tem um compromisso com data e com nome.
  1. Semana que vem, a regra oficial da portaria entra no sistema. Na outra, as primeiras telas no ar. Até o SR1, sentar com a secretaria e conferir a conta contra a planilha real.
  1. Nada disso está num arquivo separado: o quadro com dono e estado é uma seção do próprio site.

### Slide 17: prumo

- **Começa em** 8:35 · **dura** 0:25 · **quem fala:** Gabriel · **13 palavras na tela**
- **Frase da tela:** o registro, os documentos, o sistema e este pitch estão no ar.
- **O que a tela mostra:** Wordmark, o endereço do site e a pergunta para a banca.
- **A fala:**
  1. Tudo que mostramos está nesse endereço: o diário do projeto semana a semana, os documentos de cada entrega, o sistema e este pitch.
  1. O site tem um índice no topo com as oito seções, na ordem em que vocês pediram.
  1. Obrigado. Ficamos para as perguntas, e qualquer um de nós responde.

<!-- roteiro:fim -->

## 3. O roteiro-base, com os espaços preenchidos

O briefing do pitch trazia um roteiro com espaços a preencher. Cada um está resolvido abaixo
com o valor que o repositório sustenta, e a fonte.

| Espaço | Valor | Fonte |
| --- | --- | --- |
| `{{NOME}}` | Prumo | `src/content/produto.ts` |
| `{{QUEM_CONSOLIDA}}` | A Comissão de Avaliação de Metas (CAM), com apoio da SECOGE; no sistema, o perfil operacional é a coordenação da SEAB | Portaria nº 001/2024, arts. 5º a 7º; `src/lib/features.ts` |
| `{{PERSONA_1}}` | Quem consolida: analista da comissão, que opera a planilha mestre e é procurada quando alguém contesta | `src/content/ciclos/s2.tsx` |
| `{{PERSONA_2}}` | Quem informa: gerente de unidade, que responde pelos subindicadores em cima do prazo | `src/content/ciclos/s2.tsx` |
| `{{PERSONA_3}}` | Quem é avaliada: coordenadora que recebe a gratificação e vê só o resultado final | `src/content/ciclos/s2.tsx` |
| `{{PAPEIS}}` | Coordenação da SEAB, administrador, gerente distrital e gerente de unidade | `src/lib/features.ts` (`PERFIS`) |
| `{{FONTE_DADOS}}` | Base sintética com semente fixa (3 distritos, 4 tipos, 12 unidades, 7 indicadores, 11 subindicadores, 6 competências); a portaria pública como próxima régua; a planilha anonimizada fora do repositório | `src/lib/seed/`; `docs/portaria-001-2024.md`; ADR-035 |
| `{{N_RISCOS}}` | Não existe número único: 14 ameaças STRIDE, 10 itens OWASP (5 parciais), 6 princípios de privacidade | `docs/seguranca.md`; `docs/privacidade.md` |
| `{{BLOQUEIOS}}` | Ensaio cronometrado ainda não realizado; motor ainda na régua deduzida (regra v3 na Semana 5) | `src/content/ciclos/ko.tsx` |
| `{{URL_SITE}}` | https://projeto6-si.vercel.app (configurável por `NEXT_PUBLIC_SITE_URL`) | `src/content/produto.ts` |

O roteiro-base, preenchido, é a seção 2 acima.

## 4. Material de apoio

### Ensaio

- Abra `/pitch`, aperte `n` para ver as notas e `f` para tela cheia. O cronômetro começa no
  primeiro avanço e zera com `r`. Cada nota diz quanto dura o slide e em que segundo ele
  começa. As setas passam o slide venha o foco de onde vier, inclusive depois de você clicar
  num botão da tela; `p` imprime.
- Ensaiar três vezes: uma lendo as notas, uma sem ler, uma com a demonstração do slide 4
  feita por quem vai operar. A meta é terminar entre 4:40 e 4:55.
- Se um bloco estourar, o corte vem da fala, nunca do slide: o slide já tem só título, uma
  frase e um visual.
- Slide 4 é o único que exige ação na tela: abrir a memória (já vem aberta) e, se quiser,
  rolar até a soma das contribuições. Ensaiar esse gesto.

### Operação

- **Uma pessoa opera, e quem fala não opera.** O operador fica na tela o tempo todo e avança
  com a seta quando ouvir a última frase de cada bloco (está nas notas).
- Abrir `/pitch` no navegador antes de começar, em tela cheia, no tema escuro (é o padrão).
  Conferir que o slide 4 carrega a memória de cálculo inteira, sem barra de rolagem. Baixe o
  PDF antes pelo botão do próprio deck: se a rede cair no dia, ele é a apresentação.
- A demonstração do slide 4 é renderizada no servidor junto com a página: se o slide abriu,
  a memória está lá, e não há serviço externo que possa cair no meio. A reserva contra sala
  sem rede é o PDF baixado antes.
- O endereço do slide 9 é o mesmo que a banca vai digitar depois. Deixar o slide 9 na tela
  durante as perguntas.

### O que não fazer

- Não dizer "a CAM não existe mais". Ela existe e homologa; o que o sistema modela são os
  atores operacionais.
- Não citar dado real de servidor, nem a planilha anonimizada, nem nome de pessoa da SESAU.
  Nada disso está no repositório, de propósito.
- Não prometer que o ML decide algo. Ele sinaliza; a portaria decide.
- Não esconder as duas divergências com a portaria. Elas estão no slide 7 e viram trabalho
  na Semana 5; a banca prefere ouvir isso de nós.
- Não dizer quem construiu o quê. "Nós" e "a equipe".
- Não abrir o painel administrativo nem o seletor de perfil no palco: o pitch é sobre o
  problema e a ideia, não sobre a operação do site.

### Perguntas prováveis, e a resposta que o repositório sustenta

1. **"Vocês já falaram com o cliente?"** Sim. Reunião em 22/08 com a SECOGE, ata sintetizada na
   Semana 3 do registro; em 05/09 o órgão enviou a portaria e uma planilha anonimizada. A
   validação formal da régua com a SEAB está no caminho até o SR1.
2. **"E se a portaria mudar?"** Regra é dado versionado, não código. Cria-se uma versão nova; os
   meses já homologados continuam reproduzindo o resultado antigo, porque cada ciclo aponta para
   a versão que usou. A chegada da portaria oficial é o primeiro caso real: vira a regra v3.
3. **"Qual o diferencial em relação à planilha?"** A memória de cálculo: cada número responde de
   onde veio, com o subindicador, a meta e o peso que o geraram. E a trilha: toda escrita tem
   autor, data, antes e depois. Nenhuma ferramenta do benchmarking da Semana 2 versiona regra
   normativa nem produz memória de cálculo.
4. **"Onde entra o machine learning, e por que ele não decide?"** Fora do cálculo. Os modelos
   treinam offline e publicam sinais na tela de analytics, cada um com a linha de base ao lado;
   o classificador de meta perde para o palpite majoritário, e isso está escrito. A portaria é
   determinística; o modelo diz onde olhar, não quanto alguém recebe.
5. **"Por que o banco está desligado?"** Porque o MVP não precisa dele para provar a tese, e
   ligar um banco a um repositório público com dado de servidor seria o risco errado na hora
   errada. O schema PostgreSQL com RLS e gatilhos está escrito e testado contra um banco real; a
   camada de dados isola as telas para ele entrar sem reescrever tela.
6. **"Como garantem que não há dado real?"** A base é gerada por script com semente fixa, e há
   teste que falha se um CPF, e-mail ou telefone aparecer nela. A planilha anonimizada do
   cliente não entrou no repositório, e nenhum dado real entra em prompt de IA.

## 5. Pendências

- [[PENDENTE: ensaio cronometrado com os seis, em `/pitch`, antes de 12/09]]
- [[PENDENTE: definir quem opera o deck no dia; a pessoa não fala enquanto opera]]
- [[PENDENTE: confirmar se a sala do Kick-off tem projetor com navegador e rede; sem rede, apresentar do PDF]]
- [[PENDENTE: as faixas de pagamento (insatisfatório, regular e acima) vêm do Decreto nº 36.482/2023, que a equipe ainda não tem; as faixas do seed continuam sintéticas até lá]]
- [[PENDENTE: validação formal da régua com a SEAB, sobre a planilha anonimizada, fora do repositório, até o SR1]]
