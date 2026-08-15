import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono, Inter } from 'next/font/google'
import { PRODUTO } from '@/content/produto'
import './globals.css'

const display = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--fonte-display',
  display: 'swap',
})

const corpo = Inter({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
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
  themeColor: '#FAF8F4',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-papel text-tinta antialiased">
        <a href="#conteudo" className="pular-para-conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
