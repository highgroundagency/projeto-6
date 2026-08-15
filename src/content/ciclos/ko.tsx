import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import type { RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 'ko',
  marcador: 'PRUMO-MARCADOR-CICLO-ko',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Apresentar em 5 minutos o problema, sua relevância, a ideia priorizada e o direcionamento do projeto, com fala distribuída entre os seis.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Roteiro do pitch fechado, cronometrado em blocos de aproximadamente 45 segundos por integrante.',
      'Estrutura de slides definida: oito telas, uma ideia por tela.',
      'Demonstração ao vivo da memória de cálculo escolhida como momento central da apresentação.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Mostrar a memória de cálculo ao vivo em vez de descrevê-la em slide.',
        porque:
          'É o argumento do projeto contra a planilha; ver o número se explicar sozinho vale mais que ouvir sobre isso.',
      },
      {
        decisao: 'Cada integrante fala de uma parte que ele mesmo construiu.',
        porque:
          'A diretriz pede fala distribuída, e o domínio real do assunto aparece na hora das perguntas.',
      },
      {
        decisao: 'Abrir pelo problema, não pela solução.',
        porque:
          'A relevância do case é o que sustenta o projeto; a tecnologia é consequência.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: ['Ensaio cronometrado com os seis integrantes ainda não realizado.'],
  },

  feedback: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'Primeira versão do roteiro passava de 7 minutos. O corte foi tirar arquitetura do pitch e deixá-la para a arguição.',
      },
    ],
  },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Ensaiar com cronômetro e ajustar os blocos que estourarem.',
      'Preparar respostas para as três perguntas mais prováveis da banca.',
      'Entrar na Semana 5 com o diagrama de arquitetura e o fluxo de dados prontos.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Abertura: problema e contexto do cliente.' },
      { integrante: 'matheus', contribuicao: 'Relevância: quem sofre e o que a pesquisa mostrou.' },
      { integrante: 'joao-henrique', contribuicao: 'Causa raiz: por que a planilha não escala.' },
      { integrante: 'joao-pedro', contribuicao: 'Demonstração da ideia priorizada e da memória de cálculo.' },
      { integrante: 'rafael', contribuicao: 'Onde entram os modelos e o que eles respondem.' },
      { integrante: 'fernando', contribuicao: 'Governança, privacidade e direcionamento até o SR1.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Roteiro do pitch', url: '/registro#ko' },
    ],
  },
} satisfies RegistroSemana

export function Detalhes() {
  return (
    <>
      <Secao
        titulo="Roteiro do pitch — 5 minutos"
        descricao="Blocos cronometrados. A soma dá 4min45s, deixando 15 segundos de folga para a troca entre quem fala."
      >
        <Tabela
          colunas={['Tempo', 'Quem', 'O que diz', 'Slide']}
          linhas={[
            [
              '0:00–0:45',
              'Gabriel',
              'A SESAU paga gratificação variável desde 2023 com base em indicadores de portaria. A consolidação é manual, em planilha, feita por uma comissão pequena.',
              '1–2',
            ],
            [
              '0:45–1:30',
              'Matheus',
              'Quem sofre: a analista que fecha o ciclo com medo de ter errado, a área que não sabe o que informar, o gestor que recebe um número sem explicação.',
              '3',
            ],
            [
              '1:30–2:15',
              'João Henrique',
              'A causa não é a planilha ser ruim: é a regra da portaria existir apenas dentro de fórmulas. Mudou a portaria, muda tudo à mão.',
              '4',
            ],
            [
              '2:15–3:15',
              'João Pedro',
              'A ideia priorizada, ao vivo: lançamento validado, cálculo e a memória mostrando de onde veio cada número.',
              '5–6',
            ],
            [
              '3:15–4:00',
              'Rafael',
              'Com o histórico de indicadores dá para prever risco de não-atingimento e sinalizar erro provável de digitação. Sinaliza, não bloqueia: a decisão continua humana.',
              '7',
            ],
            [
              '4:00–4:45',
              'Fernando',
              'Trilha de auditoria imutável, dados sintéticos no MVP e base legal mapeada. Direcionamento até o SR1.',
              '8',
            ],
          ]}
        />
      </Secao>

      <Secao titulo="Estrutura de slides">
        <Lista
          itens={[
            'Slide 1 — Prumo, uma linha: o cálculo da gratificação que se explica sozinho.',
            'Slide 2 — O processo hoje, em cinco etapas, com o ponto de quebra marcado.',
            'Slide 3 — As três pessoas afetadas, com uma frase de cada.',
            'Slide 4 — A causa raiz: a regra vive dentro da fórmula.',
            'Slide 5 — A ideia: regra como dado, versionada.',
            'Slide 6 — Demonstração ao vivo da memória de cálculo.',
            'Slide 7 — O que os modelos respondem, com a métrica ao lado.',
            'Slide 8 — Direcionamento até o SR1 e o que estará pronto lá.',
          ]}
        />
      </Secao>

      <Secao titulo="Perguntas prováveis da banca">
        <Lista
          itens={[
            '“Por que não usar uma ferramenta pronta?” — Nenhuma versiona regra normativa nem produz memória de cálculo; a resposta está no benchmarking da Semana 2.',
            '“E se a portaria mudar?” — Regra é dado, não código: cria-se uma nova versão, e os ciclos já homologados continuam reproduzindo o resultado antigo.',
            '“Vocês usam dados reais de servidores?” — Não. O MVP roda com dados sintéticos gerados por script com semente fixa, e isso está documentado.',
          ]}
        />
        <div className="mt-3">
          <Nota>
            O Kick-off tem peso formativo na matriz: a nota não vem daqui, mas o
            direcionamento que sai da arguição orienta tudo até o SR1.
          </Nota>
        </div>
      </Secao>
    </>
  )
}
