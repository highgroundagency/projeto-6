# Privacidade e LGPD

## O que este documento é

Uma análise do tratamento de dados pessoais que o Prumo faria **em produção**, na SESAU, e
do que ele faz **hoje**, como MVP acadêmico. A diferença entre os dois é grande e está
explicitada em cada seção.

> **Estado atual do MVP:** o sistema roda com **dados 100% sintéticos**, gerados por script
> com semente fixa (`src/lib/seed/`). Nenhum dado real de pessoa ou da SESAU entra no
> repositório, no seed ou em prompt de IA. Há teste automatizado que recusa CPF, e-mail,
> telefone ou matrícula na base (`src/lib/seed/seed.test.ts`).

## Dados que o sistema trataria em produção

| Categoria | Exemplos | Titular | Necessário para |
| --- | --- | --- | --- |
| Identificação funcional | Nome, matrícula, cargo, lotação | Servidor avaliado | Vincular o resultado à pessoa certa |
| Vínculo organizacional | Área responsável, período de exercício | Servidor avaliado | Saber quais indicadores se aplicam |
| Desempenho | Score do ciclo, faixa, memória de cálculo, histórico | Servidor avaliado | Calcular e justificar a gratificação |
| Autoria de lançamento | Quem informou cada valor, quando | Servidor da área técnica | Rastreabilidade e responsabilização |
| Contestação | Motivo apresentado, resposta da comissão | Servidor avaliado | Devido processo |

**Não são tratados**: dados sensíveis (art. 5º, II da LGPD), dados de pacientes, dados
bancários ou valores de folha. O sistema calcula o **percentual devido**; a folha é outro
sistema, e isso está explicitamente fora do escopo.

## Base legal

O tratamento se apoia no **art. 7º, III da LGPD** — execução de políticas públicas
previstas em lei e regulamento pelo Poder Público. A gratificação por desempenho é
instituída por portaria e o tratamento é indispensável para executá-la.

Consequência prática: **não se pede consentimento**, e nem se deveria — consentimento numa
relação funcional assimétrica seria frágil, e a recusa não poderia ser honrada sem
inviabilizar a política. O fundamento correto é a execução da política pública.

- **Controladora:** Secretaria de Saúde do Recife (SESAU).
- **Operadora:** não se aplica no MVP; em produção, o provedor de nuvem contratado.
- **Encarregado (DPO):** designado pela Prefeitura; o sistema apenas expõe o canal.

## Princípios do art. 6º, aplicados

| Princípio | Como aparece no sistema |
| --- | --- |
| Finalidade | Cada indicador declara fonte e periodicidade; nada é coletado "por precaução" |
| Adequação | Só entram dados que alimentam o cálculo da gratificação |
| Necessidade | O gestor vê o **próprio** resultado; o painel agregado tem modo anônimo |
| Livre acesso | A memória de cálculo expõe o caminho completo do número ao próprio avaliado |
| Qualidade dos dados | Validação por zod na entrada e alerta de valor fora do padrão |
| Transparência | Regra de pontuação versionada e visível; trilha de auditoria consultável |
| Segurança | Ver `seguranca.md` |
| Prevenção | Auditoria append-only; regra vigente nunca é editada |
| Não discriminação | Score deriva de indicadores de portaria, sem variável pessoal no cálculo |
| Responsabilização | Todo lançamento e toda transição têm autor, data, antes e depois |

## Privacy by Design — onde está no código

| Princípio | Onde |
| --- | --- |
| Minimização | `src/lib/calculo/tipos.ts` — a entidade `Gestor` tem nome, cargo e área; não tem CPF, matrícula, endereço ou data de nascimento |
| Anonimização por padrão onde é possível | `src/app/sistema/gestao/page.tsx` — ranking com modo anônimo; `src/app/api/sistema/exportar/route.ts` propaga a anonimização para o CSV |
| Acesso do titular embutido, não anexado | `src/components/sistema/memoria.tsx` — o titular vê a memória completa na própria tela, sem pedir |
| Segurança desde a origem | `src/middleware.ts` + `src/lib/admin/guard.ts` — proteção em duas camadas |
| Integridade verificável | `src/lib/sistema/estado.ts` — toda escrita gera evento com antes e depois |
| Privacidade por omissão do dado | `src/lib/seed/catalogo.ts` — nomes de gestor são iniciais fictícias, não nomes completos |

## Direitos dos titulares (art. 18) e como o sistema atende

| Direito | Atendimento |
| --- | --- |
| Confirmação e acesso | Tela "Meu resultado": score, faixa, histórico e memória de cálculo do próprio avaliado |
| Correção | Contestação registrada, com resposta da comissão; correção de lançamento gera novo evento sem apagar o anterior |
| Anonimização, bloqueio ou eliminação de dado desnecessário | Ranking anonimizável; em produção, dado fora da finalidade não deve entrar |
| Portabilidade | Exportação em CSV (hoje no painel da gestão; em produção, também para o próprio titular) |
| Informação sobre compartilhamento | Não há compartilhamento com terceiros no MVP |
| Revisão de decisão automatizada (art. 20) | **Central neste projeto**: o cálculo é determinístico e a memória mostra cada passo. Os alertas de ML **sinalizam e nunca bloqueiam** — a decisão continua humana e contestável |

## Retenção

Proposta para produção, a validar com a área jurídica da Secretaria:

- **Lançamentos, avaliações e memória de cálculo:** enquanto durar o prazo prescricional
  aplicável ao ato administrativo que concedeu a gratificação — o cálculo precisa poder ser
  reproduzido enquanto puder ser questionado.
- **Trilha de auditoria:** mesmo prazo, sem exclusão seletiva. Trilha com buraco não é
  trilha.
- **Contestações:** mesmo prazo do ciclo a que se referem.
- **Dados de servidor desligado:** mantidos apenas nos ciclos em que ele foi avaliado.

## Transferência internacional

O MVP roda em nuvem que pode ter servidores fora do Brasil. Como não há dado pessoal real,
não há transferência internacional de dados pessoais hoje. **Em produção, isto vira
requisito de contratação**: hospedagem em região brasileira ou avaliação formal de
transferência (arts. 33 a 36).

## Pendências honestas

1. Falta validar com a SESAU o prazo de retenção e o inventário de dados reais.
2. O MVP não implementa exclusão nem exportação por iniciativa do titular — são fluxos de
   produção, ainda não construídos.
3. Não há registro de operações de tratamento (art. 37) formalizado; a trilha de auditoria
   é a base sobre a qual ele seria montado.
