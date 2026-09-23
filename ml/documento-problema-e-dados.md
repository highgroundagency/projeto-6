# Lente de ML: o problema e o dataset

Documento das etapas 1 e 2. As etapas 2 a 5 (EDA, pré-processamento e feature engineering)
estão nos cadernos `notebooks/01-eda.ipynb` e `notebooks/02-preprocessamento.ipynb`, com o
código, os gráficos e a justificativa de cada decisão.

## 1. O problema

### Contextualização

A Secretaria de Saúde do Recife (SESAU) paga uma gratificação por desempenho às equipes das
unidades de saúde. A régua está na Portaria Conjunta nº 001/2024: cada unidade recebe uma nota
em quatro indicadores, e o resultado geral é a soma ponderada dessas notas.

| Indicador | O que mede | Peso |
| --- | --- | --- |
| 1 | medicamentos e MMH | 20% |
| 2 | gestão do trabalho | 20% |
| 3 | satisfação do usuário | 20% |
| 4 | desempenho da unidade | 40% |

Cada indicador é formado por subindicadores, e cada subindicador compara o que a unidade fez
(quantidade atendida sobre total avaliado, ou um valor informado) com uma meta. Hoje essa conta
é feita à mão, numa planilha, e é difícil de conferir. O Prumo, sistema do projeto, refaz a
conta a partir da regra. A lente de ML olha a mesma planilha por outro ângulo: o que ela diz
sobre as unidades.

### Objetivo

Descobrir, a partir dos lançamentos da planilha, **quais indicadores mais pesam para uma
unidade ficar abaixo de 90%** no resultado geral, e quais unidades se parecem entre si. O
modelo não substitui o cálculo da portaria. Ele mostra onde olhar.

### O que se pretende prever, classificar e agrupar

| Tarefa | Pergunta | Caderno |
| --- | --- | --- |
| Classificação | A unidade fica abaixo de 90% no resultado geral? | `03-classificacao` |
| Regressão | Qual resultado geral esperar a partir das notas dos indicadores? | `04-regressao` |
| Agrupamento | Quais unidades têm desempenho parecido nos quatro indicadores? | `05-clustering` |

### Target

- **Classificação:** `abaixo_90`, que vale 1 quando o resultado geral é menor que 0,90 e 0
  quando não é. O corte de 90% separa os dois patamares em que a maior parte das USF se
  concentra, perto de 0,90 e de 0,95.
- **Regressão:** `geral`, o resultado geral da unidade, vindo da coluna `Desempenho geral`.
- **Agrupamento:** não tem target.

### Como os resultados podem ser usados

- **Priorizar acompanhamento.** A gestão pode olhar primeiro para as unidades com risco de
  ficar abaixo de 90%, antes de fechar o mês.
- **Mostrar o que move o resultado.** A importância das features diz em qual indicador uma
  melhora rende mais. Na base atual, a regressão aponta o indicador 3 e a classificação aponta
  o indicador 1 e a dispersão entre os indicadores.
- **Achar erro de planilha.** A limpeza encontrou seis linhas (NDI e SAE) em que o resultado
  não segue os pesos da portaria. Comparar o esperado pela regra com o lançado é um uso direto.
- **Acompanhar grupos de unidades.** O agrupamento junta unidades de perfil parecido, e isso
  ajuda a comparar cada unidade com as semelhantes a ela.

**Limite:** o resultado geral é uma soma ponderada das mesmas notas que entram nos modelos, por
isso as métricas são altas. Nenhum resultado dos modelos entra no cálculo da gratificação. O
agrupamento é de unidades, nunca de pessoas.

## 2. O dataset

### Origem

`ml/data/base nova completa.csv`: a planilha de desempenho por unidade fornecida pela SESAU,
lida com codificação `cp1252`. Ela tem uma linha por unidade (tipo e distrito sanitário), com os
lançamentos, as metas e as notas de cada indicador da portaria. Não tem nome, CPF, matrícula nem
nenhum dado de pessoa.

### Registros e atributos

- **244 linhas e 260 colunas.**
- 196 linhas são unidades de saúde. As outras 48 são do próprio distrito sanitário (tipo `DS`),
  avaliado com outra versão dos indicadores, e saem da modelagem.
- 6 linhas de NDI e SAE saem porque o resultado geral delas não segue os pesos da portaria.
- **Base modelada: 190 unidades.**

### Tipos de variável

Na leitura crua, o pandas encontra 201 colunas `object`, 48 `int64` e 11 `float64`. A maioria das
colunas `object` é número guardado como texto, com `%` e vírgula de milhar. Depois da conversão
ficam:

- **2 categóricas**, ambas nominais:
  - `Tipo de unidade`: 20 valores, entre eles USF 1 a 8, MAC 1 a 4, UBT, UBT MISTA, CAPS,
    UCIS, CECO, NDI, SAE e DS.
  - `Distrito Sanitário`: 8 valores, de I a VIII.
- **258 numéricas contínuas** (`float`).

### Descrição das features

As colunas numéricas seguem um padrão de nome, `<papel> — <indicador ou subindicador>`. O papel
diz o que a coluna guarda.

| Papel | Colunas | O que guarda |
| --- | --- | --- |
| Meta | 67 | meta fixada pela portaria para o subindicador |
| Desempenho | 60 | nota do subindicador |
| Quantidade atendida | 40 | numerador: casos que cumpriram o critério |
| Total avaliado | 38 | denominador: casos avaliados no período |
| Valor informado | 28 | valor bruto lançado pela unidade |
| Desempenho consolidado | 24 | nota do indicador ou do bloco. As quatro últimas colunas são os pontos (nota vezes peso) |
| Desempenho geral | 1 | resultado final da unidade: o target |

Problemas encontrados na planilha:

- **96 colunas são constantes** nas unidades, a maioria de metas, e não informam nada ao
  modelo.
- **49 colunas misturam fração e percentual**, como `0.8` e `80%`.
- **Quatro metas estão escritas de dois jeitos**, como `20` e `2000%`.
- **As linhas de distrito usam vírgula de milhar.**
- **O indicador 4 vem multiplicado pelo peso (40%)** e precisa ser dividido por 0,4 para virar
  nota.

A tabela modelada fica com as colunas abaixo. O caderno 2 acrescenta as features criadas e as
categóricas codificadas.

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `tipo` | categórica nominal | tipo de unidade, com 17 valores nas 190 unidades |
| `familia` | categórica nominal | primeira palavra do tipo: USF, MAC, UBT, CAPS, UCIS, CECO |
| `distrito` | categórica nominal | distrito sanitário, de I a VIII |
| `ind1` a `ind4` | numérica contínua | nota de cada indicador |
| `geral` | numérica contínua | resultado geral: target da regressão |
| `abaixo_90` | binária | resultado geral menor que 0,90: target da classificação |

### Distribuição das classes

| Classe | Unidades (de 190) | % |
| --- | --- | --- |
| 90% ou mais (0) | 101 | 53,2% |
| abaixo de 90% (1) | 89 | 46,8% |

As classes estão quase equilibradas. Mesmo assim, o caderno 3 usa separação estratificada, peso
de classe nos modelos e F1 como métrica do grid search.
