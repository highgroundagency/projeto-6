import type { Metadata } from 'next'
import Link from 'next/link'
import { Markdown } from '@/components/base/markdown'
import { Rodape } from '@/components/base/rodape'
import { analisarMarkdown, lerDoc } from '@/lib/markdown'

export const metadata: Metadata = {
  title: 'Transparência no uso de IA',
  description:
    'Registro semanal de onde a equipe usou IA, o que foi gerado e quem validou.',
}

export default async function PaginaTransparencia() {
  const nos = analisarMarkdown(await lerDoc('uso-de-ia.md'))

  return (
    <main id="conteudo" className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
      <header className="border-b border-linha pb-5">
        <Link href="/registro" className="rotulo hover:text-tinta">
          ← Registro do projeto
        </Link>
        <h1 className="fonte-display mt-3 text-3xl">Transparência no uso de IA</h1>
        <p className="mt-2 max-w-prose border-l-2 border-laranja pl-3 text-sm leading-relaxed">
          Uso de IA nesta equipe segue o contrato da disciplina: gerado ≠ entregue; tudo
          passa por validação humana e é declarado nos marcos.
        </p>
      </header>

      <div className="mt-8">
        <Markdown nos={nos} />
      </div>

      <Rodape className="mt-10" />
    </main>
  )
}
