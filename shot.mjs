import { chromium } from '@playwright/test'
const [url, saida, largura, altura, scrollY] = process.argv.slice(2)
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const pg = await nav.newPage({ viewport: { width: Number(largura || 1280), height: Number(altura || 900) } })
await pg.goto(url, { waitUntil: 'networkidle' })
if (scrollY) { await pg.evaluate((y) => window.scrollTo(0, Number(y)), scrollY); await pg.waitForTimeout(900) }
await pg.screenshot({ path: saida })
await nav.close()
