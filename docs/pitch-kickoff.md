# Pitch do Kick-off: roteiro corrigido, material de apoio e pendências

**O original é a rota `/pitch` do site.** Ela é liberada pelo motor de releases junto com o
ciclo `ko` (público desde 05/09, pelo adiantamento de sete dias), tem os nove slides, as setas
do teclado, as notas do apresentador com a tecla `n` e a memória de cálculo real dentro do
slide da demonstração. Este documento é a versão para ler e ensaiar longe do navegador;
`public/pitch-kickoff.pdf`, baixável pelo próprio deck, é a reserva para o dia em que a rede
falhar; as capturas ficam em `docs/pitch/`.

A fonte única do que está aqui é `src/content/pitch.ts`. Um teste confere que este arquivo
contém o título e a fala de cada slide: mudou lá, muda aqui, ou o teste avisa.

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
4:55 de apresentação, quase todas repetindo estas notas: a plateia lia em vez de ouvir. Hoje
são menos de 400, com teto por slide imposto em teste. O que sumiu da tela está aqui embaixo.

**E nada de palavra difícil, na tela ou na fala.** Quem apresenta são os seis, e nem todos
estão dentro de cada parte do projeto: a pessoa precisa entender o slide enquanto lê. Por isso
saíram "consolidar", "régua", "homologar", "memória de cálculo" e "subindicador". Onde a sigla
vale ponto com a banca, ela entra entre parênteses depois da palavra simples, como em
"ameaças de segurança listadas uma a uma (STRIDE)". Há teste que recusa a volta delas.

### Slide 1: prumo

- **Começa em** 0:00 · **dura** 0:05 · **quem fala:** Gabriel · **10 palavras na tela**
- **Frase da tela:** o cálculo da gratificação, aberto para qualquer um conferir
- **O que a tela mostra:** Wordmark, uma linha, e a pílula do marco: kick-off, data e equipe.
- **A fala:**
  1. Bom dia. Somos a Equipe 2, e este é o Prumo.
  1. Em cinco minutos: qual é o problema, quem sofre com ele, o que já construímos e para onde vamos.

### Slide 2: todo mês, uma conta feita à mão

- **Começa em** 0:05 · **dura** 0:35 · **quem fala:** Gabriel · **64 palavras na tela**
- **Frase da tela:** A prefeitura paga um extra no salário de quem bate as metas da saúde. A regra está num documento oficial. A conta está numa planilha.
- **O que a tela mostra:** O caminho do dinheiro em cinco passos, com o ponto que quebra em destaque.
- **A fala:**
  1. Desde 2023, quem dirige uma unidade de saúde no Recife pode receber um extra no salário quando bate as metas do mês.
  1. As metas estão numa portaria, que é o documento oficial da prefeitura. Ela diz o que medir, quanto vale cada coisa e qual é o alvo.
  1. O caminho é este da tela: as unidades mandam os números, a secretaria junta, uma comissão confere, e o pagamento entra na folha.
  1. O problema está no meio: a conferência é feita à mão, numa planilha. A regra está escrita; a conta, não.

### Slide 3: três pessoas, o mesmo número

- **Começa em** 0:40 · **dura** 0:40 · **quem fala:** Matheus · **60 palavras na tela**
- **Frase da tela:** Ninguém consegue dizer de onde veio esse número sem abrir a planilha de outra pessoa.
- **O que a tela mostra:** Três cartões, um por pessoa afetada, com o medo de cada uma.
- **A fala:**
  1. Essas três pessoas não são inventadas por nós: saíram do caso e foram confirmadas na conversa com o cliente, em agosto. São papéis, não gente de verdade.
  1. A primeira fecha a conta do mês. Ela mexe na planilha há três ciclos e é quem todo mundo procura quando alguém reclama do resultado.
  1. A segunda manda os números da unidade dela, sempre em cima do prazo, no meio de outras dez tarefas.
  1. A terceira recebe o valor no fim. Ela vê quanto ganhou e não vê como chegaram naquele número. É por ela que este projeto existe.

### Slide 4: a nota com a conta aberta

- **Começa em** 1:20 · **dura** 0:45 · **quem fala:** João · **15 palavras na tela**
- **Frase da tela:** Isto é o sistema rodando agora, não uma imagem.
- **O que a tela mostra:** A nota e a conta inteira, do sistema de verdade, para uma unidade de teste.
- **A fala:**
  1. O que está na tela é o sistema mesmo, rodando agora, com dados de teste. Nenhuma pessoa real aparece aqui.
  1. Em cima, a nota do mês: 86,67. Do lado, quanto isso vale em dinheiro.
  1. Embaixo, a conta inteira. Cada linha é uma coisa que a unidade informou, com o alvo dela, quanto ela vale e quanto entrou na nota.
  1. A última linha fecha a conta na frente de todo mundo. Qualquer pessoa consegue refazer essa continha no papel. É isso que a planilha não dá.
  1. Se faltar internet no dia, o PDF que a gente baixou antes tem esta mesma tela.

### Slide 5: cada mês guarda a regra que usou

- **Começa em** 2:05 · **dura** 0:45 · **quem fala:** João · **67 palavras na tela**
- **Frase da tela:** Se a regra mudar, o mês antigo continua igual.
- **O que a tela mostra:** O caminho de um número em quatro passos, e quem faz o quê.
- **A fala:**
  1. A regra não está escondida dentro do código: ela é um dado, com versão, igual a um documento.
  1. Quando a prefeitura mudar a portaria, a gente cria uma versão nova. Os meses que já fecharam continuam mostrando o mesmo resultado de antes, porque cada mês aponta para a versão que usou.
  1. O caminho de um número é o da tela: a unidade digita, o sistema calcula, a regra do mês diz qual é o alvo e quanto vale, e sai a nota de 0 a 100.
  1. São quatro pessoas no processo, e cada uma só faz a parte dela. Quem manda o número não escolhe o alvo.
  1. Toda mudança fica gravada com autor, data e o valor de antes. Nada é apagado.

### Slide 6: nenhum dado real. ainda.

- **Começa em** 2:50 · **dura** 0:40 · **quem fala:** Rafael · **56 palavras na tela**
- **Frase da tela:** Hoje o sistema roda com dados inventados por um programa. Qualquer pessoa roda de novo e vê os mesmos números.
- **O que a tela mostra:** O tamanho da base de teste, e o que os modelos acertam e erram.
- **A fala:**
  1. Tudo que vocês viram na tela anterior veio de um gerador que a gente escreveu. Ele usa sempre a mesma semente, então quem rodar de novo vê exatamente os mesmos números.
  1. Isso é de propósito: o repositório é público, e dado de servidor da prefeitura não entra nele.
  1. Na parte de inteligência artificial, treinamos quatro modelos fora do sistema. Publicamos cada um ao lado do resultado do chute mais simples possível.
  1. Um deles perde para o chute. A gente deixou publicado do mesmo jeito, porque esconder isso seria enganar.
  1. E nada do que o modelo diz entra na conta do dinheiro. A conta é a da portaria, sempre.

### Slide 7: o que pode dar errado, dito antes

- **Começa em** 3:30 · **dura** 0:40 · **quem fala:** Fernando · **63 palavras na tela**
- **Frase da tela:** O login é de faz de conta, o banco de dados está desligado e a conta ainda usa a regra que deduzimos.
- **O que a tela mostra:** Quatro contagens do que já foi mapeado, cada uma com o estado dela.
- **A fala:**
  1. A gente prefere dizer o que falta antes que alguém pergunte.
  1. Em segurança, listamos as ameaças uma a uma e dissemos o que já está resolvido e o que não está.
  1. Em privacidade, um sistema que decide salário entra na LGPD. Cada cuidado que tomamos aponta para o arquivo onde ele está no código.
  1. Em uso de inteligência artificial, cada linha tem o que foi gerado, onde entrou e o nome de quem conferiu.
  1. E a mais cara de admitir: a portaria oficial chegou esta semana, e ela manda fazer duas contas de um jeito um pouco diferente do nosso. Vamos arrumar na semana que vem. Preferimos falar isso aqui a ser pegos depois.

### Slide 8: de hoje ao sr1: três semanas

- **Começa em** 4:10 · **dura** 0:30 · **quem fala:** Fernando · **31 palavras na tela**
- **Frase da tela:** Um compromisso por semana, e todos com data.
- **O que a tela mostra:** Os três marcos até o SR1, com data e compromisso.
- **A fala:**
  1. Semana que vem: colocar a regra oficial da portaria dentro do sistema, como uma versão nova.
  1. Na outra: as primeiras telas no ar para qualquer pessoa que abrir o site.
  1. Até o SR1: sentar com a secretaria e conferir a regra contra a planilha real que eles nos mandaram.
  1. O que a banca disser hoje entra no diário de bordo e orienta essas três semanas.

### Slide 9: prumo

- **Começa em** 4:40 · **dura** 0:15 · **quem fala:** Gabriel · **11 palavras na tela**
- **Frase da tela:** o registro, o sistema e este pitch estão no ar.
- **O que a tela mostra:** Wordmark, o endereço do site e a pergunta para a banca.
- **A fala:**
  1. Tudo que mostramos está nesse endereço: o diário do projeto, o sistema e este pitch.
  1. Obrigado. Ficamos para as perguntas.

Soma: 4:55, e 377 palavras na tela no deck inteiro. Por pessoa:

| Quem fala | Slides | Tempo |
| --- | --- | --- |
| Gabriel | 1, 2, 9 | 0:55 |
| Matheus | 3 | 0:40 |
| João | 4 | 0:45 |
| João | 5 | 0:45 |
| Rafael | 6 | 0:40 |
| Fernando | 7, 8 | 1:10 |

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
