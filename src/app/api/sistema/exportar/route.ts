import { type NextRequest } from 'next/server'
import { repositorio } from '@/lib/dados'
import { avaliacoesDoCiclo, carregarDados } from '@/lib/dados/consultas'
import { exigirPerfil } from '@/lib/sistema'
import {
  MINIMO_DO_RECORTE,
  recortePequenoDemais,
  tiposSuprimidos,
} from '@/lib/sistema/anonimato'

/**
 * Exportação dos resultados de um ciclo em CSV (§8.4, tela 5).
 *
 * SEM NOMES POR PADRÃO, desde a Sprint 2 (risco 8 da Atividade 2 de Direito):
 * o arquivo identificado só sai com `nomes=1`, que é a caixa "mostrar os nomes"
 * marcada na tela. E todo arquivo, com ou sem nomes, vira evento na trilha
 * antes de sair (risco 7). Se o registro falhar, o arquivo não sai.
 */
export async function GET(requisicao: NextRequest) {
  const contexto = await exigirPerfil('painel-gestao')

  const cicloId = requisicao.nextUrl.searchParams.get('ciclo') ?? ''
  const anonimo = requisicao.nextUrl.searchParams.get('nomes') !== '1'

  const dados = await carregarDados()
  const ciclo = dados.cicloPorId(cicloId)
  if (!ciclo) return new Response('Ciclo não encontrado.', { status: 404 })

  // O MESMO recorte da tela: o gerente distrital exporta o próprio distrito,
  // nunca a rede inteira, e a URL não contorna isso.
  let distritoId = requisicao.nextUrl.searchParams.get('distrito') ?? ''
  if (contexto.perfil === 'gerente_distrital') {
    const valido = dados.distritos.some((d) => d.id === distritoId)
    distritoId = valido ? distritoId : (dados.distritos[0]?.id ?? '')
  }

  const todas = await avaliacoesDoCiclo(ciclo.id)
  const avaliacoes = [...todas]
    .filter((a) => !distritoId || dados.unidadePorId(a.unidadeId)?.distritoId === distritoId)
    .sort((a, b) => b.score - a.score)

  // O mesmo número mínimo da tela: sem nome, recorte pequeno não sai, e tipo
  // raro no recorte perde a sigla.
  if (anonimo && recortePequenoDemais(avaliacoes.length)) {
    return new Response(
      `Recorte com menos de ${MINIMO_DO_RECORTE} unidades: sem nomes, ainda daria para saber quem é quem.`,
      { status: 409 },
    )
  }
  const tipoDe = (unidadeId: string) => dados.unidadePorId(unidadeId)?.tipoId ?? ''
  const suprimidos = anonimo
    ? tiposSuprimidos(avaliacoes.map((a) => tipoDe(a.unidadeId)))
    : new Set<string>()

  const cabecalho = [
    'posicao',
    'unidade',
    'tipo',
    'distrito',
    'score',
    'faixa',
    'percentual_gratificacao',
    'regra',
    'versao_regra',
    'avisos',
  ]

  const linhas = avaliacoes.map((avaliacao, i) => {
    const unidade = dados.unidadePorId(avaliacao.unidadeId)
    const tipo = unidade ? dados.tipoUnidadePorId(unidade.tipoId) : undefined
    const distrito = unidade ? dados.distritoPorId(unidade.distritoId) : undefined
    return [
      String(i + 1),
      anonimo ? `unidade ${String(i + 1).padStart(2, '0')}` : (unidade?.nome ?? ''),
      unidade && suprimidos.has(unidade.tipoId) ? 'suprimido' : (tipo?.sigla ?? ''),
      anonimo ? '' : (distrito?.nome ?? ''),
      avaliacao.score.toFixed(2),
      avaliacao.faixa?.rotulo ?? '',
      String(avaliacao.faixa?.percentual ?? ''),
      avaliacao.memoria.regraId,
      String(avaliacao.memoria.versaoRegra),
      String(avaliacao.avisos.length),
    ]
  })

  // Aspas duplicadas conforme RFC 4180: campo com ; ou " não quebra o arquivo.
  const escapar = (campo: string) => `"${campo.replace(/"/g, '""')}"`
  const csv = [cabecalho, ...linhas].map((linha) => linha.map(escapar).join(';')).join('\r\n')

  const registro = await repositorio().registrarExportacao(
    {
      cicloId: ciclo.id,
      distritoId: distritoId || null,
      anonimo,
      linhas: linhas.length,
      autor: contexto.perfil,
      perfil: contexto.perfil,
    },
    new Date().toISOString(),
  )
  if (!registro.ok) {
    return new Response(
      `A exportação não foi registrada na trilha, então não saiu. ${registro.mensagem}`,
      {
        status: 409,
      },
    )
  }

  return new Response(`\ufeff${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="prumo-${ciclo.competencia}${anonimo ? '-anonimo' : ''}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
