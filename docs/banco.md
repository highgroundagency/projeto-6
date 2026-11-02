# O banco de dados

O `/sistema` lê e grava num **PostgreSQL**. Distritos, unidades, indicadores, regras,
ciclos, lançamentos, notas, contestações e a trilha de auditoria vivem em tabelas, e o que
alguém faz pela tela fica salvo para todo mundo. A decisão está na ADR-050 de `decisoes.md`.

Há dois schemas no repositório, e só um está ligado:

| Pasta | Domínio | Ligado ao app? |
| --- | --- | --- |
| `db/migrations/` | o atual (distritos, tipos de unidade, subindicadores, aplicabilidade na regra) | **sim** |
| `supabase/migrations/` | o anterior à reunião de 22/08 (áreas técnicas, indicador com meta própria) | não: é a prova de RLS por perfil, guardada (ADR-011, ADR-012, ADR-034) |

## Tudo no Docker (sem Node nem npm na máquina)

Só o [Docker Desktop](https://www.docker.com/products/docker-desktop/) precisa estar
instalado e aberto. Na pasta do projeto:

```bash
docker compose up -d --build
```

Abre em `http://localhost:3000`. Sobem dois containers: `prumo-postgres` (o banco) e
`prumo-app` (o site, pelo `Dockerfile`). Na subida, o app aplica as migrações novas e, se o
banco estiver vazio, carrega a base sintética; depois disso, só liga o site. A primeira vez
demora alguns minutos (baixa as imagens, instala as dependências e faz o build); as
seguintes, segundos.

| Para | Comando |
| --- | --- |
| ver o que o site está fazendo | `docker compose logs -f app` |
| aplicar uma mudança de código | `docker compose up -d --build` |
| parar tudo (os dados ficam) | `docker compose down` |
| voltar a base ao começo | `docker compose exec app npx tsx scripts/db.ts semear --limpar` |
| parar e apagar os dados | `docker compose down -v` |
| abrir o banco no psql | `docker compose exec postgres psql -U prumo` |

O painel administrativo usa um segredo só de desenvolvimento, definido no
`docker-compose.yml`. Para trocar a senha ou o segredo, crie um arquivo `.env` ao lado dele
com `ADMIN_SENHA=...` e `ADMIN_COOKIE_SECRET=...`.

Não há recarga automática: mudou o código, rode o `--build` de novo. Para editar com o site
atualizando sozinho, use o caminho com Node, abaixo.

## Banco no Docker, site com Node

Para quem tem Node instalado e quer o `npm run dev`, com recarga automática:

```bash
docker compose up -d postgres # só o banco
cp .env.example .env.local    # a DATABASE_URL do Docker já vem preenchida
npm run db:preparar           # cria as tabelas e carrega a base sintética
npm run dev
```

No Windows, sem `cp`: `copy .env.example .env.local`.

`db:preparar` pode ser rodado de novo quando quiser: aplica só as migrações novas e só carrega
a base se o banco estiver vazio. Para voltar ao começo, apagando tudo o que foi lançado pela tela:

```bash
npm run db:semear -- --limpar
```

Os dois caminhos usam o mesmo banco (o volume `prumo-dados`): o que foi lançado num aparece
no outro. Só não deixe o `prumo-app` e o `npm run dev` ligados ao mesmo tempo, porque os dois
querem a porta 3000.

Sem `DATABASE_URL`, o `/sistema` não cai calado nos dados em memória: ele avisa que o banco
não está configurado. `DADOS_DRIVER=seed` liga o modo antigo, só para quem precisar rodar
sem Docker.

## O que entra no banco

A carga inicial é a mesma base **100% sintética** de `src/lib/seed/` (regra 1 da casa): seis
meses fechados, julho aberto, 536 lançamentos, 72 notas, a trilha com 569 eventos. Ela entra
uma vez. Dali em diante, tudo o que muda é escrita de verdade.

| Comando | O que faz |
| --- | --- |
| `npm run db:migrar` | aplica as migrações novas de `db/migrations/`, anotando cada uma em `migracoes_aplicadas` |
| `npm run db:semear` | carrega a base sintética, se o banco estiver vazio |
| `npm run db:semear -- --limpar` | apaga o conteúdo e carrega de novo |
| `npm run db:preparar` | os dois anteriores, nessa ordem |
| `npm run testar-banco` | testes do driver contra um Postgres real (exige `DATABASE_URL_TESTE`) |

## Como o código fala com o banco

```
tela → src/lib/dados/index.ts → driver-postgres.ts → PostgreSQL
                                     │
                                     └─ motor de cálculo (puro), na homologação
```

As telas não mudaram: falam com `RepositorioDados`, como antes. O driver
(`src/lib/dados/driver-postgres.ts`) faz duas coisas que o banco não faz:

1. **Mensagem amigável** para o que é regra de negócio: janela fechada (e a tentativa vira
   `lancamento_recusado` na trilha), indicador que não vale para o tipo da unidade.
2. **A conta.** Ao homologar um ciclo, roda o motor puro sobre os lançamentos e grava as notas
   das unidades e dos distritos na mesma transação.

Todo o resto é do banco. Cada escrita é uma transação: se uma trava recusa, nada entra.

## As quatro travas

São gatilhos, em `db/migrations/0002_travas_e_auditoria.sql`, e valem para qualquer caminho de
escrita, inclusive um `psql` aberto pelo dono do banco:

1. `trilha_append_only`: evento de auditoria não se altera, não se apaga, não se trunca.
2. `ciclo_transicao_valida`: o ciclo avança um estado por vez e nunca volta. E, depois de
   criado, só o estado muda (`ciclo_so_muda_estado`).
3. `lancamento_dentro_da_janela`: lançamento fora de "lançamento aberto" é recusado.
   Lançamento também não se apaga: correção é linha nova.
4. `regra_imutavel`: regra publicada não se edita nem se apaga, e a aplicabilidade dela
   (meta e peso por tipo de unidade) também não. Mudou a portaria, publica-se versão nova.

Além delas, nota só entra para ciclo homologado ou publicado (`avaliacao_de_ciclo_fechado`).

## A trilha escrita pelo banco

Os eventos de auditoria saem dos gatilhos, não da aplicação: inserir um lançamento grava o
`lancamento_registrado` (ou `lancamento_alterado`, com o valor anterior no "antes"), avançar o
ciclo grava `ciclo_estado_alterado`, e assim por diante. A aplicação só diz ao banco quem
escreve e que horas são, dentro da transação:

```sql
select set_config('app.autor', 'ger-usf-canario', true),
       set_config('app.perfil', 'gerente_unidade', true),
       set_config('app.agora', '2026-07-15T13:00:00.000Z', true);
```

O relógio vem da aplicação, como manda a regra da casa. Sem esses valores (um `psql` manual), o
evento sai como `sistema`, com a hora do banco.

## Decisões de tipo

- **Datas são texto** (`YYYY-MM-DD`, `YYYY-MM`, ISO 8601 em UTC), com `check` de formato. A
  regra da casa é "data nunca é `Date`", e o texto volta exatamente como entrou.
- **Números são `double precision`**, o mesmo `number` do JavaScript: a nota calculada volta
  idêntica.
- **Toda tabela tem `ordem`**: a aplicação depende da ordem de inserção (o último lançamento
  vence), e SQL sem `order by` não promete ordem.

## Como se prova

`src/lib/dados/driver-postgres.test.ts`, contra um Postgres de verdade:

- **Ida e volta:** a base sintética entra e volta pelo driver igual, campo a campo.
- **Mesmo comportamento:** as escritas dão as mesmas mensagens da camada em memória, e a nota
  de julho calculada na homologação é idêntica à que o motor dá em memória.
- **As travas:** SQL direto, sem o driver, é recusado.

```bash
DATABASE_URL_TESTE=postgresql://prumo:prumo@localhost:5432/prumo_teste npm run testar-banco
```

O banco de teste é **apagado** a cada execução. Crie um só para isso
(`docker compose exec postgres createdb -U prumo prumo_teste`). O mesmo vale para a suíte de
ponta a ponta, que lê `DATABASE_URL_E2E` (`createdb -U prumo prumo_e2e`). No CI, os dois sobem
sozinhos.

## Contas de acesso

Lançar, contestar e avançar etapa exigem login (ADR-051). As contas ficam na tabela
`usuarios` (migração `0003`), com a senha guardada só como hash scrypt. Para criar:

```bash
docker compose exec app npx tsx scripts/usuarios.ts demo     # uma conta por perfil, senha aleatória
docker compose exec app npx tsx scripts/usuarios.ts criar --login seab --perfil seab
docker compose exec app npx tsx scripts/usuarios.ts listar
docker compose exec app npx tsx scripts/usuarios.ts senha --login seab   # troca e derruba as sessões
docker compose exec app npx tsx scripts/usuarios.ts desativar --login seab
```

Com Node na máquina, o mesmo vale como `npm run usuarios -- <comando>`. A senha é pedida sem
eco no terminal (ou gerada com `--gerar`), e nunca vai como argumento.

## Em produção na AWS

As credenciais do banco **nunca** ficam no código, no repositório, no `.env` ou na imagem:

1. **Crie o banco** no RDS (PostgreSQL 16) e deixe a AWS guardar a senha no Secrets Manager
   (opção "Manage master credentials in AWS Secrets Manager"), ou crie um segredo do tipo
   "Credentials for Amazon RDS database". O segredo fica no formato JSON do RDS
   (`username`, `password`, `host`, `port`, `dbname`), que é o que o app lê.
2. **Ligue a rotação** no segredo. O app aguenta a troca de senha sozinho: guarda a senha em
   cache por 5 minutos (`DATABASE_SECRET_TTL_SEGUNDOS`) e, se o banco recusar a senha logo
   depois de uma rotação, busca a nova e tenta de novo, sem reinício.
3. **Dê ao app só o nome do segredo**, por variável de ambiente:
   ```
   DATABASE_SECRET_ID=prumo/producao/banco
   AWS_REGION=sa-east-1
   DATABASE_SSL_CA=/app/certs/global-bundle.pem
   SESSAO_CHAVE=<vinda também do Secrets Manager>
   ```
   Com o segredo definido, a conexão exige TLS com certificado conferido. O certificado do RDS
   está em https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem.
4. **Dê permissão pelo papel IAM** de quem roda (tarefa do ECS, instância EC2, Lambda), nunca
   por chave de acesso no projeto. O mínimo:
   ```json
   {
     "Effect": "Allow",
     "Action": "secretsmanager:GetSecretValue",
     "Resource": "arn:aws:secretsmanager:sa-east-1:<conta>:secret:prumo/producao/banco-*"
   }
   ```
   Se o segredo usar uma chave KMS própria, some `kms:Decrypt` nela.
5. **Prepare o banco uma vez**, de uma máquina com acesso ao RDS e com `aws sso login` feito:
   `DATABASE_SECRET_ID=... npm run db:preparar`. A carga inicial desliga os gatilhos por um
   instante e por isso pede o usuário administrador (o do segredo do RDS serve).

No ECS, a `SESSAO_CHAVE` também pode vir do Secrets Manager, pelo campo `secrets` da
definição da tarefa: a AWS injeta o valor na subida, e ele não aparece no console.

Fora da AWS (Vercel, Neon, Supabase), o caminho é a `DATABASE_URL` nas variáveis secretas da
plataforma, com `DATABASE_SSL=exigir`.

## O que ainda não existe

- **RLS por perfil.** O login existe (ADR-051) e a aplicação confere a conta em cada escrita,
  mas o banco ainda não filtra linhas por conta: o app se conecta com um usuário só. A prova
  de que a RLS funciona está no schema guardado de `supabase/migrations/`; o próximo passo é
  trazê-la para o schema ligado, usando a conta da sessão.
- **MFA.** O login é só senha.
