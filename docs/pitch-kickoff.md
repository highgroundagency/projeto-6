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

### Slide 1: prumo

- **Começa em** 0:00 · **dura** 0:05 · **quem fala:** Gabriel · **9 palavras na tela**
- **Frase da tela:** o cálculo da gratificação que se explica sozinho
- **O que a tela mostra:** Wordmark, uma linha, e a pílula do marco: kick-off, data e equipe.
- **A fala:**
  1. Bom dia. Somos a Equipe 2 e este é o Prumo.
  1. Cinco minutos: o problema, quem sofre com ele, a ideia que priorizamos e para onde vamos até o SR1.

### Slide 2: todo mês, uma conta feita à mão

- **Começa em** 0:05 · **dura** 0:35 · **quem fala:** Gabriel · **55 palavras na tela**
- **Frase da tela:** Desde 2023 a Secretaria de Saúde do Recife paga gratificação por metas. A régua está na portaria. A conta está numa planilha.
- **O que a tela mostra:** O fluxo da portaria em cinco etapas, com o ponto de quebra marcado na consolidação.
- **A fala:**
  1. A Portaria Conjunta 001/2024 fixa cinco indicadores, com subindicadores, metas mensais e pesos que mudam por tipo de unidade e por função.
  1. O fluxo é da própria norma: cada secretaria executiva coleta, manda à SECOGE até o dia 20, a Comissão de Avaliação de Metas consolida e valida, e a SEGTES leva para a folha.
  1. O ponto de quebra é a consolidação: dezenas de números viram uma nota por gestor, à mão, em planilha. A régua está escrita; a conta não está.

### Slide 3: três pessoas, o mesmo número

- **Começa em** 0:40 · **dura** 0:40 · **quem fala:** Matheus · **55 palavras na tela**
- **Frase da tela:** Ninguém responde "de onde veio esse número?" sem abrir a planilha de outra pessoa.
- **O que a tela mostra:** Três cartões, um por papel: quem consolida, quem informa, quem é avaliada. Uma frase de cada.
- **A fala:**
  1. As três personas são papéis, não pessoas: construídas a partir do case e confirmadas na reunião com o cliente em 22/08. Nenhum dado real.
  1. Quem consolida fecha o ciclo com medo de ter errado uma fórmula, e é procurada sempre que alguém contesta um resultado.
  1. Quem informa preenche em cima do prazo, entre outras dez prioridades, e é cobrado por dado que já enviou.
  1. Quem é avaliada recebe o valor sem o caminho que levou até ele. É quem mais precisa da conta aberta.

### Slide 4: a nota com a conta aberta

- **Começa em** 1:20 · **dura** 0:45 · **quem fala:** João · **10 palavras na tela**
- **Frase da tela:** A ideia priorizada: cada número responde "de onde veio?" em um clique. Isto é o sistema rodando agora, não uma imagem.
- **O que a tela mostra:** O cartão da nota e a memória de cálculo reais, do motor do Prumo, para uma unidade sintética. A conta inteira cabe na tela, sem rolagem.
- **A fala:**
  1. O que está na tela é o componente real do sistema, com o motor real e dados sintéticos: a USF Canário, competência de maio, régua versão 2.
  1. Cada linha é um indicador. Dentro dela, os subindicadores que a unidade preencheu: valor direto, ou numerador dividido por denominador.
  1. O valor composto é comparado com a meta do tipo da unidade e vira pontos; os pontos multiplicam o peso. A soma dividida pelo máximo dá a nota de 0 a 100 e a faixa de pagamento.
  1. A memória é renderizada junto com o slide, não depende de rede nem de serviço: se a página abriu, ela está aqui. O PDF baixado antes cobre a sala sem rede.

### Slide 5: regra é dado, não fórmula

- **Começa em** 2:05 · **dura** 0:45 · **quem fala:** João · **68 palavras na tela**
- **Frase da tela:** A portaria vira uma versão da regra. O ciclo guarda qual versão usou. O resultado antigo continua reproduzível.
- **O que a tela mostra:** O caminho de um número em quatro passos, os quatro papéis e as etapas do mês.
- **A fala:**
  1. O motor é função pura: sem banco, sem relógio, sem aleatoriedade. Mesma entrada, mesma nota, hoje e daqui a um ano.
  1. Mudou a portaria? Cria-se uma versão nova da regra. Os meses já homologados continuam reproduzindo o resultado antigo, porque cada ciclo aponta para a versão que usou.
  1. Quatro papéis, os que o cliente nomeou: o gerente de unidade lança, o gerente distrital revisa, a coordenação da SEAB fecha o mês, o administrador cuida dos cadastros e da trilha.
  1. Toda escrita gera evento com autor, data, antes e depois. A trilha só cresce.

### Slide 6: nenhum dado real. ainda.

- **Começa em** 2:50 · **dura** 0:40 · **quem fala:** Rafael · **55 palavras na tela**
- **Frase da tela:** Hoje: base sintética com semente fixa, reproduzível por qualquer pessoa. A régua oficial já chegou, e é a próxima.
- **O que a tela mostra:** Os números da base sintética, e a linha de base publicada ao lado de cada modelo.
- **A fala:**
  1. Tudo que o sistema mostra vem de um gerador com semente fixa: os distritos, os tipos de unidade, as unidades, os indicadores e as competências que estão na tela.
  1. A lente de aprendizado de máquina treina fora do app e publica quatro modelos, cada um com a linha de base ao lado. O classificador de meta perde para o palpite majoritário, e isso está na tela, não escondido.
  1. Nada que sai dos modelos entra no cálculo. O modelo diz onde olhar; a portaria diz quanto alguém recebe.
  1. A portaria pública entra no repositório. A planilha anonimizada que o cliente enviou fica fora dele, porque o repositório é público, e serve para validar a régua.

### Slide 7: o que pode dar errado, dito antes

- **Começa em** 3:30 · **dura** 0:40 · **quem fala:** Fernando · **48 palavras na tela**
- **Frase da tela:** O que não fizemos está escrito: login simulado, banco desligado, modelos no recorte antigo, motor ainda na régua deduzida.
- **O que a tela mostra:** Quatro contagens: ameaças STRIDE, itens OWASP, princípios de privacidade e usos de IA assinados.
- **A fala:**
  1. Segurança: as ameaças mapeadas em STRIDE têm cada uma um estado; os dez itens do OWASP foram conferidos, e os parciais estão declarados.
  1. Privacidade: um sistema que decide remuneração cai no artigo 20 da LGPD. Os princípios de privacy by design apontam para o arquivo onde estão no código.
  1. Uso de IA: cada uso está registrado com o que foi gerado, onde entrou e quem validou. Gerado não é entregue.
  1. A honestidade que custa mais: a portaria manda tirar a média das notas dos subindicadores e redistribuir o peso do que não pôde ser aferido. Nosso motor ainda não faz as duas coisas. É trabalho da Semana 5, não segredo.

### Slide 8: de hoje ao sr1: três semanas

- **Começa em** 4:10 · **dura** 0:30 · **quem fala:** Fernando · **47 palavras na tela**
- **Frase da tela:** Semana 5: a régua oficial vira a versão 3 da regra. Semana 6: as quatro primeiras telas no ar. SR1: a régua conferida com a SEAB.
- **O que a tela mostra:** Uma linha do tempo com os três marcos e um compromisso em cada.
- **A fala:**
  1. Semana 5, arquitetura: carregar a portaria no motor como regra versão 3, com gradação por subindicador, a redistribuição do artigo 8º e o prazo de recurso do artigo 9º.
  1. Semana 6: as quatro primeiras telas do sistema liberadas no site para qualquer visitante, e o pitch ensaiado dentro do tempo.
  1. SR1: conferir a régua contra a planilha anonimizada com a SEAB, fora do repositório, e registrar o retorno da banca no diário de bordo.

### Slide 9: prumo

- **Começa em** 4:40 · **dura** 0:15 · **quem fala:** Gabriel · **11 palavras na tela**
- **Frase da tela:** o registro, o sistema e este pitch estão no ar.
- **O que a tela mostra:** Wordmark, o endereço do site e a pergunta para a banca.
- **A fala:**
  1. Tudo que mostramos está no endereço da tela: o registro semanal, o sistema e este pitch, com o roteiro e a portaria.
  1. Obrigado. Ficamos para as perguntas.

Soma: 4:55, e 358 palavras na tela no deck inteiro. Por pessoa:

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
