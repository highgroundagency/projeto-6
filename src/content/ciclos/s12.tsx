import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 12 — Pré-SR2. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's12',
  marcador: 'PRUMO-MARCADOR-CICLO-s12',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Fechar o pacote do SR2: aplicar os ajustes da validação, consolidar as três lentes e comparar planejado com realizado.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ajustes de prioridade alta da validação com a CAM aplicados.',
      'Documentação técnica, análise de segurança e análise de privacidade em versão final.',
      'Comparativo planejado × realizado do semestre, com os desvios explicados.',
      'Ensaio do pitch final, cronometrado.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao:
          'O comparativo planejado × realizado mostra o que não foi feito, com o motivo.',
        porque:
          'Relatório que só lista acerto não é relatório. O que ficou de fora e por quê é o que mostra que houve priorização.',
      },
      {
        decisao: 'Congelar funcionalidade nova a partir desta semana.',
        porque:
          'Feature entrando na véspera é feature sem teste e sem ensaio. O que não está pronto agora vira trabalho futuro declarado.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Apresentar o SR2.',
      'Publicar o comparativo planejado × realizado junto do pacote final.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Pacote do SR2 e comparativo planejado × realizado.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Documentação técnica, segurança e privacidade.',
      },
      { integrante: 'joao-pedro', contribuicao: 'Ajustes de interface da validação.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Planejado × realizado', url: '#doc-s12-planejado' },
      { tipo: 'documento', rotulo: 'Trabalho futuro declarado', url: '#doc-s12-futuro' },
      {
        tipo: 'documento',
        rotulo: 'Direito — Privacy by Design e direitos dos titulares',
        url: '#doc-s12-direito-titulares',
      },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'direito-titulares',
    titulo: 'Direito — Privacy by Design e direitos dos titulares',
    resumo: 'onde a privacidade está no código, e como cada direito do art. 18 é atendido.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Privacy by Design, apontando o código"
          descricao="Princípio que não aponta para um arquivo é declaração de intenção."
        >
          <Tabela
            colunas={['Princípio', 'Onde está no código']}
            linhas={[
              [
                'Minimização',
                'A base sintética não tem CPF, e-mail nem telefone — e há teste que falha se aparecerem',
              ],
              [
                'Finalidade',
                'O sistema calcula o percentual devido; folha de pagamento está fora do escopo desde a proposta',
              ],
              [
                'Transparência',
                'A memória de cálculo abre cada passo até a origem, para o próprio avaliado',
              ],
              [
                'Segurança',
                'Trilha append-only, regra versionada e políticas de RLS escritas em supabase/migrations/',
              ],
              ['Prestação de contas', 'Cada evento guarda quem, quando, antes e depois'],
            ]}
          />
        </Secao>

        <Secao
          titulo="Direitos do titular (art. 18)"
          descricao="Cada direito, e a tela que o atende."
        >
          <Tabela
            colunas={['Direito', 'Como o sistema atende']}
            linhas={[
              [
                'Confirmação e acesso',
                'Tela "meu resultado": score, faixa, histórico e memória de cálculo do próprio avaliado',
              ],
              [
                'Correção',
                'Contestação com resposta da comissão; correção de lançamento gera evento novo sem apagar o anterior',
              ],
              ['Anonimização', 'Ranking anonimizável no painel da gestão'],
              ['Portabilidade', 'Exportação em CSV'],
              ['Informação sobre compartilhamento', 'Não há compartilhamento com terceiros'],
              [
                'Revisão de decisão automatizada (art. 20)',
                'O cálculo é determinístico e a memória mostra cada passo; o ML sinaliza e nunca bloqueia',
              ],
            ]}
          />
        </Secao>

        <Secao titulo="O art. 20 é o centro deste projeto">
          <Lista
            itens={[
              'Decisão automatizada que afeta interesse do titular exige direito a revisão — e gratificação afeta remuneração.',
              'Por isso o cálculo não é caixa-preta: a regra é dado versionado e a memória de cálculo mostra a conta inteira.',
              'Por isso, também, nenhuma saída dos modelos de machine learning entra na conta. Eles informam onde olhar; quem decide é a comissão, e a decisão é contestável.',
            ]}
          />
          <Nota>
            Esta é a razão pela qual a lente de Direito não é um anexo do projeto: ela
            determinou uma decisão de arquitetura — o motor de cálculo ser função pura e
            auditável, e o ML ficar fora dele.
          </Nota>
        </Secao>
      </>
    ),
  },
  {
    id: 'planejado',
    titulo: 'Planejado × realizado',
    resumo: 'o que foi prometido em cada marco, o que saiu, e o desvio explicado.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Marco', 'Planejado', 'Realizado', 'Desvio']}
          linhas={[
            ['Kick-off', 'Problema, pergunta e recorte', '—', 'A preencher no SR2'],
            ['SR1', 'Pesquisa e protótipo navegável', '—', 'A preencher no SR2'],
            [
              'Sprints 1–4',
              'Ciclo completo, auditoria, gestão e analytics',
              '—',
              'A preencher no SR2',
            ],
            ['Semana 11', 'Validação com a CAM', '—', 'A preencher no SR2'],
          ]}
        />
        <Lista
          itens={[
            'A coluna "realizado" é preenchida no fim, com o que aconteceu — não antes.',
            'Desvio sem explicação não conta: cada linha diz por que mudou.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'futuro',
    titulo: 'Trabalho futuro declarado',
    resumo: 'o que o semestre não cobre, dito na cara em vez de escondido.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Item', 'Por que ficou de fora']}
          linhas={[
            [
              'Persistência em banco no runtime',
              'O schema com RLS está escrito e testado, mas o app roda no seed — ver ADR-011',
            ],
            [
              'Autenticação real por perfil',
              'O seletor é simulado; as políticas que resolveriam isso existem no schema guardado',
            ],
            [
              'Integração com a folha de pagamento',
              'Fora do escopo desde a proposta: o produto calcula e audita, não paga',
            ],
            [
              'Rate limit persistente no painel',
              'O contador vive na memória do processo; em serverless isso é best-effort e está declarado',
            ],
            [
              'CSP com nonce por requisição',
              'A política atual usa unsafe-inline, herdado do bootstrap do framework',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
