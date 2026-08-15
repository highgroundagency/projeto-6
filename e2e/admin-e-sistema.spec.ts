import { expect, test } from '@playwright/test'

const SENHA = '0321'

/**
 * Cabeçalho de cookies da sessão do navegador.
 *
 * `page.request` não reaproveita o cookie jar do contexto de forma confiável
 * entre versões; repassar explicitamente deixa o teste determinístico e mostra
 * qual credencial está sendo exercitada.
 */
async function comSessao(page: import('@playwright/test').Page) {
  const cookies = await page.context().cookies()
  return { cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') }
}

async function entrarNoPainel(page: import('@playwright/test').Page) {
  await page.goto('/admin/entrar')
  await page.getByLabel('Senha').fill(SENHA)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test.describe('acesso ao painel', () => {
  test('nenhuma página anuncia o painel', async ({ page }) => {
    // O rodapé já teve um ponto discreto apontando para /admin/entrar. Ele saiu
    // na ADR-015: um link rotulado é achado por Ctrl+F e por leitor de tela.
    for (const rota of ['/', '/registro', '/sistema', '/transparencia-ia', '/status']) {
      await page.goto(rota)
      expect(await page.locator('a[href^="/admin"]').count(), `${rota} linka para /admin`).toBe(0)
      expect(await page.content(), `${rota} cita o painel`).not.toContain('Painel administrativo')
    }
  })

  test('sem sessão, /admin redireciona para o login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/entrar$/)
  })

  test('senha errada é recusada com mensagem genérica', async ({ page }) => {
    await page.goto('/admin/entrar')
    await page.getByLabel('Senha').fill('senha-errada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/erro=1/)
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível entrar.' })).toBeVisible()
  })

  test('senha certa abre o painel completo', async ({ page }) => {
    await entrarNoPainel(page)

    for (const secao of [
      'Estado atual',
      'Ver como visitante',
      'Release',
      'Travas por ciclo',
      'Log de liberações',
      'Checklist da matriz',
      'Faixas paralelas',
    ]) {
      await expect(page.getByRole('heading', { name: secao })).toBeVisible()
    }
  })
})

test.describe('modo completo e visão de visitante', () => {
  test('admin vê ciclos que o visitante não vê', async ({ page }) => {
    const comoVisitante = await (await page.request.get('/registro')).text()
    expect(comoVisitante).not.toContain('PRUMO-MARCADOR-CICLO-s4')

    await entrarNoPainel(page)
    await page.goto('/registro')

    await expect(page.getByText('Modo completo — visível só para você')).toBeVisible()
    expect(await page.content()).toContain('PRUMO-MARCADOR-CICLO-s4')
  })

  test('ver como visitante com data simulada muda o recorte', async ({ page }) => {
    await entrarNoPainel(page)

    await page.getByLabel('Ver como visitante').check()
    await page.getByLabel('Data simulada').fill('2026-10-03')
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()

    await page.goto('/registro')
    await expect(page.getByText('Vendo como visitante')).toBeVisible()
    await expect(page.getByText(/data simulada/)).toBeVisible()
    // Em 03/10 o Kick-off já passou, então o registro dele aparece.
    expect(await page.content()).toContain('PRUMO-MARCADOR-CICLO-ko')
  })
})

test.describe('gate das funcionalidades', () => {
  test('rota não liberada devolve 404 para o visitante', async ({ page }) => {
    for (const rota of ['/sistema/cam', '/sistema/meu-resultado', '/sistema/auditoria']) {
      const resposta = await page.request.get(rota)
      expect(resposta.status(), `${rota} deveria ser 404`).toBe(404)
    }
  })

  test('a casca do sistema é honesta sobre o que ainda não existe', async ({ page }) => {
    await page.goto('/sistema')
    await expect(page.getByText('O sistema ainda não entrou em operação')).toBeVisible()
  })
})

/**
 * Avanço de estado do ciclo — a única escrita do sistema com credencial.
 *
 * O estado vive na memória do processo e vale para todos os visitantes daquela
 * instância, e a transição não tem volta pela interface. Ver ADR-015.
 */
test.describe('avanço de ciclo', () => {
  const CONTROLE = /^(Avançar para|Homologar ciclo)/

  test('sem sessão, a rota não existe', async ({ page }) => {
    const resposta = await page.request.post('/api/sistema/ciclo', {
      form: { cicloId: 'ciclo-2026-06', confirmo: 'on' },
      maxRedirects: 0,
    })
    // 404, não 401: não confirmamos o mecanismo a quem não deveria conhecê-lo.
    expect(resposta.status()).toBe(404)
  })

  test('a prévia de visitante esconde o controle que o admin tem', async ({ page }) => {
    await entrarNoPainel(page)

    await page.goto('/sistema/cam')
    await expect(page.getByRole('button', { name: CONTROLE })).toBeVisible()

    await page.goto('/admin')
    await page.getByLabel('Ver como visitante').check()
    // 19/09 é a data da s5: a tela da CAM já está liberada para o público.
    await page.getByLabel('Data simulada').fill('2026-09-19')
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()

    await page.goto('/sistema/cam')
    await expect(page.getByRole('heading', { name: 'Funil de lançamento por área' })).toBeVisible()
    await expect(page.getByRole('button', { name: CONTROLE })).toHaveCount(0)
    // E nem a dica de que existe transição: o visitante não sabe que dá para agir.
    expect(await page.content()).not.toContain('Próxima transição')
  })
})

test.describe('o sistema, visto pelo admin', () => {
  test.beforeEach(async ({ page }) => {
    await entrarNoPainel(page)
  })

  test('a memória de cálculo explica de onde veio cada número', async ({ page }) => {
    await page.goto('/sistema/meu-resultado')

    await expect(page.getByText('Score do ciclo')).toBeVisible()

    const memoria = page.getByText('Memória de cálculo')
    await expect(memoria).toBeVisible()
    await memoria.click()

    await expect(page.getByRole('columnheader', { name: 'Atingimento' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Contribuição' })).toBeVisible()
    await expect(page.getByText('Soma das contribuições')).toBeVisible()
    await expect(page.getByText(/score = \(Σ pontos × peso\)/)).toBeVisible()
  })

  test('a auditoria mostra a trilha com antes e depois', async ({ page }) => {
    await page.goto('/sistema/auditoria')
    await expect(page.getByRole('heading', { name: 'Linha do tempo' })).toBeVisible()
    await expect(page.getByText(/antes:/).first()).toBeVisible()
    await expect(page.getByText(/depois:/).first()).toBeVisible()
  })

  test('as regras versionadas mostram o diff entre versões', async ({ page }) => {
    await page.goto('/sistema/indicadores')
    await expect(page.getByRole('heading', { name: /Diff: v1 → v2/ })).toBeVisible()
    // A v2 redesenhou as faixas: nenhuma sobreviveu igual, então o diff é todo
    // de faixas removidas e adicionadas.
    await expect(page.getByText('removida').first()).toBeVisible()
    await expect(page.getByText('adicionada').first()).toBeVisible()
  })

  test('o lançamento recusa entrada inválida', async ({ page }) => {
    await page.goto('/sistema/lancamento')

    const resposta = await page.request.post('/api/sistema/lancamento', {
      headers: await comSessao(page),
      form: {
        indicadorId: 'aps-cobertura-esf',
        cicloId: 'ciclo-2026-06',
        valor: '-5',
        evidencia: 'x',
        area: 'aps',
      },
      maxRedirects: 0,
    })
    expect(resposta.status()).toBe(303)
    expect(resposta.headers()['location']).toContain('erro=')
  })

  test('o painel da gestão anonimiza e exporta', async ({ page }) => {
    await page.goto('/sistema/gestao')
    await expect(page.getByRole('heading', { name: 'Ranking por área' })).toBeVisible()

    await page.getByLabel('Anonimizar o ranking').check()
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('gestor 01')).toBeVisible()

    const csv = await page.request.get('/api/sistema/exportar?ciclo=ciclo-2026-04&anonimo=1', {
      headers: await comSessao(page),
    })
    expect(csv.status()).toBe(200)
    expect(csv.headers()['content-type']).toContain('text/csv')
    expect(await csv.text()).toContain('posicao')
  })

  test('/status responde com o health check', async ({ page }) => {
    const resposta = await page.request.get('/api/status')
    expect(resposta.status()).toBe(200)
    const corpo = await resposta.json()
    expect(corpo.produto).toBe('Prumo')
    expect(corpo.ciclosNoCronograma).toBe(18)
    expect(corpo.ok).toBe(true)
  })
})
