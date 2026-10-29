import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { areasHome, clustersHome, datasetResumoHome, regrasHome, resumoAnualHome } from '../fixtures/home'

// Os KPIs da home vêm das APIs dos quatro subprojetos (lib/home/kpis.ts). Modo simulado (padrão): respostas
// fixas de tests/fixtures/home.ts. Com E2E_BACKEND=real, usa a API de verdade.
const SIMULADO = (process.env.E2E_BACKEND ?? 'simulado') === 'simulado'

const RESPOSTAS: [RegExp, unknown][] = [
  [/\/api\/multienade\/relatorio-cluster$/, clustersHome],
  [/\/api\/multienade\/relatorio-associacao$/, regrasHome],
  [/\/api\/e-xplainenade\/dataset\/resumo$/, datasetResumoHome],
  [/\/api\/educluster\/areas$/, areasHome],
  [/\/api\/enade-time\/analises\/resumo-anual$/, resumoAnualHome],
]

async function abrir(page: Page) {
  if (SIMULADO)
    for (const [rota, corpo] of RESPOSTAS) await page.route(rota, (route) => route.fulfill({ json: corpo }))
  await page.goto('/')
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 60_000 })
}

test.describe('Tela 1 · home', () => {
  test('abre sem erro de console', async ({ page }) => {
    const erros: string[] = []
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    page.on('pageerror', (e) => erros.push(e.message))
    await abrir(page)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(erros).toEqual([])
  })

  test('screenshot', async ({ page }) => {
    test.skip(!SIMULADO, 'com dados reais compara estrutura, não pixels')
    await abrir(page)
    await page.evaluate(() => document.fonts.ready)
    // o indicador de desenvolvimento do Next não faz parte da tela
    await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((el) => el.remove()))
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('axe sem violações sérias', async ({ page }) => {
    await abrir(page)
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test('sem rolagem horizontal', async ({ page }) => {
    await abrir(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('título em Poppins 500, nada acima de 500', async ({ page }) => {
    await abrir(page)
    const h1 = page.getByRole('heading', { level: 1 })
    expect(await h1.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('500')
    expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Poppins/i)
    const pesos = await page.evaluate(() => [...document.querySelectorAll('main *')].map((el) => Number(getComputedStyle(el).fontWeight)))
    expect(Math.max(...pesos)).toBeLessThanOrEqual(500)
  })

  test('KPIs com os números de cada subprojeto', async ({ page }) => {
    test.skip(!SIMULADO, 'os números reais mudam com a base')
    await abrir(page)
    for (const texto of ['161 cursos em 3 perfis', '18.543', '3.832', '2005 a 2021 · 24.967 inscrições'])
      await expect(page.getByText(texto)).toBeVisible()
    await expect(page.locator('[class*="bg-seq-"]')).toHaveCount(resumoAnualHome.length)
  })

  test('API fora do ar: os cards mostram "Dados indisponíveis" sem erro de página', async ({ page }) => {
    const erros: string[] = []
    page.on('pageerror', (e) => erros.push(e.message))
    await page.route(/\/api\//, (route) => route.abort())
    await page.goto('/')
    await expect(page.getByText('Dados indisponíveis')).toHaveCount(4)
    await expect(page.getByText('Série histórica indisponível')).toBeVisible()
    expect(erros).toEqual([])
  })

  test('"Repositório" abre a tela de repositórios', async ({ page }) => {
    await abrir(page)
    await page.getByRole('link', { name: /Repositório/ }).click()
    await expect(page).toHaveURL(/\/repositorios$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Repositórios do projeto' })).toBeVisible()
    await expect(page.locator('a[href^="https://github.com/"]')).toHaveCount(3)
    await page.getByRole('link', { name: /Voltar/ }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('repositórios: axe sem violações sérias e sem rolagem horizontal', async ({ page }) => {
    await page.goto('/repositorios')
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help}`)).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})

test.describe('fundação no navegador', () => {
  test('logo a 28px no desktop e 24px no celular', async ({ page }, info) => {
    await abrir(page)
    const logo = page.locator('header [data-brand-logo] img:visible')
    await expect(logo).toHaveCount(1)
    const { height } = (await logo.boundingBox())!
    expect(Math.round(height)).toBe(info.project.name === 'celular' ? 24 : 28)
  })

  test('o tema escuro troca a logo e as cores', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-claro')
    await abrir(page)
    const barra = page.locator('[class*="bg-seq-5"]').first()
    const corClaro = await barra.evaluate((el) => getComputedStyle(el).backgroundColor)
    await page.getByRole('button', { name: 'Tema escuro' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await barra.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(corClaro)
    await expect(page.locator('header img.enx-logo-dark')).toBeVisible()
    await expect(page.locator('header img.enx-logo-light')).toBeHidden()
  })

  test('recarregar no escuro não pinta o claro antes', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-claro')
    await page.addInitScript(() => localStorage.setItem('enx-theme', 'dark'))
    // Captura o tema e a cor de fundo no primeiro momento em que o <body> existe, antes do React.
    await page.addInitScript(() => {
      new MutationObserver((_, obs) => {
        if (document.body) {
          ;(window as unknown as { __primeiro: string }).__primeiro = `${document.documentElement.dataset.theme}|${getComputedStyle(document.body).backgroundColor}`
          obs.disconnect()
        }
      }).observe(document, { childList: true, subtree: true })
    })
    await abrir(page)
    const primeiro = await page.evaluate(() => (window as unknown as { __primeiro: string }).__primeiro)
    expect(primeiro).toBe('dark|rgb(7, 28, 44)')
  })

  test('prefers-reduced-motion zera transição e animação', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-claro')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await abrir(page)
    const botao = page.getByRole('link', { name: /Explorar subprojetos/ })
    expect(await botao.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s')
    expect(await botao.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  })
})
