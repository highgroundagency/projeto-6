import { Citacao, Lista, Secao } from "@/components/conteudo";
import { URL_REPOSITORIO } from "@/content/produto";
import type { Documento, RegistroSemana } from "@/lib/registro/tipos";

export const registro = {
  ciclo: "s1",
  marcador: "PRUMO-MARCADOR-CICLO-s1",

  objetivo: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo:
      "Formar a equipe, escolher o case e colocar de pé o registro público do projeto.",
  },

  avancos: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: [
      "Equipe 2 formada com os seis integrantes e canal de comunicação definido.",
      "Case escolhido: a gratificação por desempenho da Secretaria de Saúde do Recife.",
      "Papéis distribuídos por frente, cobrindo as três lentes da disciplina.",
      "Pasta do Drive criada como repositório oficial de documentos.",
      "Registro do projeto publicado como site próprio, no lugar do Google Site.",
    ],
  },

  decisoes: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: [
      {
        decisao: "Adotar o case da SESAU em vez de um problema hipotético.",
        porque:
          "Há cliente real, dor documentada desde 2023 e chance de validar com quem opera o processo.",
      },
      {
        decisao: "Registrar o projeto em site próprio, versionado em Git.",
        porque:
          "O professor dispensou o Google Site, e o registro vira também evidência técnica da disciplina.",
      },
      {
        decisao: "Nenhum dado real de pessoa ou da SESAU entra no repositório.",
        porque:
          "O MVP roda com dados sintéticos: elimina risco de LGPD antes que ele exista.",
      },
      {
        decisao: "Chamar o produto de Prumo.",
        porque:
          "O fio de prumo diz se algo está alinhado — é exatamente o que falta ao cálculo hoje.",
      },
    ],
  },

  bloqueios: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: "nenhum",
  },

  feedback: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: [
      {
        origem: "equipe",
        texto:
          "O case só se sustenta se conseguirmos acesso à portaria e a alguém da CAM. Combinado tentar o contato já na Semana 2.",
      },
    ],
  },

  proximosPassos: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: [
      "Estruturar a pesquisa: personas, mapa de empatia, benchmarking e SWOT.",
      "Contextualizar o problema com fontes públicas sobre gratificação por desempenho no setor público.",
      "Escrever objetivos SMART e o cronograma inicial.",
    ],
  },

  responsaveis: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: [
      {
        integrante: "gabriel",
        contribuicao:
          "Conduziu a escolha do case e o contato inicial com o cliente.",
      },
      {
        integrante: "matheus",
        contribuicao:
          "Levantou o material público sobre o processo de avaliação de metas.",
      },
      {
        integrante: "joao-henrique",
        contribuicao: "Definiu a stack e abriu o repositório.",
      },
      {
        integrante: "joao-pedro",
        contribuicao: "Propôs a identidade visual e o nome do produto.",
      },
      {
        integrante: "rafael",
        contribuicao: "Mapeou onde o módulo de ML entra no problema.",
      },
      {
        integrante: "fernando",
        contribuicao:
          "Montou a estrutura de documentação e o registro de uso de IA.",
      },
    ],
  },

  evidencias: {
    selo: "validado",
    validadoPor: "fernando",
    conteudo: [
      {
        tipo: "codigo",
        rotulo: "Repositório do projeto",
        url: URL_REPOSITORIO,
      },
      {
        tipo: "documento",
        rotulo: "Transparência no uso de IA",
        url: "/transparencia-ia",
      },
    ],
  },
} satisfies RegistroSemana;

export const documentos = [
  {
    id: "escolha-do-case",
    titulo: "Por que este case",
    resumo: "os critérios que levaram a escolher a sesau.",
    Conteudo: () => (
      <>
        <Lista
          itens={[
            "Cliente real e acessível: a Secretaria opera o processo hoje e sente a dor todo ciclo.",
            "Problema com regra explícita: existe portaria, existem indicadores, existe cálculo — dá para modelar de verdade.",
            "Espaço para as três lentes: sistema (Projeto), previsão e perfis (ML) e tratamento de dados de servidores (Direito).",
          ]}
        />
      </>
    ),
  },
  {
    id: "o-que-sabemos",
    titulo: "O que já sabemos do problema",
    resumo: "o que a portaria e o enunciado deixam claro.",
    Conteudo: () => (
      <>
        <Citacao fonte="Descrição do case, registrada na Semana 1">
          A consolidação da gratificação é feita à mão, em planilhas, por uma
          comissão pequena. Uma tentativa anterior de automatizar foi abandonada
          por falta de recursos. O conhecimento do processo está concentrado em
          poucas pessoas.
        </Citacao>
      </>
    ),
  },
] as const satisfies readonly Documento[];
