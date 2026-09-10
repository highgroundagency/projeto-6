'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { acaoDaTecla, impedePadrao } from './teclado'

/**
 * O deck: um slide por vez, setas do teclado, notas com `n`.
 *
 * O SEGUNDO COMPONENTE CLIENTE DO PROJETO, e ele recebe só o total de slides.
 * Nunca texto: o conteúdo do Kick-off é conteúdo de ciclo, e qualquer string
 * passada por props para cá acabaria em `.next/static`, público antes da hora
 * (regra 3 da casa). Os slides chegam como `children`, renderizados no
 * servidor e já filtrados pelo gate de release da página.
 *
 * Aprimoramento progressivo, de propósito: sem JavaScript este componente não
 * faz nada, e a página é uma pilha vertical legível e imprimível. Com
 * JavaScript, o atributo `data-modo="deck"` liga o CSS que mostra um slide só,
 * e o atributo `data-ativo` diz qual. O DOM dos slides é manipulado
 * diretamente porque ele não é do React: veio pronto do servidor.
 *
 * Teclas: → ↓ espaço PageDown avançam; ← ↑ PageUp voltam; Home e End vão às
 * pontas; `n` abre e fecha as notas; `f` alterna tela cheia; `r` zera o
 * cronômetro. A posição vai para o hash da URL, então recarregar não perde o
 * slide.
 *
 * O TECLADO NÃO DEPENDE DE ONDE ESTÁ O FOCO, e isso custou um pitch quase
 * perdido. A primeira versão ignorava a tecla quando o foco estivesse em
 * `button`, `a` ou `summary` — o que parecia educado e era fatal: clicar uma
 * vez na seta da tela, no botão de tema ou na memória de cálculo deixava o
 * foco naquele controle, e a partir dali NENHUMA tecla funcionava até alguém
 * clicar no fundo da página. Quem apresenta clica; e o script que gera o PDF
 * nunca clicava, então os testes não viam. Agora só campo de texto engole
 * tecla, e os controles devolvem o foco ao corpo depois do clique.
 */
/**
 * Devolve o foco ao corpo depois de um clique de MOUSE.
 *
 * `detail` é a contagem de cliques: vale 0 quando o botão foi acionado pelo
 * teclado. Sem essa distinção, quem navega de Tab e aperta Enter perde o
 * lugar na página a cada avanço, que é trocar um problema de acessibilidade
 * por outro. Com o mouse, soltar o foco mantém a barra de espaço previsível.
 */
function soltarFoco(evento: { detail: number; currentTarget: HTMLElement }): void {
  if (evento.detail > 0) evento.currentTarget.blur()
}

export function Deck({ total, children }: { total: number; children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(1)
  const [notas, setNotas] = useState(false)
  const [montado, setMontado] = useState(false)
  const [decorrido, setDecorrido] = useState(0)
  const inicio = useRef<number | null>(null)

  const ir = useCallback(
    (destino: number) => {
      const alvo = Math.min(Math.max(destino, 1), total)
      setAtual(alvo)
      if (inicio.current === null && alvo > 1) inicio.current = Date.now()
      history.replaceState(null, '', `#slide-${alvo}`)
    },
    [total],
  )

  // Liga o modo deck e lê a posição inicial do hash.
  useEffect(() => {
    setMontado(true)
    const doHash = Number(location.hash.replace('#slide-', ''))
    if (Number.isInteger(doHash) && doHash >= 1 && doHash <= total) setAtual(doHash)
  }, [total])

  // Marca o slide ativo no DOM vindo do servidor.
  useEffect(() => {
    const slides = raiz.current?.querySelectorAll<HTMLElement>('[data-slide]') ?? []
    slides.forEach((slide) => {
      if (Number(slide.dataset.slide) === atual) slide.setAttribute('data-ativo', '')
      else slide.removeAttribute('data-ativo')
    })
  }, [atual, montado])

  // Abre ou fecha todas as notas de uma vez.
  useEffect(() => {
    const detalhes = raiz.current?.querySelectorAll<HTMLDetailsElement>('details.notas') ?? []
    detalhes.forEach((d) => {
      d.open = notas
    })
  }, [notas])

  // O cronômetro do ensaio: começa no primeiro avanço, zera com `r`.
  useEffect(() => {
    if (!notas) return
    const id = window.setInterval(() => {
      setDecorrido(inicio.current === null ? 0 : Math.floor((Date.now() - inicio.current) / 1000))
    }, 500)
    return () => window.clearInterval(id)
  }, [notas])

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      const acao = acaoDaTecla(evento, evento.target as Element | null)
      if (!acao) return
      if (impedePadrao(acao)) evento.preventDefault()

      switch (acao) {
        case 'avancar':
          ir(atual + 1)
          break
        case 'voltar':
          ir(atual - 1)
          break
        case 'inicio':
          ir(1)
          break
        case 'fim':
          ir(total)
          break
        case 'notas':
          setNotas((v) => !v)
          break
        case 'zerar':
          inicio.current = null
          setDecorrido(0)
          break
        case 'tela-cheia':
          if (document.fullscreenElement) void document.exitFullscreen()
          else void document.documentElement.requestFullscreen?.()
          break
        case 'imprimir':
          // A folha de impressão já entrega uma página por slide, 16:9, sem
          // cromo e sem notas. Imprimir para PDF no navegador dá a versão do
          // que está na tela agora, e não a do último build.
          window.print()
          break
      }
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [atual, ir, total])

  const minutos = Math.floor(decorrido / 60)
  const segundos = String(decorrido % 60).padStart(2, '0')

  return (
    <div
      ref={raiz}
      data-modo={montado ? 'deck' : undefined}
      data-notas={notas ? '' : undefined}
      className="deck"
    >
      {children}

      {montado ? (
        <nav
          aria-label="Navegação dos slides"
          className="deck-controles sem-impressao"
        >
          {notas ? (
            <span className="numero" aria-live="off" title="tempo decorrido desde o primeiro avanço">
              {minutos}:{segundos}
            </span>
          ) : null}
          <button
            type="button"
            onClick={(evento) => {
              soltarFoco(evento)
              ir(atual - 1)
            }}
            disabled={atual <= 1}
            aria-label="Slide anterior"
          >
            ←
          </button>
          <span className="numero" aria-live="polite">
            {atual}/{total}
          </span>
          <button
            type="button"
            onClick={(evento) => {
              soltarFoco(evento)
              ir(atual + 1)
            }}
            disabled={atual >= total}
            aria-label="Próximo slide"
          >
            →
          </button>
          <button
            type="button"
            onClick={(evento) => {
              soltarFoco(evento)
              setNotas((v) => !v)
            }}
            aria-pressed={notas}
            title="notas do apresentador (n)"
          >
            n
          </button>
          <button
            type="button"
            onClick={(evento) => {
              soltarFoco(evento)
              window.print()
            }}
            title="imprimir ou salvar em PDF (p)"
          >
            imprimir
          </button>
        </nav>
      ) : null}

      {/* A ajuda mora AQUI, e não na página, porque ela descreve teclas: sem
          JavaScript nenhuma delas funciona, e a versão anterior anunciava
          quatro atalhos mortos justamente para quem não podia usá-los. */}
      {/* A ajuda aparece no primeiro slide e some assim que a pessoa anda: ela
          serve para ensinar o teclado, não para acompanhar a apresentação. */}
      {montado && atual === 1 ? (
        <p className="ajuda-deck sem-impressao">
          ← → passam o slide · n abre as notas · f tela cheia · r zera o tempo · p imprime
        </p>
      ) : null}
    </div>
  )
}
