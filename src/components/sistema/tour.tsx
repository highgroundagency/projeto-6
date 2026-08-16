import type { ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, GraduationCap, X } from 'lucide-react'
import { ICONE_DA_TELA } from '@/components/sistema/icones'
import { TUTORIAIS, type PassoTutorial } from '@/content/tutoriais'
import { PERFIS, featurePorId, type FeatureId, type PerfilId } from '@/lib/features'
import {
  idDoAlvo,
  linkDeSaida,
  linkDoPasso,
  type ParametrosSistema,
} from '@/lib/sistema/parametros'

/**
 * O tutorial guiado: um passeio pelo sistema de verdade.
 *
 * A primeira versão era uma lista numerada dentro de uma sanfona. Ensinava,
 * mas não conduzia: a pessoa lia os nove passos e depois se virava sozinha.
 *
 * Agora o tutorial ENTRA no sistema. Com `?passo=N` a página troca de modo:
 *
 *   - sai tudo o que distrai (sumário, papéis, as outras sete telas);
 *   - a tela do passo fica montada, aberta, sozinha no palco;
 *   - o elemento exato de que o passo fala recebe contorno laranja e etiqueta,
 *     e o navegador rola até ele;
 *   - uma barra grudada no rodapé diz onde você está, o que fazer, por quê, e
 *     leva ao passo seguinte.
 *
 * TUDO NO SERVIDOR, sem uma linha de JavaScript. Cada passo tem URL própria, o
 * botão "voltar" do navegador funciona, e dá para mandar "olha o passo 4" por
 * mensagem. Um passeio em overlay faria mais efeito e dependeria de medir
 * posições no cliente, que é frágil justamente no celular.
 */

/** Quantos passos o perfil tem, já descontado o que ainda não foi liberado. */
export function passosDoTutorial(
  perfil: PerfilId,
  disponiveis: readonly FeatureId[],
): readonly PassoTutorial[] {
  return TUTORIAIS[perfil].passos.filter(
    (passo) => passo.tela === null || disponiveis.includes(passo.tela),
  )
}

/** Para onde o link de um passo aponta: o alvo dele, ou o topo do palco. */
function ancoraDoPasso(passo: PassoTutorial | undefined): string {
  return passo?.alvo ? `#${idDoAlvo(passo.alvo)}` : '#palco'
}

/**
 * O contorno do alvo, injetado como CSS.
 *
 * Por que `<style>` em vez de uma classe: quem sabe qual elemento destacar é o
 * passo, e o elemento vive lá dentro da tela, montada por outro componente.
 * Passar a informação para baixo obrigaria as oito telas a receberem uma prop
 * de tutorial que não é assunto delas. O seletor por `id` resolve de fora, e as
 * telas continuam sem saber que existe tutorial: elas só declaram `alvo="..."`
 * no `Painel`, que vira `id="alvo-..."`.
 *
 * O mesmo `id` é a âncora da rolagem, então o navegador para exatamente no
 * elemento contornado. Um atributo, dois usos, nenhum nome duplicado.
 *
 * A CSP do projeto permite `style-src 'unsafe-inline'`, então isto passa.
 */
function DestaqueDoAlvo({ alvo, ordem }: { alvo: string; ordem: number }) {
  // O nome vem de `tutoriais.ts`, que é dado nosso e não entrada de visitante.
  // Ainda assim, só letras, números e hífen entram no seletor.
  const seguro = alvo.replace(/[^a-z0-9-]/gi, '')
  if (!seguro) return null

  return (
    <style>{`
      #alvo-${seguro} {
        position: relative;
        outline: 2px solid var(--color-acento);
        outline-offset: 6px;
        scroll-margin-top: 4.5rem;
        scroll-margin-bottom: 12rem;
      }
      #alvo-${seguro}::after {
        content: "passo ${String(ordem).padStart(2, '0')}";
        position: absolute;
        top: -0.75rem;
        left: 0.75rem;
        padding: 0.1rem 0.5rem;
        background: var(--color-acento);
        color: var(--color-ink);
        font-family: var(--fonte-mono), monospace;
        font-size: 0.625rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
      }
    `}</style>
  )
}

/**
 * A barra do guia.
 *
 * `sticky bottom-0`, não `fixed`: grudada é igual enquanto se rola, e no fim da
 * página ela entra no fluxo em vez de tapar o rodapé do conteúdo. Com `fixed`
 * era preciso adivinhar um `padding-bottom` que compensasse a altura dela, e a
 * altura muda com o tamanho do texto e da tela: no celular a barra chegava a
 * comer dois terços da janela.
 *
 * O "por que" fica dobrado. Ele é a melhor parte do tutorial e não é o que a
 * pessoa precisa ler para dar o próximo passo.
 */
function BarraDoGuia({
  perfil,
  passos,
  indice,
  params,
}: {
  perfil: PerfilId
  passos: readonly PassoTutorial[]
  /** 1-based, como aparece na tela. */
  indice: number
  params: ParametrosSistema
}) {
  const total = passos.length
  const passo = passos[indice - 1]
  const primeiro = indice === 1
  const ultimo = indice === total
  const feature = passo.tela ? featurePorId(passo.tela) : null

  return (
    <div className="sem-impressao sticky bottom-0 z-40 mt-6 border-t-2 border-acento bg-fundo">
      {/* Trilho de progresso: uma barra por passo, as vencidas em acento. */}
      <ol aria-hidden className="flex gap-1 pt-px">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={`h-0.5 flex-1 ${i < indice ? 'bg-acento' : 'bg-linha'}`} />
        ))}
      </ol>

      <div className="flex flex-col gap-3 px-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="rotulo flex flex-wrap items-center gap-x-2 gap-y-1">
            <GraduationCap aria-hidden size={13} strokeWidth={1.5} />
            <span>
              {PERFIS[perfil].rotulo}: passo {String(indice).padStart(2, '0')} de{' '}
              {String(total).padStart(2, '0')}
            </span>
            {feature ? <span className="text-apagado">· {feature.rotulo}</span> : null}
          </p>

          <p className="fonte-display mt-1.5 text-base leading-snug">{passo.titulo}</p>
          <p className="mt-1 max-w-[68ch] text-sm leading-relaxed">{passo.oQueFazer}</p>

          <details className="group mt-1.5">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs lowercase text-apagado transition-colors hover:text-texto [&::-webkit-details-marker]:hidden">
              por que este passo existe
              <ChevronDown
                aria-hidden
                size={13}
                strokeWidth={1.5}
                className="transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="mt-1 max-w-[68ch] text-xs leading-relaxed text-apagado">
              {passo.porque}
            </p>
          </details>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!primeiro ? (
            <a
              href={linkDoPasso(params, indice - 1, ancoraDoPasso(passos[indice - 2]))}
              className="inline-flex items-center gap-1.5 border border-linha px-3 py-1.5 text-xs lowercase transition-colors hover:border-linha-alta hover:text-texto"
            >
              <ChevronLeft aria-hidden size={14} strokeWidth={1.5} />
              anterior
            </a>
          ) : null}

          {ultimo ? (
            <a
              href={linkDeSaida(params, passo.tela ?? undefined)}
              className="inline-flex items-center gap-1.5 border border-acento bg-acento px-3 py-1.5 text-xs lowercase text-ink transition-colors hover:bg-transparent hover:text-acento"
            >
              concluir
            </a>
          ) : (
            <a
              href={linkDoPasso(params, indice + 1, ancoraDoPasso(passos[indice]))}
              className="inline-flex items-center gap-1.5 border border-acento bg-acento px-3 py-1.5 text-xs lowercase text-ink transition-colors hover:bg-transparent hover:text-acento"
            >
              próximo
              <ChevronRight aria-hidden size={14} strokeWidth={1.5} />
            </a>
          )}

          <a
            href={linkDeSaida(params)}
            className="inline-flex items-center gap-1.5 border border-transparent px-2 py-1.5 text-xs lowercase text-apagado transition-colors hover:text-texto"
          >
            <X aria-hidden size={14} strokeWidth={1.5} />
            sair
          </a>
        </div>
      </div>
    </div>
  )
}

/** O palco: a tela do passo, sozinha, com o alvo marcado. */
export function PalcoDoTutorial({
  perfil,
  passos,
  indice,
  params,
  children,
}: {
  perfil: PerfilId
  passos: readonly PassoTutorial[]
  indice: number
  params: ParametrosSistema
  /** O corpo da tela do passo, já montado pela página com os dois gates. */
  children: ReactNode
}) {
  const passo = passos[indice - 1]
  const feature = passo.tela ? featurePorId(passo.tela) : null
  const Icone = passo.tela ? ICONE_DA_TELA[passo.tela] : GraduationCap

  return (
    <>
      {passo.alvo ? <DestaqueDoAlvo alvo={passo.alvo} ordem={indice} /> : null}

      <div id="palco" className="scroll-mt-4">
        <div className="mt-6 border border-linha bg-fundo">
          <div className="flex items-center gap-3 border-b-2 border-acento px-4 py-4 sm:gap-4 sm:px-5">
            <Icone aria-hidden size={22} strokeWidth={1.5} className="shrink-0 text-acento" />
            <span className="min-w-0 flex-1">
              <span className="fonte-display block text-base leading-tight sm:text-lg">
                {feature ? feature.rotulo : 'Sobre o sistema'}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-apagado sm:text-sm">
                {feature ? feature.descricao : PERFIS[perfil].descricao}
              </span>
            </span>
            <span className="pilula numero shrink-0 text-xs">
              {String(indice).padStart(2, '0')}/{String(passos.length).padStart(2, '0')}
            </span>
          </div>

          <div className="px-4 py-5 sm:px-5">{children}</div>
        </div>

        <p className="mt-4 text-center text-xs lowercase text-apagado">
          você está no tutorial guiado: as outras telas voltam quando ele terminar.
        </p>
      </div>

      <BarraDoGuia perfil={perfil} passos={passos} indice={indice} params={params} />
    </>
  )
}
