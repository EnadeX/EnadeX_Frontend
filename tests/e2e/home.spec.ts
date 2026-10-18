import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// A home não chama API: os modos simulado/gravar/real dão o mesmo resultado.

test.describe('Tela 1 · home', () => {
  test('abre sem erro de console', async ({ page }) => {
    const erros: string[] = []
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    page.on('pageerror', (e) => erros.push(e.message))
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(erros).toEqual([])
  })

  test('screenshot', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    // o indicador de desenvolvimento do Next não faz parte da tela
    await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((el) => el.remove()))
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('axe sem violações sérias', async ({ page }) => {
    await page.goto('/')
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test('sem rolagem horizontal', async ({ page }) => {
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('título em Poppins 500, nada acima de 500', async ({ page }) => {
    await page.goto('/')
    const h1 = page.getByRole('heading', { level: 1 })
    expect(await h1.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('500')
    expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Poppins/i)
    const pesos = await page.evaluate(() => [...document.querySelectorAll('main *')].map((el) => Number(getComputedStyle(el).fontWeight)))
    expect(Math.max(...pesos)).toBeLessThanOrEqual(500)
  })
})

test.describe('fundação no navegador', () => {
  test('logo a 28px no desktop e 24px no celular', async ({ page }, info) => {
    await page.goto('/')
    const logo = page.locator('header [data-brand-logo] img:visible')
    await expect(logo).toHaveCount(1)
    const { height } = (await logo.boundingBox())!
    expect(Math.round(height)).toBe(info.project.name === 'celular' ? 24 : 28)
  })

  test('o tema escuro troca a logo e as cores', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-claro')
    await page.goto('/')
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
    await page.goto('/')
    const primeiro = await page.evaluate(() => (window as unknown as { __primeiro: string }).__primeiro)
    expect(primeiro).toBe('dark|rgb(7, 28, 44)')
  })

  test('prefers-reduced-motion zera transição e animação', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-claro')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const botao = page.getByRole('link', { name: /Explorar subprojetos/ })
    expect(await botao.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s')
    expect(await botao.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  })
})
