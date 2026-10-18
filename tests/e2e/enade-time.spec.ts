import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { respostaPorCaminho } from '../fixtures/enade-time'

// Modo simulado (padrão): respostas de tests/fixtures/enade-time.ts. Com E2E_BACKEND=real, usa a API em
// NEXT_PUBLIC_ENADE_TIME_API_URL (padrão http://localhost:8001) e pula se ela estiver fora do ar.
const SIMULADO = (process.env.E2E_BACKEND ?? 'simulado') === 'simulado'
const API = process.env.NEXT_PUBLIC_ENADE_TIME_API_URL ?? 'http://localhost:8002'

const TELAS = [
  ['visao-geral', '/enade-time'],
  ['anual', '/enade-time/enade/anual'],
  ['regional', '/enade-time/enade/regional'],
  ['uf', '/enade-time/enade/uf'],
  ['ies', '/enade-time/enade/ies'],
  ['comparar', '/enade-time/enade/comparar'],
  ['registros', '/enade-time/enade/registros'],
  ['spd-comparativo', '/enade-time/spd/comparativo'],
  ['spd-execucoes', '/enade-time/spd/execucoes'],
  ['spd-metricas', '/enade-time/spd/metricas'],
  ['spd-carga', '/enade-time/spd/carga'],
  ['spd-etapas', '/enade-time/spd/etapas/3'],
  ['sobre', '/enade-time/sobre'],
  ['nao-encontrada', '/enade-time/xyz'],
] as const

async function abrir(page: Page, caminho: string) {
  if (SIMULADO)
    await page.route(/\/api\/enade-time\//, (route, req) => {
      const corpo = respostaPorCaminho(new URL(req.url()).pathname)
      return corpo === undefined ? route.fulfill({ status: 404, body: '{"detail":"não simulado"}' }) : route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpo) })
    })
  await page.goto(caminho)
  await expect(page.getByText(/● API conectada/)).toBeAttached({ timeout: 20_000 })
  // carregamentos: o spinner (o tooltip do Recharts e o alerta de amostra também usam role="status")
  await expect(page.locator('main [role="status"]:has(.animate-spin)')).toHaveCount(0, { timeout: 20_000 })
}

test.beforeAll(async ({ request }) => {
  if (SIMULADO) return
  const ok = await request.get(`${API}/api/enade-time/health`, { timeout: 5000 }).then((r) => r.ok()).catch(() => false)
  test.skip(!ok, `backend do ENADE-Time indisponível em ${API}`)
})

test.describe('ENADE-Time', () => {
  for (const [nome, caminho] of TELAS) {
    // sem benchmark carregado no banco real, não há execução para abrir as etapas
    if (!SIMULADO && nome === 'spd-etapas') continue
    test(`${nome}: abre sem erro de console`, async ({ page }) => {
      const erros: string[] = []
      page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
      page.on('pageerror', (e) => erros.push(e.message))
      await abrir(page, caminho)
      // A página não encontrada responde 404 de propósito, e o navegador registra isso no console.
      // Com o backend real, o pool de conexões do ENADE-Time (10) às vezes esgota quando uma tela abre ~10 consultas
      // em paralelo e a API responde 503; o front tenta de novo e a tela carrega. Esse 503 transitório é tolerado,
      // mas a tela não pode terminar com mensagem de erro.
      const ignorar = [nome === 'nao-encontrada' && /status of 404/, !SIMULADO && /status of 503/].filter(Boolean) as RegExp[]
      expect(erros.filter((e) => !ignorar.some((r) => r.test(e)))).toEqual([])
      await expect(page.locator('main [role="alert"]')).toHaveCount(0)
    })

    test(`${nome}: screenshot`, async ({ page }) => {
      test.skip(!SIMULADO, 'com dados reais compara estrutura, não pixels')
      // sem animação: o Recharts respeita prefers-reduced-motion e desenha o gráfico já no estado final
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await abrir(page, caminho)
      await page.evaluate(() => document.fonts.ready)
      // O screenshot de página inteira redimensiona a janela, e o ResponsiveContainer do Recharts redesenha a linha
      // nessa hora. Por isso a janela já fica com a altura da página antes da espera, e a captura não muda nada.
      await page.waitForLoadState('networkidle')
      const largura = page.viewportSize()!.width
      await page.setViewportSize({ width: largura, height: await page.evaluate(() => document.documentElement.scrollHeight) })
      await page.waitForTimeout(2500)
      // o indicador de desenvolvimento do Next não faz parte da tela
      await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((el) => el.remove()))
      await expect(page).toHaveScreenshot(`enade-time-${nome}.png`, { fullPage: true })
    })

    test(`${nome}: axe sem violações sérias, sem rolagem horizontal, peso até 500`, async ({ page }) => {
      await abrir(page, caminho)
      // Exceção conhecida, anterior à migração: tabelas largas rolam sem poder receber foco do teclado (pede
      // tabIndex no componente, que não é só estilo).
      const { violations } = await new AxeBuilder({ page }).disableRules(['scrollable-region-focusable']).analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      const pesos = await page.evaluate(() => [...document.querySelectorAll('main *')].map((el) => Number(getComputedStyle(el).fontWeight)))
      expect(Math.max(...pesos)).toBeLessThanOrEqual(500)
    })
  }
})
