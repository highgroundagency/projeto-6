import { Citacao, Lista } from '@/components/conteudo'
import { URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's1',
  marcador: 'PRUMO-MARCADOR-CICLO-s1',

  objetivo: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: 'Formar a equipe e escolher o case. Colocar de pé o registro público do projeto.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Formamos a Equipe 2 com os seis integrantes. Definimos o canal de comunicação.',
      'Escolhemos o case: a gratificação por desempenho da Secretaria de Saúde do Recife.',
      'Dividimos os papéis por frente de trabalho. As três lentes da disciplina ficaram cobertas.',
      'Criamos a pasta do Drive. Ela é o lugar oficial dos documentos.',
      'Publicamos o registro do projeto num site nosso, no lugar do Google Site.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao: 'Trabalhar com o case real da SESAU.',
        porque:
          'Há um cliente real, não um problema inventado. A dor está documentada desde 2023. E dá para validar com quem opera o processo.',
      },
      {
        decisao: 'Registrar o projeto em site próprio.',
        porque:
          'O professor dispensou o Google Site. Cada versão fica guardada no Git, e o registro vira também evidência técnica da disciplina.',
      },
      {
        decisao: 'Nenhum dado real entra no repositório.',
        porque:
          'Nem de pessoa, nem da SESAU: o protótipo (MVP) usa dados fictícios, gerados por programa. Assim o risco com a lei de proteção de dados (LGPD) some antes de existir.',
      },
      {
        decisao: 'Chamar o produto de Prumo.',
        porque:
          'O fio de prumo mostra se algo está alinhado. É exatamente o que falta ao cálculo hoje.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: 'nenhum',
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'O case só se sustenta com acesso à portaria. E com alguém da Comissão de Avaliação de Metas (CAM). Combinamos tentar o contato já na Semana 2.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Estruturar a pesquisa: personas, mapa de empatia, benchmarking e SWOT.',
      'Situar o problema com fontes públicas sobre gratificação por desempenho no setor público.',
      'Escrever os objetivos SMART e o cronograma inicial.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Conduziu a escolha do case e o primeiro contato com o cliente.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Reuniu o material público sobre o processo de avaliação de metas.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Escolheu as tecnologias e abriu o repositório.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Propôs a identidade visual e o nome do produto.',
      },
      {
        integrante: 'rafael',
        contribuicao: 'Mapeou onde o módulo de aprendizado de máquina (ML) entra no problema.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Montou a estrutura da documentação e o registro de uso de IA.',
      },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        tipo: 'codigo',
        rotulo: 'Repositório do projeto',
        url: URL_REPOSITORIO,
      },
      {
        tipo: 'documento',
        rotulo: 'Transparência no uso de IA',
        url: '/transparencia-ia',
      },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'escolha-do-case',
    titulo: 'Por que este case',
    resumo: 'o que nos levou a escolher a sesau.',
    Conteudo: () => (
      <>
        <Lista
          itens={[
            'Cliente real e acessível: a Secretaria opera o processo hoje. E sente a dor todo ciclo.',
            'Problema com regra escrita: existe portaria, existem indicadores, existe cálculo. Dá para modelar isso de verdade.',
            'Espaço para as três lentes. O sistema cobre a lente de Projeto. Previsão e perfis cobrem a de aprendizado de máquina (ML). O tratamento de dados de servidores cobre a de Direito.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'o-que-sabemos',
    titulo: 'O que já sabemos do problema',
    resumo: 'o que a portaria e o enunciado deixam claro.',
    Conteudo: () => (
      <>
        <Citacao fonte="Descrição do case, registrada na Semana 1">
          A conta da gratificação é fechada à mão, em planilhas, por uma comissão pequena. Uma
          tentativa anterior de automatizar foi abandonada por falta de recursos. O conhecimento
          do processo fica com poucas pessoas.
        </Citacao>
      </>
    ),
  },
] as const satisfies readonly Documento[]
