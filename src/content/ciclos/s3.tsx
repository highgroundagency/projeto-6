import { Cartao, Grade, Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import type { RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's3',
  marcador: 'PRUMO-MARCADOR-CICLO-s3',

  objetivo: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo:
      'Gerar alternativas de solução com técnicas de ideação e escolher, com critério explícito, a que será desenvolvida.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Roteiro das três técnicas preparado, com tempo, material e produto esperado de cada uma.',
      'Oito alternativas levantadas a partir da pesquisa da Semana 2.',
      'Matriz de impacto × esforço × aderência montada para comparar as alternativas.',
      'Critérios de decisão acordados antes da votação, para evitar escolha por preferência pessoal.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao: 'Fixar os critérios de avaliação antes de gerar as ideias.',
        porque: 'Critério definido depois tende a justificar a ideia de quem fala mais alto.',
      },
      {
        decisao: 'Aderência ao órgão público entra como critério com peso próprio.',
        porque:
          'Solução tecnicamente boa que não sobrevive a pregão, portaria ou rotatividade de equipe não serve.',
      },
      {
        decisao: 'Ideia escolhida: sistema com regra parametrizável e memória de cálculo auditável.',
        porque:
          'Ataca a causa (regra implícita na planilha) e não o sintoma (planilha bonita), e cabe no semestre.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Registro da dinâmica real das três técnicas pendente — esta seção é preenchida na semana com fotos e artefatos.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'A alternativa de “só melhorar a planilha” foi mantida na matriz de propósito: serve de linha de base para comparar ganho real.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Escrever a proposta de solução em uma página.',
      'Definir escopo dentro e fora, e o backlog inicial em histórias de usuário.',
      'Fechar o cronograma de execução até o SR1.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      { integrante: 'joao-pedro', contribuicao: 'Facilitou as dinâmicas e organizou o material.' },
      { integrante: 'gabriel', contribuicao: 'Definiu os critérios e conduziu a priorização.' },
      { integrante: 'matheus', contribuicao: 'Trouxe as dores da pesquisa como insumo das ideias.' },
      { integrante: 'joao-henrique', contribuicao: 'Estimou esforço técnico de cada alternativa.' },
      { integrante: 'rafael', contribuicao: 'Avaliou quais alternativas geram dado aproveitável por modelo.' },
      { integrante: 'fernando', contribuicao: 'Registrou a dinâmica e consolidou a justificativa da escolha.' },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      { tipo: 'documento', rotulo: 'Matriz de priorização', url: '/registro#s3' },
    ],
  },
} satisfies RegistroSemana

export function Detalhes() {
  return (
    <>
      <Secao
        titulo="Roteiro das três técnicas"
        descricao="Estrutura preparada pela equipe. O registro da dinâmica real — fotos, quadros e o que cada pessoa escreveu — entra aqui depois do encontro."
      >
        <Grade colunas={3}>
          <Cartao titulo="Brainwriting" etiqueta="20 min">
            <p>
              Cada integrante escreve três ideias em silêncio, sem discutir, e passa a
              folha adiante. Quem recebe amplia a ideia do colega em vez de criticá-la.
            </p>
            <p>
              <strong>Produto:</strong> 18 ideias escritas, sem viés de quem fala primeiro.
            </p>
          </Cartao>
          <Cartao titulo="Brainstorming" etiqueta="25 min">
            <p>
              Discussão aberta a partir das folhas do brainwriting, agrupando ideias
              parecidas e nomeando os grupos.
            </p>
            <p>
              <strong>Produto:</strong> de 6 a 8 alternativas distintas, já agrupadas.
            </p>
          </Cartao>
          <Cartao titulo="Crazy 8’s" etiqueta="8 min">
            <p>
              Oito esboços de tela em oito minutos, individualmente, para as duas
              alternativas mais votadas.
            </p>
            <p>
              <strong>Produto:</strong> primeiras telas em papel, insumo do protótipo.
            </p>
          </Cartao>
        </Grade>
      </Secao>

      <Secao
        titulo="Alternativas levantadas"
        descricao="Impacto e esforço em escala de 1 a 5; aderência avalia se a solução sobrevive à realidade de um órgão público."
      >
        <Tabela
          colunas={['Alternativa', 'Impacto', 'Esforço', 'Aderência', 'Situação']}
          linhas={[
            ['Planilha padronizada com validação e trava de fórmula', '2', '1', '4', 'Linha de base'],
            ['Formulário de coleta + planilha de consolidação', '2', '2', '4', 'Descartada'],
            ['Sistema web com regra parametrizável e memória de cálculo', '5', '4', '5', 'Escolhida'],
            ['Painel de indicadores sem cálculo de gratificação', '2', '3', '3', 'Descartada'],
            ['Robô que lê as planilhas e consolida sozinho', '3', '4', '2', 'Descartada'],
            ['Módulo dentro de um ERP público existente', '4', '5', '2', 'Descartada'],
            ['Aplicativo mobile para o gestor avaliado', '2', '3', '2', 'Adiada'],
            ['Modelo preditivo de risco de não-atingimento', '3', '3', '4', 'Incorporada'],
          ]}
        />
      </Secao>

      <Secao titulo="Justificativa da escolha">
        <Lista
          itens={[
            'Impacto: ataca a causa do problema — a regra da portaria hoje só existe dentro de fórmulas de planilha.',
            'Aderência: parametrizar indicadores e regras pela interface permite que mudança de portaria não vire mudança de software.',
            'Esforço: alto, mas fatiável — lançamento, cálculo e memória cabem até o SR1; auditoria e gestão vêm nas sprints.',
            'Sinergia: o modelo preditivo não virou produto separado; entrou como funcionalidade da mesma base de dados.',
          ]}
        />
        <div className="mt-3">
          <Nota>
            A alternativa “melhorar a planilha” continua na matriz de propósito: ela é a
            régua contra a qual o ganho do sistema é medido na validação da Semana 11.
          </Nota>
        </div>
      </Secao>
    </>
  )
}
