# SR1: roteiro e material de apoio

**O original é a rota `/sr1` do site.** São 22 slides na ordem da rubrica oficial (ADR-047), na
identidade do projeto. As setas do teclado passam os slides, a tecla `n` abre as notas do
apresentador com as respostas preparadas embaixo, e o cronômetro e a impressão ficam nas teclas
`r` e `p`. O rodapé de cada slide diz a parte da rubrica e a posição atual/total. O PDF em
`/sr1/pdf`, baixável pelo próprio deck, é o arquivo que vai para o Drive e a reserva para o dia
em que a rede falhar. As capturas ficam em `docs/sr1/`.

A fonte única do texto é `src/content/apresentacao-sr1.ts`. A seção 5 é **gerada** por
`npm run roteiro`: não edite aquele trecho à mão. Um teste confere que este arquivo contém o
título, a fala e as respostas de cada slide.

Este roteiro morava no site, como documento da Semana 6. Saiu de lá pela ADR-040, decisão 4:
material de preparação não é entrega. O site mostra o que a equipe entregou, e o que a equipe
usa para se preparar fica no repositório.

## 1. O que as orientações oficiais pedem (28/09)

- **Tempo:** até 15 minutos. A apresentação é interrompida no limite. O deck fecha em **11:59
  de fala**, com 3:01 de margem para as trocas de quem fala, a demonstração e o nervoso do dia.
- **Formato:** slides em PPT ou PDF, salvos no Drive da equipe, numerados como atual/total,
  com fonte legível, cores contrastantes, figuras e tabelas nítidas e texto revisado.
- **Na sala:** os sete presentes e de câmera aberta, inclusive nas apresentações dos outros
  grupos. Só quem fala deixa o microfone aberto. Professores e tutores podem perguntar a
  qualquer um. Todo entregável mostrado fora dos slides precisa estar aberto e carregado antes.
- **Horário:** a lista enviada vai do Grupo 01 (9:15) ao Grupo 06 (10:55 às 11:10), com a sala
  aberta às 9:00. No Kick-off a equipe era o G06 (`docs/kickoff-para-a-equipe.md`), e o PDF das
  orientações diz que a ordem é **decrescente**. **Confirmar o grupo e o horário** antes de sábado.

**Onde cada critério está no deck:**

| Critério (pontos) | Slides | O que mostra |
| --- | --- | --- |
| 1. Imersão no problema (1,75) | 3 a 8 | problema (onde, causas, consequências), pesquisa com data e aprendizados, matriz CSD, personas e mapa de empatia, benchmarking e SWOT, objetivos com estado e escopo |
| 2. Ideação (1,75) | 9 a 11 | técnicas, matriz das 8 alternativas com os critérios, o que cada disciplina pôs no produto |
| 3. Proposta de solução (2) | 12 a 15 | funcionamento, wireframes, demonstração ao vivo, diferenciais |
| 4. Metodologia e processo (1,5) | 16 a 18 | ciclo de vida e backlog MoSCoW, papéis e responsabilidades, ferramentas, site e Drive |
| 5. Planejado x realizado (1) | 19 e 20 | tabela das fases com responsáveis, percentuais de avanço, compromissos do Kick-off |
| 6. Pontos fortes e melhorias (0,5) | 21 | fortes, pontos de melhoria e riscos, cada um com o tratamento |
| 7. Apresentação (1,5) | todos | numeração, rodapé com a parte da rubrica, conclusão no slide 22 |

## 2. O que só a equipe pode fazer antes de sábado

- [ ] **Salvar o PDF no Drive da equipe.** Baixe pelo link "baixar pdf" de `/sr1`, ou use
  `docs/sr1.pdf`. Sugestão de pasta: `01 kick-off`, `02 sr1`, `03 sr2` e `documentos`, com o
  PDF do Kick-off (`docs/pitch-kickoff.pdf`) também. Compartilhe a pasta com os professores.
  O slide 18 diz que a pasta recebe o PDF de cada apresentação: isso precisa ser verdade no dia.
  Com a pasta pronta, o item do slide pode passar a mostrar a estrutura real.
- [ ] **Ligar o link do Drive no site.** Preencha `NEXT_PUBLIC_DRIVE_URL` na Vercel, em produção,
  e faça um novo deploy. O link aparece na seção de documentos da página inicial.
- [x] **Validar os registros das Semanas 5 e 6.** Em 03/10, cada frase foi conferida contra o
  repositório, corrigida onde errava, e os blocos foram validados em nome do Gabriel.
- [ ] **Confirmar os responsáveis das Semanas 5 e 6.** É o único bloco que ficou em rascunho:
  só cada um sabe o que fez. Leia a sua linha em `src/content/ciclos/s5.tsx` e `s6.tsx`.
- [ ] **Registro da sessão de ideação.** Se houver fotos, folhas do brainwriting ou desenhos do
  crazy 8s, publique na Semana 3. Se não houver, a resposta preparada do slide 9 já diz isso.
- [ ] **O João Pedro confirma a data da sessão de ideação.** O texto da Semana 3 já estava no
  primeiro commit, de 16/08, antes da data da Semana 3 (22/08), e a fala do slide 9 diz que a
  sessão aconteceu. Se a banca perguntar a data, a resposta precisa ser uma só. Se a sessão não
  puder ser sustentada, troque as duas primeiras frases do slide 9 por: "Na Semana 3 montamos o
  roteiro de três técnicas: no brainwriting, cada um escreve em silêncio e passa a folha; no
  brainstorming, a conversa junta as ideias parecidas; no crazy 8s, oito telas em oito minutos.
  Levantamos oito alternativas, todas a partir da pesquisa." E a terceira por "Publicamos o
  roteiro e as alternativas."
- [ ] **Pedir a data da Semana 11 e mandar as perguntas por escrito**, na mesma mensagem para a
  Secretaria (`docs/perguntas-para-a-sesau.md`). O slide 21 promete as duas coisas. Se a data
  vier, diga a data na fala do 22.
- [ ] **Confirmar com o professor, por escrito, a troca do Google Site pelo site.** O registro
  validado da Semana 1 diz que o professor dispensou o Google Site, mas a pergunta 6 de
  `docs/perguntas-para-a-banca.md` ainda está aberta. Até o escrito chegar, o slide 18 diz só
  que o site faz o papel do Google Site, e a resposta preparada oferece espelhar no Drive.
- [ ] **Os sete conferem o próprio nome no checklist** (`src/content/checklist.ts`). Da Semana 5
  em diante, o dono foi inferido pela frente de cada um, e o slide 19 mostra esses nomes. Cada
  um ensaia uma frase sobre a própria entrega. O slide 19 diz, calculado, quem está fora da
  tabela (hoje, Rafael e Kerry): se um item do checklist for de fato de um deles, corrija o
  dono e o slide se ajusta sozinho. Se a equipe decidir a frente do Kerry, atualize `equipe.ts`
  e volte o slide 17 e o 21 a "sete frentes".
- [ ] **Ensaiar três vezes com cronômetro, os sete**, com a demonstração inteira, em produção. A
  meta é fechar em no máximo 13:00. Depois dos ensaios, marque "Pacote SR1" como feito no
  checklist e regere o PDF: o slide 19 passa a 40 de 43.
- [ ] **Combinar quem opera a demonstração.** O deck põe João Pedro falando os slides 13 e 14 e
  João Henrique operando: ele abre o sistema enquanto o 13 é falado. Testar a sessão de admin
  antes, na mesma janela anônima da demonstração.
- [ ] **Ler as respostas preparadas** (tecla `n` em cada slide) e `docs/perguntas-da-banca.md`.
  Qualquer um pode ser perguntado.

## 3. Como apresentar

- **Os sete falam**, entre 1:05 e 2:05 cada um. O teste `src/content/apresentacao-sr1.test.ts`
  confere isso e confere que a fala de cada slide cabe no tempo dele a uma fala calma.
- **Quem mexe na tela não é quem fala.** João Pedro fala os slides 13 e 14, e João Henrique
  opera a demonstração: ele troca para a aba do sistema enquanto o 13 é falado.
- **Um computador só compartilha e passa os 22 slides**: sugerimos o do João Henrique, que opera
  a demonstração. O PDF fica aberto numa janela, como plano B.
- **Regra de corte da demonstração.** A mensagem verde sozinha não prova nada: ela vem no
  endereço da página. O João Henrique confere o estado em três pontos: (1) depois de Salvar, o
  campo de famílias acompanhadas volta preenchido com 170; (2) depois do primeiro avanço, a
  etiqueta diz Em validação e o botão vira Homologar ciclo; (3) em Meu resultado, mês 2026-07,
  a nota é 91,25. Se um falhar, o João Pedro diz "vou mostrar o mês que já fechamos", o João
  Henrique volta ao slide 14, e a frase do item sem número não é dita: em junho os cinco itens
  têm número.
- **Corte por tempo.** O João Pedro deixa um cronômetro à vista. Se em 1:40 de demonstração o
  resultado de julho não estiver na tela, ele diz "vou mostrar o mês que já fechamos", e o João
  Henrique volta ao slide 14, mesmo com o sistema respondendo. Ensaiar o corte nas três rodadas.
- **Antes de entrar na sala, numa janela anônima nova, aberta só para a demonstração:** entrar
  em `/admin/entrar`, abrir `/sr1` numa aba, em tela cheia (tecla `f`), e `/sistema` em outra,
  baixar o PDF pelo link do deck e **compartilhar a tela inteira, não uma aba**: a banca precisa
  ver as duas. O que se lança fica num cookie dessa janela, então um ensaio na mesma janela
  deixa julho fechado, e o lançamento do dia é recusado. Depois de cada ensaio, feche todas as
  janelas anônimas (no Chrome elas dividem os cookies) e abra outra. Se a rede cair, o slide 14 tem a mesma conta, parada, e o PDF também.
- **Se perguntarem se os dados são reais:** o sistema roda com dados de teste, gerados com
  semente fixa e guardados em memória. O que um visitante lança fica num diário assinado no
  próprio navegador (ADR-048). O schema do banco existe e está testado, mas desligado
  (ADR-011). A base real da Secretaria, por unidade e sem pessoa, só entra nos cadernos de ML.

## 4. O caminho da demonstração

Tudo com dados de teste. O que um visitante lança ou pede fica numa cópia só dele, refeita a
cada tela a partir de um diário assinado no cookie do navegador (ADR-046 e ADR-048): ensaiar não
estraga a tela de ninguém, e o que a banca lançar sozinha não aparece na tela de quem apresenta.
Junho já está fechado pela regra 3; julho é o mês aberto.

0. **Numa janela anônima nova, aberta só para a demonstração.** Feche antes todas as janelas
   anônimas: no Chrome elas dividem os cookies, e o cookie dura até a última fechar. Um ensaio
   deixa julho fechado nessa cópia, e o lançamento do dia é recusado.
1. **Antes de subir ao palco, fora da tela:** entrar em `/admin/entrar` com a senha de
   produção, nessa janela. Fechar o mês exige essa sessão.
2. `/sistema`, em "Estou usando como", escolher **Gerente de unidade**.
3. Abrir **Lançamento da unidade**, escolher **USF Canário** e clicar em "Trocar unidade".
4. Em "Famílias acompanhadas no mês", preencher **170** e **200**, origem "relatório mensal de
   julho", e **Salvar**. Aparece "Lançamento registrado."
5. Trocar para **Coordenação da SEAB** e abrir o **Painel da SEAB**.
6. Marcar "Confirmo…" e clicar em **Avançar para Em validação**. Marcar de novo e clicar em
   **Homologar ciclo**.
7. Abrir **Meu resultado**: gerente **E. Ferraz: USF Canário**, mês **2026-07**. Atalho:
   `/sistema?abrir=meu-resultado&res_gerente=ger-usf-canario&res_ciclo=ciclo-2026-07`.
8. Clique em **Memória de cálculo**: nesta tela a conta começa fechada. O resultado é
   **91,25, excelente**, pela regra 3. Vacinação ficou sem lançamento e saiu da
   conta com o peso junto, como faz a planilha da Secretaria: (0,73) ÷ (0,8 × 1) × 100 = 91,25.
   O número só dá isso se o lançamento for exatamente 170 de 200. O percentual que o cartão
   mostra é suposição nossa, até termos o Decreto 36.482/2023; a resposta preparada do slide 14
   diz isso.
9. Opcional, se sobrar tempo: a **Trilha de auditoria** mostra o lançamento, o avanço e o
   fechamento.

**Reserva.** Se a rede ou a sessão falharem, o slide 14 mostra junho da USF Canário, já fechado
pela regra 3, com a conta aberta, calculado pelo motor na hora de montar o slide. O PDF tem a
mesma tela. Junho também está no sistema para qualquer visitante:
`/sistema?abrir=meu-resultado&res_gerente=ger-usf-canario&res_ciclo=ciclo-2026-06`.

**O defeito que a revisão de 03/10 achou.** Até ali, a escrita ficava na memória do servidor, e
na Vercel a rota que grava e a página que mostra são funções diferentes: o lançamento dizia
"registrado" e a tela seguia igual, então a demonstração teria falhado ao vivo. Reproduzimos
com dois processos atrás de um proxy (a versão antiga falha, a nova passa) e trocamos a
memória por um diário assinado no cookie (ADR-048). A reserva continua valendo para queda de
rede.

## 5. Slide a slide


<!-- roteiro-sr1:inicio -->

### Cola do ensaio: quem fala, em que slides e a partir de que minuto

| Quem | Slides (começa em) | Tempo de fala |
| --- | --- | --- |
| Gabriel | 1 a 3 (0:00) · 19 e 20 (9:49) | 2:05 |
| Matheus | 4 a 6 (1:05) | 1:40 |
| Kerry | 7 e 8 (2:45) · 22 (11:29) | 1:40 |
| João Pedro | 9 (3:55) · 13 e 14 (6:14) | 2:00 |
| Rafael | 10 e 11 (4:25) · 21 (10:49) | 1:54 |
| João Henrique | 12 (5:39) · 15 (7:44) | 1:05 |
| Fernando | 16 a 18 (8:14) | 1:35 |

Total de fala: 11:59, com limite de 15:00. Quem passa o slide é quem opera a tela, não quem fala.

### Slide 1: prumo

- **Começa em** 0:00 · **dura** 0:15 · **quem fala:** Gabriel · **16 palavras na tela**
- **Parte da rubrica:** abertura, fora dos critérios
- **Frase da tela:** o cálculo da gratificação da saúde do Recife, aberto para qualquer um conferir
- **O que a tela mostra:** Wordmark, o SR1 com a data, a disciplina, a equipe inteira e o cliente.
- **A fala:**
  1. Bom dia. Somos a Equipe 2, e este é o Prumo, o nosso projeto com a Secretaria de Saúde do Recife.
  1. Os sete falam hoje, e qualquer um de nós responde às perguntas no fim.

### Slide 2: o caminho de hoje

- **Começa em** 0:15 · **dura** 0:10 · **quem fala:** Gabriel · **49 palavras na tela**
- **Parte da rubrica:** abertura, fora dos critérios
- **Frase da tela:** a ordem da rubrica do SR1. o rodapé de cada slide diz em que parte ele está.
- **O que a tela mostra:** As seis partes da rubrica, com os slides de cada uma.
- **A fala:**
  1. Seguimos a ordem da rubrica: o problema, as ideias, a solução, o processo, o planejado contra o realizado e o nosso balanço.

### Slide 3: o problema: uma conta de dinheiro feita à mão

- **Começa em** 0:25 · **dura** 0:40 · **quem fala:** Gabriel · **88 palavras na tela**
- **Parte da rubrica:** critério 1 · imersão no problema
- **Frase da tela:** a prefeitura paga um extra no salário de quem dirige uma unidade de saúde e bate as metas do mês.
- **O que a tela mostra:** Onde o problema ocorre, as causas e as consequências, em três blocos.
- **A fala:**
  1. O problema. A prefeitura do Recife paga um extra no salário de quem dirige uma unidade de saúde e bate as metas do mês. A regra está numa portaria de 2024.
  1. Acontece todo mês, na Secretaria de Saúde, para 196 unidades em 8 distritos.
  1. A causa: a regra está escrita, mas a conta é feita à mão, numa planilha em que pouca gente sabe mexer.
  1. A consequência: na planilha real, seis unidades seguem uma conta que a portaria não traz. E quem recebe o dinheiro não consegue conferir a própria nota.
- **Se perguntarem** (fora do tempo):
  - Por que este problema: é um cliente real, com a dor escrita desde 2023, e uma tentativa anterior de automatizar a conta parou.
  - Os números da rede vêm da base de desempenho que a Secretaria enviou em 23 de setembro, sem nome, CPF ou matrícula. Em 39 das 90 combinações de tipo e distrito há uma unidade só; isso está na análise de privacidade.
  - As seis são NDI e SAE, dois tipos que a portaria não nomeia. Não sabemos se é regra provisória ou erro: é pergunta para a SEAB, e está na matriz CSD. Na aba de pesos há outro caso: uma coluna de peso diferente da portaria, e não sabemos quem decidiu nem até quando vale.

### Slide 4: o que pesquisamos e o que aprendemos

- **Começa em** 1:05 · **dura** 0:40 · **quem fala:** Matheus · **84 palavras na tela**
- **Parte da rubrica:** critério 1 · imersão no problema
- **Frase da tela:** cinco fontes, cada uma com data. a reunião e a planilha corrigiram quatro pontos do nosso modelo.
- **O que a tela mostra:** As cinco fontes em ordem de chegada, com a planilha em destaque, e os três aprendizados.
- **A fala:**
  1. Pesquisamos em cinco fontes, cada uma com data: o caso da escola, a reunião com a Secretaria em 22 de agosto, a portaria, a planilha que a Secretaria usa e a base de desempenho.
  1. A reunião mostrou que a unidade preenche cada item medido, e não o indicador. A planilha foi a que mais ensinou: a gente fazia a média dos valores; ela dá nota a cada item e faz a média das notas.
  1. Quando faltava um número, a gente zerava. Ela tira da conta, e o peso sai junto, como manda o artigo 8º.
- **Se perguntarem** (fora do tempo):
  - A pesquisa ainda não tem entrevista com quem opera o processo: as personas vieram do caso e da reunião. A entrevista está prevista para a Semana 11, com roteiro pronto em docs/validacao.md; a data ainda vai ser pedida à Secretaria.
  - A Secretaria autorizou o uso da base por unidade na lente de aprendizado de máquina (ADR-044), ainda sem documento escrito: a autorização por escrito é a pergunta 13. São 244 linhas; 190 unidades seguem a conta da portaria.
  - Sobre a conta de hoje, a Secretaria respondeu por escrito em 22 de setembro: é tudo manual, via procv e afins.

### Slide 5: o que sabemos, supomos e falta saber

- **Começa em** 1:45 · **dura** 0:25 · **quem fala:** Matheus · **90 palavras na tela**
- **Parte da rubrica:** critério 1 · imersão no problema
- **Frase da tela:** a matriz CSD, atualizada em 25/09 com a planilha e a base da Secretaria.
- **O que a tela mostra:** As três colunas da matriz, com a contagem e dois exemplos de cada, e o que a pesquisa respondeu.
- **A fala:**
  1. A matriz de certezas, suposições e dúvidas foi atualizada em 25 de setembro: 11 certezas, cada uma com a fonte, 4 suposições declaradas e 8 dúvidas, cada uma com a pergunta para a Secretaria.
  1. A maior dúvida é quanto se paga em cada classe da nota.
  1. Desde o Kick-off, a dúvida do indicador sem número virou certeza, e a planilha corrigiu o nosso modelo.
- **Se perguntarem** (fora do tempo):
  - A matriz do Kick-off continua no site, com a data dela. A de 25 de setembro está no documento de síntese da pesquisa, no SR1.

### Slide 6: quem usa: personas e mapa de empatia

- **Começa em** 2:10 · **dura** 0:35 · **quem fala:** Matheus · **90 palavras na tela**
- **Parte da rubrica:** critério 1 · imersão no problema
- **Frase da tela:** personas do caso e o mapa da analista que fecha a conta.
- **O que a tela mostra:** As três personas, três quadrantes do mapa de empatia e os quatro papéis que elas viraram.
- **A fala:**
  1. Criamos três personas a partir do caso: a analista que fecha a conta, a gerente que manda os números e a coordenadora avaliada, que recebe o extra.
  1. O mapa de empatia é da analista. A frase dela resume o medo: se mexer numa fórmula, tem que conferir a planilha inteira de novo.
  1. Na reunião de 22 de agosto, o cliente deu nome aos quatro papéis do sistema; a gerente e a avaliada viraram o gerente de unidade.
- **Se perguntarem** (fora do tempo):
  - As personas são personagens, não gente real: vieram dos papéis descritos no caso, sem entrevista. A entrevista com quem opera o processo está no plano da Semana 11.
  - A segunda persona nasceu como gestor de área técnica. Depois da reunião de 22 de agosto, virou a gerente da unidade, porque é a unidade que manda os números.
  - O rascunho das personas foi feito com IA a partir do caso e conferido pelo Gabriel, sem entrevista. Está no registro de uso de IA.

### Slide 7: o que já existe: benchmarking e SWOT

- **Começa em** 2:45 · **dura** 0:35 · **quem fala:** Kerry · **90 palavras na tela**
- **Parte da rubrica:** critério 1 · imersão no problema
- **Frase da tela:** nenhuma solução junta regra com versão, conta aberta e registro de quem mudou.
- **O que a tela mostra:** As cinco soluções estudadas com o que falta a cada uma, e os quatro quadrantes da SWOT.
- **A fala:**
  1. Antes de construir, olhamos cinco soluções: painéis públicos de indicadores, sistemas de metas do SUS, duas ferramentas de metas de empresa e a própria planilha de hoje.
  1. Cada uma resolve um pedaço. Nenhuma junta regra com versão, conta aberta e registro de quem mudou.
  1. Na SWOT, a força é o cliente real, com a regra escrita. A fraqueza: ninguém da equipe conhecia o processo por dentro, e a portaria só chegou em 5 de setembro.
- **Se perguntarem** (fora do tempo):
  - O benchmarking compara tipos de solução, não produtos com nome. Ele e a SWOT estão na Semana 2 do site, e a SWOT foi revista em setembro, quando a portaria chegou e o Kerry entrou.

### Slide 8: os objetivos e o que já alcançamos

- **Começa em** 3:20 · **dura** 0:35 · **quem fala:** Kerry · **90 palavras na tela**
- **Parte da rubrica:** critério 1 · imersão no problema
- **Frase da tela:** objetivo geral: tirar a conta da planilha e deixar cada nota aberta para qualquer um conferir.
- **O que a tela mostra:** Os cinco objetivos específicos com o prazo, o estado de hoje e o que falta, e o fora do escopo em uma linha.
- **A fala:**
  1. O objetivo geral: tirar a conta da planilha e deixar cada nota aberta para conferir.
  1. Dos cinco específicos, um foi alcançado e dois estão em parte: a regra já tem versão, mas ainda muda por código, e o ranking mostra a nota sem a conta. Os outros dois vencem em 7 de novembro e 21 de novembro.
  1. Próximos passos: cadastrar a regra pela tela, levar a conta ao ranking e pedir a data da Semana 11.
  1. O escopo foi revisto na Semana 6, com a portaria e a planilha.
- **Se perguntarem** (fora do tempo):
  - O escopo da Semana 4 foi revisto depois da portaria, de 5 de setembro, e da planilha, de 22 de setembro. A revisão está na Semana 6 do site.
  - A regra com versão funciona: maio não mudou quando a regra mudou. Mas a versão 3 pediu código novo no motor, e cadastrar a regra pela tela está no backlog.
  - A conta aberta está em parte porque o ranking do painel da gestão mostra a nota sem a conta. Levar a conta a toda tela que mostra nota está no backlog.
  - Cada um vê o que é seu na permissão: cada tela confere o papel no servidor e responde 404. O login é simulado, e o da prefeitura está fora do escopo.
  - Por isso, no documento de privacy by design, o requisito de acesso por área está em parte: sem login real, o próprio distrito é escolhido no seletor.
  - As metas de entrega da Semana 2 também têm estado: o motor com testes dos casos-limite saiu até a Semana 6, e o protótipo navegável está no ar. O ciclo inteiro com histórico, a entrevista da Semana 11 e o SR2 estão no prazo.

### Slide 9: como geramos as ideias

- **Começa em** 3:55 · **dura** 0:30 · **quem fala:** João Pedro · **60 palavras na tela**
- **Parte da rubrica:** critério 2 · ideação
- **Frase da tela:** três técnicas na semana 3, com uma regra: somar antes de criticar.
- **O que a tela mostra:** As três técnicas, com o tempo, como cada uma funciona e o que produziu, e o funil até a escolhida.
- **A fala:**
  1. Na Semana 3 seguimos um roteiro de três técnicas. No brainwriting, cada um escreve em silêncio e passa a folha adiante, para ninguém ser puxado por quem fala primeiro.
  1. No brainstorming, as ideias parecidas viraram oito alternativas. No crazy 8s, cada um rascunha oito telas em oito minutos.
  1. Publicamos o roteiro e as alternativas. As folhas, ainda não.
- **Se perguntarem** (fora do tempo):
  - O site tem o roteiro das três técnicas e o resultado, as oito alternativas. As folhas e os desenhos da sessão ainda não foram publicados: é um item em aberto no nosso checklist.
  - SCAMPER não foi usado: a matriz da disciplina pedia, na Semana 3, brainwriting, brainstorming e crazy 8's, e seguimos essas três.

### Slide 10: os critérios e a ideia escolhida

- **Começa em** 4:25 · **dura** 0:30 · **quem fala:** Rafael · **86 palavras na tela**
- **Parte da rubrica:** critério 2 · ideação
- **Frase da tela:** nota de 1 a 5 em impacto, esforço (5 = mais trabalho) e aderência ao órgão público.
- **O que a tela mostra:** As oito alternativas com as três notas e o destino de cada uma, a escolhida em destaque.
- **A fala:**
  1. Cada alternativa levou nota de 1 a 5 em três critérios, fixados antes das ideias.
  1. Venceu o sistema web com a conta aberta: maior impacto, e maior aderência, porque a regra tem versão e mês fechado não muda. Ele ataca a causa: hoje a conta só existe em fórmula de planilha.
  1. A planilha travada ficou como linha de base. A ideia do modelo virou a tela de analytics, que aponta onde olhar sem mudar nota.
- **Se perguntarem** (fora do tempo):
  - Não somamos as notas. O esforço 4 foi aceito porque cabe em fatias: lançamento, conta e conta aberta até o SR1, e o resto nas sprints.
  - A lista de risco da tela de analytics é uma média simples, sem modelo. Os modelos rodam sobre a base da Secretaria e mostram o que pesa na nota.
  - Aderência é sobreviver no órgão: pregão, portaria nova e troca de equipe. Na Semana 3, a razão escrita foi mudar a regra pela tela, e isso ainda está no backlog. O que já funciona é a versão: a regra 3 entrou e maio não mudou.

### Slide 11: o que cada disciplina pôs no produto

- **Começa em** 4:55 · **dura** 0:44 · **quem fala:** Rafael · **90 palavras na tela**
- **Parte da rubrica:** critério 2 · ideação
- **Frase da tela:** como cada lente moldou a ideia escolhida: as três da matriz e direito.
- **O que a tela mostra:** Quatro cartões, um por disciplina, com as decisões concretas de cada uma; o de direito traz a base legal e a Atividade 2.
- **A fala:**
  1. A ideia escolhida ganhou peças de cada disciplina.
  1. Segurança: o que não é seu responde como se não existisse, e listamos 14 ameaças.
  1. Nuvem: o sistema roda na Vercel, sem servidor para manter.
  1. Aprendizado de máquina: três modelos sobre a base real da Secretaria mostram o que pesa na nota, sem fazer a conta.
  1. E Direito: pelo artigo 20 da LGPD, a nota que decide o salário de alguém precisa ser explicada. Por isso a conta fica aberta. A base legal é a política pública, não o consentimento.
  1. Na Atividade 2 de Direito, mapeamos dezesseis dados pessoais e quinze riscos de privacidade, cada um com requisito e teste. O que falta virou backlog.
- **Se perguntarem** (fora do tempo):
  - O classificador acerta 100%, contra 54% do chute mais simples, porque aprende a própria conta da portaria. Por isso o modelo diz o que pesa, e não calcula nada.
  - O agrupamento separa 4 grupos de unidades, nunca de pessoas, com silhueta de 0,71. A apresentação completa está em /ml.
  - Dos 10 riscos da lista OWASP Top 10, 5 ainda estão cobertos só pela metade. O login do sistema é simulado.
  - O banco já está projetado, com as regras de acesso testadas num Postgres de verdade, mas ainda com os papéis de antes da reunião de 22 de agosto, e está desligado: o sistema roda em memória para qualquer pessoa clonar e rodar sem senha.
  - O desenho do sistema em quatro níveis (C4) está na página de arquitetura do site.
  - A base legal é o artigo 7º, inciso III, lido com o artigo 23: o Poder Público executando uma política pública. Não é consentimento, que seria frágil numa relação de trabalho.
  - Dos 15 requisitos de privacidade, 2 já valem no sistema, 8 valem em parte, 2 estão no backlog e 3 dependem de infraestrutura real. A tabela está no documento de privacy by design do SR1, no site.
  - Um exemplo de dado sensível por inferência: a licença médica que justifica uma meta perdida revela saúde. No sistema, o único lugar em que isso pode entrar é o texto da contestação, e o formulário avisa para não escrever.
  - O PDF da Atividade 2 cita a Portaria 05 de 2023, que foi revogada pela 001 de 2024. O site já cita a vigente.
  - O backlog de privacidade tem 8 itens, e cada um cobre um ou mais riscos: 1 feito, 3 em parte e 4 a fazer. Os 2 requisitos no backlog são os que ainda não têm nada no sistema.
  - O artigo 20 vale mesmo com a CAM decidindo? A nota sai de uma conta automática, e quem recebe precisa conseguir conferir. Na Atividade 2, a conta aberta atende aos direitos do titular do artigo 18, e o artigo 20 aparece no modelo: nenhuma saída de modelo entra na nota, e a decisão continua humana e contestável.

### Slide 12: a solução: do número à nota, com a conta aberta

- **Começa em** 5:39 · **dura** 0:35 · **quem fala:** João Henrique · **82 palavras na tela**
- **Parte da rubrica:** critério 3 · proposta de solução
- **Frase da tela:** um sistema web que faz a conta da portaria e mostra de onde veio cada número.
- **O que a tela mostra:** O caminho de um mês em quatro passos, com o papel de quem faz cada um, e as contagens do sistema.
- **A fala:**
  1. A solução é um sistema web que faz a conta da portaria e mostra de onde veio cada número.
  1. Todo mês, a unidade lança os números, o distrito confere, e a coordenação da SEAB, que conduz a avaliação na Secretaria, fecha o mês. Então cada gerente vê a própria nota, com a conta inteira embaixo.
  1. São 8 telas e 4 papéis. A regra é um dado com número de versão, separado do motor que faz a conta.
- **Se perguntarem** (fora do tempo):
  - Hoje a regra nova entra por código, como dado. Cadastrar indicador e regra pela tela é história do backlog que ainda não está pronta.

### Slide 13: os protótipos de baixa fidelidade

- **Começa em** 6:14 · **dura** 0:20 · **quem fala:** João Pedro · **64 palavras na tela**
- **Parte da rubrica:** critério 3 · proposta de solução
- **Frase da tela:** quatro desenhos de três telas centrais, propositalmente sem texto. os nomes são os do menu.
- **O que a tela mostra:** Os quatro wireframes, um por tela, com a legenda de cada.
- **A fala:**
  1. Estes são os protótipos de baixa fidelidade de três telas centrais: o lançamento, o painel da SEAB e o meu resultado, que tem dois desenhos.
  1. Cada desenho fixa uma decisão: a conta fica embaixo da nota, e o painel mostra quem falta.
  1. Vocês veem as telas funcionando agora.
- **Se perguntarem** (fora do tempo):
  - Os desenhos foram gerados com IA na semana do Kick-off, a partir das telas que já existiam, e conferidos pelo Gabriel. O site diz essa data, e os rascunhos em papel do crazy 8s não foram publicados.
  - Barra cinza no lugar de texto é de propósito: a conversa é sobre onde cada coisa fica, não sobre a frase.

### Slide 14: o sistema funcionando, ao vivo

- **Começa em** 6:34 · **dura** 1:10 · **quem fala:** João Pedro · **26 palavras na tela**
- **Parte da rubrica:** critério 3 · proposta de solução
- **Frase da tela:** dados de teste: nenhuma pessoa real.
- **O que a tela mostra:** O sistema ao vivo, lançando julho. De reserva, a nota de junho com a conta aberta, calculada na hora.
- **A fala:**
  1. Agora o sistema funcionando, ao vivo, com dados de teste.
  1. Primeiro, a unidade. Escolhemos a USF Canário e lançamos um número de julho, dizendo de onde ele veio.
  1. Depois, a coordenação. O painel mostra quem já mandou e quem falta, e o mês avança uma etapa por vez, até fechar.
  1. Por fim, o resultado, com a conta inteira embaixo. Cada linha mostra o número, o alvo, a nota e quanto pesa.
  1. Um item ficou sem número e saiu da conta com o peso junto, como faz a planilha da Secretaria. A última linha fecha a conta: qualquer pessoa refaz no papel.
- **Se perguntarem** (fora do tempo):
  - Na reserva, depois de "vou mostrar o mês que já fechamos": esta tela mostra junho, já fechado, 75, com a mesma conta aberta.
  - Não há banco ligado: o que um visitante lança fica num diário assinado no próprio navegador, e cada tela refaz a conta a partir dele. Fechou o navegador, some. O banco está projetado e desligado.
  - Quem mexe na tela não é quem fala: assim a demonstração não depende de uma pessoa só.
  - O que um visitante lança fica na sessão dele. A demonstração de um não muda a tela de outro.
  - O percentual de cada classe está no Decreto 36.482/2023, que ainda buscamos. No sistema ele é suposição nossa; o nome da classe vem da planilha. Vale também para o percentual que aparece em julho, ao vivo.
  - Se a demonstração cair na reserva de junho, a frase do item sem número não vale: em junho os cinco itens têm número.

### Slide 15: por que esta solução: três diferenciais

- **Começa em** 7:44 · **dura** 0:30 · **quem fala:** João Henrique · **85 palavras na tela**
- **Parte da rubrica:** critério 3 · proposta de solução
- **Frase da tela:** o que nenhuma das soluções estudadas junta.
- **O que a tela mostra:** Os três diferenciais, cada um com o problema de hoje que resolve, e maio que não muda.
- **A fala:**
  1. Três diferenciais: nenhuma solução que estudamos junta os três. Cada um ataca um problema de hoje.
  1. A conta aberta: qualquer pessoa refaz a nota no papel.
  1. A regra com versão: a regra nova vale a partir de junho, e maio continuou com 86,67. Pela regra nova daria 85, mas mês fechado não muda.
  1. E o registro de quem mudou: corrigir não apaga, e o valor antigo fica na trilha de auditoria, com quem fez e quando.
- **Se perguntarem** (fora do tempo):
  - O registro já está no ar: lançamento, correção e avanço de etapa vão para a trilha de auditoria, com o antes e o depois. Refazer qualquer contestação passo a passo é o objetivo do slide 8, e fecha na Semana 9.
  - A trilha só recebe linha nova: não há caminho para apagar. No protótipo, isso depende de toda escrita passar pela mesma camada; no banco projetado, um gatilho garante o mesmo.
  - A regra ainda muda por código, e cada versão fica no Git, com autor e data. Cadastrar a regra pela tela, com registro na trilha, está no backlog.
  - Cada papel só vê o que é seu: é o objetivo alcançado do slide 8, e quem manda o número não escolhe a meta. O login ainda é simulado, e um teste percorre as oito telas contra os quatro papéis.
  - A resposta é “não encontrado” e nunca “proibido” de propósito: da porta, não dá para saber se a tela existe.
  - Escrevemos a regra 3 em setembro, com a planilha do cliente, valendo a partir de junho. Quando ela entrou, junho ainda estava aberto na base de teste; os meses até maio, já fechados, não mudaram. Junho dá 75. O motor tem 55 testes só dele, e cada envio de código roda todos de novo.

### Slide 16: o ciclo de vida do projeto

- **Começa em** 8:14 · **dura** 0:35 · **quem fala:** Fernando · **89 palavras na tela**
- **Parte da rubrica:** critério 4 · metodologia e processo
- **Frase da tela:** o semestre em fases, com um registro por semana no site.
- **O que a tela mostra:** As fases do semestre com as datas do cronograma, o SR1 em destaque, a rotina da semana e o backlog priorizado.
- **A fala:**
  1. Hoje é o SR1. Depois vêm quatro sprints de uma semana, cada uma puxada pela ordem do backlog, a validação com a Secretaria e o SR2.
  1. Toda semana tem registro no site, com o que avançou, o que travou e quem fez. Toda decisão fica escrita com o porquê.
  1. O backlog tem 26 histórias, priorizadas por MoSCoW. Das 16 obrigatórias, 10 estão no ar, como lançar cada item e abrir a conta. As que faltam, de configurar pela tela, entram nas sprints.
- **Se perguntarem** (fora do tempo):
  - As sprints da Semana 7 à 10 começam pelo retorno desta banca. A ordem do backlog muda com ele.
  - Por que há desejáveis no ar antes de todas as obrigatórias: algumas vieram junto de uma obrigatória, como publicar o mês, que é a última etapa do mesmo botão que avança a etapa. As 6 obrigatórias que faltam são todas da SEAB configurando pela tela: abrir o mês, a janela de lançamento, os indicadores e a regra. Entram nas sprints, na ordem que o retorno desta banca pedir.

### Slide 17: papéis e responsabilidades

- **Começa em** 8:49 · **dura** 0:30 · **quem fala:** Fernando · **87 palavras na tela**
- **Parte da rubrica:** critério 4 · metodologia e processo
- **Frase da tela:** seis frentes com dono; o Kerry apoia a pesquisa.
- **O que a tela mostra:** Os sete integrantes, com o papel e as responsabilidades de cada um.
- **A fala:**
  1. Gabriel cuida do produto e das prioridades, Matheus da pesquisa, com o apoio do Kerry, João Henrique da arquitetura e da conta, João Pedro das telas, Rafael dos dados, e eu da qualidade e da documentação.
  1. Kerry entrou no Kick-off e apoia o Matheus na pesquisa e na validação.

### Slide 18: ferramentas, o site e o Drive

- **Começa em** 9:19 · **dura** 0:30 · **quem fala:** Fernando · **78 palavras na tela**
- **Parte da rubrica:** critério 4 · metodologia e processo
- **Frase da tela:** onde o trabalho acontece e onde cada entrega fica.
- **O que a tela mostra:** As ferramentas com o uso de cada uma, as oito seções do site no lugar do Google Site e o que a pasta do Drive guarda.
- **A fala:**
  1. O código e os testes ficam no GitHub, e cada envio roda os testes sozinho. O site roda na Vercel.
  1. O site faz o papel do Google Site: as oito seções do briefing e o diário de bordo de cada semana, com cada documento aberto ali mesmo.
  1. A pasta do Drive recebe o PDF de cada apresentação.
- **Se perguntarem** (fora do tempo):
  - Trocamos o Google Site pelo site do projeto na Semana 1, com as mesmas oito seções, e cada versão fica guardada no Git, com a data. Se a banca preferir, espelhamos no Drive.
  - O uso de IA está em /transparencia-ia, com quem conferiu cada uso. Até aqui o Gabriel conferiu todos; dividir isso entra nas sprints.

### Slide 19: planejado x realizado: as entregas

- **Começa em** 9:49 · **dura** 0:35 · **quem fala:** Gabriel · **72 palavras na tela**
- **Parte da rubrica:** critério 5 · planejado x realizado
- **Frase da tela:** fora da tabela: Rafael (aprendizado de máquina) e Kerry (apoio à pesquisa).
- **O que a tela mostra:** A tabela das fases até o SR1, com entregas, responsáveis e o que está em andamento.
- **A fala:**
  1. Até hoje o cronograma pedia 43 entregas, e entregamos as 43. Cada linha mostra a fase, a data e quem respondeu por ela.
  1. O Rafael não aparece porque responde pela lente de aprendizado de máquina, que tem calendário próprio; o Kerry apoia o Matheus na pesquisa.
- **Se perguntarem** (fora do tempo):
  - O Rafael responde pela lente de aprendizado de máquina, que tem marcos próprios: a entrega parcial em 23 de setembro e a AV1 em 30 de setembro. Os slides estão em /ml.
  - O Kerry entrou no Kick-off, em 12 de setembro, e ainda não tem frente própria: apoia o Matheus na pesquisa e na validação, como diz o slide 17.
  - Por que um nome se repete em quase toda linha: as entregas ficaram registradas no nome de poucos, e esse é o ponto de melhoria do slide 21.

### Slide 20: o avanço e o estágio de hoje

- **Começa em** 10:24 · **dura** 0:25 · **quem fala:** Gabriel · **89 palavras na tela**
- **Parte da rubrica:** critério 5 · planejado x realizado
- **Frase da tela:** estágio: protótipo navegável, no ar.
- **O que a tela mostra:** Três percentuais de avanço com a conta de cada um, e os três compromissos do Kick-off com o estado.
- **A fala:**
  1. Na metade do semestre, entregamos tudo o que o cronograma pedia até hoje, e 65% das histórias do backlog já estão no ar.
  1. Dos três compromissos do Kick-off, dois foram feitos: as oito telas estão no ar, e a regra foi conferida com a planilha da própria Secretaria. O terceiro está em andamento: os indicadores oficiais entram em 24 de outubro.
- **Se perguntarem** (fora do tempo):
  - A regra foi conferida com a planilha que a Secretaria usa, enviada em 22 de setembro: a regra 3 segue o método dela, e o que não bateu virou pergunta por escrito. A validação com quem opera o processo é na Semana 11.
  - No Kick-off também dissemos que o prazo de contestação entraria na regra 3. Não entrou: ficou para a Sprint 3, e a tela diz que ele ainda não existe.

### Slide 21: pontos fortes, melhorias e riscos

- **Começa em** 10:49 · **dura** 0:40 · **quem fala:** Rafael · **89 palavras na tela**
- **Parte da rubrica:** critério 6 · pontos fortes e melhorias
- **Frase da tela:** do projeto e da equipe. a seta diz como tratamos.
- **O que a tela mostra:** Três colunas: pontos fortes, pontos de melhoria com o tratamento, e os três riscos maiores com o tratamento.
- **A fala:**
  1. Pontos fortes: um cliente real com regra escrita, o sistema no ar com as oito telas, e uma equipe com seis frentes separadas.
  1. Pontos de melhoria: a pesquisa ainda não tem entrevista, e vamos entrevistar na Semana 11. E o registro das entregas ficou no nome de poucas pessoas: nas sprints, cada um registra a própria entrega.
  1. O maior risco é o percentual pago em cada classe, que ainda é dúvida: está num decreto que não temos. O Matheus busca o decreto, o João Henrique troca os indicadores pelos cinco da portaria, e o Gabriel pede já a data da Semana 11.
- **Se perguntarem** (fora do tempo):
  - O registro de riscos inteiro está na Semana 6 do site, com probabilidade, impacto, mitigação e dono.
  - Uma unidade que é única no distrito pode apontar quem a dirige. Isso está na análise de privacidade, e é uma pergunta para a Secretaria.
  - O retorno desta banca entra por cima de tudo isso, na primeira sprint.

### Slide 22: conclusão e próximos passos

- **Começa em** 11:29 · **dura** 0:30 · **quem fala:** Kerry · **73 palavras na tela**
- **Parte da rubrica:** encerramento, fora dos critérios
- **Frase da tela:** do problema ao plano.
- **O que a tela mostra:** A linha do problema à solução e ao plano, as paradas até o SR2 com a data de cada uma, o endereço do site e a pergunta para a banca.
- **A fala:**
  1. Para fechar: a regra está na portaria, mas a conta só existe em fórmula de planilha. A solução deixa a regra com versão e a conta aberta.
  1. Próximos passos: em 17 de outubro, aplicar o retorno desta banca; em 24 de outubro, os cinco indicadores da portaria; e pedir à Secretaria a Semana 11, para conferir a conta com a gente.
  1. Obrigado. Tudo está no site, e qualquer um de nós responde.

<!-- roteiro-sr1:fim -->
