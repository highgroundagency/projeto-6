import { expect, test } from '@playwright/test'
import { CICLO_OCULTO, marcador } from './cronograma'

/** A mesma chave que playwright.config.ts injeta no servidor da suíte. */
const CHAVE = 'chave-de-teste-e2e-da-vitrine-pessoal'

/**
 * O link da vitrine pessoal: visão completa sem senha e sem painel.
 *
 * O contrato tem três lados, e os três precisam de teste: a chave certa abre
 * tudo para ESTE navegador; qualquer outra coisa é 404 indistinguível de rota
 * inexistente; e quem não tem o cookie continua vendo o recorte normal.
 */
test.describe('vitrine pessoal', () => {
  test('chave errada é 404, igual a rota que não existe', async ({ page }) => {
    const errada = await page.request.get('/vitrine/chave-errada-mas-igualmente-longa')
    expect(errada.status()).toBe(404)
  })

  test('a chave certa abre o site inteiro', async ({ page }) => {
    await page.goto(`/vitrine/${CHAVE}`)

    // O link deposita o cookie e manda para a página. A faixa é mínima de
    // propósito: nome e saída, sem data simulada nem frase de explicação.
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('vitrine pessoal', { exact: false })).toBeVisible()
    await expect(page.getByText(/simulando/)).toHaveCount(0)

    // Um ciclo que o visitante de hoje NÃO vê está no registro.
    expect(await page.content()).toContain(marcador(CICLO_OCULTO))

    // E o sistema mostra as 8 telas (o perfil padrão, SEAB, enxerga todas).
    await page.goto('/sistema')
    await expect(page.locator('#sumario li')).toHaveCount(8)
  })

  test('sair devolve o recorte normal do calendário', async ({ page }) => {
    await page.goto(`/vitrine/${CHAVE}`)
    expect(await page.content()).toContain(marcador(CICLO_OCULTO))

    await page.goto('/vitrine/sair')
    await expect(page).toHaveURL(/\/$/)
    expect(await page.content()).not.toContain(marcador(CICLO_OCULTO))
    await expect(page.getByText('Vitrine pessoal', { exact: false })).toHaveCount(0)
  })

  test('a sessão de admin vence o cookie: a prévia de visitante não mente', async ({
    page,
  }) => {
    // Jornada real da equipe: clicou o link uma vez (cookie de 150 dias), depois
    // abriu o painel para conferir o recorte público. Se o cookie vencesse, o
    // "ver como visitante" mostraria 2027 enquanto o visitante real vê agosto.
    await page.goto(`/vitrine/${CHAVE}`)
    await expect(page.getByText('Vitrine pessoal', { exact: false })).toBeVisible()

    await page.goto('/admin/entrar')
    await page.getByLabel('Senha').fill('0321')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/admin$/)

    await page.goto('/')
    await expect(page.getByText('Modo completo: visível só para você')).toBeVisible()
    await expect(page.getByText('Vitrine pessoal', { exact: false })).toHaveCount(0)
  })

  test('sem o cookie, nada muda para o visitante comum', async ({ page }) => {
    await page.goto('/')
    expect(await page.content()).not.toContain(marcador(CICLO_OCULTO))
    await expect(page.getByText('Vitrine pessoal', { exact: false })).toHaveCount(0)
  })
})
