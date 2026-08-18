import { Moon, Sun } from 'lucide-react'
import { outroTema, type Tema } from '@/lib/tema'

/**
 * O botão que troca entre claro e escuro.
 *
 * É um formulário, não um botão de JavaScript: um POST troca o cookie e o
 * servidor devolve a página já no tema novo. Sem piscada, sem depender de
 * script, e o estado persiste entre visitas.
 *
 * `voltarPara` traz a pessoa de volta para a mesma página. Quem chama passa o
 * caminho; a rota confere que ele é interno antes de usar.
 */
export function BotaoTema({ tema, voltarPara }: { tema: Tema; voltarPara: string }) {
  const alvo = outroTema(tema)
  const Icone = alvo === 'claro' ? Sun : Moon
  const rotulo = alvo === 'claro' ? 'modo claro' : 'modo escuro'

  return (
    <form action="/api/tema" method="post" className="sem-impressao inline-flex">
      <input type="hidden" name="tema" value={alvo} />
      <input type="hidden" name="voltarPara" value={voltarPara} />
      <button
        type="submit"
        title={`Mudar para o ${rotulo}`}
        aria-label={`Mudar para o ${rotulo}`}
        className="inline-flex items-center gap-2 border border-linha px-2.5 py-1 text-xs lowercase transition-colors hover:border-acento hover:text-acento"
      >
        <Icone aria-hidden size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">{rotulo}</span>
      </button>
    </form>
  )
}
