import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('0.4 fonte', () => {
  it('a Poppins carregada declara só os pesos 400 e 500', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8')
    const pesos = [...layout.matchAll(/weight: '(\d+)'/g)].map((m) => m[1])
    expect(pesos.sort()).toEqual(['400', '500'])
    expect(layout).toContain("variable: '--font-poppins'")
  })
})
