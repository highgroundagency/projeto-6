import { chromium } from '@playwright/test'
const [url, saida, largura, altura, abrir] = process.argv.slice(2)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const pg = await nav.newPage({ viewport: { width: Number(largura || 1280), height: Number(altura || 900) } })
await pg.goto(url, { waitUntil: 'networkidle' })
if (abrir) {
  await pg.locator('details[data-ciclo="s2"] > summary').click()
  await pg.waitForTimeout(400)
  await pg.locator('#doc-s2-swot > summary').scrollIntoViewIfNeeded()
  await pg.locator('#doc-s2-swot > summary').click()
  await pg.waitForTimeout(600)
  await pg.locator('#doc-s2-swot').scrollIntoViewIfNeeded()
  await pg.waitForTimeout(400)
}
await pg.screenshot({ path: saida })
await nav.close()
