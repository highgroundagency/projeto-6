import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import { CSD_EM_25_09 } from '@/content/analises'
import { nomeCurto } from '@/content/equipe'
import { COMPROMISSOS_ATE_O_SR1 } from '@/content/pitch'
import {
  ATIVIDADE_2,
  BACKLOG_DE_PRIVACIDADE,
  BASE_LEGAL_DA_ATIVIDADE,
  DADOS_PESSOAIS,
  DADOS_SENSIVEIS,
  NORMAS_DA_POLITICA,
  NOTA_DA_IMPLANTACAO,
  NOTA_DA_PORTARIA,
  REQUISITOS_DE_PRIVACIDADE,
  contarRequisitos,
} from '@/content/privacidade'
import { OBJETIVOS_ESPECIFICOS, URL_REPOSITORIO } from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'
import { BACKLOG, ROTULO_ESTADO_HISTORIA, contarBacklog, type EstadoHistoria } from './s6'

/**
 * SR1: primeira apresentação de resultados. PLANO, não relato.
 *
 * ESTÁ PÚBLICO ANTES DA DATA, por trava (`src/content/travas.ts`), e o selo
 * `rascunho` não aparece para ninguém (ADR-026). Quem abre o site lê tudo aqui
 * como fato. Por isso avanços e responsáveis estão no futuro, e as evidências
 * têm rótulos que já são verdade hoje ("Protótipo navegável", e não
 * "Protótipo apresentado"). Depois do SR1, alguém troca o plano pelo que
 * aconteceu, com data, e valida os blocos.
 *
 * O bloco `feedback` fica 'nenhum' DE PROPÓSITO e é o único que não pode ser
 * preenchido antes da hora: o retorno da banca é fala de terceiro, e escrever
 * por ela seria fabricar evidência. Ele é preenchido no dia, com origem
 * declarada. Se continuar 'nenhum' depois do SR1, o site passa a dizer que a
 * banca não disse nada, o que também seria falso.
 */
export const registro = {
  ciclo: 'sr1',
  marcador: 'PRUMO-MARCADOR-CICLO-sr1',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Mostrar à banca o problema, a pesquisa e o protótipo navegável. Sair da apresentação com o retorno da banca anotado e em ordem de prioridade.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Vamos apresentar o problema, a pesquisa e o que mudou desde o Kick-off.',
      'Vamos demonstrar o sistema ao vivo, do lançamento à memória de cálculo.',
      'Vamos mostrar o que prometemos no Kick-off e em que pé está cada promessa.',
      'Vamos entregar o pacote do SR1. O mapa abaixo leva a cada evidência da matriz.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Demonstrar ao vivo, sem vídeo gravado.',
        porque:
          'Um vídeo gravado esconde travamentos e não prova que o sistema roda. Se cair ao vivo, cai na frente de todo mundo, e isso também é informação.',
      },
      {
        decisao: 'Dizer o que ficou para trás antes de a banca perguntar.',
        porque:
          'O Kick-off prometeu três coisas até aqui. Uma saiu em parte e outra não saiu. O documento de correção de rota diz por quê.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'As perguntas 4 e 6 a 13 para a Secretaria continuam abertas. Sem elas, a regra não fica conferida até o SR1.',
    ],
  },

  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Anotar neste bloco de feedback o que a banca disser, e de quem veio.',
      'Trocar este plano pelo que aconteceu no dia, com data.',
      'Reordenar o backlog, a lista de tarefas das quatro sprints, pelo que a banca apontar.',
      'Marcar para a Semana 11 a conversa de validação com a Comissão de Avaliação de Metas (CAM).',
    ],
  },

  /* A fala segue as partes da rubrica no deck do SR1 (ADR-047), e os sete
     falam. No Kick-off a fala foi dividida entre seis, porque Kerry chegou no
     dia (ver ko.tsx). */
  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao:
          'Vai abrir a apresentação, mostrar o problema e o planejado contra o realizado, com o avanço.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Vai mostrar a pesquisa, a matriz CSD e as personas com o mapa de empatia.',
      },
      {
        integrante: 'kerry',
        contribuicao:
          'Vai mostrar o benchmarking, a SWOT e os objetivos, e fechar com a conclusão e os próximos passos.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao:
          'Vai mostrar as técnicas de ideação e os protótipos, e explicar a demonstração ao vivo.',
      },
      {
        integrante: 'rafael',
        contribuicao:
          'Vai mostrar os critérios da escolha, o que cada disciplina pôs no produto e o balanço.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao:
          'Vai mostrar a solução e os diferenciais, e operar o sistema na demonstração.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Vai mostrar o ciclo de vida, os papéis e as ferramentas, com o site e o Drive.',
      },
    ],
  },

  /* Só o que sai deste cartão. Os documentos do próprio SR1 já aparecem logo
     abaixo, e repetir o atalho fazia o bloco parecer quebrado (commit 9be0aca).
     As âncoras de outras semanas passam pelo teste de âncora do registro. */
  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Protótipo navegável', url: '/sistema' },
      { tipo: 'documento', rotulo: 'Deck do SR1', url: '/sr1' },
      { tipo: 'documento', rotulo: 'Riscos', url: '#doc-s6-riscos' },
      { tipo: 'documento', rotulo: 'Escopo revisado', url: '#doc-s6-escopo-revisado' },
      { tipo: 'documento', rotulo: 'Backlog com estado', url: '#doc-s6-backlog' },
      { tipo: 'documento', rotulo: 'A planilha da Secretaria', url: '#doc-s5-planilha' },
      { tipo: 'documento', rotulo: 'Arquitetura em quatro níveis', url: '/arquitetura' },
      { tipo: 'dashboard', rotulo: 'Lente de ML', url: '/ml' },
      { tipo: 'documento', rotulo: 'Uso de IA', url: '/transparencia-ia' },
      { tipo: 'codigo', rotulo: 'Código e testes', url: URL_REPOSITORIO },
    ],
  },
} satisfies RegistroSemana

/* ---------------------------------------------------------------------------
   O mapa do pacote
   ------------------------------------------------------------------------- */

export interface Destino {
  readonly rotulo: string
  readonly href: string
}

export interface LinhaDoPacote {
  /** Precisa bater, letra por letra, com uma evidência de `cronograma.ts`. */
  readonly evidencia: string
  readonly onde: readonly [Destino, ...Destino[]]
  readonly mostra: string
}

/**
 * Uma linha por evidência que a matriz pede na Semana 6 e no SR1.
 *
 * É o mesmo papel da tabela de critérios do Kick-off, com uma diferença: aqui
 * cada destino é um link. `sr1.test.ts` confere que as evidências são as do
 * cronograma, todas, e que cada âncora `#doc-` tem documento de destino.
 */
export const MAPA_DO_PACOTE = [
  {
    ciclo: 's6',
    linhas: [
      {
        evidencia: 'Pacote SR1',
        onde: [{ rotulo: 'Checklist do SR1', href: '#doc-s6-checklist' }],
        mostra: 'Este mapa, e o critério de pronto de cada item.',
      },
      {
        evidencia: 'Protótipo atualizado',
        onde: [{ rotulo: 'O sistema', href: '/sistema' }],
        mostra: 'As oito telas, com dados de teste. Cada perfil vê só o que é seu.',
      },
      {
        evidencia: 'Escopo revisado',
        onde: [{ rotulo: 'Escopo revisado', href: '#doc-s6-escopo-revisado' }],
        mostra: 'O que entrou, o que saiu e o que ficou para depois, com motivo.',
      },
      {
        evidencia: 'Cronograma e backlog',
        onde: [
          { rotulo: 'Backlog com estado', href: '#doc-s6-backlog' },
          { rotulo: 'Cronograma', href: '#cronograma' },
        ],
        mostra: 'Cada história com o estado no código. Cada entrega com dono e data.',
      },
      {
        evidencia: 'Riscos',
        onde: [{ rotulo: 'Riscos', href: '#doc-s6-riscos' }],
        mostra: 'Cada risco com probabilidade, impacto, mitigação e dono.',
      },
    ],
  },
  {
    ciclo: 'sr1',
    linhas: [
      {
        evidencia: 'Pesquisa consolidada',
        onde: [
          { rotulo: 'Síntese da pesquisa', href: '#doc-sr1-sintese-da-pesquisa' },
          { rotulo: 'Personas e mapa de empatia', href: '#doc-s2-personas' },
          { rotulo: 'Reunião com o cliente', href: '#doc-s3-reuniao-cliente' },
          { rotulo: 'A planilha da Secretaria', href: '#doc-s5-planilha' },
        ],
        mostra: 'Cada fonte com a data e o que ela mudou no produto. A matriz CSD atualizada.',
      },
      {
        evidencia: 'Escopo maduro',
        onde: [
          { rotulo: 'Escopo revisado', href: '#doc-s6-escopo-revisado' },
          { rotulo: 'Backlog com estado', href: '#doc-s6-backlog' },
        ],
        mostra:
          'O escopo depois da portaria e da planilha. O que depende da Secretaria está dito.',
      },
      {
        evidencia: 'Protótipo de baixa/média fidelidade',
        onde: [
          { rotulo: 'Wireframes', href: '#doc-ko-wireframes' },
          { rotulo: 'O sistema', href: '/sistema' },
        ],
        mostra: 'Os desenhos do Kick-off e as telas que saíram deles.',
      },
      {
        evidencia: 'Desenvolvimento iniciado',
        onde: [
          { rotulo: 'O código', href: URL_REPOSITORIO },
          { rotulo: 'Arquitetura do MVP', href: '#doc-s5-arquitetura' },
        ],
        mostra: 'O motor com as regras v1, v2 e v3. Os testes rodam a cada envio ao GitHub.',
      },
      {
        evidencia: 'Evidências técnicas',
        onde: [
          { rotulo: 'Arquitetura em quatro níveis', href: '/arquitetura' },
          { rotulo: 'Nuvem e fluxo de dados', href: '#doc-s5-nuvem' },
          { rotulo: 'Segurança', href: '#doc-sr1-seguranca' },
          { rotulo: 'Direito e LGPD', href: '#doc-sr1-direito-base-legal' },
          { rotulo: 'Privacy by design', href: '#doc-sr1-privacy-by-design' },
          { rotulo: 'Lente de ML', href: '/ml' },
          { rotulo: 'Uso de IA', href: '/transparencia-ia' },
        ],
        mostra: 'Uma peça por lente técnica, cada uma no seu lugar.',
      },
      {
        evidencia: 'Plano de correção de rota',
        onde: [{ rotulo: 'Correção de rota', href: '#doc-sr1-correcao-de-rota' }],
        mostra: 'O que prometemos, o que fizemos, e o ajuste de cada desvio.',
      },
    ],
  },
] as const satisfies readonly {
  readonly ciclo: 's6' | 'sr1'
  readonly linhas: readonly LinhaDoPacote[]
}[]

function Destinos({ onde }: { onde: readonly Destino[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
      {onde.map((destino) => {
        const externo = destino.href.startsWith('http')
        return (
          <li key={destino.href}>
            <a
              href={destino.href}
              {...(externo ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
              className="underline underline-offset-4 hover:text-acento"
            >
              {destino.rotulo} {externo ? '↗' : '→'}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Evidência → onde está. Lista de definição e não tabela: com três colunas a
 * tabela rolava de lado a 360px e escondia justamente os links, que são a
 * razão de o mapa existir. Aqui a evidência fica em cima no celular e à
 * esquerda na tela larga, com os mesmos hairlines das tabelas.
 */
function MapaDoPacote({ linhas }: { linhas: readonly LinhaDoPacote[] }) {
  return (
    <dl className="divide-y divide-linha border border-linha text-sm">
      {linhas.map((linha) => (
        <div
          key={linha.evidencia}
          className="grid gap-2 px-3 py-3 sm:grid-cols-[13rem_1fr] sm:gap-4"
        >
          <dt className="leading-relaxed text-texto">{linha.evidencia}</dt>
          <dd className="leading-relaxed">
            <Destinos onde={linha.onde} />
            <p className="mt-1.5 text-apagado">{linha.mostra}</p>
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ---------------------------------------------------------------------------
   Segurança, transcrita de docs/seguranca.md
   ------------------------------------------------------------------------- */

/**
 * As tabelas de `docs/seguranca.md`, transcritas para o site (regra 5).
 *
 * A FONTE É O ARQUIVO. Aqui só muda a forma: sem travessão, sem markdown. A
 * contagem não muda, e `sr1.test.ts` confere as três contra o arquivo e contra
 * `CONTAGENS_PITCH`. A única linha escrita de novo é a de vazamento de dado
 * pessoal, que segue a fronteira da ADR-044.
 */
export const AMEACAS_STRIDE = [
  [
    'Spoofing: fingir ser quem opera o painel',
    'Painel /admin',
    'Senha única conferida só no servidor, em tempo constante. Cookie httpOnly assinado com HMAC-SHA256, válido por 30 dias',
    'Implementado',
  ],
  [
    'Spoofing: fingir ser outro perfil no sistema',
    'Seletor de perfil',
    'Não mitigado, por desenho. O seletor é login simulado, e a tela diz isso. É cookie de cada visitante, então trocar de perfil não afeta ninguém. As regras de acesso do banco (RLS) estão escritas e testadas, mas não ligadas ao app',
    'Risco aceito e declarado',
  ],
  [
    'Tampering: adulterar o cookie de sessão',
    '/admin',
    'O conteúdo é assinado. Qualquer alteração invalida a assinatura, conferida em tempo constante',
    'Implementado',
  ],
  [
    'Tampering: adulterar o cookie da visão',
    'Cookie prumo_visao',
    'Mesma assinatura. O conteúdo é conferido de novo com zod depois da assinatura',
    'Implementado',
  ],
  [
    'Tampering: alterar resultado já homologado',
    'Motor de cálculo',
    'A regra tem versão. Mudar cria versão nova e não toca na vigente. Recalcular o mês antigo dá o mesmo número',
    'Implementado',
  ],
  [
    'Repudiation: negar que informou um valor',
    'Lançamentos',
    'Histórico que só cresce, com autor, hora, antes e depois. Correção entra como evento novo. Em memória, depende de a camada de escrita ser o único caminho. No schema guardado, um gatilho garante o mesmo',
    'Parcial',
  ],
  [
    'Information disclosure: vazar conteúdo de release futuro',
    'Registro e telas',
    'Portão no servidor, carregamento sob demanda e server-only. Rota não liberada devolve 404. Verificação automática no CI',
    'Implementado e testado',
  ],
  [
    'Information disclosure: vazar dado pessoal',
    'A base do sistema e ml/data',
    'Dado de pessoa nunca entra. O sistema roda numa base inventada, e um teste recusa CPF, e-mail, telefone e matrícula nela. A base por unidade da SESAU é dado da instituição e entra em ml/data com autorização (ADR-044). Um segundo teste varre essa pasta linha a linha. Nenhum teste pega a identificação indireta: 39 combinações de tipo e distrito têm uma linha só, e a autorização por escrito para publicar ainda falta',
    'Parcial',
  ],
  [
    'Denial of service: força bruta no login',
    '/api/admin/entrar',
    '5 tentativas a cada 10 minutos por IP, com erro genérico',
    'Parcial: o contador vive na memória',
  ],
  [
    'Denial of service: sobrecarga da aplicação',
    'Toda a aplicação',
    'Limites da plataforma (Vercel). Páginas leves, sem consulta pesada',
    'Delegado à plataforma',
  ],
  [
    'Elevation of privilege: acessar /admin sem sessão',
    '/admin e /api/admin',
    'Filtro na borda (middleware) e sessão conferida de novo em cada página e rota',
    'Implementado',
  ],
  [
    'Elevation of privilege: agir fora do próprio perfil',
    'APIs do sistema',
    'Cada rota confere o perfil antes de agir e recusa dizendo o motivo',
    'Implementado, sobre login simulado',
  ],
  [
    'Elevation of privilege: abrir tela de outro perfil pela URL',
    'As 8 telas do sistema',
    'O perfil é conferido antes de qualquer renderização, com 404 e não 403. Vale também para as rotas antigas. Um teste percorre 8 telas contra 4 perfis (ADR-023)',
    'Implementado, sobre login simulado',
  ],
  [
    'Tampering: adulterar a demonstração alheia',
    '/api/sistema/ciclo',
    'A mudança de etapa não volta atrás pela tela. Exige sessão de admin, e o controle nem aparece para quem não tem',
    'Implementado',
  ],
] as const

export const ITENS_OWASP = [
  [
    'A01 Quebra de controle de acesso',
    'Parcial',
    'Painel protegido em duas camadas. Avançar o ciclo exige a mesma sessão. As oito telas conferem o perfil no servidor, com 404. Mas o perfil vem de um seletor simulado: isso organiza, não protege',
  ],
  [
    'A02 Falhas criptográficas',
    'Coberto',
    'HMAC-SHA256 pela Web Crypto. Segredo só em variável de ambiente. Nenhuma senha guardada',
  ],
  [
    'A03 Injeção',
    'Coberto',
    'O app não monta SQL. Toda entrada passa pelo zod, e o JSX escapa a saída. A semeadura usa consultas com parâmetro',
  ],
  [
    'A04 Design inseguro',
    'Coberto',
    'Regra com versão e histórico que só cresce são decisões de desenho contra adulteração',
  ],
  [
    'A05 Configuração incorreta',
    'Parcial',
    'CSP, X-Frame-Options, nosniff, Referrer-Policy e HSTS aplicados. A CSP ainda usa unsafe-inline',
  ],
  [
    'A06 Componentes vulneráveis',
    'Parcial',
    'O npm audit acusa 3 avisos altos em dependências do Next (postcss, sharp). Só saem com o Next 16, fora do escopo. São de build, não de execução',
  ],
  [
    'A07 Falhas de identificação',
    'Parcial',
    'O sistema não autentica: o perfil é simulado. O painel usa senha única, sem MFA, com limite de tentativas em memória',
  ],
  [
    'A08 Integridade de software e dados',
    'Coberto',
    'Conteúdo com versão no Git. O painel não edita conteúdo por formulário',
  ],
  [
    'A09 Falhas de log e monitoração',
    'Parcial',
    'O histórico da aplicação é completo. O log de acesso fica com a plataforma',
  ],
  ['A10 SSRF', 'N/A', 'A aplicação não faz requisição a endereço informado pelo usuário'],
] as const

export const LIMITACOES_DE_SEGURANCA = [
  'O seletor de perfil não é autenticação. Num site público, qualquer pessoa troca entre os quatro perfis. A única credencial real é a sessão de admin.',
  'A escrita do sistema não tem banco. O que se grava fica num diário assinado no cookie do próprio navegador e some quando ele fecha. Até 03/10 ficava na memória do servidor, e na Vercel a página não enxergava o que a rota tinha gravado (ADR-048). Lançamento e contestação ficam abertos a qualquer visitante, por decisão, e cada visitante só vê o que ele mesmo escreveu.',
  'Esconder o link do painel reduz tropeço, não é segurança. A proteção real é trocar a senha em produção.',
  'A CSP usa unsafe-inline para script e estilo. O próximo passo é um nonce por requisição.',
  'Não há proteção CSRF além do cookie sameSite=lax. Basta para formulário da mesma origem, não para uma API pública.',
  'A base por unidade da SESAU em ml/data é pública, porque o repositório é. Dado de pessoa não entra, e um teste varre a pasta inteira. Mas 39 das 90 combinações de tipo e distrito têm uma linha só, o que pode apontar a unidade e, por ela, o gerente. A análise está no documento de Direito, logo abaixo.',
] as const

/* ---------------------------------------------------------------------------
   Correção de rota
   ------------------------------------------------------------------------- */

type CicloDoCompromisso = (typeof COMPROMISSOS_ATE_O_SR1)[number]['ciclo']

interface Balanco {
  readonly estado: 'feito' | 'em parte' | 'não feito'
  readonly motivo: string
  readonly ajuste: string
}

/** Um balanço por compromisso: o tipo obriga a cobrir os três. */
const BALANCO_DOS_COMPROMISSOS: Record<CicloDoCompromisso, Balanco> = {
  s5: {
    estado: 'em parte',
    motivo:
      'O método da portaria entrou como regra v3 em 23/09. Os indicadores continuam os 8 de teste, e os cortes das classes são suposição.',
    ajuste:
      'Os 5 indicadores da portaria entram nas sprints. Os cortes entram como versão nova da regra, quando a SEAB responder.',
  },
  s6: {
    estado: 'feito',
    motivo:
      'As três primeiras telas estão no ar desde 11/09, véspera do Kick-off. As oito, desde 25/09.',
    ajuste: 'Nenhum.',
  },
  sr1: {
    estado: 'feito',
    motivo:
      'A regra 3 foi conferida com a planilha que a própria Secretaria usa, enviada em 22/09, e segue o método dela.',
    ajuste:
      'A validação com quem opera o processo fica na Semana 11, e as perguntas 4 e 6 a 13 vão por escrito.',
  },
}

/** Os objetivos específicos com prazo até o SR1, com o balanço de cada um. */
const BALANCO_DOS_OBJETIVOS: Readonly<Record<string, Balanco>> = {
  'a regra como dado': {
    estado: 'em parte',
    motivo:
      'A regra tem versão: v1, v2 e v3. A v3 entrou em 23/09, e nenhum mês publicado mudou de nota. Mas a v3 pediu código novo no motor: a regra ainda muda por código.',
    ajuste: 'Cadastrar a regra pela tela, que está no backlog.',
  },
  'a conta sempre aberta': {
    estado: 'em parte',
    motivo:
      'A memória de cálculo abre na tela meu resultado. O ranking do painel da gestão mostra a nota sem a conta.',
    ajuste: 'Levar a memória de cálculo a toda tela que mostra nota.',
  },
  'cada um vê o que é seu': {
    estado: 'feito',
    motivo:
      'Cada tela confere o perfil no servidor e devolve 404 a quem não pode. O perfil ainda vem de um seletor, sem login.',
    ajuste: 'O login da prefeitura segue fora do escopo, como na Semana 4.',
  },
}

const OBJETIVOS_ATE_O_SR1 = OBJETIVOS_ESPECIFICOS.filter(
  (o) => o.quando === 'Semana 5' || o.quando === 'SR1',
)

function balancoDoObjetivo(resumo: string): Balanco {
  const balanco = BALANCO_DOS_OBJETIVOS[resumo]
  if (!balanco) throw new Error(`Objetivo sem balanço na correção de rota: ${resumo}`)
  return balanco
}

const MUST_QUE_NAO_ESTAO_NO_AR = BACKLOG.filter((h) => h.moscow === 'M' && h.estado !== 'no_ar')

/* ---------------------------------------------------------------------------
   Histórias que surgiram na construção
   ------------------------------------------------------------------------- */

/**
 * O que o sistema faz e nenhuma das 26 histórias da Semana 4 pedia (ADR-049).
 *
 * ESCRITO EM 03/10, DEPOIS DA BANCA, a partir do código: cada linha é uma
 * função que já está no ar e se confere na tela. A maioria já estava no código
 * antes do backlog da Semana 4 (29/08) e ficou de fora dele. A data "16/08" é
 * a do commit mais antigo que o histórico do Git guarda, não a da construção.
 *
 * FORA DA CONTA DAS 26, DE PROPÓSITO. `BACKLOG` (s6) é o retrato de 25/09, e o
 * deck do SR1 conta o avanço a partir dele. O deck não importa este arquivo, e
 * `sr1.test.ts` segura isso: nada daqui muda um número que a banca viu. E
 * nenhuma história daqui toma o lugar das que faltam: abrir o mês, cadastrar a
 * régua pela tela e responder à contestação continuam no backlog, com estado.
 *
 * Sem MoSCoW: já estão construídas, e prioridade serve para decidir o que
 * construir. Elas entram na ordem das sprints junto com o resto do backlog.
 */
export interface HistoriaDaConstrucao {
  readonly epico: string
  /** No formato da Semana 4: como quem, quero o quê, para quê. */
  readonly historia: string
  /** Só entra o que existe. O que falta é história do backlog, não daqui. */
  readonly estado: Extract<EstadoHistoria, 'no_ar' | 'em_parte'>
  /** De onde a função veio, com a data ou a decisão que se confere. */
  readonly origem: string
  /** Onde se confere, em uma frase. */
  readonly onde: string
}

/** As do produto: servem a quem usaria o sistema na Secretaria. */
export const HISTORIAS_DA_CONSTRUCAO: readonly HistoriaDaConstrucao[] = [
  {
    epico: 'Ciclo',
    historia:
      'Como SEAB, quero ver, unidade por unidade, quem já informou os números do mês e quem falta, para cobrar só quem está atrasado',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08, por área. Virou por unidade depois da reunião de 22/08',
    onde: 'Painel da SEAB: o funil por unidade e a lista de pendências',
  },
  {
    epico: 'Lançamento',
    historia:
      'Como SEAB, quero lançar no lugar de uma unidade atrasada, ficando registrado que fui eu, para o mês não travar',
    estado: 'no_ar',
    origem: 'Entrou na remodelagem de 25/08 (ADR-034). O autor na trilha, em 26/08',
    onde: 'Tela de lançamento, no perfil SEAB. Na trilha, quem aparece como autor é a SEAB',
  },
  {
    epico: 'Lançamento',
    historia:
      'Como SEAB, quero que o sistema recuse lançamento em mês que não está aberto e guarde a tentativa, para nada entrar fora do prazo sem deixar rastro',
    estado: 'no_ar',
    origem: 'ADR-046, em 25/09: a tela dizia que a tentativa ficava registrada, e não ficava',
    onde: 'Trilha de auditoria: lançamento recusado. Aparece quando alguém tenta lançar depois que a SEAB fecha o mês, e há teste automático',
  },
  {
    epico: 'Resultado',
    historia:
      'Como SEAB, quero ver as unidades da maior nota para a menor, na rede ou num distrito, para enxergar o conjunto',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08',
    onde: 'Painel da gestão: o ranking das unidades',
  },
  {
    epico: 'Resultado',
    historia:
      'Como SEAB, quero esconder os nomes no ranking e na planilha exportada, para mostrar o resultado numa reunião sem expor ninguém',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08',
    onde: 'Painel da gestão: esconder os nomes. A planilha sai com as unidades numeradas e sem o distrito',
  },
  {
    epico: 'Resultado',
    historia:
      'Como gerente distrital, quero ver o painel e baixar a planilha só do meu distrito, para não ver o recorte dos outros',
    estado: 'em_parte',
    origem: 'Reunião com o cliente, em 22/08. Entrou em 25/08',
    onde: 'Painel da gestão, no perfil distrital: não há a opção da rede toda, nem na planilha. O distrito ainda é escolhido, porque o login é simulado',
  },
  {
    epico: 'Governança',
    historia:
      'Como SEAB, quero ver os números que parecem erro de digitação, para conferir antes de homologar o mês',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08',
    onde: 'Analytics: os valores cinco vezes acima ou abaixo da meta do tipo da unidade',
  },
  {
    epico: 'Governança',
    historia:
      'Como SEAB, quero ver se cada unidade é consistente ou oscila, acima ou abaixo da meta, para saber onde ajudar primeiro',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08, por área',
    onde: 'Analytics: o jeito de cada unidade',
  },
  {
    epico: 'Governança',
    historia:
      'Como SEAB, quero ver o que os modelos treinados dizem, sempre com a referência ao lado, para não confiar num número sem comparação',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08. Desde 23/09, os modelos leem a base por unidade da Secretaria (ADR-043)',
    onde: 'Analytics: os três modelos, cada um com método, métrica e linha de base',
  },
  {
    epico: 'Governança',
    historia:
      'Como administrador, quero que cada perfil abra só as telas do próprio papel, e que as outras nem apareçam, para ninguém ver o que não é seu',
    estado: 'no_ar',
    origem: 'ADR-023, em 16/08: cinco das oito telas não conferiam o perfil',
    onde: 'Tela fora do perfil responde 404, e um teste percorre as 8 telas contra os 4 perfis. O perfil ainda vem do seletor, sem login',
  },
  {
    epico: 'Uso',
    historia:
      'Como quem chega ao sistema, quero um tutorial que me leve pela tela do meu papel, apontando cada botão, para aprender sem treinamento',
    estado: 'no_ar',
    origem: 'ADR-024, em 16/08: quem usou pediu um tutorial que conduzisse',
    onde: 'Topo do sistema: um tutorial guiado para cada perfil',
  },
  {
    epico: 'Uso',
    historia:
      'Como quem usa o sistema, quero um tema claro, para ler bem em sala, no projetor e em tela ruim',
    estado: 'no_ar',
    origem: 'ADR-027, em 18/08',
    onde: 'Botão de tema, no topo do sistema',
  },
]

/** As do protótipo: servem a quem avalia, não a quem usaria o sistema. */
export const HISTORIAS_DO_PROTOTIPO: readonly HistoriaDaConstrucao[] = [
  {
    epico: 'Protótipo',
    historia:
      'Como quem avalia o protótipo, quero trocar de perfil sem login, para ver o sistema pelos olhos de cada papel',
    estado: 'no_ar',
    origem: 'Já estava no sistema em 16/08. O login da prefeitura ficou fora do escopo na Semana 4',
    onde: 'Seletor de perfil, no topo do sistema',
  },
  {
    epico: 'Protótipo',
    historia:
      'Como quem avalia o protótipo, quero testar numa cópia só minha, para não mudar a demonstração dos outros',
    estado: 'no_ar',
    origem: 'ADR-046, em 25/09: o lançamento de um avaliador aparecia na tela do outro. Refeito em 03/10 (ADR-048)',
    onde: 'Lançamento e contestação ficam só no navegador de quem fez, e somem quando ele fecha',
  },
]

const HISTORIAS_DO_BACKLOG_NO_AR = BACKLOG.filter((h) => h.estado === 'no_ar').length

function contarDaConstrucao(estado: HistoriaDaConstrucao['estado']): number {
  return HISTORIAS_DA_CONSTRUCAO.filter((h) => h.estado === estado).length
}

/* ---------------------------------------------------------------------------
   Documentos
   ------------------------------------------------------------------------- */

export const documentos = [
  {
    id: 'pacote',
    titulo: 'Pacote de entrega do SR1',
    resumo: 'o mapa para quem avalia: cada evidência da matriz com o link do que a sustenta.',
    Conteudo: () => (
      <>
        <p>
          A matriz pede {cicloPorId('s6').evidencias.length} evidências no Pré-SR1 e{' '}
          {cicloPorId('sr1').evidencias.length} no SR1. Cada linha abaixo aponta para o
          documento ou a página que sustenta uma delas. Quem avalia não precisa procurar.
        </p>
        {MAPA_DO_PACOTE.map((bloco) => (
          <div key={bloco.ciclo} className="mt-4">
            <Secao titulo={cicloPorId(bloco.ciclo).rotulo}>
              <MapaDoPacote linhas={bloco.linhas} />
            </Secao>
          </div>
        ))}
        <p className="mt-4 text-sm">
          A apresentação do SR1 fica em{' '}
          <a href="/sr1" className="underline underline-offset-4 hover:text-acento">
            /sr1 →
          </a>
          , no mesmo formato da do Kick-off. Nenhuma peça é PDF: tudo é conteúdo do site,
          guardado no Git com histórico de versões.
        </p>
      </>
    ),
  },
  {
    id: 'sintese-da-pesquisa',
    titulo: 'Síntese da pesquisa',
    resumo: 'cada fonte com a data e o que ela mudou no produto, e a matriz csd de 25/09.',
    Conteudo: () => (
      <>
        <Secao
          titulo="As fontes, na ordem em que chegaram"
          descricao="O que cada fonte mudou no produto. As personas e o benchmarking estão na Semana 2."
        >
          <Tabela
            colunas={['Fonte', 'Quando', 'O que mudou no produto']}
            linhas={[
              [
                'O caso escrito pela escola com o órgão',
                'Semana 1',
                'Definiu o problema: a conta é feita à mão, por poucas pessoas. Uma tentativa anterior de automatizar parou.',
              ],
              [
                'Personas, mapa de empatia, benchmarking e SWOT',
                'Semana 2',
                'Personagens inventados a partir dos papéis do caso, sem entrevista. Deram as dores que o backlog atende.',
              ],
              [
                'Reunião com o cliente (SECOGE/SESAU)',
                '22/08',
                'O que se preenche é o item medido. A régua muda por tipo de unidade. Os quatro papéis ganharam nome (ADR-034).',
              ],
              [
                'A portaria e uma planilha de um ciclo real, sem nomes',
                '05/09',
                'A regra oficial: cinco indicadores, peso por função e prazo de recurso. Ela confirmou o modelo e corrigiu dois pontos (ADR-035).',
              ],
              [
                'A planilha que a Secretaria usa hoje, sem nomes, com as fórmulas',
                '22/09',
                'Mostrou o método real, que virou a regra v3 (ADR-041). Confirmou os sete tipos de unidade da portaria (ADR-042).',
              ],
              [
                'A base de desempenho por unidade da Secretaria',
                '23/09',
                'Uma linha por unidade e por distrito, sem nenhuma pessoa. Entrou na lente de ML com autorização (ADR-043 e ADR-044).',
              ],
            ]}
          />
        </Secao>

        <Secao
          titulo="A matriz CSD em 25/09"
          descricao="A matriz do Kick-off fica onde está. Esta é a versão de 25/09, com o que a planilha e a base responderam."
        >
          <Tabela
            colunas={['Certeza', 'De onde vem']}
            linhas={CSD_EM_25_09.certezas.map((l) => [l.item, l.origem])}
          />
          <div className="mt-4">
            <Tabela
              colunas={['Suposição', 'De onde vem']}
              linhas={CSD_EM_25_09.suposicoes.map((l) => [l.item, l.origem])}
            />
          </div>
          <div className="mt-4">
            <Tabela
              colunas={['Dúvida', 'A quem perguntar']}
              linhas={CSD_EM_25_09.duvidas.map((l) => [l.item, l.origem])}
            />
          </div>
          <div className="mt-3">
            <Nota>
              O que mudou desde a matriz de 12/09, a do dia do Kick-off. A dúvida do peso do
              art. 8º foi respondida pela planilha (pergunta 3). A suposição de que as unidades
              mandam tudo por planilha virou certeza (pergunta 5). A suposição de que a planilha
              confirmaria o nosso modelo caiu: três pontos dele estavam errados. As perguntas
              estão em docs/perguntas-para-a-sesau.md.
            </Nota>
          </div>
        </Secao>

        <Secao titulo="O que a pesquisa ainda não tem">
          <Lista
            itens={[
              'Entrevista com quem opera o processo. As personas vieram do caso e da reunião de 22/08.',
              'A conferência da conta do sistema contra a da Secretaria. Ela fica para a Semana 11.',
            ]}
          />
        </Secao>
      </>
    ),
  },
  {
    id: 'correcao-de-rota',
    titulo: 'Correção de rota',
    resumo: 'o que prometemos até o sr1, o que fizemos, e o ajuste de cada desvio.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Os três compromissos do Kick-off"
          descricao="O que o slide do cronograma prometeu até o SR1, com quem puxava cada um."
        >
          <Tabela
            colunas={['Compromisso', 'Até', 'Quem puxa', 'Estado', 'Por quê', 'Ajuste']}
            linhas={COMPROMISSOS_ATE_O_SR1.map((c) => {
              const b = BALANCO_DOS_COMPROMISSOS[c.ciclo]
              return [
                c.compromisso,
                cicloPorId(c.ciclo).rotulo,
                nomeCurto(c.quem),
                b.estado,
                b.motivo,
                b.ajuste,
              ]
            })}
          />
          <div className="mt-3">
            <Nota>
              A data da conferência com a Secretaria aparecia de dois jeitos: “até o SR1” no
              Kick-off e “Semana 11” no objetivo “conferido com o cliente”. Ficamos com a Semana
              11 para a validação com quem opera o processo. A conferência da regra foi feita
              antes, em 22/09, com a planilha que a própria Secretaria usa.
            </Nota>
          </div>
        </Secao>

        <Secao
          titulo="Os objetivos com prazo até o SR1"
          descricao="Os objetivos específicos do produto que venciam na Semana 5 ou no SR1."
        >
          <Tabela
            colunas={['Objetivo', 'Prazo', 'Estado', 'Por quê', 'Ajuste']}
            linhas={OBJETIVOS_ATE_O_SR1.map((o) => {
              const b = balancoDoObjetivo(o.resumo)
              return [o.resumo, o.quando, b.estado, b.motivo, b.ajuste]
            })}
          />
        </Secao>

        <Secao
          titulo="As histórias obrigatórias do backlog"
          descricao={`Das ${contarBacklog('M')} obrigatórias, ${contarBacklog('M', 'no_ar')} estão no ar. Estas são as que não estão.`}
        >
          <Tabela
            colunas={['História', 'Estado', 'Por quê', 'Ajuste']}
            linhas={MUST_QUE_NAO_ESTAO_NO_AR.map((h) => [
              h.historia,
              h.estado === 'so_leitura' ? 'só leitura' : 'falta',
              h.onde,
              h.estado === 'so_leitura'
                ? 'Tela de cadastro nas sprints, na ordem que o retorno da banca pedir'
                : 'Entra nas sprints, na ordem que o retorno da banca pedir',
            ])}
          />
        </Secao>

        <Secao titulo="O que a planilha mudou no plano">
          <Lista
            itens={[
              'A regra v3 entrou na Semana 5, como previsto. O prazo do art. 9º, que viria junto, ficou para as sprints.',
              'O método da v3 veio da planilha, e não só da portaria. Três suposições nossas estavam erradas.',
              'Os 5 indicadores da portaria e o porte ficaram para as sprints.',
              'A planilha trouxe perguntas novas para a Secretaria: NDI e SAE, porte e peso excepcional.',
              'Entra nas sprints um teste que confere a conta do motor contra linhas reais da base por unidade. Hoje os testes do motor usam só casos inventados.',
            ]}
          />
        </Secao>

        <Secao titulo="O retorno da banca">
          <p className="text-sm">
            Entra aqui depois do SR1, com a origem de cada fala. O que a banca pedir reordena o
            backlog das sprints.
          </p>
        </Secao>
      </>
    ),
  },
  {
    id: 'seguranca',
    titulo: 'Segurança: ameaças e controles',
    resumo: `as ${AMEACAS_STRIDE.length} ameaças stride, os ${ITENS_OWASP.length} itens owasp e as limitações, transcritos de docs/seguranca.md.`,
    Conteudo: () => (
      <>
        <p>
          A fonte é o arquivo docs/seguranca.md, escrito desde 15/08. Este documento transcreve
          as tabelas dele para o site. Um teste confere que as contagens batem.
        </p>
        <div className="mt-4">
          <Secao
            titulo="STRIDE: as ameaças, uma a uma"
            descricao="Cobre o sistema e também o painel que controla o que o professor vê."
          >
            <Tabela
              colunas={['Ameaça', 'Onde', 'Como tratamos', 'Estado']}
              linhas={AMEACAS_STRIDE}
            />
          </Secao>
          <Secao titulo="OWASP Top 10 (2021)">
            <Tabela colunas={['Risco', 'Estado', 'Observação']} linhas={ITENS_OWASP} />
          </Secao>
          <Secao titulo="Limitações conhecidas">
            <Lista itens={LIMITACOES_DE_SEGURANCA} />
          </Secao>
        </div>
        <div className="mt-3">
          <Nota>
            A identificação indireta pela base por unidade está no documento de Direito, logo
            abaixo.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'direito-base-legal',
    titulo: 'Direito: base legal e dados pessoais',
    resumo:
      'que dado o sistema usaria, de quem, com base em qual artigo da lgpd, e o que muda com a base por unidade.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Base legal para usar os dados"
          descricao="A LGPD permite usar dados pessoais para executar política pública prevista em lei e regulamento. É o art. 7º, III da LGPD."
        >
          <Lista
            itens={[
              'A gratificação foi criada por portaria. Sem usar esses dados, não há como executá-la.',
              'O sistema não pede consentimento ao servidor, e nem deveria. Numa relação de trabalho desigual, o consentimento seria frágil. E se o servidor recusasse, não daria para respeitar a recusa sem impedir a política.',
              'Quem responde pelos dados (a controladora) é a Secretaria de Saúde do Recife. O encarregado (a pessoa de contato sobre dados) é indicado pela Prefeitura. O sistema só mostra o canal para falar com ele.',
            ]}
          />
        </Secao>

        <Secao
          titulo="Quais dados o sistema guardaria"
          descricao="O que existiria no sistema real, de quem seria cada dado e para que serviria."
        >
          <Tabela
            colunas={['Categoria', 'Titular', 'Necessário para']}
            linhas={[
              [
                'Quem é o servidor (nome, matrícula, cargo, lotação)',
                'Servidor avaliado',
                'Ligar o resultado à pessoa certa',
              ],
              [
                'Onde o servidor trabalha (área, período de exercício)',
                'Servidor avaliado',
                'Saber quais indicadores valem para ele',
              ],
              [
                'Desempenho (a nota, chamada de score, a faixa, a memória de cálculo e o histórico)',
                'Servidor avaliado',
                'Calcular a gratificação e explicar o resultado',
              ],
              [
                'Quem fez o lançamento (quem informou, quando)',
                'Servidor da área técnica',
                'Ter o histórico de quem informou, para poder responsabilizar',
              ],
              [
                'Contestação (motivo, resposta da comissão)',
                'Servidor avaliado',
                'Garantir o direito de defesa (devido processo)',
              ],
            ]}
          />
          <Nota>
            O sistema não tem campo para dado sensível, os do art. 5º, II. O único lugar onde um
            pode entrar sem querer é o texto livre da contestação, e por isso o formulário avisa
            para não escrever. A Atividade 2 de Direito, no documento abaixo, trata esse e os
            outros casos. O sistema também não guarda dados de pacientes, dados bancários nem
            valores de folha. Ele só calcula o percentual devido. A folha de pagamento é outro
            sistema, e deixamos isso fora do escopo de forma declarada.
          </Nota>
        </Secao>

        <Secao titulo="No sistema, nenhuma pessoa">
          <Lista
            itens={[
              'O sistema roda numa base 100% sintética, ou seja, inventada por programa. Ela usa uma semente fixa, por isso sai sempre igual. Nenhum servidor real está nela.',
              'Um teste automático confere essa base. Ele falha se aparecer CPF, e-mail, telefone ou matrícula.',
              'A tabela acima descreve o que existiria no sistema real. Assim, a análise jurídica não precisa esperar o dado real chegar.',
            ]}
          />
        </Secao>

        <Secao
          titulo="Na lente de ML, dado da instituição"
          descricao="A lente de aprendizado de máquina lê outra base: a de desempenho por unidade da Secretaria."
        >
          <Lista
            itens={[
              'A base tem uma linha por unidade de saúde e por distrito. Traz tipo, distrito, indicador e número.',
              'Não traz nome, CPF, matrícula, e-mail nem telefone. É dado da instituição, não de pessoa.',
              'Ela entrou em ml/data com autorização da Secretaria, registrada na ADR-044. A autorização não se estende à base do sistema.',
              'Um segundo teste varre ml/data inteiro, linha a linha: src/lib/dados-do-cliente.test.ts. Ele falha com CPF, e-mail, telefone ou coluna que identifique pessoa.',
            ]}
          />
        </Secao>

        <Secao
          titulo="Identificação indireta"
          descricao="Sem nome, alguém ainda pode ser identificado por cruzamento. Pelo art. 5º, I da LGPD, dado pessoal inclui o de pessoa identificável."
        >
          <Lista
            itens={[
              'Na base, 39 das 90 combinações de tipo e distrito têm uma linha só.',
              'Uma unidade única no distrito pode apontar quem a dirige. E é o gerente quem recebe a gratificação.',
              'Assim, o desempenho da unidade pode virar dado de uma pessoa identificável.',
            ]}
          />
          <div className="mt-3">
            <Tabela
              colunas={['O que falta decidir', 'Por quê']}
              linhas={[
                [
                  'A autorização por escrito da Secretaria para publicar',
                  'Hoje ela está registrada só no texto da ADR-044, e o repositório é público',
                ],
                [
                  'Generalizar as combinações únicas, ou justificar a publicação',
                  'Generalizar tira a unidade única da base. Justificar pede dizer com que base legal ela fica',
                ],
              ]}
            />
          </div>
        </Secao>
      </>
    ),
  },
  {
    id: 'privacy-by-design',
    titulo: 'Direito: requisitos de privacy by design',
    resumo: `a atividade 2 de direito: ${DADOS_PESSOAIS.length} dados pessoais mapeados, ${REQUISITOS_DE_PRIVACIDADE.length} riscos com requisito e teste, e onde cada requisito está hoje.`,
    Conteudo: () => (
      <>
        <p className="text-sm leading-relaxed">
          A Atividade 2 de {ATIVIDADE_2.disciplina} ({ATIVIDADE_2.peso}), entregue em{' '}
          {formatarBR(ATIVIDADE_2.entrega)}, levantou os requisitos de privacidade da plataforma
          antes do código: que dado pessoal ela trataria, o que pode dar errado com cada um e que
          controle evita o risco. Cada requisito nomeia o princípio de privacy by design que o
          sustenta e traz um critério de verificação que dá para testar. Este documento
          transcreve o catálogo e acrescenta uma coluna que o original não tem: onde cada
          requisito está hoje no sistema.
        </p>

        <Secao
          titulo="Base legal"
          descricao="Por que a plataforma pode tratar esses dados sem pedir consentimento."
        >
          <Lista itens={BASE_LEGAL_DA_ATIVIDADE} />
          <div className="mt-3">
            <Nota>
              {NOTA_DA_PORTARIA} As normas da política: {NORMAS_DA_POLITICA.join(', ')}.
            </Nota>
          </div>
        </Secao>

        <Secao
          titulo="Os dados pessoais que a plataforma trataria"
          descricao={`${DADOS_PESSOAIS.length} categorias, classificadas pelo art. 5º, I e II da LGPD. ${DADOS_SENSIVEIS.length} são sensíveis ou podem ser, a maioria por inferência.`}
        >
          <Tabela
            colunas={['Dado', 'Classificação', 'Por quê']}
            linhas={DADOS_PESSOAIS.map((d) => [d.dado, d.classe, d.porque])}
            alinharNumeros={false}
          />
          <div className="mt-3">
            <Nota>
              No protótipo, nenhum desses dados é de pessoa real: o sistema roda só com dados de
              teste. Dos sensíveis, só um tem lugar no protótipo hoje, o texto livre da
              contestação, e o formulário avisa para não escrever dado sensível nele.
            </Nota>
          </div>
        </Secao>

        <Secao
          titulo="Riscos e requisitos"
          descricao={`${REQUISITOS_DE_PRIVACIDADE.length} riscos, cada um com o requisito que o trata e o critério que prova que o requisito foi cumprido.`}
        >
          <Tabela
            colunas={['Nº', 'Risco', 'Requisito', 'Critério de verificação']}
            linhas={REQUISITOS_DE_PRIVACIDADE.map((r, i) => [
              String(i + 1),
              r.risco,
              r.requisito,
              r.criterio,
            ])}
          />
        </Secao>

        <Secao
          titulo="Onde cada requisito está hoje"
          descricao={`${contarRequisitos('no MVP')} já valem no sistema, ${contarRequisitos('em parte')} valem em parte, ${contarRequisitos('no backlog')} estão no backlog e ${contarRequisitos('na implantação')} dependem de infraestrutura real.`}
        >
          <Tabela
            colunas={['Nº', 'Princípio', 'Estado', 'O que existe e o que falta']}
            linhas={REQUISITOS_DE_PRIVACIDADE.map((r, i) => [
              String(i + 1),
              r.principio,
              r.estado,
              r.hoje,
            ])}
          />
        </Secao>

        <Secao
          titulo="O que a atividade acrescenta ao sistema"
          descricao="O backlog de privacidade. Os números da coluna de riscos são os das tabelas acima."
        >
          <Tabela
            colunas={['Item', 'O que é', 'Riscos', 'Estado']}
            linhas={BACKLOG_DE_PRIVACIDADE.map((b) => [
              b.item,
              b.detalhe,
              b.riscos.length ? b.riscos.join(', ') : 'todos',
              b.estado,
            ])}
          />
          <div className="mt-3">
            <Nota>{NOTA_DA_IMPLANTACAO}</Nota>
          </div>
        </Secao>
      </>
    ),
  },
  {
    id: 'historias-da-construcao',
    titulo: 'Histórias que surgiram na construção',
    resumo: `o que o sistema já faz e não estava nas ${BACKLOG.length} histórias do backlog, escrito como história em 03/10, depois da banca.`,
    Conteudo: () => (
      <>
        <p>
          O backlog da Semana 4 tem {BACKLOG.length} histórias. O sistema faz mais do que elas
          pedem. Várias funções nasceram enquanto construíamos, a maioria antes do próprio
          backlog. Nenhuma história as registrava. Em 03/10, depois da banca do SR1, escrevemos
          cada uma no formato da Semana 4. E conferimos todas na tela.
        </p>

        <Secao
          titulo="Do produto"
          descricao={`${HISTORIAS_DA_CONSTRUCAO.length} histórias: ${contarDaConstrucao('no_ar')} no ar e ${contarDaConstrucao('em_parte')} em parte. Servem a quem usaria o sistema na Secretaria.`}
        >
          <Tabela
            colunas={['Épico', 'História', 'Estado', 'De onde veio', 'Onde se confere']}
            linhas={HISTORIAS_DA_CONSTRUCAO.map((h) => [
              h.epico,
              h.historia,
              ROTULO_ESTADO_HISTORIA[h.estado],
              h.origem,
              h.onde,
            ])}
          />
        </Secao>

        <Secao
          titulo="Do protótipo"
          descricao={`${HISTORIAS_DO_PROTOTIPO.length} histórias. Servem a quem avalia o protótipo, não a quem usaria o sistema.`}
        >
          <Tabela
            colunas={['História', 'Estado', 'De onde veio', 'Onde se confere']}
            linhas={HISTORIAS_DO_PROTOTIPO.map((h) => [
              h.historia,
              ROTULO_ESTADO_HISTORIA[h.estado],
              h.origem,
              h.onde,
            ])}
          />
        </Secao>

        <div className="mt-3">
          <Nota>
            Estas histórias ficam fora da conta das {BACKLOG.length}. O avanço continua o que
            mostramos no SR1: {HISTORIAS_DO_BACKLOG_NO_AR} de {BACKLOG.length} no ar. Nenhuma
            delas toma o lugar das {BACKLOG.length - HISTORIAS_DO_BACKLOG_NO_AR} que faltam. Essas
            seguem no{' '}
            <a href="#doc-s6-backlog" className="underline underline-offset-4 hover:text-acento">
              backlog com estado →
            </a>
            , e entram nas sprints.
          </Nota>
        </div>
      </>
    ),
  },
] as const satisfies readonly Documento[]
