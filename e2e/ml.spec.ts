import { expect, test, type Page } from '@playwright/test'
import { SLIDES_ML } from '@/content/apresentacao-ml'

/** Quantos slides o deck tem HOJE. Sai do conteúdo, nunca de um número à mão. */
const TOTAL = SLIDES_ML.length

/**
 * Onde o conteúdo do slide termina e o rodapé começa.
 *
 * O modo deck corta o que passa da altura (`overflow: hidden`), então um
 * gráfico alto demais não faz a página rolar: ele simplesmente some embaixo do
 * rodapé, sem erro nenhum. Foi o tipo de coisa que já saiu estranha num PDF.
 * Esta medida acha o elemento mais baixo do corpo e o compara com o rodapé.
 */
async function medirSlide(page: Page, numero: number) {
  return page.evaluate((n) => {
    const slide = document.querySelector(`[data-slide="${n}"]`) as HTMLElement
    const corpo = slide.querySelector('.slide-corpo') as HTMLElement
    const rodape = slide.querySelector('.slide-rodape') as HTMLElement
    const limite = slide.getBoundingClientRect()
    let baixo = 0
    let direita = 0
    for (const el of corpo.querySelectorAll<HTMLElement>('*')) {
      // A faixa do Recife é de borda a borda de propósito, e fica atrás.
      if (el.closest('.horizonte')) continue
      const caixa = el.getBoundingClientRect()
      if (caixa.width === 0 && caixa.height === 0) continue
      baixo = Math.max(baixo, caixa.bottom)
      direita = Math.max(direita, caixa.right)
    }
    return {
      folgaAteORodape: rodape.getBoundingClientRect().top - baixo,
      passaDaDireita: direita - limite.right,
    }
  }, numero)
}

test.describe('a AV1 de machine learning', () => {
  test('o visitante abre o deck, sem portão de release', async ({ page }) => {
    const resposta = await page.goto('/ml')
    expect(resposta?.status()).toBe(200)

    await expect(page.locator('[data-modo="deck"]')).toBeAttached()
    expect(await page.locator('[data-slide]').count()).toBe(TOTAL)
    await expect(page.locator('[data-slide="1"][data-ativo]')).toBeVisible()

    // Setas, hash e notas: o mesmo deck do Kick-off.
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide="3"][data-ativo]')).toBeVisible()
    await expect(page).toHaveURL(/#slide-3$/)
    await page.keyboard.press('n')
    await expect(page.locator('[data-slide="3"] details.notas')).toHaveAttribute('open', '')

    // A etapa da avaliação aparece no alto de cada slide de conteúdo.
    await expect(page.locator('[data-slide="3"]')).toContainText('entendimento do problema')

    // A página não estoura a largura, nem a 360px.
    const larguras = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }))
    expect(larguras.documento).toBeLessThanOrEqual(larguras.janela)
  })

  for (const tamanho of [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
  ]) {
    test(`cada slide cabe inteiro em ${tamanho.width}x${tamanho.height}`, async ({ page }) => {
      await page.setViewportSize(tamanho)
      await page.goto('/ml#slide-1')
      await page.evaluate(() => document.fonts.ready)
      // Sem animação: medir no meio da entrada daria um slide mais baixo do
      // que ele termina.
      await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
      })

      for (let numero = 1; numero <= TOTAL; numero++) {
        await expect(page.locator(`[data-slide="${numero}"][data-ativo]`)).toBeVisible()
        const medida = await medirSlide(page, numero)
        expect(medida.folgaAteORodape, `slide ${numero} invade o rodapé`).toBeGreaterThanOrEqual(0)
        expect(medida.passaDaDireita, `slide ${numero} passa da borda`).toBeLessThanOrEqual(1)

        const rolaPagina = await page.evaluate(
          () => document.documentElement.scrollHeight > window.innerHeight + 1,
        )
        expect(rolaPagina, `a página rola no slide ${numero}`).toBe(false)
        if (numero < TOTAL) await page.keyboard.press('ArrowRight')
      }
    })
  }

  test('o deck oferece o PDF de reserva, e ele existe', async ({ page, request }) => {
    await page.goto('/ml')
    const baixar = page.getByRole('link', { name: 'baixar pdf' })
    await expect(baixar).toBeVisible()
    await expect(baixar).toHaveAttribute('download', '')
    expect(await baixar.getAttribute('href')).toBe('/ml/pdf')

    const resposta = await request.get('/ml/pdf')
    expect(resposta.status()).toBe(200)
    expect(resposta.headers()['content-type']).toContain('pdf')
  })

  test('o rodapé do site leva à AV1', async ({ page }) => {
    await page.goto('/arquitetura')
    const link = page.getByRole('link', { name: 'machine learning', exact: true })
    await expect(link).toHaveAttribute('href', '/ml')
  })

  test('sem JavaScript, todos os slides ficam empilhados e legíveis', async ({
    browser,
    baseURL,
  }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, baseURL })
    const page = await contexto.newPage()
    await page.goto('/ml')

    expect(await page.locator('[data-modo="deck"]').count()).toBe(0)
    for (let numero = 1; numero <= TOTAL; numero++) {
      await expect(page.locator(`[data-slide="${numero}"]`)).toBeVisible()
    }
    await contexto.close()
  })
})
