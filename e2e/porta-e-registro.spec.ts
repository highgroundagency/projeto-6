import { expect, test } from '@playwright/test'

test.describe('página inicial', () => {
  test('a chamada e o hero cabem acima da dobra', async ({ page }) => {
    await page.goto('/')

    // A página rola de propósito, mas a primeira tela precisa dizer o que é.
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
    await expect(page.getByRole('link', { name: /ver o sistema/ }).first()).toBeInViewport()
  })

  test('não estoura a largura da tela', async ({ page }) => {
    await page.goto('/')
    // Mono é bem mais largo que sans: a headline já estourou 360px uma vez.
    const estoura = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(estoura).toBe(false)
  })

  test('traz o site inteiro: equipe, marcos, registro e o caminho do sistema', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Equipe' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Evolução do projeto' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Registro semanal' })).toBeVisible()

    // Os seis integrantes, com nome.
    for (const nome of [
      'Gabriel',
      'Matheus',
      'João Henrique',
      'João Pedro',
      'Rafael',
      'Fernando',
    ]) {
      await expect(page.getByText(nome, { exact: false }).first()).toBeVisible()
    }

    await page
      .getByRole('link', { name: /ver o sistema/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/sistema$/)
  })

  test('/registro continua funcionando e cai na seção', async ({ page }) => {
    // A rota virou redirecionamento: link já compartilhado não pode quebrar.
    await page.goto('/registro')
    await expect(page).toHaveURL(/\/#registro$/)
    await expect(page.getByRole('heading', { name: 'Registro semanal' })).toBeVisible()
  })

  test('tem foco de teclado visível no primeiro elemento navegável', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const temFoco = await page.evaluate(() => document.activeElement?.tagName !== 'BODY')
    expect(temFoco).toBe(true)
  })
})

test.describe('registro do projeto', () => {
  test('cumpre os blocos exigidos pela diretriz', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Registro semanal' })).toBeVisible()

    // As semanas chegam recolhidas: abrir uma é o que expõe os oito blocos.
    await page.locator('details[data-ciclo]').first().getByRole('heading').click()

    for (const bloco of [
      'Objetivo da semana',
      'Avanços',
      'Decisões',
      'Bloqueios',
      'Feedback recebido',
      'Próximos passos',
      'Responsáveis',
      'Evidências',
    ]) {
      await expect(
        page.getByRole('heading', { name: bloco, exact: true }).first(),
      ).toBeVisible()
    }
  })

  test('mostra a equipe, a pergunta do projeto e a trilha de marcos', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Equipe' })).toBeVisible()
    await expect(
      page.getByText(/confiável, transparente, sustentável e auditável/),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Evolução do projeto' })).toBeVisible()

    for (const marco of ['Kick-off', 'SR1', 'SR2: Final']) {
      await expect(page.getByText(marco, { exact: true }).first()).toBeVisible()
    }
  })

  test('todas as semanas chegam recolhidas, e a setinha abre uma', async ({ page }) => {
    await page.goto('/')

    const semanas = page.locator('details[data-ciclo]')
    const quantas = await semanas.count()
    expect(quantas).toBeGreaterThan(1)

    // Nenhuma aberta: o professor procura UMA linha, não rola um muro de texto.
    for (let i = 0; i < quantas; i++) {
      await expect(semanas.nth(i)).not.toHaveAttribute('open', '')
    }

    // E a da vez vem marcada, para ele achar sem ler data por data.
    await expect(page.getByText('esta semana').first()).toBeVisible()

    // A setinha abre as entregas daquela semana — sem JavaScript nosso.
    const escolhida = semanas.first()
    await escolhida.getByRole('heading').click()
    await expect(escolhida).toHaveAttribute('open', '')
    await expect(escolhida.getByRole('heading', { name: 'Objetivo da semana' })).toBeVisible()
  })

  test('os documentos abrem dentro da própria página', async ({ page }) => {
    await page.goto('/')

    // Semana 2 é a que tem personas, benchmarking e SWOT.
    await page.locator('details[data-ciclo="s2"] > summary').click()

    const swot = page.locator('#doc-s2-swot')
    await expect(swot).toBeVisible()
    await expect(swot).not.toHaveAttribute('open', '')

    await swot.locator('summary').click()
    await expect(swot).toHaveAttribute('open', '')

    // O documento é conteúdo renderizado, não link para PDF nem aba nova.
    for (const quadrante of ['Forças', 'Fraquezas', 'Oportunidades', 'Ameaças']) {
      await expect(swot.getByText(quadrante, { exact: true })).toBeVisible()
    }
  })

  test('nenhuma evidência manda o professor para fora ou para lugar nenhum', async ({
    page,
  }) => {
    await page.goto('/')

    const ancoras = page.locator('a[href^="#doc-"]')
    const quantas = await ancoras.count()
    expect(quantas).toBeGreaterThan(0)

    // Toda âncora de documento precisa ter destino na página.
    for (let i = 0; i < quantas; i++) {
      const href = await ancoras.nth(i).getAttribute('href')
      await expect(page.locator(href!), `âncora sem destino: ${href}`).toHaveCount(1)
    }
  })

  test('não entrega conteúdo de ciclo ainda não liberado', async ({ page }) => {
    await page.goto('/')
    const html = await page.content()

    // `<details>` fechado continua no DOM: por isso semana não liberada não pode
    // sequer ser renderizada, dobrada ou não.
    expect(html).toContain('PRUMO-MARCADOR-CICLO-s1')
    expect(html).not.toContain('PRUMO-MARCADOR-CICLO-s4')
    expect(html).not.toContain('PRUMO-MARCADOR-CICLO-ko')
  })

  test('transparência no uso de IA está publicada', async ({ page }) => {
    await page.goto('/')
    // O registro tem dois caminhos para a página: o cartão de evidência da s1 e
    // o link do rodapé. Aqui exercitamos o do rodapé.
    await page.getByRole('link', { name: 'transparência no uso de ia', exact: true }).click()
    await expect(page).toHaveURL(/\/transparencia-ia$/)
    // A frase aparece no cabeçalho da página e de novo no documento renderizado.
    await expect(page.getByText(/gerado ≠ entregue/).first()).toBeVisible()
    await expect(page.getByRole('table').first()).toBeVisible()
  })
})

/**
 * Modo claro (ADR-027).
 *
 * O que se mede aqui é o que a implementação por cookie promete e a por
 * localStorage não entrega: o HTML já chega pintado do servidor, então não há
 * quadro nenhum com o tema errado, e a escolha atravessa as páginas.
 */
test.describe('tema claro e escuro', () => {
  test('o botão troca o tema, e a escolha sobrevive à navegação', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro')

    await page.getByRole('button', { name: /modo claro/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro')

    // Atravessa páginas: o cookie vale para o site inteiro, não só para a home.
    await page.goto('/sistema')
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro')

    await page.getByRole('button', { name: /modo escuro/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro')
  })

  test('o tema já vem pintado no HTML do servidor, sem piscada', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /modo claro/i }).click()

    // Busca o HTML cru, antes de qualquer JavaScript rodar: se o atributo só
    // fosse aplicado no cliente, ele não estaria aqui e haveria piscada.
    const cru = await (await page.request.get('/')).text()
    expect(cru).toContain('data-tema="claro"')
  })

  test('o modo claro repinta de verdade, não só troca um atributo', async ({ page }) => {
    await page.goto('/')
    const escuro = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

    await page.getByRole('button', { name: /modo claro/i }).click()
    const claro = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

    expect(claro).not.toBe(escuro)
    // Papel é claro: a soma dos canais tem de subir muito.
    const soma = (cor: string) =>
      (cor.match(/\d+/g) ?? []).slice(0, 3).reduce((s, n) => s + Number(n), 0)
    expect(soma(claro)).toBeGreaterThan(soma(escuro) + 300)
  })
})
