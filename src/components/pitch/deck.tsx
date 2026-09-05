'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

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
 */
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
      if (evento.metaKey || evento.ctrlKey || evento.altKey) return
      const alvo = evento.target as HTMLElement | null
      // Dentro de campo, botão ou sumário, o teclado é deles.
      if (alvo?.closest('input, select, textarea, button, a, summary')) return

      switch (evento.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'j':
          evento.preventDefault()
          ir(atual + 1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
        case 'k':
          evento.preventDefault()
          ir(atual - 1)
          break
        case 'Home':
          evento.preventDefault()
          ir(1)
          break
        case 'End':
          evento.preventDefault()
          ir(total)
          break
        case 'n':
          setNotas((v) => !v)
          break
        case 'r':
          inicio.current = null
          setDecorrido(0)
          break
        case 'f':
          if (document.fullscreenElement) void document.exitFullscreen()
          else void document.documentElement.requestFullscreen?.()
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
            onClick={() => ir(atual - 1)}
            disabled={atual <= 1}
            aria-label="Slide anterior"
          >
            ←
          </button>
          <span className="numero">
            {atual}/{total}
          </span>
          <button
            type="button"
            onClick={() => ir(atual + 1)}
            disabled={atual >= total}
            aria-label="Próximo slide"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => setNotas((v) => !v)}
            aria-pressed={notas}
            title="notas do apresentador (n)"
          >
            n
          </button>
        </nav>
      ) : null}
    </div>
  )
}
