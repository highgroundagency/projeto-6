#!/usr/bin/env bash
# Instala as ferramentas das fitness functions com versão fixa e SHA-256
# conferido. É o único lugar com versões de ferramenta de pipeline: para
# atualizar, troque versão e hash juntos, tirando o hash do arquivo de
# checksums publicado no release (docs/pipeline.md).
#
# Uso: ferramentas.sh trivy gitleaks hadolint terraform
set -euo pipefail

TRIVY_VERSAO=0.76.2
TRIVY_SHA256=bc0fc726e017b8927a62b2d3531d7a84ee01769daf5c99ed866dced54089fdbf

GITLEAKS_VERSAO=8.30.1
GITLEAKS_SHA256=551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb

HADOLINT_VERSAO=2.15.1
HADOLINT_SHA256=c7187db94eeeeca956519a6af171adc31453941a1e777961f6e680f697c8c507

TERRAFORM_VERSAO=1.17.1
TERRAFORM_SHA256=4638628058e71a55212b1c563712eac03b902128f40740f3dc8174df12135061

DESTINO=${DESTINO:-/usr/local/bin}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# baixar <url> <arquivo> <sha256>: falha se o hash não bater.
baixar() {
  curl -fsSL --retry 3 --retry-delay 2 -o "$TMP/$2" "$1"
  echo "$3  $TMP/$2" | sha256sum --check --quiet -
}

instalar_trivy() {
  baixar "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSAO}/trivy_${TRIVY_VERSAO}_Linux-64bit.tar.gz" trivy.tgz "$TRIVY_SHA256"
  tar -xzf "$TMP/trivy.tgz" -C "$TMP" trivy contrib
  install -m 0755 "$TMP/trivy" "$DESTINO/trivy"
  # Os templates (junit.tpl) servem aos relatórios do CodeBuild.
  mkdir -p /opt/trivy && cp -r "$TMP/contrib" /opt/trivy/
}

instalar_gitleaks() {
  baixar "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSAO}/gitleaks_${GITLEAKS_VERSAO}_linux_x64.tar.gz" gitleaks.tgz "$GITLEAKS_SHA256"
  tar -xzf "$TMP/gitleaks.tgz" -C "$TMP" gitleaks
  install -m 0755 "$TMP/gitleaks" "$DESTINO/gitleaks"
}

instalar_hadolint() {
  baixar "https://github.com/hadolint/hadolint/releases/download/v${HADOLINT_VERSAO}/hadolint-linux-x86_64" hadolint "$HADOLINT_SHA256"
  install -m 0755 "$TMP/hadolint" "$DESTINO/hadolint"
}

instalar_terraform() {
  baixar "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSAO}/terraform_${TERRAFORM_VERSAO}_linux_amd64.zip" terraform.zip "$TERRAFORM_SHA256"
  unzip -oq "$TMP/terraform.zip" terraform -d "$TMP"
  install -m 0755 "$TMP/terraform" "$DESTINO/terraform"
}

for ferramenta in "$@"; do
  "instalar_${ferramenta}"
  echo "instalado: ${ferramenta}"
done
