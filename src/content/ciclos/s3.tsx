import { Cartao, Grade, Lista, Nota, Tabela } from '@/components/conteudo'
import {
  ALTERNATIVAS,
  NOTA_DA_ESCOLHA,
  RAZOES_DA_ESCOLHA,
  TECNICAS_DE_IDEACAO,
} from '@/content/analises'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's3',
  marcador: 'PRUMO-MARCADOR-CICLO-s3',

  objetivo: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo:
      'Levantar várias ideias de solução com técnicas de ideação, as dinâmicas de gerar ideias em grupo. Depois, escolher uma com critérios claros. É essa que vamos construir.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Preparamos o roteiro das três dinâmicas de ideias. Para cada uma, definimos o tempo, o material e o que ela deve produzir.',
      'Levantamos oito alternativas de solução. Todas partiram da pesquisa da Semana 2.',
      'Montamos a matriz de priorização, uma tabela que compara as alternativas. Cada ideia recebe nota em três critérios: impacto, esforço e aderência. Aderência é o quanto a ideia cabe na realidade do órgão público.',
      'Combinamos os critérios de decisão antes da votação. Assim ninguém escolhe só por preferência pessoal.',
      'Fizemos a primeira reunião com o representante do cliente em 22/08. A ata está registrada como documento desta semana.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao: 'Critérios de avaliação fixados antes das ideias.',
        porque: 'Critério definido depois tende a justificar a ideia de quem fala mais alto.',
      },
      {
        decisao: 'Aderência ao órgão público: critério com peso próprio.',
        porque:
          'Solução boa na técnica pode morrer no órgão: licitação (pregão), portaria nova, troca de equipe. Se não sobrevive a isso, não serve.',
      },
      {
        decisao:
          'Ideia escolhida: sistema com regra parametrizável e memória de cálculo auditável. Ou seja: regra ajustável sem mudar o programa, e conta aberta para conferir.',
        porque:
          'Ela ataca a causa: a regra hoje vive escondida nas fórmulas da planilha. Uma planilha mais bonita só trataria o sintoma, e essa ideia cabe no semestre.',
      },
      {
        decisao:
          'Refazer o modelo do MVP já, com o que a reunião com o cliente revelou. Mudam três coisas: os itens medidos (subindicadores), os tipos de unidade e a rede por distrito.',
        porque:
          'O que muda é o coração do modelo, não um detalhe de tela. Cada semana construída sobre o entendimento antigo custaria mais caro de desfazer.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Ainda falta registrar como as três dinâmicas aconteceram de verdade. Esta parte é preenchida na semana, com fotos e o material produzido.',
      'A planilha real de cálculo, prometida na reunião, ainda não chegou. Sem ela, seguimos com suposições declaradas, marcadas na ata. Uma: como os itens medidos formam o indicador. Outra: como as unidades formam a nota do distrito.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        origem: 'cliente',
        texto:
          'O que a unidade preenche são os itens medidos, chamados subindicadores. Cada item é um valor direto ou um numerador e um denominador. O indicador é calculado a partir deles. As metas e os pesos dependem do tipo da unidade. A rede tem três níveis: secretaria, distrito sanitário e unidade. O gerente distrital também é avaliado.',
      },
      {
        origem: 'cliente',
        texto:
          'O cliente confirmou o que o MVP já fazia. A conta é mensal. A regra muda de ano em ano e fica guardada com número de versão. Um número corrigido guarda o valor antigo no histórico. Cada perfil vê só o que é do seu nível. Dá para exportar planilha. Pedido novo: um prazo de revisão de cinco dias no fim do mês.',
      },
      {
        origem: 'equipe',
        texto:
          'Mantivemos de propósito a alternativa de “só melhorar a planilha” na matriz. Ela é o ponto de comparação (a linha de base) para medir o ganho real do sistema.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Escrever a proposta de solução em uma página.',
      'Definir o que entra e o que fica fora do escopo. Montar a primeira lista de tarefas (o backlog) em histórias de usuário.',
      'Fechar o cronograma de trabalho até o marco SR1.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        integrante: 'joao-pedro',
        contribuicao: 'Conduziu as dinâmicas e organizou o material.',
      },
      {
        integrante: 'gabriel',
        contribuicao: 'Definiu os critérios e conduziu a escolha.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Trouxe as dores da pesquisa para as ideias.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Estimou o esforço técnico de cada alternativa.',
      },
      {
        integrante: 'rafael',
        contribuicao:
          'Avaliou quais alternativas geram dado útil para o modelo de aprendizado de máquina.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Registrou a dinâmica e escreveu a justificativa da escolha.',
      },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        tipo: 'documento',
        rotulo: 'Matriz de priorização',
        url: '/#ciclo-s3',
      },
      {
        tipo: 'documento',
        rotulo: 'Reunião com o cliente registrada',
        url: '#doc-s3-reuniao-cliente',
      },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'reuniao-cliente',
    titulo: 'Reunião com o cliente (22/08)',
    resumo:
      'a ata resumida: o que a conversa confirmou, o que mudou no desenho do sistema e o que ficou para conferir.',
    Conteudo: () => (
      <>
        <p>
          Foi a primeira conversa com o representante do órgão (SECOGE/SESAU) sobre o processo
          real da gratificação. A ata abaixo é um resumo e não cita nome de pessoa. É a regra de
          privacidade do projeto: importa o papel, não a identidade.
        </p>

        <div className="mt-4">
          <Tabela
            colunas={['O que o MVP já cobria', 'O que a reunião mudou']}
            linhas={[
              [
                'O indicador era preenchido direto, com meta e peso próprios',
                'O que se preenche é o item medido, o SUBINDICADOR. Ele é um valor direto (um índice) ou um numerador e um denominador (uma razão). O indicador é calculado a partir desses itens.',
              ],
              [
                'Áreas técnicas sem hierarquia, todas com as mesmas metas e pesos',
                'As metas e os pesos dependem do TIPO da unidade (USF, CAPS, UPA, policlínica). Conforme o tipo, só alguns indicadores valem, e os pesos mudam.',
              ],
              [
                'Um gestor por área',
                'A rede tem três níveis: secretaria, distrito sanitário e unidade. O gerente distrital também é avaliado. A nota dele junta as notas das unidades do distrito.',
              ],
              [
                'Correção dentro do prazo de lançamento',
                'Um prazo de REVISÃO de cinco dias no fim do mês. O valor antigo fica guardado no histórico.',
              ],
              [
                'Perfis CAM, área técnica, gestor e auditoria',
                'Quatro papéis, com nome: gerente de unidade, gerente distrital, administrador da plataforma e coordenação da SEAB.',
              ],
            ]}
          />
        </div>

        <div className="mt-4">
          <Grade colunas={2}>
            <Cartao titulo="Gerente de unidade" etiqueta="ator 1">
              <p>
                Dirige uma unidade de saúde. Preenche os itens medidos do mês. Responde pela
                nota da unidade, que segue as metas e os pesos do tipo dela.
              </p>
            </Cartao>
            <Cartao titulo="Gerente distrital" etiqueta="ator 2">
              <p>
                Acompanha as unidades do distrito, cerca de trinta na rede real. Revisa os
                números no prazo de revisão. Também é avaliado: a nota dele junta as notas das
                unidades.
              </p>
            </Cartao>
            <Cartao titulo="Administrador" etiqueta="ator 3">
              <p>
                Cuida da plataforma: cadastros, acessos e o histórico de quem mudou o quê.
                Administra a ferramenta, não as notas.
              </p>
            </Cartao>
            <Cartao titulo="Coordenação da SEAB" etiqueta="ator 4">
              <p>
                Coordena o processo. Define as metas e os pesos, cobra os números e faz a conta.
                Aprova, publica e responde às contestações.
              </p>
            </Cartao>
          </Grade>
        </div>

        <p className="mt-4">
          <strong>O que a conversa confirmou</strong> do que o MVP já fazia. A conta é mensal. A
          regra muda de ano em ano e fica guardada com número de versão. Um número corrigido
          guarda o valor antigo. Cada perfil vê só o que é do seu nível. Dá para exportar
          planilha. E os dados ficam guardados com todo o histórico.
        </p>

        <div className="mt-3">
          <Nota>
            Suposições declaradas por nós, a conferir com a planilha real prometida. Razão =
            numerador ÷ denominador. Indicador com vários itens medidos = média simples dos
            itens apurados. Nota do distrito = média simples das unidades. Se a planilha disser
            diferente, vira uma versão nova da regra, não uma reescrita do sistema.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'tecnicas-ideacao',
    titulo: 'Roteiro das três técnicas',
    resumo:
      'brainwriting, brainstorming e crazy 8’s: quanto tempo cada uma leva e o que produz.',
    Conteudo: () => (
      <>
        <Grade colunas={3}>
          {TECNICAS_DE_IDEACAO.map((tecnica) => (
            <Cartao
              key={tecnica.nome}
              titulo={tecnica.nome}
              etiqueta={`${tecnica.minutos} min`}
            >
              <p>{tecnica.como}</p>
              <p>
                <strong>Produto:</strong> {tecnica.produto}
              </p>
            </Cartao>
          ))}
        </Grade>
      </>
    ),
  },
  {
    id: 'alternativas',
    titulo: 'Alternativas levantadas',
    resumo:
      'as oito ideias e a matriz de impacto, esforço e aderência: a nota de cada uma nos três critérios.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Alternativa', 'Impacto', 'Esforço', 'Aderência', 'Situação']}
          linhas={ALTERNATIVAS.map((a) => [
            a.nome,
            String(a.impacto),
            String(a.esforco),
            String(a.aderencia),
            a.situacao,
          ])}
        />
      </>
    ),
  },
  {
    id: 'justificativa',
    titulo: 'Justificativa da escolha',
    resumo: 'por que a alternativa escolhida venceu as outras.',
    Conteudo: () => (
      <>
        <Lista itens={RAZOES_DA_ESCOLHA.map((r) => `${r.titulo}: ${r.texto}`)} />
        <div className="mt-3">
          <Nota>{NOTA_DA_ESCOLHA}</Nota>
        </div>
      </>
    ),
  },
] as const satisfies readonly Documento[]
