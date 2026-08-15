# Como operar os releases

Manual da equipe para controlar o que o professor vê e quando. Se você só quer saber "como
libero a semana", pule para [Receitas](#receitas).

## A ideia em um parágrafo

O site tem duas realidades: a **pública** (o recorte visível hoje) e a **completa** (tudo
que a equipe já construiu). A pública é sempre um recorte da completa, calculado a partir
do cronograma. Ninguém precisa "publicar" nada: o conteúdo entra no Git quando fica pronto
e aparece sozinho na data certa.

## Como o release é calculado

```
releaseAtual = override manual, se existir
             : último ciclo cuja data ≤ hoje + ADIANTAMENTO_DIAS
```

`ADIANTAMENTO_DIAS` vale **7** por padrão: o site mostra sempre uma semana à frente, para
que o material esteja no ar antes do acompanhamento da equipe.

Depois do cálculo, as **travas por ciclo** são aplicadas:

| Trava | Efeito |
| --- | --- |
| `automatico` | Segue o release (padrão) |
| `sempre_visivel` | Libera aquele ciclo fora de ordem, sem mexer nos outros |
| `sempre_oculto` | Esconde o ciclo mesmo com a data vencida |

Tudo isso é calculado no **servidor**. Conteúdo de ciclo não liberado não entra no HTML, não
entra no payload RSC e não entra no bundle — e `npm run verificar-vazamento` prova isso a
cada build.

## Onde o conteúdo declara seu ciclo

- **Registro semanal:** um arquivo por ciclo em `src/content/ciclos/{id}.tsx`, registrado em
  `src/content/ciclos/registro.ts`. O registry lista os 18 ciclos; `null` significa "ainda
  sem registro" — uma decisão explícita, nunca um esquecimento.
- **Funcionalidades do sistema:** `src/lib/features.ts` amarra cada tela ao ciclo que a
  libera. Rota não liberada devolve **404**, não uma tela de "em breve".

## Painel administrativo

Acesso pelo ponto discreto no rodapé → `/admin/entrar`. Senha em `ADMIN_SENHA`.

O painel controla **quando o que já existe fica visível**. Ele não edita conteúdo: conteúdo
vive no Git, versionado, com histórico de quem escreveu o quê.

| Recurso | Para quê |
| --- | --- |
| Modo completo | Ver o projeto inteiro, com faixa fixa avisando que só você vê isso |
| Ver como visitante | Ver o recorte público — opcionalmente numa data futura |
| Adiantamento | Mover todos os releases de uma vez; mostra em tempo real qual ciclo cada valor libera |
| Seletor de release | Fixar um ciclo à mão; "automático (pela data)" volta ao cálculo |
| Travas por ciclo | Liberar ou esconder um ciclo isolado |
| Log de liberações | Histórico do que mudou, de quanto para quanto e quando |
| Checklist da matriz | Evidências exigidas por ciclo, com status e responsável |
| Faixas paralelas | Marcos de ML e Direito, e o que este projeto alimenta em cada |

## Onde a configuração é gravada

Isto **muda conforme o ambiente** e é a pegadinha mais importante deste documento.

| Ambiente | Driver | O que acontece ao salvar no painel |
| --- | --- | --- |
| Desenvolvimento local | `arquivo` | Grava em `.dados/config-site.json`. Vale para todo mundo que acessar aquele servidor |
| Produção na Vercel (até a F3) | `env (somente leitura)` | **Não grava configuração global.** A mudança vira overlay assinado na sua sessão e vale só para você |
| Produção com Supabase (F3+) | `supabase` | Grava na tabela `configuracao_site` e no `log_releases` |

O filesystem da Vercel é read-only — por isso o driver de arquivo não serve lá. O painel
avisa isso em vermelho quando o store não é gravável.

### Mudar o que o público vê em produção, antes da F3

Altere as variáveis de ambiente na Vercel e faça o redeploy:

| Variável | Exemplo | Efeito |
| --- | --- | --- |
| `RELEASE_ADIANTAMENTO_DIAS` | `14` | Mostra duas semanas à frente |
| `RELEASE_OVERRIDE` | `sr1` | Fixa o release no SR1 |
| `RELEASE_TRAVAS` | `{"s9":"sempre_visivel"}` | Libera o s9 fora de ordem |

Valor inválido é ignorado e o padrão assume — o site não cai por causa de env var digitada
errada.

## Receitas

**Publicar o registro da semana.** Escreva `src/content/ciclos/sX.tsx`, aponte o carregador
em `registro.ts`, rode `npm run verificar` e faça o commit. Na data do ciclo (menos sete
dias) ele aparece sozinho.

**Mostrar algo antes da hora, só numa apresentação.** Entre no painel, use o seletor de
release ou uma trava `sempre_visivel`. Em produção isso vale só para a sua sessão — o que
é exatamente o que você quer numa demonstração.

**Conferir como estará no SR1.** Painel → "Ver como visitante", data simulada `2026-10-03`.
A faixa do topo muda para laranja e mostra a data simulada.

**Esconder um ciclo publicado por engano.** Trava `sempre_oculto` no ciclo. Em produção,
`RELEASE_TRAVAS` + redeploy.

**Voltar tudo ao normal.** Painel → "Limpar simulação". O overlay da sessão é apagado.

## Conferir que nada vazou

```bash
npm run build
npm run verificar-vazamento
```

O script sobe o servidor de produção e confere que nenhum marcador de ciclo não liberado
aparece no HTML, no payload RSC ou em `.next/static`, que cada rota de funcionalidade não
liberada responde 404, e que o admin continua vendo tudo.
