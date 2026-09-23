# Classificação de objetos astronômicos: o problema e o dataset

Documento das etapas 1 e 2. A EDA, o pré-processamento e o feature engineering (etapas 2 a 5)
estão no notebook `stellarClasses.ipynb`, com o código, os gráficos e a justificativa de cada
decisão.

## 1. O problema

### Contextualização

Levantamentos do céu como o Sloan Digital Sky Survey (SDSS) observam milhões de objetos. Cada
um é medido pelo brilho em cinco filtros de cor (u, g, r, i, z) e pelo redshift. Saber com
certeza se o objeto é uma estrela, uma galáxia ou um quasar exige o espectro completo, que é caro
e lento de obter. A pergunta é se essas medidas mais simples bastam para classificar o objeto.

### Objetivo

Construir um modelo que classifique cada objeto como galáxia (`GALAXY`), quasar (`QSO`) ou
estrela (`STAR`). As entradas são a posição no céu, as magnitudes nos cinco filtros, o
redshift, o tipo espectral e a população de cor.

### O que se pretende prever

Classificação multiclasse, com três classes mutuamente exclusivas.

### Target

`class`, com os valores `GALAXY`, `QSO` e `STAR`. O treino tem o target; o teste não tem, e a
previsão sobre ele gera os arquivos de submissão (`id`, `class`).

### Como os resultados podem ser usados

- **Triagem para espectroscopia.** O tempo de telescópio é limitado. O modelo aponta os objetos
  com maior probabilidade de serem quasares, que são raros e mais valiosos para estudo.
- **Catálogos em larga escala.** Classificar milhões de objetos sem esperar pelo espectro de
  cada um.
- **Revisão dirigida.** Objetos com a probabilidade dividida entre duas classes vão para
  conferência humana, e o resto segue automático.
- **Métrica alinhada ao uso.** Como as classes são desbalanceadas e errar a classe rara custa
  mais, o modelo é avaliado por balanced accuracy, que dá o mesmo peso ao acerto de cada classe.

## 2. O dataset

### Origem

Dois arquivos CSV, lidos em `data/`:

- `train.csv`: tem o target e é usado para treinar e validar.
- `test.csv`: não tem o target e é usado para gerar a submissão.

As colunas são as do conjunto de classificação estelar do SDSS (DR17), mais duas categóricas,
`spectral_type` e `galaxy_population`.

### Quantidade de registros e atributos

| Arquivo | Registros | Colunas |
| --- | --- | --- |
| `train.csv` | 577.347 | 12: `id`, 10 atributos e `class` |
| `test.csv` | 247.435 | 11: `id` e 10 atributos |

### Descrição das features, tipo e natureza

| Coluna | Tipo | Natureza | O que mede |
| --- | --- | --- | --- |
| `id` | int | identificador | número da linha, sem informação sobre a classe; sai dos atributos |
| `alpha` | float | numérica contínua | ascensão reta: posição no céu, em graus (0 a 360) |
| `delta` | float | numérica contínua | declinação: posição no céu, em graus (-90 a 90) |
| `u` | float | numérica contínua | magnitude no filtro ultravioleta |
| `g` | float | numérica contínua | magnitude no filtro verde |
| `r` | float | numérica contínua | magnitude no filtro vermelho |
| `i` | float | numérica contínua | magnitude no filtro infravermelho próximo |
| `z` | float | numérica contínua | magnitude no filtro infravermelho |
| `redshift` | float | numérica contínua | desvio para o vermelho: quanto a luz se esticou com o afastamento do objeto |
| `spectral_type` | texto | categórica nominal | tipo espectral: `O/B`, `A/F`, `G/K` ou `M` |
| `galaxy_population` | texto | categórica nominal | população de cor: `Blue_Cloud` ou `Red_Sequence` |
| `class` | texto | categórica nominal (target) | `GALAXY`, `QSO` ou `STAR` |

Magnitude é uma escala invertida: quanto menor o número, mais brilhante o objeto.

**Resumo:** 8 variáveis numéricas contínuas, 2 categóricas nominais e o target categórico. Não
há nenhum valor faltante nem linha duplicada, em nenhuma das bases.

### Distribuição das classes

| Classe | Registros | % |
| --- | --- | --- |
| GALAXY | 377.480 | 65,4% |
| QSO | 117.143 | 20,3% |
| STAR | 82.724 | 14,3% |

As classes são desbalanceadas. Um modelo que chutasse sempre `GALAXY` teria 65% de acurácia,
mas só 33% de balanced accuracy. Por isso a separação entre treino e validação é estratificada,
e a métrica é a balanced accuracy.
