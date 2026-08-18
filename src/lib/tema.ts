import 'server-only'
import { cookies } from 'next/headers'

/**
 * Modo escuro e modo claro (ADR-027).
 *
 * A escolha vive num cookie e é aplicada PELO SERVIDOR, no atributo `data-tema`
 * do `<html>`. Duas consequências boas caem de graça:
 *
 * 1. NÃO EXISTE PISCADA. O caminho comum (ler `localStorage` no cliente) pinta
 *    a página no tema errado por um quadro antes de corrigir, e o remendo
 *    habitual é um script inline bloqueante no `<head>`. Aqui o HTML já chega
 *    pintado, porque o servidor sabe o tema antes de escrever a primeira tag.
 * 2. FUNCIONA SEM JAVASCRIPT. O botão é um `<form>` que dá POST e volta, do
 *    mesmo jeito que o seletor de perfil (ADR-006).
 *
 * O custo, dito na cara: ler cookie no layout raiz torna toda rota dinâmica.
 * Como o site inteiro já era `force-dynamic` por causa do gate de release, o
 * que se perde aqui é a estática de `/registro` e `/transparencia-ia`, que
 * eram as duas últimas páginas pré-renderizadas.
 */
export type Tema = 'escuro' | 'claro'

export const NOME_COOKIE_TEMA = 'prumo_tema'
export const TEMA_PADRAO: Tema = 'escuro'

export function ehTemaValido(valor: string): valor is Tema {
  return valor === 'escuro' || valor === 'claro'
}

export function outroTema(tema: Tema): Tema {
  return tema === 'escuro' ? 'claro' : 'escuro'
}

export async function temaAtual(): Promise<Tema> {
  const bruto = (await cookies()).get(NOME_COOKIE_TEMA)?.value
  return bruto && ehTemaValido(bruto) ? bruto : TEMA_PADRAO
}
