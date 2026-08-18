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

## O que a IA **não** fez

- Não decidiu o escopo, os papéis da equipe nem a priorização do backlog.
- Não teve acesso à portaria, a dados de servidores ou a qualquer base da SESAU.
- Não substituiu a validação com o cliente prevista para a Semana 11.
- Não assinou nenhuma entrega: toda linha desta tabela precisa de um nome na última coluna.
