# Validação

## O que já é validado automaticamente

| Camada | Como | Onde |
| --- | --- | --- |
| Aritmética de datas no fuso do projeto | Vitest com instantes fixos | `src/lib/datas.test.ts` |
| Cronograma | Vitest: 18 ciclos, ordem, espaçamento de 7 dias, todos no sábado | `src/lib/cronograma.test.ts` |
| Motor de releases | Vitest: fronteiras, adiantamento, override, travas | `src/lib/releases.test.ts` |
| Config store | Vitest: drivers, env inválida, log de mudanças | `src/lib/config/config.test.ts` |
| Sessão do admin | Vitest: assinatura, adulteração, expiração, rate limit | `src/lib/admin/admin.test.ts` |
| Completude do registro | Vitest: blocos vazios, links, responsáveis, semana vencida sem registro | `src/lib/registro/registro.test.ts` |
| Motor de cálculo | Vitest: faixas-limite, arredondamento, `menor_melhor`, sem lançamento, troca de regra | `src/lib/calculo/motor.test.ts` |
| Base sintética | Vitest: reprodutibilidade, integridade referencial, ausência de dado pessoal | `src/lib/seed/seed.test.ts` |
| Não-vazamento de release futuro | Script sobre o build de produção | `scripts/verificar-vazamento.ts` |
| Jornadas críticas | Playwright | `e2e/` |
| Tipagem do conteúdo | `tsc --noEmit` quebra se um ciclo publicado estiver incompleto | CI |

Rodar tudo: `npm run verificar`.

## Validação com o cliente — Semana 11 (21/11)

### Roteiro de entrevista semiestruturada

**Perfil buscado:** integrante da CAM que opere a planilha hoje. Duração: 45 minutos.
Registro: anotação em tempo real e, se autorizado, gravação de áudio.

**Abertura (5 min)**
1. Explicar o objetivo, pedir autorização para registro e informar que nada será publicado
   com identificação.
2. Confirmar que o protótipo usa dados fictícios.

**Processo atual (10 min)**
3. Descreva o caminho de um número, do momento em que a área informa até o resultado do
   gestor.
4. Onde esse caminho costuma travar?
5. Já houve erro percebido depois do fechamento? O que aconteceu em seguida?
6. Quanto tempo o fechamento de um ciclo consome hoje?

**Demonstração guiada (15 min)** — o entrevistado usa, a equipe observa em silêncio.
7. Encontre o resultado de um gestor e diga de onde veio o score.
8. Explique, olhando a tela, por que este indicador pontuou o que pontuou.
9. Um valor foi digitado errado. Encontre e corrija.
10. Este ciclo precisa ser homologado. Faça isso.

**Reação (10 min)**
11. O que aqui resolve um problema que você tem hoje?
12. O que aqui atrapalharia sua rotina?
13. O que falta para você conseguir usar isso num ciclo real?
14. Se a portaria mudar em janeiro, o que você faria neste sistema?

**Fechamento (5 min)**
15. Se pudesse mudar uma única coisa, qual seria?
16. Podemos voltar com uma versão ajustada?

**Regra de condução:** não defender o produto durante a demonstração. Se o entrevistado
travar, anotar onde travou e só depois explicar.

### Questionário

Aplicado logo após a entrevista.

**Parte 1 — SUS (System Usability Scale).** Dez afirmações, escala de 1 (discordo
totalmente) a 5 (concordo totalmente):

1. Eu usaria este sistema com frequência.
2. O sistema é desnecessariamente complexo.
3. O sistema é fácil de usar.
4. Eu precisaria de apoio técnico para usar este sistema.
5. As funções do sistema estão bem integradas.
6. Há inconsistência demais neste sistema.
7. A maioria das pessoas aprenderia a usar este sistema rapidamente.
8. O sistema é desajeitado de usar.
9. Eu me senti confiante usando o sistema.
10. Precisei aprender muita coisa antes de conseguir usar o sistema.

*Cálculo:* ímpares → (nota − 1); pares → (5 − nota); soma × 2,5. Referência usual: 68 é a
média; abaixo de 50 é sinal de problema sério.

**Parte 2 — específicas do domínio.** Mesma escala de 1 a 5:

11. Consigo explicar a outra pessoa de onde veio um resultado usando a memória de cálculo.
12. Confio mais neste cálculo do que na planilha atual.
13. A trilha de auditoria me daria segurança em caso de questionamento.
14. Conseguiria cadastrar uma nova regra sozinho quando a portaria mudar.
15. O tempo de fechamento de um ciclo cairia com este sistema.
16. O gestor avaliado entenderia o próprio resultado sem precisar me perguntar.

**Parte 3 — abertas.**

17. O que mais te ajudou?
18. O que mais te atrapalhou?
19. O que faltou?

### Template de análise

Para cada participante, registrar:

| Campo | Conteúdo |
| --- | --- |
| Identificação | Código (P1, P2…), papel, tempo de experiência com o processo |
| Tarefas concluídas | Quais das quatro tarefas foram concluídas sem ajuda |
| Tempo por tarefa | Em segundos, do enunciado à conclusão |
| Pontos de travamento | Tela, ação tentada, o que a pessoa esperava |
| SUS | Pontuação calculada |
| Específicas | Média por afirmação |
| Citações | Frases textuais que sintetizam a reação |

**Consolidação da equipe:**

1. Agrupar travamentos por tela e contar frequência.
2. Classificar cada achado em: **corrigir agora** (impede a tarefa), **corrigir depois**
   (atrapalha mas não impede), **não corrigir** (fora do escopo — registrar o porquê).
3. Todo achado "corrigir agora" vira história no backlog com link para esta análise.
4. O que foi ajustado depois da validação entra no registro da Semana 11, no bloco
   *Feedback recebido*, com a decisão correspondente.

### Critérios de sucesso definidos antes de coletar

Fixados agora para não serem convenientemente reinterpretados depois:

- **SUS ≥ 68** — usabilidade na média ou acima.
- **Tarefa 7 (explicar de onde veio o score) concluída sem ajuda por todos os
  participantes.** É a tese do projeto; falhar aqui é falhar no essencial.
- **Nenhum travamento crítico** que impeça o fechamento de um ciclo.
- **Afirmação 12 (confiança) ≥ 4** na média.

Resultado abaixo do critério não vira desculpa: vira item no plano de correção de rota,
registrado na Semana 11 e revisitado no SR2 em "planejado × realizado".
