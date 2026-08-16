# Lente de machine learning

Os modelos vivem aqui, fora do app. Treino é offline; o site lê o resultado.

## Rodar

```bash
pip install numpy pandas scikit-learn
python ml/gerador.py     # escreve ml/dados/lancamentos.csv
python ml/exportar.py    # treina, avalia e escreve src/content/ml/resultados.json
```

Os dois comandos são determinísticos: mesma semente, mesmos números. É isso que
torna a tela de analytics auditável — quem duvidar de um número roda e confere.

## O que tem aqui

| Arquivo | Para quê |
| --- | --- |
| `gerador.py` | Base sintética, espelhando `src/lib/seed/` do app: 10 áreas, 30 indicadores, 6 competências |
| `modelos.py` | Classificação, regressão e clustering, com linha de base ao lado de cada um |
| `exportar.py` | Empacota os resultados em JSON com semente, commit e versão do sklearn |
| `notebooks/` | Os seis cadernos da disciplina: EDA, pré-processamento, os três modelos e as conclusões |

## Três decisões que valem ser lidas

**A separação treino/teste é temporal, não aleatória.** Sortear linhas deixaria
o modelo ver competências futuras do mesmo indicador — o erro clássico de
vazamento em série temporal. As cinco primeiras competências treinam, a última
testa.

**Todo modelo é publicado com a linha de base.** Acurácia sem referência engana:
num alvo desbalanceado, chutar a classe majoritária já acerta a maioria. O
classificador de "vai bater a meta" **não supera** o palpite majoritário nesta
base, e isso está publicado na tela em vez de escondido — o caderno 03 explica
que a pergunta é mal posta, não o modelo que é ruim.

**Nenhuma saída daqui entra no cálculo da gratificação.** A regra da portaria é
determinística e continua sendo. O modelo informa onde olhar; ele não decide
quanto alguém recebe. E o clustering agrupa **áreas**, nunca pessoas.

## Dados

Nada aqui é real. `gerador.py` produz tudo com semente fixa (20262), e o
vocabulário é verossímil no domínio da saúde pública sem que nenhum número, meta
ou pessoa venha da SESAU. Quando houver dado real, com base legal para tratá-lo,
os modelos precisam ser reavaliados do zero.
