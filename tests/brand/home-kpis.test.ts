// KPIs da home (lib/home/kpis.ts): um número por subprojeto, cada um carregando e falhando sozinho.
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDatasetResumo } from '@/lib/e-xplainenade/api'
import { fetchAreas } from '@/lib/educluster/api'
import { fetchResumoAnual } from '@/lib/enade-time/api'
import { useKpisHome } from '@/lib/home/kpis'
import { getRelatorioAssociacao, getRelatorioCluster } from '@/lib/multienade/api'
import { areasHome, clustersHome, datasetResumoHome, regrasHome, resumoAnualHome } from '../fixtures/home'

vi.mock('@/lib/multienade/api', () => ({ getRelatorioCluster: vi.fn(), getRelatorioAssociacao: vi.fn() }))
vi.mock('@/lib/e-xplainenade/api', () => ({ getDatasetResumo: vi.fn() }))
vi.mock('@/lib/educluster/api', () => ({ fetchAreas: vi.fn() }))
vi.mock('@/lib/enade-time/api', () => ({ fetchResumoAnual: vi.fn() }))

beforeEach(() => {
  vi.mocked(getRelatorioCluster).mockResolvedValue(clustersHome)
  vi.mocked(getRelatorioAssociacao).mockResolvedValue(regrasHome)
  vi.mocked(getDatasetResumo).mockResolvedValue(datasetResumoHome)
  vi.mocked(fetchAreas).mockResolvedValue(areasHome)
  vi.mocked(fetchResumoAnual).mockResolvedValue([...resumoAnualHome].reverse())
})

async function carregado() {
  const { result } = renderHook(() => useKpisHome())
  await waitFor(() => expect(Object.values(result.current).every((k) => k.status !== 'carregando')).toBe(true))
  return result.current
}

describe('useKpisHome', () => {
  it('começa carregando', () => {
    const { result } = renderHook(() => useKpisHome())
    expect(result.current.multiEnade.status).toBe('carregando')
    expect(result.current.enadeTime.status).toBe('carregando')
  })

  it('MultiENADE: regras de associação, cursos e perfis distintos', async () => {
    expect((await carregado()).multiEnade).toEqual({ status: 'ok', valor: '50', detalhe: '161 cursos em 3 perfis' })
  })

  it('E-XplainENADE: estudantes representados, cursos e nota média em pt-BR', async () => {
    expect((await carregado()).explain).toEqual({ status: 'ok', valor: '18.543', detalhe: '705 cursos · nota média 36,8' })
  })

  it('EduCluster: soma dos cursos de todas as áreas', async () => {
    expect((await carregado()).eduCluster).toEqual({ status: 'ok', valor: '3.832', detalhe: '30 áreas de avaliação' })
  })

  it('ENADE-Time: edições, intervalo e inscrições; a série sai ordenada por ano', async () => {
    const kpis = await carregado()
    expect(kpis.enadeTime).toEqual({ status: 'ok', valor: '06', detalhe: '2005 a 2021 · 24.967 inscrições' })
    expect(kpis.serie.status === 'ok' && kpis.serie.anos.map((a) => a.nu_ano)).toEqual([2005, 2008, 2011, 2014, 2017, 2021])
  })

  it('E-XplainENADE sem estudantes nem média ainda mostra os cursos', async () => {
    vi.mocked(getDatasetResumo).mockResolvedValue({ ...datasetResumoHome, n_estudantes_representados: null, media_nota_geral: null })
    expect((await carregado()).explain).toEqual({ status: 'ok', valor: '—', detalhe: '705 cursos' })
  })

  it('uma API fora do ar não derruba as outras', async () => {
    vi.mocked(getRelatorioAssociacao).mockRejectedValue(new Error('offline'))
    vi.mocked(fetchResumoAnual).mockRejectedValue(new Error('offline'))
    const kpis = await carregado()
    expect(kpis.multiEnade.status).toBe('erro')
    expect(kpis.enadeTime.status).toBe('erro')
    expect(kpis.serie.status).toBe('erro')
    expect(kpis.explain.status).toBe('ok')
    expect(kpis.eduCluster.status).toBe('ok')
  })

  it('série do ENADE-Time vazia vira erro no KPI', async () => {
    vi.mocked(fetchResumoAnual).mockResolvedValue([])
    expect((await carregado()).enadeTime.status).toBe('erro')
  })

  it('desmontar antes da resposta aborta as requisições', () => {
    const { unmount } = renderHook(() => useKpisHome())
    const sinal = vi.mocked(fetchAreas).mock.calls[0][0]!
    unmount()
    expect(sinal.aborted).toBe(true)
  })
})
