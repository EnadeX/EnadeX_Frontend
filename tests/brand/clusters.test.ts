import { describe, expect, it } from 'vitest'
import { clusters, coresDoTema, contraste, dados, DELTA_E_MIN_CLUSTERS, type Tema } from '@/lib/brand/tokens'
import { deltaE2000, labDe, SIMULACOES } from './cor'
import { CSS } from './css'

const TEMAS: Tema[] = ['claro', 'escuro']
const N = [1, 2, 3, 4, 5, 6] as const

describe('0.2 cluster-1..6', () => {
  it('são as séries categóricas do manual, na mesma ordem', () => {
    for (const t of TEMAS)
      for (const n of N) expect(clusters[t][`cluster-${n}`]).toBe(dados[t][`series-${n}`])
    for (const n of N) expect(CSS).toContain(`--cluster-${n}: var(--series-${n});`)
  })

  it.each(TEMAS)('6 cores distintas no tema %s', (t) => {
    expect(new Set(Object.values(clusters[t])).size).toBe(6)
  })

  it.each(TEMAS)('pelo menos 3:1 sobre surface-card no tema %s', (t) => {
    const card = coresDoTema(t)['surface-card']
    for (const [nome, cor] of Object.entries(clusters[t])) expect(contraste(cor, card), nome).toBeGreaterThanOrEqual(3)
  })

  const casos = TEMAS.flatMap((t) => [['visão normal', undefined] as const, ...Object.entries(SIMULACOES)].map(([nome, m]) => [t, nome, m] as const))

  it.each(casos)(`tema %s, %s: ΔE2000 ≥ ${DELTA_E_MIN_CLUSTERS} entre quaisquer duas`, (t, _, matriz) => {
    const cores = Object.entries(clusters[t])
    for (let i = 0; i < cores.length; i++)
      for (let j = i + 1; j < cores.length; j++) {
        const de = deltaE2000(labDe(cores[i][1], matriz), labDe(cores[j][1], matriz))
        expect(de, `${cores[i][0]} × ${cores[j][0]}`).toBeGreaterThanOrEqual(DELTA_E_MIN_CLUSTERS)
      }
  })

  it('ΔE2000 confere com os valores de referência (Sharma et al., par 1)', () => {
    expect(deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 3)
  })
})
