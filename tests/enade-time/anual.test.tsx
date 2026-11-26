// Página "Por Ano" do ENADE-Time depois da correção estatística (25/11/2026): sem agregar nem ordenar
// edições (saíram "Média NT GER" e "Melhor ano") e com a estatística descritiva por curso-ano.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import * as fx from '../fixtures/enade-time'

const nav = vi.hoisted(() => ({ search: '' }))

vi.mock('next/navigation', () => ({
  usePathname: () => '/enade-time/enade/anual',
  useSearchParams: () => new URLSearchParams(nav.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
}))

// O gráfico não é o assunto aqui: cada componente do Recharts vira um <div>.
vi.mock('recharts', async (original) => {
  const real = await original<Record<string, unknown>>()
  return Object.fromEntries(
    Object.keys(real).map((nome) => [
      nome,
      /^[A-Z]/.test(nome)
        ? (props: { children?: ReactNode }) => <div data-recharts={nome}>{props.children}</div>
        : real[nome],
    ]),
  )
})

vi.mock('@/lib/enade-time/api', async (original) => {
  const real = await original<typeof import('@/lib/enade-time/api')>()
  return { ...real, fetchResumoAnual: vi.fn(), fetchDescritiva: vi.fn() }
})

import * as api from '@/lib/enade-time/api'
import Anual from '@/app/enade-time/enade/(analises)/anual/page'
import type { DescritivaAnual } from '@/lib/enade-time/types'

const descritiva = fx.descritiva as DescritivaAnual[]
const resumoAnual = fx.resumoAnual as { nu_ano: number }[]

function montar() {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })
  return render(
    <QueryClientProvider client={cliente}>
      <Anual />
    </QueryClientProvider>,
  )
}

async function estabilizar() {
  for (let i = 0; i < 6; i++) await act(async () => {})
  await waitFor(() => expect(document.querySelector('[role="status"]')).toBeNull())
}

/** O cartão (MetricCard) que tem o rótulo dado. */
const cartao = (rotulo: string) => screen.getByText(rotulo).parentElement!.parentElement!

beforeEach(() => {
  nav.search = ''
  vi.mocked(api.fetchResumoAnual).mockResolvedValue(resumoAnual as never)
  vi.mocked(api.fetchDescritiva).mockResolvedValue(descritiva)
})

afterEach(() => cleanup())

describe('Por Ano: indicadores', () => {
  it('não agrega nem ordena edições: sem "Média NT GER", "Melhor ano" nem "Menor média observada"', async () => {
    montar()
    await estabilizar()
    expect(screen.queryByText('Melhor ano')).toBeNull()
    expect(screen.queryByText('Média NT GER')).toBeNull()
    expect(screen.queryByText(/Menor média observada/)).toBeNull()
    expect(screen.queryByText('37,14')).toBeNull() // a média simples das seis médias anuais
  })

  it('mostra registros, cursos (curso-ano) e edições do recorte', async () => {
    montar()
    await estabilizar()
    expect(cartao('Registros (filtro)')).toHaveTextContent('24.967')
    expect(cartao('Cursos (curso-ano)')).toHaveTextContent('582')
    expect(cartao('Edições no recorte')).toHaveTextContent('6')
  })

  it('com várias edições, o cartão de dispersão diz que os valores são por edição e remete à tabela', async () => {
    montar()
    await estabilizar()
    const c = cartao('Desvio-padrão entre cursos (NT GER)')
    expect(c).toHaveTextContent('Por edição')
    expect(c).toHaveTextContent('veja a tabela abaixo')
    expect(c).not.toHaveTextContent(/\d,\d\d/) // nenhum número único: não se agrega entre edições
  })

  it('com uma única edição, mostra o desvio-padrão e a média por curso dessa edição', async () => {
    vi.mocked(api.fetchDescritiva).mockResolvedValue(descritiva.filter((d) => d.nu_ano === 2017))
    vi.mocked(api.fetchResumoAnual).mockResolvedValue(resumoAnual.filter((r) => r.nu_ano === 2017) as never)
    nav.search = 'nu_ano=2017'
    montar()
    await estabilizar()
    const c = cartao('Desvio-padrão entre cursos (NT GER)')
    expect(c).toHaveTextContent('7,46')
    expect(c).toHaveTextContent('Edição 2017')
    expect(c).toHaveTextContent('média por curso 40,97')
    expect(c).toHaveTextContent('n = 72 cursos')
    expect(vi.mocked(api.fetchDescritiva).mock.calls[0][0]).toEqual({ nu_ano: 2017 })
  })

  it('se a rota descritiva falhar (API antiga), os demais indicadores continuam', async () => {
    vi.mocked(api.fetchDescritiva).mockRejectedValue(new api.EnadeTimeApiError(404, 'Not Found'))
    montar()
    await estabilizar()
    expect(cartao('Registros (filtro)')).toHaveTextContent('24.967')
    expect(cartao('Desvio-padrão entre cursos (NT GER)')).toHaveTextContent('Indisponível no momento')
    expect(screen.getByRole('alert')).toHaveTextContent('Not Found') // só a seção da tabela mostra o erro
  })
})

describe('Por Ano: tabela de estatística descritiva por edição', () => {
  const tabela = () => screen.getByRole('table')
  const linhas = () => within(tabela()).getAllByRole('row').slice(1) // sem o cabeçalho
  const celulas = (linha: HTMLElement) => within(linha).getAllByRole('cell').map((c) => c.textContent)

  it('tem título, cabeçalhos de coluna e de linha, e uma linha por edição', async () => {
    montar()
    await estabilizar()
    expect(
      screen.getByRole('heading', { name: 'Estatística descritiva por edição (unidade curso-ano)' }),
    ).toBeInTheDocument()
    const colunas = within(tabela()).getAllByRole('columnheader')
    expect(colunas.map((c) => c.textContent)).toEqual([
      'Ano', 'Cursos', 'Média', 'DP', 'Variância', 'CV (%)', 'Mín', 'Q1', 'Mediana', 'Q3', 'Máx',
    ])
    expect(colunas.every((c) => c.getAttribute('scope') === 'col')).toBe(true)
    const rowheaders = within(tabela()).getAllByRole('rowheader')
    expect(rowheaders.map((c) => c.textContent)).toEqual(['2005', '2008', '2011', '2014', '2017', '2021'])
    expect(rowheaders.every((c) => c.getAttribute('scope') === 'row')).toBe(true)
    expect(tabela().querySelector('caption')).toHaveTextContent(
      'Estatística descritiva por edição (unidade curso-ano): NT GER',
    )
  })

  it('NT GER por padrão, com vírgula decimal, 2 casas e CV com 1 casa', async () => {
    montar()
    await estabilizar()
    expect(celulas(linhas()[0])).toEqual(['110', '33,11', '6,93', '48,08', '20,9', '0,99', '29,09', '33,03', '37,87', '49,25'])
    expect(celulas(linhas()[3])).toEqual(['66', '43,59', '8,84', '78,17', '20,3', '27,88', '37,17', '40,75', '50,48', '62,74'])
  })

  it('o seletor de nota troca os valores da tabela', async () => {
    montar()
    await estabilizar()
    fireEvent.change(screen.getByLabelText('Nota'), { target: { value: 'nt_fg' } })
    expect(celulas(linhas()[0]).slice(0, 5)).toEqual(['110', '54,85', '8,73', '76,15', '15,9'])
    fireEvent.change(screen.getByLabelText('Nota'), { target: { value: 'nt_ce' } })
    expect(celulas(linhas()[0]).slice(0, 5)).toEqual(['110', '25,87', '7,28', '53,06', '28,2'])
    expect(tabela().querySelector('caption')).toHaveTextContent('NT CE')
  })

  it('traz a nota de rodapé e avisa quantos curso-ano ficam sem a nota', async () => {
    montar()
    await estabilizar()
    expect(
      screen.getByText(
        /Medidas calculadas sobre as médias de curso \(uma observação por curso-ano\)\. As edições não são diretamente comparáveis; 2005 e 2008 incluem ingressantes\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/14 curso-ano do recorte não têm a nota/)).toBeInTheDocument()
  })

  it('mostra "—" para medida indefinida (n = 1: sem desvio-padrão)', async () => {
    const um = JSON.parse(JSON.stringify(descritiva.slice(0, 1))) as DescritivaAnual[]
    um[0].nt_ger = {
      n: 1, media: 33.3, desvio_padrao: null, variancia: null, coef_variacao: null,
      minimo: 33.3, q1: 33.3, mediana: 33.3, q3: 33.3, maximo: 33.3,
    }
    vi.mocked(api.fetchDescritiva).mockResolvedValue(um)
    montar()
    await estabilizar()
    expect(celulas(linhas()[0]).slice(0, 5)).toEqual(['1', '33,30', '—', '—', '—'])
  })

  it('é uma região com rolagem horizontal focável pelo teclado e passa no axe', async () => {
    const { container } = montar()
    await estabilizar()
    const regiao = screen.getByRole('region', { name: /Estatística descritiva por edição/ })
    expect(regiao).toHaveAttribute('tabindex', '0')
    expect(regiao.className).toContain('overflow-x-auto')
    expect(await axe(container)).toHaveNoViolations()
  })
})
