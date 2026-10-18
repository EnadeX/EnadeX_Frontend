import { describe, expect, it } from 'vitest'
import {
  coresDoTema,
  contraste,
  dados,
  interfaceTemas,
  luminancia,
  marca,
  PARES_GRAFICOS,
  PARES_PROIBIDOS,
  PARES_TEXTO,
  type Tema,
} from '@/lib/brand/tokens'

const TEMAS: Tema[] = ['claro', 'escuro']

describe('0.2 tokens: valores do manual (p. 9 e 10)', () => {
  it('marca, interface e dados', () => {
    expect({ marca, interfaceTemas, dados }).toMatchSnapshot()
  })

  it('15 tokens de interface em cada tema', () => {
    for (const t of TEMAS) expect(Object.keys(interfaceTemas[t])).toHaveLength(15)
    expect(Object.keys(interfaceTemas.escuro)).toEqual(Object.keys(interfaceTemas.claro))
  })
})

describe('0.2 tokens: contraste (WCAG 2.1)', () => {
  it.each(TEMAS)('texto acima de 4,5:1 no tema %s', (tema) => {
    const c = coresDoTema(tema)
    for (const [texto, fundo] of PARES_TEXTO) expect(contraste(c[texto], c[fundo]), `${texto} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5)
  })

  it.each(TEMAS)('borda de controle e anel de foco acima de 3:1 no tema %s', (tema) => {
    const c = coresDoTema(tema)
    for (const [a, b] of PARES_GRAFICOS) expect(contraste(c[a], c[b]), `${a} sobre ${b}`).toBeGreaterThanOrEqual(3)
  })

  it('success e warning sobre surface-sunken continuam abaixo de 4,5:1 no claro (pares proibidos)', () => {
    const c = coresDoTema('claro')
    for (const [a, b] of PARES_PROIBIDOS) expect(contraste(c[a], c[b])).toBeLessThan(4.5)
  })

  it('series-1 é a mais escura no claro e a mais clara no escuro', () => {
    const series = (t: Tema) => [1, 2, 3, 4, 5, 6].map((n) => luminancia(dados[t][`series-${n}` as 'series-1']))
    expect(Math.min(...series('claro'))).toBe(series('claro')[0])
    expect(Math.max(...series('escuro'))).toBe(series('escuro')[0])
  })

  it.each(TEMAS)('séries e contribuição com pelo menos 3:1 sobre surface-card no tema %s', (tema) => {
    const c = coresDoTema(tema)
    for (const t of ['series-1', 'series-2', 'series-3', 'series-4', 'series-5', 'series-6', 'contrib-positive', 'contrib-negative'] as const)
      expect(contraste(c[t], c['surface-card']), t).toBeGreaterThanOrEqual(3)
  })
})
