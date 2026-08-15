import { expect, test } from '@playwright/test'

test.describe('porta de entrada', () => {
  test('mostra as duas escolhas e cabe na tela sem scroll', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: /Registro do projeto/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Sistema/ })).toBeVisible()

    // A porta é uma bifurcação, não uma landing page: não pode ter scroll.
    const precisaRolar = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight + 1,
    )
    expect(precisaRolar).toBe(false)
  })

  test('leva ao registro e ao sistema', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Registro do projeto/ }).click()
    await expect(page).toHaveURL(/\/registro$/)

    await page.goto('/')
    await page.getByRole('link', { name: /^02/ }).click()
    await expect(page).toHaveURL(/\/sistema$/)
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
    await page.goto('/registro')

    await expect(page.getByRole('heading', { name: 'Registro semanal' })).toBeVisible()

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
      await expect(page.getByRole('heading', { name: bloco, exact: true }).first()).toBeVisible()
    }
  })

  test('mostra a equipe, a pergunta do projeto e a trilha de marcos', async ({ page }) => {
    await page.goto('/registro')

    await expect(page.getByRole('heading', { name: 'Equipe' })).toBeVisible()
    await expect(page.getByText(/confiável, transparente, sustentável e auditável/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Evolução do projeto' })).toBeVisible()

    for (const marco of ['Kick-off', 'SR1', 'SR2 — Final']) {
      await expect(page.getByText(marco, { exact: true }).first()).toBeVisible()
    }
  })

  test('não entrega conteúdo de ciclo ainda não liberado', async ({ page }) => {
    await page.goto('/registro')
    const html = await page.content()

    expect(html).toContain('PRUMO-MARCADOR-CICLO-s1')
    expect(html).not.toContain('PRUMO-MARCADOR-CICLO-s4')
    expect(html).not.toContain('PRUMO-MARCADOR-CICLO-ko')
  })

  test('transparência no uso de IA está publicada', async ({ page }) => {
    await page.goto('/registro')
    // O registro tem dois caminhos para a página: o cartão de evidência da s1 e
    // o link do rodapé. Aqui exercitamos o do rodapé.
    await page.getByRole('link', { name: 'Transparência no uso de IA', exact: true }).click()
    await expect(page).toHaveURL(/\/transparencia-ia$/)
    // A frase aparece no cabeçalho da página e de novo no documento renderizado.
    await expect(page.getByText(/gerado ≠ entregue/).first()).toBeVisible()
    await expect(page.getByRole('table').first()).toBeVisible()
  })
})
