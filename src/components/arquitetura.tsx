import {
  Building2,
  CalendarClock,
  Gauge,
  GitBranch,
  MessageSquareWarning,
  PencilLine,
  Ruler,
  Scale,
  ScrollText,
  Sigma,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { DiagramaConteineres, DiagramaContexto } from '@/components/arquitetura-c4'
import { AcaoDoFluxo, Conector, EstadoDoFluxo, Fluxo } from '@/components/base/fluxo'
import { URL_REPOSITORIO } from '@/content/produto'

/**
 * Os desenhos da arquitetura (C4), como componente compartilhado.
 *
 * Renderizados NA PELE DO SISTEMA (ADR-031): quem chega aqui quer entender o
 * produto, e a pele de cartões e ícones explica melhor que a folha de
 * especificação. A gramática visual é a de C4 de verdade: cartão com ícone é
 * gente ou peça, caixa com cabeçalho é fronteira, tracejado é o que existe mas
 * está desligado, e toda seta tem rótulo dizendo o que passa por ela.
 *
 * Os campos do diagrama de classes vêm de src/lib/calculo/tipos.ts, o arquivo
 * real: desenho que inventa atributo ensina errado.
 */


/** As classes do domínio, com os campos REAIS de src/lib/calculo/tipos.ts. */
interface Classe {
  icone: LucideIcon
  nome: string
  campos: readonly string[]
  ligacoes: readonly string[]
  nota?: string
}

const CLASSES: readonly Classe[] = [
  {
    icone: Building2,
    nome: 'Área',
    campos: ['nome', 'sigla'],
    ligacoes: ['tem 1 gestor', 'tem N indicadores'],
  },
  {
    icone: UserRound,
    nome: 'Gestor',
    campos: ['nome', 'cargo', 'areaId'],
    ligacoes: ['pertence a 1 área', 'recebe 1 avaliação por mês'],
    nota: 'sem CPF, sem matrícula, sem endereço: o que não existe não vaza',
  },
  {
    icone: Ruler,
    nome: 'Indicador',
    campos: ['nome', 'unidade', 'direção', 'meta', 'peso', 'fonte'],
    ligacoes: ['pertence a 1 área', 'recebe N lançamentos'],
  },
  {
    icone: CalendarClock,
    nome: 'Ciclo (o mês)',
    campos: ['competência', 'estado', 'janela de lançamento', 'regraId'],
    ligacoes: ['usa 1 regra', 'recebe N lançamentos'],
    nota: 'anda uma etapa por vez e nunca volta',
  },
  {
    icone: PencilLine,
    nome: 'Lançamento',
    campos: ['valor', 'evidência', 'autor', 'registradoEm', 'status'],
    ligacoes: ['de 1 indicador', 'em 1 ciclo'],
  },
  {
    icone: Scale,
    nome: 'Regra de pontuação',
    campos: ['versão', 'vigenteDe / vigenteAté', 'faixas de pontos', 'faixas de gratificação', 'teto de atingimento'],
    ligacoes: ['calcula N avaliações'],
    nota: 'imutável: mudança vira versão nova, a antiga fica valendo para os meses dela',
  },
  {
    icone: Gauge,
    nome: 'Avaliação',
    campos: ['score (0 a 100)', 'faixa', 'memória de cálculo', 'avisos'],
    ligacoes: ['de 1 gestor', 'num 1 ciclo', 'pela regra vigente'],
  },
  {
    icone: MessageSquareWarning,
    nome: 'Contestação',
    campos: ['motivo', 'status', 'resposta'],
    ligacoes: ['aberta por 1 gestor', 'sobre 1 ciclo'],
  },
]

const PROMPT_DIAGRAMAS = `Você é um arquiteto de software especialista no modelo C4. Crie os
diagramas do sistema descrito abaixo, em quatro entregas: (1) contexto,
C4 nível 1; (2) contêineres, C4 nível 2; (3) um fluxo simples do caminho
de um número, do lançamento até a nota; (4) um diagrama de classes do
domínio.

Regras de honestidade, que valem mais que estética: não invente
componentes, campos nem integrações; o banco aparece com anotação
"escrito e testado, NÃO ligado ao aplicativo"; o pipeline de ML roda
offline e o site apenas lê um JSON versionado, nenhuma predição entra no
cálculo; os dados são 100% sintéticos e vivem em memória; o seletor de
papéis é login simulado de demonstração.

FATOS. Nome: Prumo, sistema web acadêmico (CESAR School) que substitui
a planilha da gratificação por desempenho da SESAU Recife. Pessoas:
CAM (gere o mês e homologa), área técnica (informa os números da própria
área), gestor avaliado (vê a própria nota e contesta), auditoria (lê
tudo, não escreve), professor (lê o registro semanal), dono (opera
liberações por painel com senha). Externos: GitHub (código; push vira
deploy), Vercel (hospedagem serverless), Google Drive (só um link).
Contêineres: aplicação Next.js 15 App Router com React Server Components
(site, 8 telas, painel e motor de cálculo puro: score = soma de pontos x
peso sobre o máximo possível, x 100); middleware Edge protegendo /admin;
route handlers Node (login, ciclo, lançamento, contestação, CSV, tema,
perfil, status); base sintética em memória com semente fixa 20262 (10
áreas, 10 gestores, 30 indicadores, 6 meses, trilha imutável); motor de
liberações por calendário (conteúdo futuro não vai ao navegador; tela
não liberada responde 404); schema PostgreSQL versionado com RLS e 4
gatilhos, testado no CI e DESLIGADO; pipeline de ML offline em Python
que exporta src/content/ml/resultados.json.
Classes do domínio (campos reais): Área (nome, sigla); Gestor (nome,
cargo, areaId; sem CPF nem matrícula, por desenho); Indicador (nome,
unidade, direção, meta, peso, fonte); Ciclo (competência, estado com 5
etapas que andam uma por vez e nunca voltam, janela de lançamento,
regraId); Lançamento (valor, evidência, autor, registradoEm, status);
Regra de pontuação (versão, vigência, faixas de pontos, faixas de
gratificação, teto; imutável, muda-se de versão); Avaliação (score 0 a
100, faixa, memória de cálculo, avisos); Contestação (motivo, status,
resposta); Evento de auditoria (quando, autor, tipo, entidade, antes,
depois; append-only, registra todas as outras classes). Ligações: Área
1-1 Gestor e 1-N Indicador; Ciclo usa 1 Regra e recebe N Lançamentos;
Lançamento referencia 1 Indicador e 1 Ciclo; Avaliação liga 1 Gestor a
1 Ciclo pela Regra vigente; Contestação é de 1 Gestor sobre 1 Ciclo.

SAÍDA: cada diagrama num bloco Mermaid separado (C4Context, C4Container,
flowchart e classDiagram), rótulos em português, uma linha por
descrição, sem travessão. Uma única cor de destaque, laranja #F7580B.
Feche com uma legenda de 3 linhas explicando como ler C4 para quem
nunca viu.`

function Rotulado({ eyebrow, titulo }: { eyebrow: string; titulo: string }) {
  return (
    <header>
      <p className="rotulo text-acento">{eyebrow}</p>
      <h2 className="fonte-display mt-0.5 text-xl leading-snug">{titulo}</h2>
    </header>
  )
}

export function ConteudoArquitetura() {
  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      <section id="contexto" className="scroll-mt-6" aria-label="Desenho de contexto">
        <Rotulado eyebrow="C4 · nível 1 · contexto" titulo="O sistema visto de fora" />
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-apagado">
          Como ler: caixa arredondada é pessoa, a caixa laranja é o nosso sistema, o
          tracejado em volta é onde ele vive, e toda seta diz o que passa por ela. Em tela
          estreita, o desenho rola para o lado.
        </p>
        <div className="mt-5 rounded-2xl border border-linha bg-cartao p-3 shadow-[0_1px_2px_var(--color-sombra)] sm:p-5">
          <DiagramaContexto />
        </div>
      </section>

      <section id="conteineres" className="mt-12 scroll-mt-6" aria-label="Desenho de contêineres">
        <Rotulado eyebrow="C4 · nível 2 · contêineres" titulo="As peças da caixa" />
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-apagado">
          Abrindo a caixa laranja: cada retângulo é um contêiner (uma peça que roda ou
          guarda algo), o cilindro é base de dados, e o cilindro tracejado existe, está
          testado, e está desligado de propósito.
        </p>
        <div className="mt-5 rounded-2xl border border-linha bg-cartao p-3 shadow-[0_1px_2px_var(--color-sombra)] sm:p-5">
          <DiagramaConteineres />
        </div>
      </section>

      <section id="fluxo" className="mt-12 scroll-mt-6" aria-label="O caminho de um número">
        <Rotulado eyebrow="o produto em um desenho" titulo="O caminho de um número" />
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-apagado">
          Do dedo da área técnica até a nota do gestor, tudo passa por aqui, nesta ordem.
        </p>

        <div className="mt-6">
          <Fluxo>
            <AcaoDoFluxo icone={<PencilLine size={18} strokeWidth={1.5} />} titulo="Lançamento">
              a área informa o valor e diz de onde ele veio. entrada inválida é recusada na
              hora, e fora do prazo o campo trava.
            </AcaoDoFluxo>
            <Conector />
            <AcaoDoFluxo icone={<ScrollText size={18} strokeWidth={1.5} />} titulo="Trilha">
              cada lançamento vira um registro que não se apaga: quem, quando, e como estava
              antes.
            </AcaoDoFluxo>
            <Conector />
            <AcaoDoFluxo icone={<Scale size={18} strokeWidth={1.5} />} titulo="Regra vigente">
              a versão da regra que valia naquele mês entra na conta. regra não se edita:
              muda-se de versão.
            </AcaoDoFluxo>
            <Conector />
            <AcaoDoFluxo icone={<Sigma size={18} strokeWidth={1.5} />} titulo="Motor de cálculo">
              função pura: mesma entrada, mesma saída, sempre. sai a nota, a faixa e a memória
              de cálculo passo a passo.
            </AcaoDoFluxo>
            <Conector />
            <EstadoDoFluxo explicacao="o gestor vê a nota e a conta aberta; a gestão vê o agregado e exporta">
              nota + memória de cálculo
            </EstadoDoFluxo>
          </Fluxo>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="classes" className="mt-12 scroll-mt-6" aria-label="Diagrama de classes">
        <Rotulado eyebrow="diagrama de classes" titulo="O que o sistema guarda" />
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-apagado">
          Cada cartão é uma classe: o nome, os campos de verdade (tirados do código, não
          inventados) e, embaixo, com quem ela se liga.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {CLASSES.map((c) => (
            <div
              key={c.nome}
              className="overflow-hidden rounded-2xl border border-linha bg-cartao shadow-[0_1px_2px_var(--color-sombra)]"
            >
              <p className="flex items-center gap-2.5 border-b border-linha px-4 py-2.5">
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-superficie text-apagado"
                >
                  <c.icone size={15} strokeWidth={1.8} />
                </span>
                <span className="text-[0.9rem] font-semibold text-texto">{c.nome}</span>
              </p>
              <ul className="numero px-4 py-2.5 text-xs leading-relaxed text-apagado">
                {c.campos.map((campo) => (
                  <li key={campo}>{campo}</li>
                ))}
              </ul>
              <p className="flex flex-wrap gap-1.5 border-t border-linha px-4 py-2.5">
                {c.ligacoes.map((l) => (
                  <span key={l} className="pilula">
                    {l}
                  </span>
                ))}
              </p>
              {c.nota ? (
                <p className="border-t border-linha bg-superficie px-4 py-2 text-xs text-apagado">
                  {c.nota}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* A trilha embaixo, larga: ela registra todas as outras classes. */}
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-linha bg-cartao p-4 shadow-[0_1px_2px_var(--color-sombra)]">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-superficie text-apagado"
          >
            <ScrollText size={18} strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[0.9rem] font-semibold text-texto">Evento de auditoria</span>
              <span className="numero text-[0.68rem] text-apagado">
                quando · autor · tipo · entidade · antes · depois
              </span>
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-apagado">
              Registra tudo que acontece com todas as classes acima, com o antes e o depois.
              Caderno de caneta, sem borracha: nada se edita, nada se apaga.
            </span>
          </span>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mt-12" aria-label="O prompt de regeneração">
        <Rotulado eyebrow="para redesenhar" titulo="O prompt está aqui" />
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-apagado">
          Estes desenhos também existem em Mermaid no repositório (
          <a
            href={`${URL_REPOSITORIO}/blob/main/docs/arquitetura.md`}
            className="underline underline-offset-4 hover:text-acento"
          >
            docs/arquitetura.md
          </a>
          ). E o texto abaixo, colado em qualquer IA, regenera os quatro, fiéis ao sistema
          real: os fatos e as regras de honestidade já vão dentro.
        </p>

        <details className="group mt-4 overflow-hidden rounded-2xl border border-linha bg-cartao shadow-[0_1px_2px_var(--color-sombra)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-superficie [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 font-medium">
              <GitBranch aria-hidden size={16} strokeWidth={1.7} className="text-apagado" />
              abrir o prompt completo
            </span>
            <span aria-hidden className="text-apagado transition-transform group-open:rotate-90">
              →
            </span>
          </summary>
          <pre className="overflow-x-auto border-t border-linha bg-superficie px-4 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {PROMPT_DIAGRAMAS}
          </pre>
        </details>
      </section>
    </div>
  )
}
