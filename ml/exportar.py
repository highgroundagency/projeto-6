"""
Exporta os resultados dos modelos para o app.

POR QUE JSON E NÃO INFERÊNCIA EM TEMPO REAL: o site é um MVP acadêmico servido
em serverless. Carregar scikit-learn a cada requisição custaria segundos de cold
start para exibir números que não mudam entre um deploy e outro. Treinar offline
e versionar o resultado deixa a tela instantânea e — o que importa mais — deixa o
número auditável: o JSON está no Git, com data e semente, e qualquer pessoa
reproduz rodando os mesmos dois comandos.

Uso:
    python ml/gerador.py && python ml/exportar.py
"""

from __future__ import annotations

import json
import subprocess
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

import sklearn

from modelos import SEMENTE, rodar_tudo

RAIZ = Path(__file__).resolve().parent
DESTINO = RAIZ.parent / 'src' / 'content' / 'ml' / 'resultados.json'


def commit_atual() -> str:
    try:
        saida = subprocess.run(
            ['git', 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True, cwd=RAIZ.parent, timeout=10,
        )
        return saida.stdout.strip() or 'desconhecido'
    except Exception:
        return 'desconhecido'


def main() -> None:
    resultados = rodar_tudo()

    pacote = {
        'gerado_em': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        'semente': SEMENTE,
        'commit': commit_atual(),
        'versao_sklearn': sklearn.__version__,
        # Declarado no próprio arquivo para que a tela nunca precise afirmar isso
        # por conta própria — a procedência viaja junto com o número.
        'base': 'sintética, gerada por ml/gerador.py com semente fixa',
        'aviso': 'Nenhum resultado desta lista entra no cálculo da gratificação.',
        'modelos': [asdict(r) for r in resultados],
    }

    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(pacote, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(f'{len(resultados)} modelos exportados para {DESTINO.relative_to(RAIZ.parent)}')
    for r in resultados:
        supera = r.metricas.get('supera_referencia')
        marca = '' if supera is None else ('  [supera a referência]' if supera else '  [NÃO supera a referência]')
        print(f'  - {r.modelo}{marca}')


if __name__ == '__main__':
    main()
