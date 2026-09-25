import { expect, test, type Page } from '@playwright/test'
import { SLIDES_SR1, SLIDES_SR1_CURTA } from '@/content/apresentacao-sr1'
import { CICLOS_PUBLICOS } from './cronograma'

/** Quantos slides cada versão tem HOJE. Sai do conteúdo, nunca de um número à mão. */
const TOTAL = SLIDES_SR1.length
const TOTAL_CURTA = SLIDES_SR1_CURTA.length

/** O deck é conteúdo do SR1: o visitante o vê quando o release libera `sr1`. */
const SR1_PUBLICO = CICLOS_PUBLICOS.includes('sr1')

const SENHA = '0321'

async function entrarNoPainel(page: Page) {
  await page.goto('/admin/entrar')
  await page.getByLabel('Senha').fill(SENHA)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

/** O mesmo medidor da AV1 de ML: o que passa da altura some embaixo do rodapé. */
async function medirSlide(page: Page, numero: number) {
  return page.evaluate((n) => {
    const slide = document.querySelector(`[data-slide="${n}"]`) as HTMLElement
    const corpo = slide.querySelector('.slide-corpo') as HTMLElement
    const rodape = slide.querySelector('.slide-rodape') as HTMLElement
    const limite = slide.getBoundingClientRect()
    let baixo = 0
    let direita = 0
    for (const el of corpo.querySelectorAll<HTMLElement>('*')) {
      if (el.closest('.horizonte') || el.closest('.sr-only')) continue
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

test.describe('o deck do SR1', () => {
  test('o visitante recebe o que o release manda: 200 liberado, 404 oculto', async ({ page }) => {
    const resposta = await page.goto('/sr1')
    expect(resposta?.status()).toBe(SR1_PUBLICO ? 200 : 404)
    const pdf = await page.request.get('/sr1/pdf')
    expect(pdf.status()).toBe(SR1_PUBLICO ? 200 : 404)
  })

  test('o admin abre o deck: teclado, notas com quem fala e as respostas preparadas', async ({
    page,
  }) => {
    await entrarNoPainel(page)
    await page.goto('/sr1')

    await expect(page.locator('[data-modo="deck"]')).toBeAttached()
    expect(await page.locator('[data-slide]').count()).toBe(TOTAL)
    await expect(page.locator('[data-slide="1"][data-ativo]')).toBeVisible()

    for (let i = 1; i < 4; i++) await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide="4"][data-ativo]')).toBeVisible()
    await expect(page).toHaveURL(/#slide-4$/)
    await page.keyboard.press('n')
    const notas = page.locator('[data-slide="4"] details.notas')
    await expect(notas).toHaveAttribute('open', '')
    await expect(notas.locator('summary')).toContainText('matheus')
    await expect(notas).toContainText('se perguntarem')

    // A demonstração de reserva é o sistema de verdade, com a conta aberta.
    const demo = SLIDES_SR1.findIndex((s) => s.id === 'demo') + 1
    for (let i = 4; i < demo; i++) await page.keyboard.press('ArrowRight')
    const caixa = page.locator(`[data-slide="${demo}"] .demo`)
    await expect(caixa).toContainText('Soma das contribuições')
  })

  test('a versão de cinco minutos é o mesmo deck, com menos slides e a fala cortada', async ({
    page,
  }) => {
    await entrarNoPainel(page)
    await page.goto('/sr1?versao=curta')
    expect(await page.locator('[data-slide]').count()).toBe(TOTAL_CURTA)
    await expect(page.locator(`[data-slide="${TOTAL_CURTA}"] .slide-rodape`)).toContainText(
      `${TOTAL_CURTA}/${TOTAL_CURTA}`,
    )
    // O link do topo troca de uma versão para a outra.
    await expect(page.getByRole('link', { name: 'versão completa' })).toHaveAttribute('href', '/sr1')
    await page.goto('/sr1')
    await expect(page.getByRole('link', { name: 'versão de 5 min' })).toHaveAttribute(
      'href',
      '/sr1?versao=curta',
    )
  })

  for (const tamanho of [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    test(`cada slide cabe inteiro em ${tamanho.width}x${tamanho.height}`, async ({ page }) => {
      await entrarNoPainel(page)
      await page.setViewportSize(tamanho)
      await page.goto('/sr1#slide-1')
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
      })

      for (let numero = 1; numero <= TOTAL; numero++) {
        await expect(page.locator(`[data-slide="${numero}"][data-ativo]`)).toBeVisible()
        const medida = await medirSlide(page, numero)
        expect(medida.folgaAteORodape, `slide ${numero} invade o rodapé`).toBeGreaterThanOrEqual(0)
        expect(medida.passaDaDireita, `slide ${numero} passa da borda`).toBeLessThanOrEqual(1)
        if (numero < TOTAL) await page.keyboard.press('ArrowRight')
      }
    })
  }

  test('no celular, nenhum texto vaza da própria caixa', async ({ page }) => {
    await entrarNoPainel(page)
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/sr1#slide-1')
    await page.evaluate(() => document.fonts.ready)
    for (let numero = 1; numero <= TOTAL; numero++) {
      await expect(page.locator(`[data-slide="${numero}"][data-ativo]`)).toBeVisible()
      const vazando = await page.evaluate((n) => {
        const corpo = document.querySelector(`[data-slide="${n}"] .slide-corpo`) as HTMLElement
        return [...corpo.querySelectorAll<HTMLElement>('*')]
          .filter((el) => !el.closest('svg') && !el.closest('.sr-only') && !el.closest('.demo'))
          .filter((el) => getComputedStyle(el).textOverflow !== 'ellipsis')
          .filter((el) => el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
          .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80))
      }, numero)
      expect(vazando, `slide ${numero}`).toEqual([])
      if (numero < TOTAL) await page.keyboard.press('ArrowRight')
    }
    const larguras = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }))
    expect(larguras.documento).toBeLessThanOrEqual(larguras.janela)
  })
})
