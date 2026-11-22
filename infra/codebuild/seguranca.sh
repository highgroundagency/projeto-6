#!/usr/bin/env bash
# Fitness functions de segurança do CI.
#
# Cada função abaixo é uma propriedade que o repositório precisa manter, medida
# por uma ferramenta, com um limiar que reprova. Todas rodam, mesmo que uma
# falhe, e o script só sai com erro no fim: o log mostra o quadro inteiro de
# uma vez, em vez de uma correção por execução.
#
# Roda igual no CodeBuild e na máquina de quem quiser conferir antes do push:
#   bash infra/codebuild/ferramentas.sh trivy gitleaks hadolint terraform
#   bash infra/codebuild/seguranca.sh
set -uo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 1

RELATORIOS=${RELATORIOS:-relatorios}
SEVERIDADE=${SEVERIDADE:-HIGH,CRITICAL}
JUNIT="@${TRIVY_CONTRIB:-/opt/trivy/contrib}/junit.tpl"
IGNORAR_DIRS="node_modules,.next,**/.terraform"
mkdir -p "$RELATORIOS"

falhas=()
etapa() {
  local nome=$1
  shift
  printf '\n=== %s\n' "$nome"
  if "$@"; then
    printf -- '--- ok: %s\n' "$nome"
  else
    printf -- '--- FALHOU: %s\n' "$nome"
    falhas+=("$nome")
  fi
}

# 1. Nenhum segredo no histórico inteiro do Git, não só na árvore atual: um
#    segredo apagado num commit seguinte continua no clone de qualquer um.
segredos_no_historico() {
  if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "false" ]; then
    gitleaks git --config .gitleaks.toml --redact --no-banner \
      --report-format junit --report-path "$RELATORIOS/gitleaks.xml" .
  else
    echo "aviso: sem histórico completo; varrendo só os arquivos da árvore"
    gitleaks dir --config .gitleaks.toml --redact --no-banner \
      --report-format junit --report-path "$RELATORIOS/gitleaks.xml" .
  fi
}

# 2. Nenhuma dependência de produção com CVE alta ou crítica que já tenha
#    correção publicada. Dependência de desenvolvimento não vai para a imagem.
dependencias_sem_cve() {
  local resultado=0
  trivy fs --scanners vuln --severity "$SEVERIDADE" --ignore-unfixed \
    --skip-dirs "$IGNORAR_DIRS" --exit-code 1 . || resultado=$?
  trivy fs --scanners vuln --severity "$SEVERIDADE" --ignore-unfixed \
    --skip-dirs "$IGNORAR_DIRS" --format template --template "$JUNIT" \
    --output "$RELATORIOS/trivy-dependencias.xml" . >/dev/null 2>&1
  return "$resultado"
}

# 3. Segunda opinião sobre segredos, com as regras do Trivy (chaves de nuvem,
#    tokens, chaves privadas), na árvore de arquivos.
segredos_na_arvore() {
  trivy fs --scanners secret --skip-dirs "$IGNORAR_DIRS" --exit-code 1 .
}

# 4. Nenhuma licença restritiva nas dependências de produção. A exceção é a
#    LGPL do libvips, que o sharp carrega como biblioteca dinâmica sem
#    modificação: a LGPL permite esse uso num serviço. GPL e AGPL reprovam.
licencas_compativeis() {
  trivy fs --scanners license --severity "$SEVERIDADE" --skip-dirs "$IGNORAR_DIRS" \
    --ignored-licenses "LGPL-3.0-or-later,Apache-2.0 AND LGPL-3.0-or-later,Apache-2.0 AND LGPL-3.0-or-later AND MIT" \
    --exit-code 1 .
}

# 5. Infraestrutura como código sem configuração insegura: Terraform e
#    Dockerfile. Exceção só por comentário `trivy:ignore` com justificativa
#    ao lado do recurso.
iac_sem_configuracao_insegura() {
  local resultado=0
  trivy config --severity "$SEVERIDADE" --skip-dirs "$IGNORAR_DIRS" --exit-code 1 . || resultado=$?
  trivy config --severity "$SEVERIDADE" --skip-dirs "$IGNORAR_DIRS" \
    --format template --template "$JUNIT" \
    --output "$RELATORIOS/trivy-iac.xml" . >/dev/null 2>&1
  return "$resultado"
}

# 6. Dockerfile dentro das boas práticas (versão fixa, usuário não root...).
dockerfile_conforme() {
  hadolint Dockerfile
}

# 7. Terraform formatado e válido contra o schema real dos providers.
terraform_valido() {
  terraform fmt -check -recursive infra/terraform || return 1
  local raiz
  for raiz in infra/terraform/bootstrap infra/terraform/ambientes/producao; do
    terraform -chdir="$raiz" init -backend=false -input=false -no-color >/dev/null || return 1
    terraform -chdir="$raiz" validate -no-color || return 1
  done
}

etapa "segredos no historico (gitleaks)" segredos_no_historico
etapa "dependencias sem CVE alta/critica (trivy fs)" dependencias_sem_cve
etapa "segredos na arvore (trivy secret)" segredos_na_arvore
etapa "licencas compativeis (trivy license)" licencas_compativeis
etapa "IaC sem configuracao insegura (trivy config)" iac_sem_configuracao_insegura
etapa "Dockerfile conforme (hadolint)" dockerfile_conforme
etapa "Terraform formatado e valido" terraform_valido

printf '\n===================================\n'
if [ "${#falhas[@]}" -gt 0 ]; then
  printf 'Reprovado em %d fitness function(s):\n' "${#falhas[@]}"
  printf '  - %s\n' "${falhas[@]}"
  exit 1
fi
echo "Todas as fitness functions de seguranca passaram."
