import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { PRODUTO } from '@/content/produto'
import { temaAtual } from '@/lib/tema'
import './globals.css'

/**
 * Duas famílias, ambas monoespaçadas — nenhuma sans-serif de apoio.
 *
 * Martian Mono é larga e pesada: serve ao display e aos números grandes.
 * JetBrains Mono carrega tudo o mais, inclusive o que antes era "corpo".
 *
 * OS ARQUIVOS SÃO VERSIONADOS, e não baixados do Google no build (ADR-028).
 * `next/font/google` busca o .woff2 em fonts.gstatic.com toda vez que compila,
 * e a rede do runner falhando derrubava o CI sem nada no código ter mudado: o
 * mesmo commit passava numa branch e quebrava na outra. Aqui é `next/font/local`
 * lendo de src/fontes/, então o build não depende de rede e é reprodutível.
 *
 * O recorte é o mesmo de antes: subconjunto latin, que já cobre todo o
 * português. Trocar de peso ou de família exige baixar o arquivo e commitá-lo.
 */
const display = localFont({
  src: [
    { path: '../fontes/martian-mono-500.woff2', weight: '500', style: 'normal' },
    { path: '../fontes/martian-mono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--fonte-display',
  display: 'swap',
})

const mono = localFont({
  src: [
    { path: '../fontes/jetbrains-mono-400.woff2', weight: '400', style: 'normal' },
    { path: '../fontes/jetbrains-mono-500.woff2', weight: '500', style: 'normal' },
    { path: '../fontes/jetbrains-mono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--fonte-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${PRODUTO.nome}: ${PRODUTO.subtitulo}`,
    template: `%s · ${PRODUTO.nome}`,
  },
  description: PRODUTO.descricao,
  applicationName: PRODUTO.nome,
  // O registro é artefato acadêmico, não conteúdo para buscador.
  robots: { index: false, follow: false },
}

/**
 * A cor da barra do navegador acompanha o tema.
 *
 * Precisa ser `generateViewport` e não a constante `viewport`: o valor depende
 * do cookie, e constante é avaliada uma vez no build.
 */
export async function generateViewport(): Promise<Viewport> {
  const tema = await temaAtual()
  return {
    themeColor: tema === 'claro' ? '#faf8f4' : '#0a0b0a',
    colorScheme: tema === 'claro' ? 'light' : 'dark',
    width: 'device-width',
    initialScale: 1,
  }
}

/**
 * O tema sai do cookie e vira atributo do `<html>` (ADR-027).
 *
 * Ler cookie aqui torna toda rota dinâmica, e isso é aceito de olhos abertos: o
 * site já era `force-dynamic` nas páginas que importam, e em troca não existe
 * piscada de tema errado no carregamento.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tema = await temaAtual()

  return (
    <html
      lang="pt-BR"
      data-tema={tema}
      style={{ colorScheme: tema === 'claro' ? 'light' : 'dark' }}
      className={`${display.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-fundo text-apagado antialiased">
        <a href="#conteudo" className="pular-para-conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
