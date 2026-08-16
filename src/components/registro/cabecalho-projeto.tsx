import { CLIENTE, PERGUNTA_DO_PROJETO, PROBLEMA } from '@/content/produto'
import { EQUIPE, SELO_PAPEIS } from '@/content/equipe'
import { Selo } from '@/components/base/selo'

export function CabecalhoProjeto() {
  return (
    <section className="mt-8" aria-labelledby="titulo-problema">
      <h2 id="titulo-problema" className="rotulo">
        O problema
      </h2>
      <div className="mt-2 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-2">
          {PROBLEMA.map((linha) => (
            <p key={linha} className="max-w-prose text-[0.95rem] leading-relaxed">
              {linha}
            </p>
          ))}
          <p className="rotulo pt-1">Cliente: {CLIENTE.orgao} — {CLIENTE.area}</p>
        </div>

        <div className="self-start border-l-2 border-acento bg-fundo p-5">
          <h3 className="rotulo">A pergunta do projeto</h3>
          <p className="fonte-display mt-2 text-xl leading-snug">{PERGUNTA_DO_PROJETO}</p>
        </div>
      </div>
    </section>
  )
}

export function Equipe() {
  return (
    <section className="mt-10" aria-labelledby="titulo-equipe">
      <div className="flex items-center gap-2">
        <h2 id="titulo-equipe" className="rotulo">
          Equipe
        </h2>
        <Selo selo={SELO_PAPEIS} />
      </div>

      <ul className="mt-3 grid gap-px border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-3">
        {EQUIPE.map((integrante) => (
          <li key={integrante.id} className="flex gap-3 bg-fundo p-4">
            <span
              aria-hidden
              className="numero flex size-9 shrink-0 items-center justify-center border border-linha-alta text-xs font-semibold"
            >
              {integrante.iniciais}
            </span>
            <div className="min-w-0">
              <p className="fonte-display text-sm leading-tight">{integrante.nome}</p>
              <p className="rotulo mt-1 text-acento">{integrante.papel}</p>
              <p className="mt-1 text-xs leading-relaxed text-apagado">{integrante.frente}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
