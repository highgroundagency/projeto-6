import { expect, test } from '@playwright/test'
import {
  CICLO_OCULTO,
  ROTAS_ABERTAS,
  ROTAS_FECHADAS,
  VESPERA_DA_ULTIMA_TELA,
  marcador,
} from './cronograma'

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
      expect(await page.locator('a[href^="/admin"]').count(), `${rota} linka para /admin`).toBe(
        0,
      )
      expect(await page.content(), `${rota} cita o painel`).not.toContain(
        'Painel administrativo',
      )
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
    await expect(
      page.getByRole('alert').filter({ hasText: 'Não foi possível entrar.' }),
    ).toBeVisible()
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
    // O ciclo alvo é o primeiro ainda não liberado hoje, calculado a partir do
    // cronograma. Fixar `s4` aqui funcionou até a s4 virar pública sozinha.
    const comoVisitante = await (await page.request.get('/registro')).text()
    expect(comoVisitante).not.toContain(marcador(CICLO_OCULTO))

    await entrarNoPainel(page)
    await page.goto('/registro')

    await expect(page.getByText('Modo completo: visível só para você')).toBeVisible()
    expect(await page.content()).toContain(marcador(CICLO_OCULTO))
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
    // As rotas saem do mapa de funcionalidades cruzado com o release de hoje,
    // e não de uma lista à mão: quando a s5 abriu, a lista à mão passou a
    // exigir 404 de rota que já responde. Desde a véspera do SR1 as oito
    // telas estão no ar e a lista de hoje pode estar vazia; o teste abaixo
    // continua provando o portão numa data em que ele fechava alguma coisa.
    for (const rota of ROTAS_FECHADAS) {
      const resposta = await page.request.get(rota)
      expect(resposta.status(), `${rota} deveria ser 404`).toBe(404)
    }
  })

  test('na véspera da última leva, a prévia de visitante leva 404 no que faltava', async ({
    page,
  }) => {
    const { data, fechadas, abertas } = VESPERA_DA_ULTIMA_TELA
    expect(fechadas.length, `nenhuma rota fechada em ${data} para exercitar`).toBeGreaterThan(0)

    await entrarNoPainel(page)
    await page.getByLabel('Ver como visitante').check()
    await page.getByLabel('Data simulada').fill(data)
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()

    const cabecalhos = await comSessao(page)
    for (const rota of fechadas) {
      const resposta = await page.request.get(rota, { headers: cabecalhos, maxRedirects: 0 })
      expect(resposta.status(), `${rota} deveria ser 404 em ${data}`).toBe(404)
    }
    // E o portão não fecha tudo: o que já tinha saído naquela data responde.
    for (const rota of abertas) {
      const resposta = await page.request.get(rota, { headers: cabecalhos, maxRedirects: 0 })
      expect(resposta.status(), `${rota} deveria redirecionar em ${data}`).toBeGreaterThanOrEqual(
        300,
      )
      expect(resposta.status()).toBeLessThan(400)
    }
  })

  test('a casca do sistema é honesta sobre o que ainda não existe', async ({ page }) => {
    await page.goto('/sistema')
    if (ROTAS_ABERTAS.length === 0) {
      await expect(page.getByText('O sistema ainda não entrou em operação')).toBeVisible()
    } else {
      // Com tela liberada, a casca mostra o que existe e não promete o resto:
      // a honestidade aqui é o silêncio sobre as telas que ainda não saíram.
      await expect(page.getByText('O sistema ainda não entrou em operação')).toHaveCount(0)
      await expect(page.locator('details[id^="tela-"]').first()).toBeAttached()
    }
  })

  test('tela de outro perfil não existe, mesmo já liberada', async ({ page }) => {
    // Entra como admin (modo completo: as oito telas liberadas) e troca para
    // gerente de unidade, que lança e vê o próprio resultado. As outras devem
    // sumir de verdade, não ficar apagadas — ver `exigirPerfil`.
    await entrarNoPainel(page)
    await page.goto('/sistema')
    // Escolher já troca: não existe mais botão de confirmar (ADR-024).
    await page.getByLabel('Estou usando como').selectOption('gerente_unidade')
    await expect(page.getByRole('link', { name: 'Lançamento da unidade' })).toBeVisible()
    for (const rotulo of ['Trilha de auditoria', 'Analytics', 'Painel da gestão']) {
      await expect(page.getByRole('link', { name: rotulo })).toHaveCount(0)
    }

    // E a URL direta também não abre: o filtro não é só de menu.
    for (const rota of ['/sistema/auditoria', '/sistema/analytics', '/sistema/gestao']) {
      const resposta = await page.request.get(rota, { headers: await comSessao(page) })
      expect(resposta.status(), `${rota} deveria ser 404 para o gerente de unidade`).toBe(404)
    }
  })
})

/**
 * Avanço de estado do ciclo — a única escrita do sistema com credencial.
 *
 * O estado vive na memória do processo, numa cópia por visitante: o avanço
 * que o admin faz fica na cópia dele. A transição não tem volta pela
 * interface. Ver ADR-015 e `src/lib/sistema/estado.ts`.
 */
test.describe('avanço de ciclo', () => {
  const CONTROLE = /^(Avançar para|Homologar ciclo)/

  test('sem sessão, a rota não existe', async ({ page }) => {
    const resposta = await page.request.post('/api/sistema/ciclo', {
      form: { cicloId: 'ciclo-2026-07', confirmo: 'on' },
      maxRedirects: 0,
    })
    // 404, não 401: não confirmamos o mecanismo a quem não deveria conhecê-lo.
    expect(resposta.status()).toBe(404)
  })

  test('a prévia de visitante esconde o controle que o admin tem', async ({ page }) => {
    await entrarNoPainel(page)

    await page.goto('/sistema/cam')
    await expect(page).toHaveURL(/\/sistema\?abrir=painel-seab#tela-painel-seab$/)
    await expect(page.getByRole('button', { name: CONTROLE })).toBeVisible()

    await page.goto('/admin')
    await page.getByLabel('Ver como visitante').check()
    // 19/09 é a data da s5: o painel da SEAB já está liberado para o público.
    await page.getByLabel('Data simulada').fill('2026-09-19')
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()

    await page.goto('/sistema/cam')
    await expect(
      page.getByRole('heading', { name: 'Funil de lançamento por unidade' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: CONTROLE })).toHaveCount(0)
    // E nem a dica de que existe transição: o visitante não sabe que dá para agir.
    expect(await page.content()).not.toContain('Próxima etapa')
  })
})

test.describe('o sistema, visto pelo admin', () => {
  test.beforeEach(async ({ page }) => {
    await entrarNoPainel(page)
  })

  test('as telas abrem na própria página, sem sair de /sistema', async ({ page }) => {
    await page.goto('/sistema')

    // Fechadas por padrão: quem chega escolhe o que abrir.
    const auditoria = page.locator('#tela-auditoria')
    await expect(auditoria).toHaveJSProperty('open', false)

    await page
      .getByRole('navigation', { name: 'Telas do sistema' })
      .getByRole('link', { name: 'Auditoria' })
      .click()

    // Continua em /sistema: a queixa original era justamente ser levado embora.
    await expect(page).toHaveURL(/\/sistema\?[^#]*abrir=auditoria[^#]*#tela-auditoria$/)
    await expect(auditoria).toHaveJSProperty('open', true)
    await expect(page.getByRole('heading', { name: 'Linha do tempo' })).toBeVisible()
    // E as vizinhas continuam fechadas: abriu uma, não abriu tudo.
    await expect(page.locator('#tela-analytics')).toHaveJSProperty('open', false)
  })

  test('pular de uma tela para outra não descarta o que já foi escolhido', async ({ page }) => {
    await page.goto('/sistema?abrir=painel-gestao')
    await page.getByLabel('Esconder os nomes').check()
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page).toHaveURL(/gest_anonimo=1/)

    await page
      .getByRole('navigation', { name: 'Telas do sistema' })
      .getByRole('link', { name: 'Auditoria' })
      .click()

    // O `gest_anonimo` sobrevive à navegação: as oito telas dividem uma query
    // string só, e o estado de uma não pode ser zerado pela vizinha.
    await expect(page).toHaveURL(/gest_anonimo=1/)
  })

  test('o sumário fica visível enquanto se rola uma tela longa', async ({ page }) => {
    // Com a auditoria aberta a página fica bem mais alta que a janela; é
    // justamente aí que o sumário grudado prova o seu valor.
    await page.goto('/sistema?abrir=auditoria')
    await page.mouse.wheel(0, 2500)
    await expect(page.getByRole('navigation', { name: 'Telas do sistema' })).toBeInViewport()
  })

  test('trocar o papel na lista já troca o personagem, sem botão', async ({ page }) => {
    await page.goto('/sistema')
    await expect(page.getByText('Tutorial guiado para Coordenação da SEAB')).toBeVisible()

    await page.getByLabel('Estou usando como').selectOption('gerente_unidade')
    await expect(page.getByText('Tutorial guiado para Gerente de unidade')).toBeVisible()
    // E o tutorial encolhe junto: o gerente tem menos telas que a SEAB.
    await expect(page.getByText(/6 passos/)).toBeVisible()
  })

  /**
   * O tutorial guiado (ADR-024).
   *
   * O que se mede aqui é o que a versão anterior não fazia: conduzir. Uma tela
   * só no palco, o elemento certo contornado, e o passo seguinte a um clique.
   */
  test('o tutorial guiado abre uma tela por vez e marca o alvo do passo', async ({ page }) => {
    await page.goto('/sistema')
    await page.getByRole('link', { name: /começar o tutorial/ }).click()

    await expect(page).toHaveURL(/passo=1/)
    // Passo 01 da SEAB é a régua por tipo de unidade.
    await expect(page.locator('#alvo-ind-regua')).toBeVisible()
    await expect(page.getByText('veja a régua de cada tipo de unidade')).toBeVisible()
    // Uma tela só: o sumário e as outras sanfonas saem de cena.
    await expect(page.locator('#tela-auditoria')).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Telas do sistema' })).toHaveCount(0)

    await page.getByRole('link', { name: /^próximo/ }).click()
    await expect(page).toHaveURL(/passo=2#alvo-seab-funil$/)
    await expect(page.locator('#alvo-seab-funil')).toBeInViewport()
  })

  test('sair do tutorial devolve o sistema inteiro', async ({ page }) => {
    await page.goto('/sistema?passo=3')
    await page.getByRole('link', { name: /sair/ }).click()

    await expect(page).not.toHaveURL(/passo=/)
    await expect(page.getByRole('navigation', { name: 'Telas do sistema' })).toBeVisible()
  })

  test('passo fora da faixa cai no último em vez de quebrar', async ({ page }) => {
    await page.goto('/sistema?passo=999')
    // A SEAB tem 9 passos; o 999 digitado à mão vira o 09, não um 404.
    await expect(page.getByText(/passo 09 de 09/)).toBeVisible()
  })

  test('a memória de cálculo explica de onde veio cada número', async ({ page }) => {
    // O mês mais recente fechado é junho, e junho fechou pela v3: a memória
    // abre pelo método de notas, com a coluna "Nota" no lugar do atingimento.
    await page.goto('/sistema?abrir=meu-resultado')

    await expect(page.getByText('Nota do mês', { exact: true })).toBeVisible()

    const memoria = page.getByText('Memória de cálculo', { exact: true })
    await expect(memoria).toBeVisible()
    await memoria.click()

    await expect(page.getByRole('columnheader', { name: 'Nota', exact: true })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Contribuição' })).toBeVisible()
    await expect(page.getByText('Soma das contribuições')).toBeVisible()
    await expect(page.getByText(/score = \(Σ nota × peso\)/)).toBeVisible()
  })

  test('maio continua pela regra antiga, com a mesma conta de antes', async ({ page }) => {
    await page.goto(
      '/sistema?abrir=meu-resultado&res_gerente=ger-usf-canario&res_ciclo=ciclo-2026-05',
    )
    // O número do Kick-off: USF Canário, maio, pela v2.
    await expect(page.locator('#alvo-res-score').getByText('86.67', { exact: true })).toBeVisible()
    await page.getByText('Memória de cálculo', { exact: true }).click()
    await expect(page.getByRole('columnheader', { name: 'Atingimento' })).toBeVisible()
    await expect(page.getByText(/score = \(Σ pontos × peso\)/)).toBeVisible()
  })

  test('a auditoria mostra a trilha com antes e depois', async ({ page }) => {
    await page.goto('/sistema?abrir=auditoria')
    await expect(page.getByRole('heading', { name: 'Linha do tempo' })).toBeVisible()
    await expect(page.getByText(/antes:/).first()).toBeVisible()
    await expect(page.getByText(/depois:/).first()).toBeVisible()
  })

  test('as regras versionadas mostram o diff entre versões', async ({ page }) => {
    await page.goto('/sistema?abrir=indicadores')
    await expect(page.getByRole('heading', { name: /Diff: v1 → v2/ })).toBeVisible()
    // A v2 redesenhou as faixas: nenhuma sobreviveu igual, então o diff é todo
    // de faixas removidas e adicionadas.
    await expect(page.getByText('removida').first()).toBeVisible()
    await expect(page.getByText('adicionada').first()).toBeVisible()
  })

  test('o lançamento recusa entrada inválida', async ({ page }) => {
    await page.goto('/sistema?abrir=lancamento')

    const resposta = await page.request.post('/api/sistema/lancamento', {
      headers: await comSessao(page),
      form: {
        subindicadorId: 'absenteismo-taxa',
        unidadeId: 'usf-sabia',
        cicloId: 'ciclo-2026-07',
        valor: '-5',
        evidencia: 'x',
      },
      maxRedirects: 0,
    })
    expect(resposta.status()).toBe(303)
    expect(resposta.headers()['location']).toContain('erro=')
  })

  test('o painel da gestão anonimiza e exporta', async ({ page }) => {
    await page.goto('/sistema?abrir=painel-gestao')
    await expect(page.getByRole('heading', { name: 'Ranking das unidades' })).toBeVisible()

    await page.getByLabel('Esconder os nomes').check()
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('unidade 01')).toBeVisible()

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

/** Preenche e envia o subindicador de famílias acompanhadas da unidade aberta na tela. */
async function lancarFamilias(page: import('@playwright/test').Page, numerador: string) {
  await page.locator('#numerador-acompanhamento-familias').fill(numerador)
  await page.locator('#denominador-acompanhamento-familias').fill('200')
  await page.locator('#evidencia-acompanhamento-familias').fill('relatório mensal do teste')
  await page
    .locator('form', { has: page.locator('#numerador-acompanhamento-familias') })
    .getByRole('button', { name: 'Salvar' })
    .click()
  await expect(page.getByText('Lançamento registrado.')).toBeVisible()
}

/**
 * A escrita é de quem escreve (auditoria do SR1, lacuna 10).
 *
 * Dois navegadores, duas cópias: o lançamento de um não aparece para o outro,
 * e o avanço de etapa que o admin faz na demonstração não muda a tela de
 * nenhum avaliador que esteja navegando ao mesmo tempo.
 */
test.describe('cada visitante escreve na própria cópia', () => {
  const TELA_DE_LANCAMENTO = '/sistema?abrir=lancamento&lanc_unidade=usf-canario'

  test('o que um visitante lança, o outro não vê', async ({ page, browser, baseURL }) => {
    await page.goto('/sistema')
    await page.getByLabel('Estou usando como').selectOption('gerente_unidade')
    await expect(page.getByText('Tutorial guiado para Gerente de unidade')).toBeVisible()

    await page.goto(TELA_DE_LANCAMENTO)
    await lancarFamilias(page, '170')
    await expect(page.locator('#numerador-acompanhamento-familias')).toHaveValue('170')

    const outro = await browser.newContext({ baseURL })
    try {
      const outraPagina = await outro.newPage()
      await outraPagina.goto(TELA_DE_LANCAMENTO)
      await expect(outraPagina.locator('#numerador-acompanhamento-familias')).toHaveValue('')
    } finally {
      await outro.close()
    }
  })

  test('a demonstração: lançar julho, homologar e abrir a nota pela v3', async ({
    page,
    browser,
    baseURL,
  }) => {
    await entrarNoPainel(page)

    // 1. A unidade (aqui a SEAB, lançando por ela) informa um número de julho.
    await page.goto(TELA_DE_LANCAMENTO)
    await lancarFamilias(page, '170')

    // 2. A SEAB fecha o prazo e homologa: dois avanços, cada um confirmado.
    await page.goto('/sistema?abrir=painel-seab')
    await page.getByLabel(/Confirmo o avanço/).check()
    await page.getByRole('button', { name: 'Avançar para Em validação' }).click()
    await expect(page.getByText('Ciclo avançado para Em validação.')).toBeVisible()
    await page.getByLabel(/Confirmo o avanço/).check()
    await page.getByRole('button', { name: 'Homologar ciclo' }).click()
    await expect(page.getByText('Ciclo avançado para Homologado.')).toBeVisible()

    // 3. Julho tem nota, pelo método de notas, e o indicador sem lançamento
    //    (a vacinação da Canário, que ninguém lançou) sai da conta com o peso
    //    junto (art. 8º): a USF soma 1,0 de peso, e a conta divide por 0,8.
    await page.goto(
      '/sistema?abrir=meu-resultado&res_gerente=ger-usf-canario&res_ciclo=ciclo-2026-07',
    )
    await expect(page.getByText('Nota do mês', { exact: true })).toBeVisible()
    await page.getByText('Memória de cálculo', { exact: true }).click()
    await expect(page.getByRole('columnheader', { name: 'Nota', exact: true })).toBeVisible()
    const memoria = page.locator('#alvo-res-memoria')
    await expect(memoria.getByText('regra-v3 v3')).toBeVisible()
    await expect(memoria.getByText(/÷ \(0\.8 × 1\) × 100 =/)).toBeVisible()
    await expect(memoria.getByText('Vacinação infantil em dia')).toHaveCount(0)

    // 4. Fora do prazo, a tentativa não entra, mas fica no histórico.
    const tentativa = await page.request.post('/api/sistema/lancamento', {
      headers: await comSessao(page),
      form: {
        subindicadorId: 'vacinacao-polio',
        unidadeId: 'usf-canario',
        cicloId: 'ciclo-2026-07',
        numerador: '10',
        denominador: '20',
        evidencia: 'depois do prazo',
      },
      maxRedirects: 0,
    })
    expect(tentativa.headers()['location']).toContain('erro=')
    await page.goto('/sistema?abrir=auditoria&aud_tipo=lancamento_recusado')
    await expect(page.getByText(/Tentativa de lançamento de vacinacao-polio/)).toBeVisible()

    // 5. E ninguém mais viu nada disso: para outro navegador, julho segue aberto.
    const outro = await browser.newContext({ baseURL })
    try {
      const outraPagina = await outro.newPage()
      await outraPagina.goto('/sistema?abrir=painel-seab')
      await expect(outraPagina.getByText('mês em andamento: 2026-07')).toBeVisible()
      await expect(
        outraPagina.locator('#tela-painel-seab').getByText('Lançamento aberto').first(),
      ).toBeVisible()
      await outraPagina.goto(
        '/sistema?abrir=meu-resultado&res_gerente=ger-usf-canario&res_ciclo=ciclo-2026-07',
      )
      // Sem nota de julho: o seletor cai no último mês fechado, junho.
      await expect(outraPagina.locator('#res_ciclo')).toHaveValue('ciclo-2026-06')
    } finally {
      await outro.close()
    }
  })
})
