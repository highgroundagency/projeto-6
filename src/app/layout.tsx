import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Martian_Mono } from 'next/font/google'
import { PRODUTO } from '@/content/produto'
import './globals.css'

/**
 * Duas famílias, ambas monoespaçadas — nenhuma sans-serif de apoio.
 *
 * Martian Mono é larga e pesada: serve ao display e aos números grandes.
 * JetBrains Mono carrega tudo o mais, inclusive o que antes era "corpo".
 */
const display = Martian_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--fonte-display',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--fonte-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${PRODUTO.nome} — ${PRODUTO.subtitulo}`,
    template: `%s · ${PRODUTO.nome}`,
  },
  description: PRODUTO.descricao,
  applicationName: PRODUTO.nome,
  // O registro é artefato acadêmico, não conteúdo para buscador.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0A0B0A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-fundo text-apagado antialiased">
        <a href="#conteudo" className="pular-para-conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
