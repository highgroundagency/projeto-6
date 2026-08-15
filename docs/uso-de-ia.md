# Uso de IA neste projeto

Uso de IA nesta equipe segue o contrato da disciplina: **gerado ≠ entregue**. Tudo o que
uma ferramenta produz passa por validação humana antes de virar entrega, e o uso é
declarado nos marcos.

Regras que a equipe adotou:

1. Nenhum dado real de pessoa ou da SESAU entra em prompt — nem para "testar".
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
| 15/08/2026 | s2 | Claude (Anthropic) | Gerador de dados sintéticos com semente fixa para o seed do sistema | `scripts/gerar-seed.ts` | pendente |

## O que a IA **não** fez

- Não decidiu o escopo, os papéis da equipe nem a priorização do backlog.
- Não teve acesso à portaria, a dados de servidores ou a qualquer base da SESAU.
- Não substituiu a validação com o cliente prevista para a Semana 11.
- Não assinou nenhuma entrega: toda linha desta tabela precisa de um nome na última coluna.
