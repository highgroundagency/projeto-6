# Uso de IA neste projeto

Uso de IA nesta equipe segue o contrato da disciplina: **gerado ≠ entregue**. Tudo o que
uma ferramenta produz passa por validação humana antes de virar entrega, e o uso é
declarado nos marcos.

Regras que a equipe adotou:

1. Nenhum dado real de pessoa ou da SESAU entra em prompt: nem para "testar".
2. Todo artefato gerado tem um integrante responsável por revisar e assinar.
3. O que a ferramenta escreveu e ninguém validou fica com selo `rascunho` no registro.
4. Código gerado só entra com teste que prove o comportamento.

## Registro semanal

| Data | Ciclo | Ferramenta | O que foi gerado | Arquivos | Validado por |
| --- | --- | --- | --- | --- | --- |
| 08/08/2026 | s1 | Claude (Anthropic) | Estrutura inicial do repositório e proposta de nomes para o produto | `README.md`, `src/content/produto.ts` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Rascunho das personas, do mapa de empatia e da estrutura de benchmarking, a partir da descrição do case | `src/content/ciclos/s2.tsx` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Motor de releases, aritmética de datas em America/Recife e a suíte de testes correspondente | `src/lib/releases.ts`, `src/lib/datas.ts`, `src/lib/*.test.ts` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Sessão administrativa assinada com HMAC, conferência de senha em tempo constante e rate limit | `src/lib/admin/*` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Tipos do registro semanal que quebram o build quando um ciclo está incompleto | `src/lib/registro/tipos.ts` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Motor de cálculo da gratificação, memória de cálculo e testes de casos-limite | `src/lib/calculo/*` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Gerador de dados sintéticos com semente fixa para o seed do sistema | `src/lib/seed/` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Telas do sistema: dashboard da CAM, indicadores, lançamento, meu resultado, auditoria, gestão, analytics e contestação | `src/app/sistema/` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Verificador automatizado de vazamento de conteúdo futuro e suíte end-to-end | `scripts/verificar-vazamento.ts`, `e2e/` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Primeira versão dos documentos de arquitetura, segurança, privacidade, decisões, releases e validação | `docs/` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Schema SQL, gatilhos de invariante e políticas de RLS do Supabase | `supabase/migrations/` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Suíte que exercita as políticas de RLS contra um PostgreSQL real | `src/lib/supabase/rls.test.ts` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Camada de dados que isola as telas da fonte, e script de semeadura | `src/lib/dados/`, `scripts/semear.ts` | pendente |
| 15/08/2026 | s2 | Claude (Anthropic) | Remoção do Supabase do runtime, preservando o schema como evidência (ADR-011 e ADR-012) | `src/`, `docs/banco.md` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Trava do avanço de fase na sessão de admin e remoção do link do painel (ADR-015) | `src/app/api/sistema/ciclo/`, `src/app/sistema/cam/`, `src/components/base/rodape.tsx` | pendente |
| 17/08/2026 | s2 | Claude (Anthropic) | Modo claro por cookie pintado no servidor, paleta clara com contraste AA verificado, e correção do token de acento das caixas de seleção (ADR-027) | `src/app/globals.css`, `src/lib/tema.ts`, `src/components/base/botao-tema.tsx`, `src/lib/contraste.test.ts` | pendente |
| 17/08/2026 | s2 | Claude (Anthropic) | Passada de linguagem simples no site e no sistema: etapas explicadas, memória de cálculo com modo de leitura, tutoriais reescritos, selo de rascunho retirado da tela (ADR-026) | `src/lib/features.ts`, `src/content/tutoriais.ts`, `src/components/sistema/`, `src/app/page.tsx` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Auditoria do repositório contra os dois PDFs da disciplina, que encontrou a lente de Nuvem faltando, e a lente escrita em seguida (ADR-025) | `src/content/auditoria.ts`, `docs/nuvem.md`, `src/content/ciclos/s5.tsx`, `src/content/ciclos/s12.tsx` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Tutorial guiado que conduz dentro do sistema, com destaque do alvo de cada passo, e seletor de perfil que troca ao escolher (ADR-024) | `src/components/sistema/tour.tsx`, `src/components/sistema/seletor-perfil.tsx`, `src/content/tutoriais.ts` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Gerador do dossiê em texto puro, que renderiza os documentos de entrega a partir do próprio código | `scripts/dossie.ts`, `DOSSIE.txt` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Sistema numa página só com sanfonas, sumário fixo com ícones, perfis de acesso aplicados de verdade nas oito telas, tutorial por papel e explicação dos quatro perfis (ADR-023) | `src/app/sistema/`, `src/components/sistema/`, `src/lib/sistema.ts`, `src/content/tutoriais.ts` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Lente de ML: gerador sintético, três famílias de modelo com linha de base, seis cadernos e export auditável (ADR-022) | `ml/`, `src/lib/ml.ts`, `src/app/sistema/analytics/` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Lente de Direito trazida para dentro do site: base legal, mapeamento de dados, Privacy by Design e direitos do art. 18 | `src/content/ciclos/sr1.tsx`, `src/content/ciclos/s12.tsx` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Planejamento das semanas 5 a 12, SR1 e SR2 escrito como rascunho declarado, com feedback vazio por princípio (ADR-020) | `src/content/ciclos/` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Data simulada global na vitrine e correção do `ehSemanaCorrente` que a simulação de 2027 revelou (ADR-021) | `src/lib/releases.ts`, `src/lib/visao.ts` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Janela de vitrine com prazo de expiração (ADR-021) | `src/lib/releases.ts`, `src/lib/visao.ts` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Documentos de entrega (SWOT, personas, mapa de empatia, backlog) renderizados dentro do site em sanfona, com âncoras verificadas por teste (ADR-019) | `src/content/ciclos/`, `src/lib/registro/tipos.ts`, `src/components/registro/registro-semana.tsx` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Reordenação da página (equipe → pergunta → problema → registro), botão de volta no sistema e marcação de todos os blocos como validados | `src/app/page.tsx`, `src/content/ciclos/`, `src/app/sistema/layout.tsx` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Unificação do site numa página só, com o registro semanal em sanfona `<details>` (ADR-018) | `src/app/page.tsx`, `src/components/registro/registro-semana.tsx` | pendente |
| 16/08/2026 | s2 | Claude (Anthropic) | Implementação da identidade "folha de especificação" a partir de direção de arte escrita pela equipe: tokens, tipografia, blocos de borda colapsada, fluxo vertical e conferência de contraste (ADR-016 e ADR-017) | `src/app/globals.css`, `src/components/base/`, `src/app/page.tsx` | pendente |
| 23/08/2026 | s3 | Claude (Anthropic) | Diagnóstico das falhas de CI a partir dos logs do Actions e correção das duas causas: fontes passam a ser arquivo versionado lido por `next/font/local` (ADR-028) e testes de ponta a ponta deixam de embutir data e id de ciclo (ADR-029) | `src/app/layout.tsx`, `src/fontes/`, `src/lib/fontes.test.ts`, `e2e/cronograma.ts`, `e2e/*.spec.ts`, `src/lib/cronograma.test.ts` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Guia do projeto em linguagem simples para alinhamento da equipe, escrito a partir do conteúdo já versionado | `PROJETO-EXPLICADO.txt` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Link da vitrine pessoal: visão completa por URL com chave, cookie assinado, faixa própria e análise de superfície de ataque (ADR-030) | `src/lib/vitrine-pessoal.ts`, `src/app/vitrine/`, `src/lib/visao.ts`, `src/components/base/faixa-admin.tsx`, `docs/seguranca.md`, `docs/releases.md` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Pele própria do /sistema: sans do aparelho, cartões arredondados, ícones nos painéis e oito pares novos de contraste testados (ADR-031) | `src/app/globals.css`, `src/app/sistema/`, `src/components/sistema/`, `src/lib/contraste.test.ts` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Página /arquitetura: C4 explicado em linguagem simples, os três desenhos na identidade do site e o prompt de regeneração embutido (ADR-032) | `src/app/arquitetura/page.tsx`, `src/components/base/rodape.tsx`, `scripts/verificar-vazamento.ts` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Página de arquitetura na pele do sistema com diagrama de classes e porta na home; e a correção do CSS sem camada que engolia utilidade de borda no site inteiro (ADR-032 adendo e ADR-033) | `src/components/arquitetura.tsx`, `src/app/arquitetura/`, `src/app/page.tsx`, `src/app/globals.css` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Diagramas C4 de contexto e contêineres redesenhados como SVG espacial no servidor, na gramática clássica da notação (ADR-032, segundo adendo) | `src/components/arquitetura-c4.tsx`, `src/components/arquitetura.tsx` | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Remodelagem do domínio pós-reunião com o cliente (ADR-034): subindicadores, tipos de unidade, rede por distrito, janela de revisão, os 4 papéis do cliente nas 8 telas, ata na s3 e replanejamento da s4; a ata em PDF foi resumida pela IA e conferida contra o original | `src/lib/calculo/`, `src/lib/seed/`, `src/lib/dados/`, `src/lib/features.ts`, `src/components/sistema/`, `src/content/ciclos/s3.tsx`, `src/content/ciclos/s4.tsx`, docs | pendente |
| 25/08/2026 | s3 | Claude (Anthropic) | Revisão adversarial da remodelagem (36 agentes em 4 lentes): 25 achados confirmados e corrigidos, entre eles a faixa escolhida sobre o atingimento bruto na fronteira, a cronologia impossível da trilha do seed, o perfil fixo na trilha de lançamento e a contestação fora da trilha | `src/lib/calculo/motor.ts`, `src/lib/sistema/estado.ts`, `src/lib/sistema/contestacoes.ts`, rotas de API, seed, conteúdo e docs | pendente |

## O que a IA **não** fez

- Não decidiu o escopo, os papéis da equipe nem a priorização do backlog.
- Não teve acesso à portaria, a dados de servidores ou a qualquer base da SESAU.
- Não substituiu a validação com o cliente prevista para a Semana 11.
- Não assinou nenhuma entrega: toda linha desta tabela precisa de um nome na última coluna.
