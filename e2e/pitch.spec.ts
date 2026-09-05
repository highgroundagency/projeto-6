import { expect, test, type Page } from '@playwright/test'
import { CICLOS_PUBLICOS } from './cronograma'

const SENHA = '0321'

/** O pitch é conteúdo do Kick-off: o visitante o vê quando o release libera `ko`. */
const KO_PUBLICO = CICLOS_PUBLICOS.includes('ko')

async function entrarNoPainel(page: Page) {
  await page.goto('/admin/entrar')
  await page.getByLabel('Senha').fill(SENHA)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test.describe('o pitch do Kick-off', () => {
  test('o visitante recebe o que o release manda: 200 liberado, 404 oculto', async ({
    page,
  }) => {
    const resposta = await page.goto('/pitch')
    expect(resposta?.status()).toBe(KO_PUBLICO ? 200 : 404)
  })

  test('o admin abre o deck: nove slides, indicador, teclado, notas e a memória real', async ({
    page,
  }) => {
    await entrarNoPainel(page)
    await page.goto('/pitch')

    // O modo deck liga com JavaScript e mostra um slide por vez.
    await expect(page.locator('[data-modo="deck"]')).toBeAttached()
    expect(await page.locator('[data-slide]').count()).toBe(9)
    await expect(page.locator('[data-slide="1"][data-ativo]')).toBeVisible()
    await expect(page.locator('[data-slide="2"]')).toBeHidden()

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide="3"][data-ativo]')).toBeVisible()
    await expect(page.locator('[data-slide="3"] .slide-rodape')).toContainText('3/9')
    await expect(page).toHaveURL(/#slide-3$/)

    // `n` abre as notas do apresentador, com quem fala e o tempo.
    await page.keyboard.press('n')
    await expect(page.locator('[data-slide="3"] details.notas')).toHaveAttribute('open', '')
    await expect(page.locator('[data-slide="3"] details.notas summary')).toContainText('0:40')

    // O slide da demonstração traz a memória de cálculo de verdade, já aberta.
    await page.keyboard.press('ArrowRight')
    const demo = page.locator('[data-slide="4"] [data-captura="memoria"]')
    await expect(demo).toContainText('Memória de cálculo')
    await expect(demo.locator('details[open]')).toHaveCount(1)
    await expect(demo).toContainText('Soma das contribuições')

    // A página não estoura a largura, nem a 360px.
    const larguras = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }))
    expect(larguras.documento).toBeLessThanOrEqual(larguras.janela)

    // Voltar funciona, e o começo é o começo.
    await page.keyboard.press('Home')
    await expect(page.locator('[data-slide="1"][data-ativo]')).toBeVisible()
  })

  test('sem JavaScript, os nove slides ficam empilhados e legíveis', async ({
    browser,
    baseURL,
  }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, baseURL })
    const page = await contexto.newPage()
    await entrarNoPainel(page)
    await page.goto('/pitch')

    expect(await page.locator('[data-modo="deck"]').count()).toBe(0)
    for (let numero = 1; numero <= 9; numero++) {
      await expect(page.locator(`[data-slide="${numero}"]`)).toBeVisible()
    }
    await expect(page.locator('[data-slide="9"] .slide-rodape')).toContainText('9/9')

    await contexto.close()
  })
})
