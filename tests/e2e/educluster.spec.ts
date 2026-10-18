import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { respostaPorCaminho } from '../fixtures/educluster'

// Modo simulado (padrão): respostas de tests/fixtures/educluster.ts. Com E2E_BACKEND=real, usa a API em
// NEXT_PUBLIC_EDUCLUSTER_API_URL (padrão http://localhost:8001) e pula se ela estiver fora do ar.
const SIMULADO = (process.env.E2E_BACKEND ?? 'simulado') === 'simulado'
const API = process.env.NEXT_PUBLIC_EDUCLUSTER_API_URL ?? 'http://localhost:8001'

const TELAS = [
  ['visao-geral', '/educluster'],
  ['perfis-de-curso', '/educluster/cursos'],
  ['discrepantes', '/educluster/cursos/discrepantes'],
  ['dimensoes', '/educluster/cursos/dimensoes'],
  ['comparacao', '/educluster/cursos/comparacao'],
  // nos dados simulados o curso 1000 existe; nos reais, o 19 (ou E2E_CURSO)
  ['curso', `/educluster/cursos/${SIMULADO ? 1000 : (process.env.E2E_CURSO ?? 19)}`],
  ['estudantes', '/educluster/estudantes'],
  ['calibracao', '/educluster/estudantes/calibracao'],
  ['discursivas', '/educluster/estudantes/discursivas'],
  ['sobre', '/educluster/sobre'],
] as const

async function abrir(page: Page, caminho: string) {
  if (SIMULADO)
    await page.route(/\/api\/educluster\//, (route, req) => {
      const url = new URL(req.url())
      const corpo = respostaPorCaminho(url.pathname, url.searchParams)
      return corpo === undefined ? route.fulfill({ status: 404, body: '{"detail":"não simulado"}' }) : route.fulfill({ contentType: 'application/json', body: JSON.stringify(corpo) })
    })
  await page.goto(caminho)
  await expect(page.getByText(/● API conectada/)).toBeAttached({ timeout: 20_000 })
  // carregamentos do EduCluster (o tooltip do Recharts também usa role="status")
  await expect(page.locator('main [role="status"]:not(.recharts-default-tooltip)')).toHaveCount(0, { timeout: 20_000 })
}

test.beforeAll(async ({ request }) => {
  if (SIMULADO) return
  const ok = await request.get(`${API}/api/educluster/health`, { timeout: 5000 }).then((r) => r.ok()).catch(() => false)
  test.skip(!ok, `backend do EduCluster indisponível em ${API}`)
})

test.describe('EduCluster', () => {
  for (const [nome, caminho] of TELAS) {
    test(`${nome}: abre sem erro de console`, async ({ page }) => {
      const erros: string[] = []
      page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
      page.on('pageerror', (e) => erros.push(e.message))
      await abrir(page, caminho)
      expect(erros).toEqual([])
    })

    test(`${nome}: screenshot`, async ({ page }) => {
      test.skip(!SIMULADO, 'com dados reais compara estrutura, não pixels')
      await abrir(page, caminho)
      await page.evaluate(() => document.fonts.ready)
      // o indicador de desenvolvimento do Next não faz parte da tela
      await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((el) => el.remove()))
      await expect(page).toHaveScreenshot(`educluster-${nome}.png`, { fullPage: true })
    })

    test(`${nome}: axe sem violações sérias, sem rolagem horizontal, peso até 500`, async ({ page }) => {
      await abrir(page, caminho)
      // Exceções conhecidas, anteriores à migração (corrigir pede mudar lógica do autor):
      // - tabelas largas rolam sem poder receber foco do teclado (pede tabIndex no componente);
      // - células de calor (fundo calculado em lib/educluster/chart.ts) de tom intermediário ficam abaixo de 4,5:1
      //   com as duas tintas que tintaSobre escolhe. O pior caso não piorou: ver tests/brand/educluster.test.ts.
      const { violations } = await new AxeBuilder({ page })
        .disableRules(['scrollable-region-focusable'])
        .exclude('main span[style*="background-color"]')
        .analyze()
      expect(violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      const pesos = await page.evaluate(() => [...document.querySelectorAll('main *')].map((el) => Number(getComputedStyle(el).fontWeight)))
      expect(Math.max(...pesos)).toBeLessThanOrEqual(500)
    })
  }
})
