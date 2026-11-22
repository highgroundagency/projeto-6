#!/bin/bash
# BeforeInstall: tira a revisão anterior do disco antes de copiar a nova, para
# não sobrar arquivo de uma versão que não existe mais. Os contêineres em
# execução não são tocados aqui: o site continua no ar até o ApplicationStart.
set -euo pipefail

rm -rf /opt/prumo/revisao
install -d -m 0750 /opt/prumo
