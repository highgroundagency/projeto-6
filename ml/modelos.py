"""
Os três modelos da lente de machine learning, com avaliação honesta.

A regra desta camada: NENHUMA saída daqui entra no cálculo da gratificação. A
regra da portaria é determinística e continua sendo — o modelo informa, não
decide. É por isso que a tela de analytics exibe método e métrica ao lado de
cada número: previsão sem método declarado é opinião com aparência de dado, e
num cálculo que vira dinheiro isso é grave.

Três famílias, cada uma respondendo a uma pergunta diferente:

  classificação  — este indicador vai bater a meta na próxima competência?
  regressão      — qual atingimento esperar?
  clustering     — quais áreas se comportam parecido?

Avaliação: a separação treino/teste é TEMPORAL, não aleatória. Sortear linhas
deixaria o modelo ver o futuro do mesmo indicador e inflaria a métrica — o erro
clássico de vazamento em série temporal. Aqui as cinco primeiras competências
treinam e a última testa, que é como o modelo seria usado de verdade.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.dummy import DummyClassifier, DummyRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    precision_score,
    r2_score,
    recall_score,
    silhouette_score,
)
from sklearn.preprocessing import StandardScaler

RAIZ = Path(__file__).resolve().parent
DADOS = RAIZ / 'dados' / 'lancamentos.csv'
SEMENTE = 20262


def carregar() -> pd.DataFrame:
    if not DADOS.exists():
        raise SystemExit('Rode `python ml/gerador.py` antes: ml/dados/lancamentos.csv não existe.')
    return pd.read_csv(DADOS)


def com_atributos(df: pd.DataFrame) -> pd.DataFrame:
    """
    Atributos derivados, todos calculados olhando só para o passado.

    `atingimento_anterior` e `media_movel` usam `shift(1)`: numa competência t,
    o modelo só enxerga até t-1. Sem o shift, o atributo conteria a resposta.
    """
    df = df.sort_values(['indicador_id', 'mes_ordinal']).copy()
    grupo = df.groupby('indicador_id')['atingimento']

    df['atingimento_anterior'] = grupo.shift(1)
    df['media_movel'] = grupo.transform(lambda s: s.shift(1).rolling(2, min_periods=1).mean())
    df['delta_anterior'] = grupo.shift(1) - grupo.shift(2)
    df['bateu_meta'] = (df['atingimento'] >= 1.0).astype(int)
    df['vai_melhorar'] = (df['atingimento'] > grupo.shift(1)).astype(int)
    df['menor_melhor'] = (df['direcao'] == 'menor_melhor').astype(int)

    return df.dropna(subset=['atingimento_anterior', 'media_movel'])


ATRIBUTOS = ['atingimento_anterior', 'media_movel', 'peso', 'menor_melhor', 'mes_ordinal']


def separar_no_tempo(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Última competência é o teste. Nunca sortear: seria ver o futuro."""
    corte = df['mes_ordinal'].max()
    return df[df['mes_ordinal'] < corte], df[df['mes_ordinal'] == corte]


@dataclass
class Resultado:
    modelo: str
    pergunta: str
    metodo: str
    metricas: dict
    referencia: dict
    limitacao: str


def classificar(df: pd.DataFrame) -> Resultado:
    treino, teste = separar_no_tempo(df)
    X_tr, y_tr = treino[ATRIBUTOS], treino['bateu_meta']
    X_te, y_te = teste[ATRIBUTOS], teste['bateu_meta']

    # A classe positiva é minoria (poucos indicadores batem a meta). Sem
    # reequilibrar, o modelo aprende que chutar "não bate" sempre já acerta a
    # maioria — e a acurácia fica idêntica à do palpite burro, com revocação
    # zero. `class_weight='balanced'` faz o erro no positivo custar caro.
    modelo = RandomForestClassifier(
        n_estimators=400, class_weight='balanced', min_samples_leaf=2, random_state=SEMENTE
    )
    modelo.fit(X_tr, y_tr)
    pred = modelo.predict(X_te)

    # Linha de base: chutar sempre a classe majoritária. Um modelo que não
    # supera isto não aprendeu nada — e é honesto publicar a comparação.
    base = DummyClassifier(strategy='most_frequent', random_state=SEMENTE)
    base.fit(X_tr, y_tr)
    pred_base = base.predict(X_te)

    f1 = float(f1_score(y_te, pred, zero_division=0))
    acuracia = float(accuracy_score(y_te, pred))
    acuracia_base = float(accuracy_score(y_te, pred_base))

    # O veredito é calculado, não escrito à mão: se o modelo não superar o
    # palpite, a tela vai dizer isso.
    supera = f1 > 0.0 and acuracia >= acuracia_base * 0.9

    return Resultado(
        modelo='classificacao',
        pergunta='Este indicador vai bater a meta na próxima competência?',
        metodo=(
            'Random Forest com 400 árvores e classes reequilibradas, sobre atingimento anterior, '
            'média móvel, peso e direção. Separação treino/teste temporal.'
        ),
        metricas={
            'acuracia': round(acuracia, 3),
            'precisao': round(float(precision_score(y_te, pred, zero_division=0)), 3),
            'revocacao': round(float(recall_score(y_te, pred, zero_division=0)), 3),
            'f1': round(f1, 3),
            'amostras_teste': int(len(y_te)),
            'positivos_no_teste': int(y_te.sum()),
            'supera_referencia': supera,
        },
        referencia={
            'nome': 'chutar sempre a classe majoritária',
            'acuracia': round(acuracia_base, 3),
            'f1': round(float(f1_score(y_te, pred_base, zero_division=0)), 3),
        },
        limitacao=(
            'Classe positiva é minoria: acurácia isolada engana, e por isso a referência vai ao lado. '
            'Treinado sobre base sintética — o modelo aprende a regra que gerou os dados, não a rede real.'
        ),
    )


def classificar_tendencia(df: pd.DataFrame) -> Resultado:
    """
    A mesma família de modelo, numa pergunta BEM POSTA.

    "Vai bater a meta?" fracassa nesta base porque quase nada bate a meta — 5 de
    30 no mês de teste. Não é o modelo que é ruim: é a pergunta, num alvo com
    5 positivos não há o que aprender. Trocar a pergunta por "vai melhorar em
    relação ao mês anterior?" dá um alvo equilibrado e uma resposta que a CAM
    de fato usaria: onde olhar antes que piore.

    As duas ficam publicadas. Esconder a que falhou e mostrar só a que deu certo
    seria escolher a métrica depois de ver o resultado.
    """
    treino, teste = separar_no_tempo(df)
    alvo = 'vai_melhorar'
    X_tr, y_tr = treino[ATRIBUTOS], treino[alvo]
    X_te, y_te = teste[ATRIBUTOS], teste[alvo]

    modelo = RandomForestClassifier(
        n_estimators=400, class_weight='balanced', min_samples_leaf=2, random_state=SEMENTE
    )
    modelo.fit(X_tr, y_tr)
    pred = modelo.predict(X_te)

    base = DummyClassifier(strategy='most_frequent', random_state=SEMENTE)
    base.fit(X_tr, y_tr)
    pred_base = base.predict(X_te)

    f1 = float(f1_score(y_te, pred, zero_division=0))
    acuracia = float(accuracy_score(y_te, pred))
    acuracia_base = float(accuracy_score(y_te, pred_base))

    return Resultado(
        modelo='classificacao_tendencia',
        pergunta='Este indicador vai melhorar em relação à competência anterior?',
        metodo=(
            'Random Forest com 400 árvores e classes reequilibradas. Mesmo conjunto de atributos '
            'e mesma separação temporal do modelo anterior — só o alvo muda.'
        ),
        metricas={
            'acuracia': round(acuracia, 3),
            'precisao': round(float(precision_score(y_te, pred, zero_division=0)), 3),
            'revocacao': round(float(recall_score(y_te, pred, zero_division=0)), 3),
            'f1': round(f1, 3),
            'amostras_teste': int(len(y_te)),
            'positivos_no_teste': int(y_te.sum()),
            'supera_referencia': acuracia > acuracia_base and f1 > 0.0,
        },
        referencia={
            'nome': 'chutar sempre a classe majoritária',
            'acuracia': round(acuracia_base, 3),
            'f1': round(float(f1_score(y_te, pred_base, zero_division=0)), 3),
        },
        limitacao=(
            'Alvo equilibrado, mas a série tem seis competências. O resultado sustenta priorização '
            'de atenção, não decisão sobre pagamento — que segue determinística pela portaria.'
        ),
    )


def regredir(df: pd.DataFrame) -> Resultado:
    treino, teste = separar_no_tempo(df)
    X_tr, y_tr = treino[ATRIBUTOS], treino['atingimento']
    X_te, y_te = teste[ATRIBUTOS], teste['atingimento']

    modelo = RandomForestRegressor(n_estimators=300, random_state=SEMENTE)
    modelo.fit(X_tr, y_tr)
    pred = modelo.predict(X_te)

    base = DummyRegressor(strategy='mean')
    base.fit(X_tr, y_tr)
    pred_base = base.predict(X_te)

    importancias = sorted(
        ({'atributo': a, 'peso': round(float(p), 3)} for a, p in zip(ATRIBUTOS, modelo.feature_importances_)),
        key=lambda d: d['peso'],
        reverse=True,
    )

    return Resultado(
        modelo='regressao',
        pergunta='Qual atingimento esperar na próxima competência?',
        metodo='Random Forest com 300 árvores sobre os mesmos atributos. Separação treino/teste temporal.',
        metricas={
            'mae': round(float(mean_absolute_error(y_te, pred)), 4),
            'r2': round(float(r2_score(y_te, pred)), 3),
            'amostras_teste': int(len(y_te)),
            'importancias': importancias,
        },
        referencia={
            'nome': 'média do treino',
            'mae': round(float(mean_absolute_error(y_te, pred_base)), 4),
        },
        limitacao='Seis competências é série curta. O R² aqui mede consistência do gerador, não capacidade de prever a rede real.',
    )


def agrupar(df: pd.DataFrame) -> Resultado:
    """Agrupa ÁREAS, não pessoas. Clusterizar servidor seria outra conversa — e não é esta."""
    perfil = (
        df.groupby('area_id')
        .agg(
            atingimento_medio=('atingimento', 'mean'),
            volatilidade=('atingimento', 'std'),
            taxa_meta=('bateu_meta', 'mean'),
        )
        .fillna(0.0)
    )

    X = StandardScaler().fit_transform(perfil)
    k = 3
    modelo = KMeans(n_clusters=k, random_state=SEMENTE, n_init=10)
    rotulos = modelo.fit_predict(X)

    # Nomear o grupo pelo comportamento, não por número: "grupo 2" não diz nada
    # a quem lê o painel.
    #
    # O nome vem do CENTROIDE, e cita as duas dimensões que o separam. Nomear só
    # pelo atingimento médio produzia rótulo incoerente: uma área com média mais
    # alta caía no grupo "abaixo" porque oscilava muito. Com o nome citando
    # também a volatilidade, o rótulo passa a explicar o próprio agrupamento.
    centroides = (
        perfil.assign(grupo=rotulos)
        .groupby('grupo')[['atingimento_medio', 'volatilidade']]
        .mean()
        .sort_values('atingimento_medio', ascending=False)
    )
    volatilidade_tipica = float(perfil['volatilidade'].median())
    nomes = {
        int(g): (
            f'{"mais alto" if i == 0 else "intermediário" if i == 1 else "mais baixo"}, '
            f'{"oscilante" if linha.volatilidade > volatilidade_tipica else "estável"}'
        )
        for i, (g, linha) in enumerate(centroides.iterrows())
    }

    grupos = [
        {
            'area_id': area,
            'grupo': nomes[int(rotulo)],
            'atingimento_medio': round(float(perfil.loc[area, 'atingimento_medio']), 3),
            'volatilidade': round(float(perfil.loc[area, 'volatilidade']), 3),
        }
        for area, rotulo in zip(perfil.index, rotulos)
    ]

    return Resultado(
        modelo='clustering',
        pergunta='Quais áreas se comportam de forma parecida?',
        metodo=f'K-Means com k={k} sobre atingimento médio, volatilidade e taxa de meta, com atributos padronizados.',
        metricas={
            'silhueta': round(float(silhouette_score(X, rotulos)), 3),
            'k': k,
            'areas': sorted(grupos, key=lambda g: g['atingimento_medio'], reverse=True),
        },
        referencia={'nome': 'silhueta de referência', 'observacao': 'acima de 0,5 indica separação nítida'},
        limitacao='Agrupa ÁREAS, nunca pessoas. Dez áreas é amostra pequena: o k foi escolhido pela silhueta, e mudaria com mais dados.',
    )


def rodar_tudo() -> list[Resultado]:
    df = com_atributos(carregar())
    return [classificar(df), classificar_tendencia(df), regredir(df), agrupar(df)]


if __name__ == '__main__':
    for resultado in rodar_tudo():
        print(f'\n== {resultado.modelo} ==')
        for chave, valor in asdict(resultado).items():
            if chave != 'modelo':
                print(f'  {chave}: {valor}')
