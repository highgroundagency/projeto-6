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
    const demo = page.locator('[data-slide="4"] .demo')
    await expect(demo).toContainText('Memória de cálculo')
    await expect(demo.locator('details[open]')).toHaveCount(1)
    await expect(demo).toContainText('Soma das contribuições')

    // E ela cabe: sem caixa de rolagem interna, a conta inteira na tela. A
    // versão anterior mostrava 38% do conteúdo e escondia justamente a linha
    // que dá nome ao slide.
    const rolagem = await demo.evaluate((el) => ({
      conteudo: el.scrollHeight,
      caixa: el.clientHeight,
    }))
    expect(rolagem.conteudo, 'a demonstração tem barra de rolagem').toBeLessThanOrEqual(
      rolagem.caixa + 1,
    )
    await expect(demo).toContainText('A conta final')

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

  test('depois de clicar num controle, a seta continua passando o slide', async ({ page }) => {
    // O caminho que ninguém testava, porque o script do PDF navega sem nunca
    // clicar: quem apresenta clica, o foco fica no botão, e a versão anterior
    // desligava o teclado inteiro até alguém clicar no fundo da página.
    await entrarNoPainel(page)
    await page.goto('/pitch')

    await page.getByRole('button', { name: 'Próximo slide' }).click()
    await expect(page.locator('[data-slide="2"][data-ativo]')).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide="3"][data-ativo]')).toBeVisible()

    // Vale para o botão de tema no cabeçalho, que fica visível o pitch inteiro.
    await page.locator('.cromo').getByRole('button').first().click()
    await page.waitForLoadState('networkidle')
    await page.locator('body').click({ position: { x: 5, y: 400 } })
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('[data-slide][data-ativo]')).toBeVisible()

    // E as notas continuam abrindo pelo teclado depois de tudo isso.
    await page.keyboard.press('n')
    await expect(page.locator('[data-slide][data-ativo] details.notas')).toHaveAttribute(
      'open',
      '',
    )
  })

  test('o deck oferece o PDF de reserva, e ele existe', async ({ page, request }) => {
    await entrarNoPainel(page)
    await page.goto('/pitch')

    const baixar = page.getByRole('link', { name: 'baixar pdf' })
    await expect(baixar).toBeVisible()
    await expect(baixar).toHaveAttribute('download', '')

    const href = await baixar.getAttribute('href')
    expect(href).toBe('/pitch/pdf')

    // O cookie de sessão vai junto: o PDF passa pelo mesmo portão da página.
    const cookies = await page.context().cookies()
    const resposta = await request.get(href ?? '', {
      headers: { cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') },
    })
    expect(resposta.status()).toBe(200)
    expect(resposta.headers()['content-type']).toContain('pdf')
  })

  for (const tamanho of [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
  ]) {
    test(`a memória cabe inteira em ${tamanho.width}x${tamanho.height}`, async ({ page }) => {
      await entrarNoPainel(page)
      await page.setViewportSize(tamanho)
      await page.goto('/pitch#slide-4')

      const caixa = page.locator('[data-slide="4"] .demo')
      // Visível, não só presente: a linha da conta é o argumento do slide.
      await expect(caixa.getByText('A conta final')).toBeInViewport()
      await expect(caixa.getByText('Soma das contribuições')).toBeInViewport()

      const rolaCaixa = await caixa.evaluate((el) => el.scrollHeight > el.clientHeight + 1)
      expect(rolaCaixa, 'a demonstração rola por dentro').toBe(false)

      // E a página também não rola: o modo deck promete um slide por tela, e
      // a linha de ajuda das teclas já fez a página crescer 68px uma vez.
      const rolaPagina = await page.evaluate(
        () => document.documentElement.scrollHeight > window.innerHeight + 1,
      )
      expect(rolaPagina, 'a página rola em modo deck').toBe(false)
    })
  }

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
