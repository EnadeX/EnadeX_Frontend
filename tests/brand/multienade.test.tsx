// Testes próprios da Tela 2 (MultiENADE) depois da migração. A caracterização fica em
// tests/preservacao/multienade.test.tsx.
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { CLUSTER_PALETTE, CORES_CATEGORIA } from '@/lib/multienade/constants'
import { nomesDefinidos } from './css'

vi.mock('@/lib/multienade/api', async (original) => ({
  ...(await original<typeof import('@/lib/multienade/api')>()),
  getRelatorioRegressao: vi.fn().mockResolvedValue([]),
  getRelatorioCluster: vi.fn().mockResolvedValue([]),
  getRelatorioAssociacao: vi.fn().mockResolvedValue([]),
  getRelatorioShap: vi.fn().mockResolvedValue([]),
}))

describe('Tela 2 · MultiENADE', () => {
  it('CLUSTER_PALETTE: 6 cores, cada uma var(--cluster-n) na ordem', () => {
    expect(CLUSTER_PALETTE).toHaveLength(6)
    expect(CLUSTER_PALETTE).toEqual([1, 2, 3, 4, 5, 6].map((n) => `var(--cluster-${n})`))
    for (let id = 0; id < 20; id++) expect(CLUSTER_PALETTE[id % CLUSTER_PALETTE.length]).toBe(`var(--cluster-${(id % 6) + 1})`)
  })

  it('CORES_CATEGORIA: series-1 e series-4', () => {
    expect(CORES_CATEGORIA).toEqual({
      professores: { 'Concordância alta': 'var(--series-1)', 'Concordância baixa/média': 'var(--series-4)' },
      cotas: { 'Menos cotistas': 'var(--series-1)', 'Mais cotistas (renda/múlt. critérios)': 'var(--series-4)' },
    })
  })

  it('todas as cores apontam para tokens existentes', () => {
    const definidos = nomesDefinidos()
    for (const cor of [...CLUSTER_PALETTE, ...Object.values(CORES_CATEGORIA).flatMap(Object.values)])
      expect(definidos.has(cor.slice(4, -1)), cor).toBe(true)
  })

  it('cabeçalho: BarraModulo com a logo negativa do kit e o nome do subprojeto', async () => {
    const { default: Pagina } = await import('@/app/multienade/page')
    const { container } = render(<Pagina />)
    await screen.findByText(/● Conectado/)
    const header = container.querySelector('header')!
    expect(header).toHaveClass('enx-on-dark')
    expect(header.querySelectorAll('[data-brand-logo]')).toHaveLength(1)
    expect(header.querySelector('img')!.getAttribute('src')).toBe('/img/enadex-horizontal-negativo.svg')
    expect(header.textContent).toContain('MultiENADE')
    expect(container.textContent).toContain('Descoberta de padrões')
  })

  it('vitest-axe sem violações', async () => {
    const { default: Pagina } = await import('@/app/multienade/page')
    const { container } = render(<Pagina />)
    await screen.findByText(/● Conectado/)
    await act(async () => {})
    expect(await axe(container)).toHaveNoViolations()
  })
})
