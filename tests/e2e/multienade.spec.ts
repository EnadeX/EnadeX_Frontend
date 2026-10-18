import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// Modo simulado (padrão): respostas fixas de tests/e2e/fixtures. Com E2E_BACKEND=real, usa a API de verdade.
const SIMULADO = (process.env.E2E_BACKEND ?? 'simulado') === 'simulado'

async function abrir(page: Page) {
  if (SIMULADO)
    await page.route(/\/api\/multienade\/(relatorio-[a-z]+)$/, (route, req) => {
      const nome = req.url().match(/(relatorio-[a-z]+)$/)![1]
      return route.fulfill({ contentType: 'application/json', body: readFileSync(`tests/e2e/fixtures/multienade-${nome}.json`, 'utf8') })
    })
  await page.goto('/multienade')
  await expect(page.getByText('● Conectado')).toBeAttached()
}

test.describe('Tela 2 · MultiENADE', () => {
  test('abre sem erro de console', async ({ page }) => {
    const erros: string[] = []
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    page.on('pageerror', (e) => erros.push(e.message))
    await abrir(page)
    expect(erros).toEqual([])
  })

  for (const aba of ['Modelagem supervisionada', 'Agrupamento de perfis', 'Regras de associação']) {
    test(`screenshot: ${aba}`, async ({ page }) => {
      test.skip(!SIMULADO, 'com dados reais compara estrutura, não pixels')
      await abrir(page)
      await page.getByRole('button', { name: new RegExp(aba) }).click()
      await page.evaluate(() => document.fonts.ready)
      // o indicador de desenvolvimento do Next não faz parte da tela
      await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((el) => el.remove()))
      await expect(page).toHaveScreenshot(`multienade-${aba.split(' ')[0].toLowerCase()}.png`, { fullPage: true })
    })
  }

  test('axe sem violações sérias', async ({ page }) => {
    await abrir(page)
    for (const aba of ['Agrupamento de perfis', 'Regras de associação', 'Modelagem supervisionada']) {
      await page.getByRole('button', { name: new RegExp(aba) }).click()
      // Exceção conhecida, anterior à migração: a tabela do Dataset rola sem poder receber foco do teclado.
      // Corrigir pede `tabIndex` no componente (não é só estilo); ficou como sugestão ao autor (plano, seção 6).
      const { violations } = await new AxeBuilder({ page }).disableRules(['scrollable-region-focusable']).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${aba} · ${v.id}: ${v.help}`)).toEqual([])
    }
  })

  test('sem rolagem horizontal da página', async ({ page }) => {
    await abrir(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('nada acima do peso 500', async ({ page }) => {
    await abrir(page)
    const pesos = await page.evaluate(() => [...document.querySelectorAll('main *')].map((el) => Number(getComputedStyle(el).fontWeight)))
    expect(Math.max(...pesos)).toBeLessThanOrEqual(500)
  })

  test('os clusters trocam de cor com o tema', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-claro')
    await abrir(page)
    await page.getByRole('button', { name: /Agrupamento de perfis/ }).click()
    const ponto = page.locator('span[title*="cluster 0 "]').first()
    const claro = await ponto.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(claro).toBe('rgb(12, 51, 80)') // series-1 no claro
    await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'))
    expect(await ponto.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(228, 242, 244)') // series-1 no escuro
  })
})
