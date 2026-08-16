"""
Gerador da base sintética para a lente de machine learning.

REGRA QUE NÃO SE NEGOCIA: nenhum dado real de pessoa ou da SESAU entra aqui.
Áreas, indicadores, metas e lançamentos são fictícios, gerados com semente fixa.
O vocabulário é verossímil no domínio da saúde pública; os números, não são de
ninguém.

Este arquivo espelha `src/lib/seed/` do app — mesmas dez áreas, mesmos trinta
indicadores, mesma semente (20262). O objetivo é que o notebook e a tela do
sistema falem da mesma base, e não de duas bases parecidas.

Uso:
    python ml/gerador.py            # escreve ml/dados/lancamentos.csv
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

import numpy as np

SEMENTE = 20262
COMPETENCIAS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

RAIZ = Path(__file__).resolve().parent
SAIDA = RAIZ / 'dados'


@dataclass(frozen=True)
class Area:
    id: str
    sigla: str
    nome: str


@dataclass(frozen=True)
class Indicador:
    id: str
    area_id: str
    nome: str
    unidade: str
    direcao: str  # 'maior_melhor' | 'menor_melhor'
    meta: float
    peso: int
    desempenho_base: float
    volatilidade: float


AREAS: list[Area] = [
    Area('aps', 'APS', 'Atenção Primária à Saúde'),
    Area('vis', 'VIS', 'Vigilância em Saúde'),
    Area('reg', 'REG', 'Regulação e Controle'),
    Area('af', 'AF', 'Assistência Farmacêutica'),
    Area('sm', 'SM', 'Saúde Mental'),
    Area('urg', 'URG', 'Urgência e Emergência'),
    Area('sb', 'SB', 'Saúde Bucal'),
    Area('gp', 'GP', 'Gestão de Pessoas'),
    Area('plan', 'PLAN', 'Planejamento e Orçamento'),
    Area('ouv', 'OUV', 'Ouvidoria e Participação'),
]

# Três indicadores por área. `desempenho_base` é quão perto da meta a área
# costuma ficar; `volatilidade` é o quanto oscila de mês a mês. São esses dois
# números que dão ao dataset uma estrutura aprendível — e é por isso que o
# notebook 06 discute que aprender a regra do gerador não é aprender a realidade.
INDICADORES: list[Indicador] = [
    Indicador('aps-cobertura-esf', 'aps', 'Cobertura populacional da ESF', '%', 'maior_melhor', 85, 5, 0.94, 0.05),
    Indicador('aps-consultas-puericultura', 'aps', 'Consultas de puericultura por criança', 'consultas', 'maior_melhor', 6, 4, 0.88, 0.09),
    Indicador('aps-visitas-acs', 'aps', 'Visitas domiciliares por ACS', 'visitas', 'maior_melhor', 40, 3, 0.91, 0.07),
    Indicador('vis-notificacao-prazo', 'vis', 'Notificações no prazo', '%', 'maior_melhor', 90, 5, 0.86, 0.08),
    Indicador('vis-inspecoes', 'vis', 'Inspeções sanitárias realizadas', 'inspeções', 'maior_melhor', 120, 4, 0.82, 0.12),
    Indicador('vis-tempo-resposta', 'vis', 'Tempo de resposta a surto', 'horas', 'menor_melhor', 24, 4, 0.9, 0.1),
    Indicador('reg-fila-espera', 'reg', 'Tempo médio na fila de espera', 'dias', 'menor_melhor', 30, 5, 0.78, 0.14),
    Indicador('reg-taxa-absenteismo', 'reg', 'Absenteísmo em consultas agendadas', '%', 'menor_melhor', 12, 3, 0.85, 0.1),
    Indicador('reg-autorizacoes-prazo', 'reg', 'Autorizações no prazo', '%', 'maior_melhor', 95, 4, 0.92, 0.05),
    Indicador('af-desabastecimento', 'af', 'Itens em desabastecimento', 'itens', 'menor_melhor', 5, 5, 0.72, 0.18),
    Indicador('af-dispensacao-prazo', 'af', 'Dispensações no prazo', '%', 'maior_melhor', 92, 4, 0.89, 0.06),
    Indicador('af-perda-validade', 'af', 'Perda por validade', '%', 'menor_melhor', 2, 3, 0.8, 0.15),
    Indicador('sm-caps-acolhimento', 'sm', 'Acolhimentos no CAPS', 'acolhimentos', 'maior_melhor', 200, 4, 0.87, 0.09),
    Indicador('sm-vinculo-continuidade', 'sm', 'Continuidade de vínculo', '%', 'maior_melhor', 75, 5, 0.83, 0.1),
    Indicador('sm-tempo-primeiro-atendimento', 'sm', 'Tempo até primeiro atendimento', 'dias', 'menor_melhor', 15, 3, 0.79, 0.13),
    Indicador('urg-tempo-porta-medico', 'urg', 'Tempo porta-médico', 'minutos', 'menor_melhor', 30, 5, 0.75, 0.16),
    Indicador('urg-classificacao-risco', 'urg', 'Classificação de risco aplicada', '%', 'maior_melhor', 98, 4, 0.95, 0.04),
    Indicador('urg-taxa-evasao', 'urg', 'Evasão antes do atendimento', '%', 'menor_melhor', 5, 3, 0.81, 0.12),
    Indicador('sb-primeira-consulta', 'sb', 'Primeira consulta odontológica', '%', 'maior_melhor', 60, 4, 0.84, 0.09),
    Indicador('sb-escovacao-supervisionada', 'sb', 'Escovação supervisionada', '%', 'maior_melhor', 70, 3, 0.88, 0.08),
    Indicador('sb-exodontias', 'sb', 'Proporção de exodontias', '%', 'menor_melhor', 15, 3, 0.86, 0.09),
    Indicador('gp-absenteismo-servidor', 'gp', 'Absenteísmo do servidor', '%', 'menor_melhor', 4, 4, 0.88, 0.07),
    Indicador('gp-capacitacao', 'gp', 'Servidores capacitados no período', '%', 'maior_melhor', 50, 3, 0.8, 0.13),
    Indicador('gp-avaliacao-desempenho', 'gp', 'Avaliações de desempenho concluídas', '%', 'maior_melhor', 95, 4, 0.93, 0.05),
    Indicador('plan-execucao-orcamentaria', 'plan', 'Execução orçamentária', '%', 'maior_melhor', 90, 5, 0.9, 0.06),
    Indicador('plan-prestacao-contas', 'plan', 'Prestações de contas no prazo', '%', 'maior_melhor', 100, 4, 0.96, 0.03),
    Indicador('plan-restos-a-pagar', 'plan', 'Restos a pagar sobre empenhado', '%', 'menor_melhor', 10, 3, 0.77, 0.14),
    Indicador('ouv-resposta-prazo', 'ouv', 'Manifestações respondidas no prazo', '%', 'maior_melhor', 90, 5, 0.85, 0.09),
    Indicador('ouv-satisfacao', 'ouv', 'Satisfação com a resposta', '%', 'maior_melhor', 70, 4, 0.82, 0.1),
    Indicador('ouv-reincidencia', 'ouv', 'Reincidência de manifestação', '%', 'menor_melhor', 8, 3, 0.79, 0.12),
]


def atingimento(valor: float, meta: float, direcao: str, teto: float = 1.5) -> float:
    """
    Mesma conta do motor em TypeScript (`calcularAtingimento`).

    Para 'menor_melhor' a razão inverte: entregar menos que a meta é bom. O teto
    existe para que um mês excepcional não compense um ano ruim.
    """
    if meta == 0:
        return 0.0
    bruto = (meta / valor) if direcao == 'menor_melhor' and valor > 0 else (valor / meta)
    return float(min(bruto, teto))


def gerar(semente: int = SEMENTE) -> list[dict]:
    """Um lançamento por indicador por competência. Determinístico."""
    rng = np.random.default_rng(semente)
    linhas: list[dict] = []

    for indicador in INDICADORES:
        # Cada indicador tem uma tendência própria ao longo do semestre: algumas
        # áreas melhoram, outras pioram. Sem isso, regressão não teria sinal.
        tendencia = rng.normal(0.0, 0.012)

        for i, competencia in enumerate(COMPETENCIAS):
            fator = indicador.desempenho_base + tendencia * i
            fator += rng.normal(0.0, indicador.volatilidade)
            fator = float(np.clip(fator, 0.35, 1.35))

            if indicador.direcao == 'menor_melhor':
                valor = indicador.meta / fator if fator > 0 else indicador.meta * 3
            else:
                valor = indicador.meta * fator

            valor = round(float(valor), 2)
            area = next(a for a in AREAS if a.id == indicador.area_id)

            linhas.append(
                {
                    'competencia': competencia,
                    'mes_ordinal': i,
                    'area_id': area.id,
                    'area_sigla': area.sigla,
                    'indicador_id': indicador.id,
                    'unidade': indicador.unidade,
                    'direcao': indicador.direcao,
                    'meta': indicador.meta,
                    'peso': indicador.peso,
                    'valor': valor,
                    'atingimento': round(atingimento(valor, indicador.meta, indicador.direcao), 4),
                }
            )

    return linhas


def escrever_csv(linhas: list[dict], destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    with destino.open('w', newline='', encoding='utf-8') as arquivo:
        escritor = csv.DictWriter(arquivo, fieldnames=list(linhas[0].keys()))
        escritor.writeheader()
        escritor.writerows(linhas)


if __name__ == '__main__':
    linhas = gerar()
    destino = SAIDA / 'lancamentos.csv'
    escrever_csv(linhas, destino)
    print(f'{len(linhas)} lançamentos escritos em {destino.relative_to(RAIZ.parent)}')
    print(f'{len(AREAS)} áreas · {len(INDICADORES)} indicadores · {len(COMPETENCIAS)} competências')
