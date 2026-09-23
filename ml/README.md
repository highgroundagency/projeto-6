# Lente de machine learning

Os modelos vivem aqui, fora do app. Treino é offline; o site lê o resultado.

## Rodar

```bash
pip install pandas scikit-learn matplotlib seaborn xgboost lightgbm catboost jupyter
```

Abra `ml/notebooks/` e rode os cadernos **em ordem**. Todo o código está dentro deles.

| Caderno | Faz | Escreve |
| --- | --- | --- |
| `01-eda` | Exploração da planilha: distribuições, assimetria, correlação, classes do alvo | nada |
| `02-preprocessamento` | Conversão de tipos, ausentes, duplicados, outliers, feature engineering e encoding | `ml/saidas/unidades.csv` e `ml/saidas/unidades_features.csv` |
| `03-classificacao` | XGBoost, LightGBM, CatBoost e stacking, com grid search, para prever se a unidade fica abaixo de 90% | `ml/saidas/classificacao.json` |
| `04-regressao` | XGBoost com grid search para prever o resultado geral | `ml/saidas/regressao.json` |
| `05-clustering` | K-Means sobre as unidades | `ml/saidas/clustering.json` |
| `06-conclusoes` | Matriz de confusão, resultados finais e exportação para o app | `src/content/ml/resultados.json` |
| `07-numeros-da-apresentacao` | Nenhuma análise nova: repete as contas de 01 e 02 e grava os números que os slides da AV1 desenham em `/ml` | `src/content/ml/apresentacao.json` |

`ml/saidas/` é gerada e fica fora do Git. O que é versionado é o resultado final, porque é
ele que a tela de analytics lê.

O problema e o dataset (etapas 1 e 2) estão descritos em [`documento-problema-e-dados.md`](documento-problema-e-dados.md).
Os slides da AV1 moram na rota `/ml` do site, com o roteiro em [`docs/ml-av1.md`](../docs/ml-av1.md):
se mudar a análise em 01 ou 02, rode o 07 de novo, porque `src/content/apresentacao-ml.test.ts`
confere os números dos slides contra o que 01 e 02 imprimiram.

## Dados

`ml/data/base nova completa.csv`: uma linha por unidade de saúde (tipo e distrito), com
lançamentos, metas e notas de cada indicador da Portaria Conjunta nº 001/2024. Não tem nome,
CPF, matrícula nem nenhum dado de pessoa. As 48 linhas `DS` são de distrito, avaliado com
outra régua, e ficam fora dos modelos. Seis linhas de NDI e SAE que não seguem os pesos da
portaria também saem.

## Observações

- Todo modelo é comparado com uma referência simples (classe mais comum, média do treino).
- O resultado geral é uma soma ponderada das notas dos indicadores, então as métricas da
  classificação e da regressão são altas. Os modelos servem para mostrar quais indicadores
  mais pesam, não para substituir o cálculo.
- Nenhuma saída daqui entra no cálculo da gratificação. O clustering agrupa **unidades**,
  nunca pessoas.
