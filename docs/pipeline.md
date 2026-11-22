# Pipeline de CI/CD na AWS

O Prumo tem um segundo caminho até a produção, além da Vercel: um pipeline no **AWS
CodePipeline** que verifica cada commit de `main` com fitness functions, constrói uma imagem de
contêiner, publica no ECR e entrega numa **EC2 pública com só duas portas abertas**. Toda a
infraestrutura, inclusive o próprio pipeline, é **Terraform em módulos**. O porquê está na
ADR-051 (`docs/decisoes.md`).

```
 push em main
     │
     ▼
 ┌────────┐   ┌──────────────── CI ─────────────────┐   ┌────────┐   ┌───────────┐   ┌─────────────┐   ┌────────┐
 │ Fonte  │──▶│ Seguranca ‖ Qualidade ‖ Jornadas     │──▶│ Imagem │──▶│[Aprovacao]│──▶│ Implantacao │──▶│ Fumaca │
 │ GitHub │   │ (paralelos; qualquer um reprova)     │   │ +Trivy │   │ opcional  │   │ CodeDeploy  │   │ de fora│
 └────────┘   └──────────────────────────────────────┘   └────────┘   └───────────┘   └─────────────┘   └────────┘
                                                             │                              │
                                                             ▼                              ▼
                                                    ECR (tag imutável,           EC2: Caddy :80/:443 ──▶ app (sem porta no host)
                                                    deploy pelo digest)          rollback automático se a validação falhar
```

## As fitness functions

Fitness function é uma propriedade da arquitetura escrita como teste automático: uma
ferramenta mede, um limiar reprova. Cada linha abaixo é uma propriedade que o projeto se
compromete a manter, e o pipeline para quando ela deixa de valer.

| Estágio | Propriedade | Ferramenta | Reprova quando |
| --- | --- | --- | --- |
| Seguranca | Nenhum segredo no histórico inteiro do Git | Gitleaks 8.30 | Qualquer achado fora da allowlist de `.gitleaks.toml` |
| Seguranca | Dependência de produção sem CVE conhecida | Trivy 0.76 (`fs`, vuln) | CVE alta ou crítica com correção publicada |
| Seguranca | Nenhum segredo na árvore de arquivos | Trivy (`fs`, secret) | Qualquer achado |
| Seguranca | Licenças compatíveis com o uso | Trivy (`fs`, license) | Licença restritiva alta ou crítica (GPL, AGPL); a LGPL do libvips é a única exceção, justificada no script |
| Seguranca | Infraestrutura sem configuração insegura | Trivy (`config`) sobre Terraform e Dockerfile | Achado alto ou crítico sem `trivy:ignore` justificado ao lado do recurso |
| Seguranca | Dockerfile dentro das boas práticas | Hadolint 2.15 | Qualquer regra violada |
| Seguranca | Terraform formatado e válido | `terraform fmt` e `validate` | Diferença de formatação ou erro de schema |
| Qualidade | Cadeia de suprimentos íntegra | `npm audit signatures` | Pacote sem assinatura válida do registro |
| Qualidade | Código sem erro de lint e de tipo | ESLint, `tsc` | Qualquer erro; ciclo publicado incompleto não compila |
| Qualidade | As regras da casa | Vitest, 721 testes | LGPL (CPF, e-mail e telefone no seed e em `ml/data`), pureza do motor, contraste dos dois temas, portões 8 telas × 4 perfis, RLS contra Postgres real |
| Qualidade | Conteúdo futuro não vaza | `verificar-vazamento` | Marcador de ciclo oculto no HTML, no RSC ou no bundle |
| Qualidade | Dossiê fiel ao site | `conferir-dossie` | `DOSSIE.txt` desatualizado |
| Jornadas | As jornadas críticas funcionam no build real | Playwright, desktop e 360 px | Qualquer jornada falha |
| Imagem | A imagem não carrega CVE nem segredo | Trivy (`image`) | CVE alta ou crítica com correção; a imagem nunca chega ao ECR |
| Fumaca | A versão no ar é a do commit | `curl /api/status` | Commit diferente depois de 5 minutos |
| Fumaca | TLS válido e com folga | `openssl` | Certificado inválido ou com menos de 14 dias |
| Fumaca | O 80 nunca serve página | `curl` | Resposta que não seja 301, 307 ou 308 para `https://` |
| Fumaca | Cabeçalhos de segurança chegam ao navegador | `curl` | Falta HSTS, CSP, X-Frame-Options, nosniff, Referrer ou Permissions-Policy; ou aparece Server, Via ou X-Powered-By |
| Fumaca | **Só as portas públicas respondem** | `/dev/tcp` de fora | 443 fechada, ou 22, 2019, 3000, 3389, 5432, 8080 ou 8443 aberta |

Os relatórios JUnit do Gitleaks, do Trivy, do Vitest e do Playwright aparecem na aba
**Reports** de cada build do CodeBuild.

As versões das ferramentas estão fixadas, com SHA-256 conferido, num lugar só:
`infra/codebuild/ferramentas.sh`.

### Rodar antes do push

Os scripts são os mesmos do CodeBuild. Em Linux, macOS ou WSL:

```bash
sudo bash infra/codebuild/ferramentas.sh trivy gitleaks hadolint terraform
bash infra/codebuild/seguranca.sh
```

## A infraestrutura

```
infra/
├── terraform/
│   ├── bootstrap/            bucket do state (roda uma vez, com state local)
│   ├── ambientes/producao/   a composição: provider, backend e os módulos
│   └── modulos/
│       ├── criptografia/     uma CMK do KMS para logs, artefatos, segredos, disco e imagens
│       ├── rede/             VPC, sub-rede pública, NACL (primeira camada de portas), flow logs
│       ├── registro/         ECR com tag imutável, scan no push e limpeza de imagens antigas
│       ├── segredos/         SSM Parameter Store; segredos write-only, fora do state
│       ├── servidor/         EC2, Elastic IP, security group (segunda camada), papel IAM, logs
│       ├── dns/              registro A e CAA no Route 53 (opcional, para domínio próprio)
│       ├── entrega/          CodeDeploy com rollback automático
│       └── pipeline/         CodePipeline V2, os cinco CodeBuild, bucket de artefatos, conexão GitHub
├── codebuild/                buildspecs e scripts de cada estágio
└── codedeploy/               appspec, Caddyfile e os ganchos que rodam na EC2
```

### A limitação de portas, camada por camada

| Camada | Entra | Sai |
| --- | --- | --- |
| NACL da sub-rede (sem estado) | TCP 80 e 443; retorno efêmero 1024-65535 | TCP 443; resposta efêmera aos visitantes |
| Security group (com estado) | TCP 80 e 443 | TCP 443 |
| Host | Só o contêiner do Caddy publica porta: 80 e 443 | |
| Docker | O app escuta 3000 só na rede interna `prumo`; não há porta dele no host | |
| Caddy | 80 só redireciona e responde ao desafio ACME; HTTP/3 desligado (seria UDP); API admin desligada | |

**Não existe porta 22.** A instância não tem chave SSH, o `sshd` é desligado no primeiro boot, e
o acesso administrativo é pelo **SSM Session Manager**, que sai da instância pelo 443 e não abre
porta nenhuma. A porta 80 existe por dois motivos: o Let's Encrypt valida o domínio por ela, e
quem digita o endereço sem `https://` precisa ser redirecionado.

### O contêiner

`Dockerfile` na raiz, em três estágios. O que roda é a imagem **distroless** do Node 22 sobre
Debian 13: sem shell, sem npm, sem gerenciador de pacotes, usuário 65532. O Next sai em modo
`standalone` só dentro da imagem (`NEXT_OUTPUT=standalone`); `next start`, a Vercel e o
`verificar-vazamento` continuam iguais.

Na EC2, o app roda com sistema de arquivos **somente leitura**, todas as capabilities
removidas, `no-new-privileges`, limite de memória e de processos. A configuração do release
vem de variável de ambiente, como na Vercel (`CONFIG_SITE_SOMENTE_LEITURA=1`).

### Onde vivem os segredos

`ADMIN_SENHA` e `ADMIN_COOKIE_SECRET` são gerados pelo Terraform com recurso **efêmero** e
gravados no SSM como SecureString, cifrados com a CMK. O atributo é **write-only**: o valor
vai para a AWS e não fica no state. No deploy, o gancho `preparar.sh` lê o caminho
`/prumo/producao/app/` inteiro e monta o arquivo de ambiente do contêiner, com permissão 600.
Nenhum segredo passa pelo CodeBuild, pelo repositório ou pelo `terraform.tfvars`.

## Criar do zero

**Pré-requisitos:** Terraform 1.11 ou mais novo, AWS CLI autenticado numa conta com permissão
de administrador, e acesso de administração ao repositório no GitHub.

1. **Bucket do state** (uma vez por conta):

   ```bash
   terraform -chdir=infra/terraform/bootstrap init
   terraform -chdir=infra/terraform/bootstrap apply
   terraform -chdir=infra/terraform/bootstrap output -raw backend_hcl \
     > infra/terraform/ambientes/producao/backend.hcl
   ```

2. **Variáveis do ambiente:** copie `terraform.tfvars.exemplo` para `terraform.tfvars` em
   `infra/terraform/ambientes/producao/` e ajuste. Os padrões já servem.

3. **Criar a stack:**

   ```bash
   cd infra/terraform/ambientes/producao
   terraform init -backend-config=backend.hcl
   terraform apply
   ```

4. **Aprovar a conexão com o GitHub.** O Terraform cria a conexão no estado `PENDING`, e a AWS
   exige que um humano conclua o aperto de mão uma vez: console da AWS → *Developer Tools* →
   *Settings* → *Connections* → `prumo-producao-github` → *Update pending connection* →
   autorizar o app da AWS no repositório. O output `conexao_github_status` deve virar
   `AVAILABLE` no próximo `terraform apply` (ou `terraform refresh`).

5. **Primeiro deploy:** um push em `main`, ou *Release change* no pipeline `prumo-producao`.
   O primeiro build leva mais tempo (sem cache), e o Let's Encrypt emite o certificado no
   primeiro acesso; o estágio Fumaca espera até 5 minutos por isso.

6. **Ler a senha do painel:** o output `comando_senha_admin` traz o comando pronto.

O endereço do site sai no output `url_site`: `https://<ip-com-hifens>.sslip.io`. O sslip.io é
um DNS público que responde o IP escrito no próprio nome, e isso basta para o Let's Encrypt.

### Domínio próprio

Preencha `dominio` no `terraform.tfvars`. Se a zona estiver no Route 53 da mesma conta,
preencha também `zona_route53`: o módulo `dns` cria o registro `A` para o Elastic IP e um
registro CAA que só autoriza o Let's Encrypt, no mesmo apply. Fora do Route 53, crie o `A` à
mão com o output `ip_publico`. O build seguinte troca o `NEXT_PUBLIC_SITE_URL`, e o deploy
seguinte, o certificado.

## Operação

| Quero | Faço |
| --- | --- |
| Shell na instância | o comando do output `comando_sessao` (precisa do plugin do Session Manager no AWS CLI) |
| Ver os logs do app e do Caddy | CloudWatch → `/prumo/producao/app` (um fluxo por deploy) |
| Ver quem tentou portas fechadas | CloudWatch → `/prumo/producao/vpc-fluxo`, registros `REJECT` |
| Voltar à versão anterior | CodeDeploy → o deploy anterior bem-sucedido → *Redeploy*; ou *Retry* do estágio no pipeline. A falha na validação já volta sozinha |
| Mudar uma variável do app | `variaveis_app` no `terraform.tfvars` e `terraform apply`; ela vale no próximo deploy |
| Trocar a senha do painel por uma escolhida | `aws ssm put-parameter --overwrite --type SecureString --name /prumo/producao/app/ADMIN_SENHA --value '...'` e um novo deploy |
| Girar os dois segredos | incremente `versao_segredos` e aplique; depois, um novo deploy |
| Ligar a vitrine pessoal (ADR-030) | `aws ssm put-parameter --type SecureString --name /prumo/producao/app/CHAVE_VITRINE --value '<valor longo e aleatório>'` e um novo deploy |
| Exigir aprovação antes de produção | `exigir_aprovacao = true` e aplique |
| Atualizar uma ferramenta do CI | troque versão **e** SHA-256 em `infra/codebuild/ferramentas.sh`, tirando o hash do arquivo de checksums do release |
| Atualizar o sistema operacional da EC2 | a AMI é ignorada de propósito para não recriar a máquina num apply qualquer: `terraform apply -replace=module.servidor.aws_instance.servidor` e um novo deploy |
| Apagar tudo | `terraform destroy` no ambiente; o ECR e o bucket de artefatos recusam se tiverem conteúdo, a menos que as variáveis `apagar_*` estejam ligadas |

## Custo aproximado

Estimativa para `sa-east-1`, a conferir na calculadora da AWS: a EC2 `t3.small` com disco de
20 GB, o IPv4 público e a chave KMS ficam perto de **US$ 35 por mês** ligados o tempo todo.
Cada execução do pipeline gasta por volta de meia hora somada de CodeBuild, abaixo de **US$ 1**.
CloudWatch, S3 e ECR, na escala do projeto, ficam em centavos.

## Limitações declaradas

- **Uma instância, uma zona.** Se a zona cair, o site cai. O alarme de recuperação automática
  cobre falha do hardware, não da zona. Para o volume do caso é a escolha certa; para produção
  da Secretaria, seriam duas instâncias atrás de um balanceador.
- **A troca de versão não é blue/green.** O contêiner antigo para e o novo sobe; o Caddy segura
  as requisições por até 30 s nesse intervalo. Testado localmente: 40 de 40 requisições
  responderam 200 durante a troca.
- **O sslip.io é de terceiros.** Ele resolve, mas o limite de certificados do Let's Encrypt é
  compartilhado com quem mais usa o serviço. Com domínio próprio, essa dependência some.
- **A saída para 443 é para qualquer destino.** Os endpoints da AWS e do Let's Encrypt não têm
  IP fixo. Endpoints de VPC fechariam isso, a uns US$ 50 por mês, mais que a própria instância.
- **O rate limit do painel continua em memória** (`docs/seguranca.md`). Numa instância só ele é
  exato até o próximo deploy, que zera o contador.
- **A Vercel continua.** Este pipeline não desliga o deploy da Vercel nem o workflow do GitHub
  Actions, que segue verificando cada push e cada pull request.
