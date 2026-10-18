import { describe, expect, it } from 'vitest'
import { CORES_GRAFICO, EIXO_MARCA, TOOLTIP_MARCA } from '@/lib/brand/chart'
import { nomesDefinidos } from './css'

describe('0.7 cores de gráfico', () => {
  const definidos = nomesDefinidos()
  const todas = [
    ...Object.values(CORES_GRAFICO),
    EIXO_MARCA.stroke,
    EIXO_MARCA.tick.fill,
    TOOLTIP_MARCA.borderColor,
    TOOLTIP_MARCA.backgroundColor,
    TOOLTIP_MARCA.color,
  ]

  it.each(todas)('%s é var(--token) existente em globals.css', (cor) => {
    const m = cor.match(/^var\((--[\w-]+)\)$/)
    expect(m).not.toBeNull()
    expect(definidos.has(m![1])).toBe(true)
  })

  it('eixo e tooltip em 11px na fonte de dados', () => {
    expect(EIXO_MARCA.tick.fontSize).toBe(11)
    expect(EIXO_MARCA.tick.fontFamily).toBe('var(--font-data)')
    expect(TOOLTIP_MARCA.fontSize).toBe(11)
    expect(TOOLTIP_MARCA.fontFamily).toBe('var(--font-data)')
  })
})
