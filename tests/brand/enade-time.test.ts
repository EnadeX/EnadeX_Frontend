// Testes próprios do ENADE-Time (telas 4 a 17) depois da migração visual. A caracterização fica em
// tests/preservacao/enade-time.test.tsx; os arquivos de lógica estão em congelados.json.
import { describe, expect, it } from 'vitest'
import * as chart from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import * as ui from '@/lib/enade-time/ui'
import { nomesDefinidos } from './css'
import { verificarClasses } from './guards'

const token = (cor: string) => cor.match(/^var\((--[\w-]+)\)$/)?.[1]

describe('ENADE-Time · cores e classes', () => {
  const definidos = nomesDefinidos()

  it('CHART_COLORS: mesmas chaves e os valores do plano (Tela 16)', () => {
    expect(CHART_COLORS).toEqual({
      seq: 'var(--ink-muted)',
      paralelo: 'var(--series-2)',
      paralelo2: 'var(--series-3)',
      ideal: 'var(--success)',
      alert: 'var(--danger)',
      warn: 'var(--warning)',
      neutral: 'var(--ink-muted)',
    })
  })

  it.each([...Object.values(CHART_COLORS), chart.GRID_COLOR, chart.EIXO.stroke, chart.EIXO.tick.fill, chart.TOOLTIP_STYLE.borderColor])(
    '%s é var(--token) existente',
    (cor) => expect(definidos.has(token(cor)!)).toBe(true),
  )

  it.each(Object.entries(ui))('ui.%s sem hex, paleta do Tailwind, peso acima de 500 ou caixa-alta', (_, classes) => {
    expect(verificarClasses(classes)).toEqual([])
  })

  it('o âmbar saiu: nenhum hex nas classes nem nas constantes', () => {
    expect(Object.values(ui).join(' ')).not.toMatch(/#[0-9a-f]{3,6}/i)
    expect(Object.values(CHART_COLORS).join(' ')).not.toMatch(/#[0-9a-f]{3,6}/i)
  })
})
