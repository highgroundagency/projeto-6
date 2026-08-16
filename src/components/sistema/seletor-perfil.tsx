'use client'

import { ORDEM_PERFIS, PERFIS, type PerfilId } from '@/lib/features'

/**
 * Troca o papel simulado no ato de escolher.
 *
 * O PRIMEIRO E ÚNICO COMPONENTE CLIENTE DO PROJETO, e vale explicar por quê.
 * A regra da casa (ADR-006) é não usar JavaScript quando o HTML resolve, e
 * `<select>` + botão "Trocar" resolvia. Só que resolvia mal: escolher um papel
 * numa lista JÁ É a ação. Pedir um segundo clique para confirmar uma troca que
 * não destrói nada é cerimônia sem função, e quem usou reclamou disso na cara.
 *
 * A degradação é honesta: sem JavaScript o `<noscript>` devolve o botão, e o
 * formulário continua sendo o mesmo POST de sempre. Nada aqui é requisito para
 * o sistema funcionar — é conforto.
 *
 * Continua não sendo autenticação: o perfil é preferência de navegação, escrita
 * num cookie não assinado, e o controle real está nas políticas de RLS de
 * `supabase/migrations/` (ADR-011).
 */
export function SeletorDePerfil({ perfil }: { perfil: PerfilId }) {
  return (
    <form
      action="/api/sistema/perfil"
      method="post"
      className="flex flex-wrap items-center gap-2"
    >
      <label htmlFor="perfil" className="rotulo">
        Estou usando como
      </label>
      <select
        id="perfil"
        name="perfil"
        defaultValue={perfil}
        onChange={(evento) => evento.currentTarget.form?.requestSubmit()}
        className="border border-linha px-2 py-1 text-sm"
      >
        {ORDEM_PERFIS.map((id) => (
          <option key={id} value={id}>
            {PERFIS[id].rotulo}
          </option>
        ))}
      </select>
      <noscript>
        <button
          type="submit"
          className="border border-linha-alta px-2 py-1 text-xs hover:bg-superficie hover:text-texto"
        >
          Trocar
        </button>
      </noscript>
    </form>
  )
}
