import { describe, expect, it } from 'vitest'
import { coresDoTema, marca } from '@/lib/brand/tokens'
import { CSS, tokensClaro, tokensEscuroForcado, tokensEscuroSistema } from './css'

describe('0.2 globals.css sincronizado com tokens.ts', () => {
  it('tema claro em :root', () => {
    const css = tokensClaro()
    for (const [nome, valor] of Object.entries({ ...marca, ...coresDoTema('claro') })) expect(css[nome], nome).toBe(valor)
  })

  it('tema escuro igual na preferência do sistema e no data-theme="dark"', () => {
    const sistema = tokensEscuroSistema()
    const forcado = tokensEscuroForcado()
    expect(sistema).toEqual(forcado)
    for (const [nome, valor] of Object.entries(coresDoTema('escuro'))) expect(forcado[nome], nome).toBe(valor)
  })

  it('variáveis do shadcn apontam para os tokens', () => {
    for (const par of [
      '--background: var(--surface-page)',
      '--primary: var(--accent)',
      '--ring: var(--focus-ring)',
      '--destructive: var(--danger)',
      '--chart-1: var(--series-1)',
      '--chart-4: var(--series-4)',
    ])
      expect(CSS).toContain(par)
  })

  it('variante dark segue data-theme e o sistema', () => {
    expect(CSS).not.toContain('@custom-variant dark (&:is(.dark *))')
    expect(CSS).toMatch(/@custom-variant dark \{[\s\S]*\[data-theme='dark'\][\s\S]*prefers-color-scheme: dark/)
  })
})

describe('0.4 tipografia: escala do manual (p. 11)', () => {
  const escala = {
    display: [32, 40, 500],
    h1: [24, 32, 500],
    h2: [18, 26, 500],
    h3: [15, 22, 500],
    body: [14, 22, undefined],
    caption: [12, 16, undefined],
    kpi: [28, 36, 500],
    'table-num': [13, 20, undefined],
  } as const

  it.each(Object.entries(escala))('text-%s', (nome, [tamanho, entrelinha, peso]) => {
    expect(CSS).toContain(`--text-${nome}: ${tamanho}px;`)
    expect(CSS).toContain(`--text-${nome}--line-height: ${entrelinha}px;`)
    if (peso) expect(CSS).toContain(`--text-${nome}--font-weight: ${peso};`)
  })

  it('nenhum peso acima de 500 na escala', () => {
    for (const [, peso] of CSS.matchAll(/--text-[\w-]+--font-weight: (\d+)/g)) expect(Number(peso)).toBeLessThanOrEqual(500)
  })

  it('.num usa a fonte de dados com tabular-nums', () => {
    expect(CSS).toMatch(/@utility num \{\s*font-family: var\(--font-data\);\s*font-variant-numeric: tabular-nums;/)
  })
})

describe('0.9 movimento', () => {
  it('prefers-reduced-motion zera animação e transição', () => {
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*animation: none !important;[\s\S]*transition: none !important;/)
  })
})
