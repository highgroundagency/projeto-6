# Documentação

| Documento | Para quem | Conteúdo |
| --- | --- | --- |
| [`arquitetura.md`](arquitetura.md) | Banca e equipe técnica | Diagramas C4 (contexto e contêiner), fluxo de dados do cálculo e as decisões de infraestrutura com seus porquês |
| [`releases.md`](releases.md) | Equipe | Manual de operação: como o site decide o que o professor vê, como o painel funciona e onde a configuração é gravada em cada ambiente |
| [`seguranca.md`](seguranca.md) | Banca | STRIDE, OWASP Top 10, análise honesta do painel administrativo como superfície de ataque, e a distinção entre o RBAC escrito e o RBAC ligado |
| [`banco.md`](banco.md) | Equipe e banca | O schema PostgreSQL com RLS que existe no repositório mas não está ligado ao app: por que existe, o que contém e como usá-lo |
| [`nuvem.md`](nuvem.md) | Banca (lente de Arquitetura Nativa na Nuvem) | Onde cada componente executa, pipeline de dados, doze fatores, escala, trade-offs e o que falta para virar produção |
| [`privacidade.md`](privacidade.md) | Banca (lente de Direito) | Dados tratados em produção, base legal do art. 7º, III, Privacy by Design apontando o código, direitos dos titulares e retenção |
| [`decisoes.md`](decisoes.md) | Equipe e banca | ADRs de cinco linhas — o que foi decidido, por quê e o que se perdeu em troca |
| [`validacao.md`](validacao.md) | Equipe | O que já é testado automaticamente e os instrumentos da validação com o cliente na Semana 11 |
| [`uso-de-ia.md`](uso-de-ia.md) | Banca | Registro semanal de uso de IA: data, ferramenta, o que foi gerado, arquivos e quem validou |

O `uso-de-ia.md` também é renderizado em `/transparencia-ia`, junto do contrato da
disciplina: **gerado ≠ entregue**.

As regras de contribuição estão em [`../CLAUDE.md`](../CLAUDE.md).
