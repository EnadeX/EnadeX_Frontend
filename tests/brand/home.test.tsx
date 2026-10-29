// Testes próprios da Tela 1 (home) depois da migração. A caracterização fica em tests/preservacao/home.test.tsx.
import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import Home from '@/app/page'
import { type EstadoKpi, useKpisHome } from '@/lib/home/kpis'
import { resumoAnualHome } from '../fixtures/home'

vi.mock('@/lib/home/kpis', () => ({ useKpisHome: vi.fn() }))

const ok = (valor: string, detalhe: string): EstadoKpi => ({ status: 'ok', valor, detalhe })
const carregados = {
  multiEnade: ok('50', '161 cursos em 3 perfis'),
  explain: ok('18.543', '705 cursos · nota média 36,8'),
  eduCluster: ok('3.832', '30 áreas de avaliação'),
  enadeTime: ok('06', '2005 a 2021 · 24.967 inscrições'),
  serie: { status: 'ok', anos: resumoAnualHome },
} as const

beforeEach(() => {
  vi.mocked(useKpisHome).mockReturnValue(carregados)
})

const cardsKpi = (container: HTMLElement) => [...container.querySelectorAll('section')[1].children] as HTMLElement[]

describe('Tela 1 · home', () => {
  it('os quatro cards usam a mesma classe de destaque', () => {
    render(<Home />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(4)
    const classesDoCard = new Set(cards.map((c) => c.className))
    const classesDoLink = new Set(cards.map((c) => c.querySelector('a')!.className))
    const classesDoIcone = new Set(cards.map((c) => c.querySelector('svg')!.getAttribute('class')!.replace(/\blucide-[\w-]+/g, '').trim()))
    expect(classesDoCard.size).toBe(1)
    expect(classesDoLink.size).toBe(1)
    expect(classesDoIcone.size).toBe(1)
    expect([...classesDoLink][0]).toContain('text-accent')
  })

  it('sem violet, amber ou teal nas classes', () => {
    const fonte = readFileSync('app/page.tsx', 'utf8')
    expect(fonte).not.toMatch(/\b(?:bg|text|border)-(?:violet|amber|teal|blue)-\d+/)
  })

  it('a logo do kit no cabeçalho e a negativa no rodapé', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('header img')!.getAttribute('src')).toBe('/img/enadex-horizontal.svg')
    expect(container.querySelector('footer img')!.getAttribute('src')).toBe('/img/enadex-horizontal-negativo.svg')
    expect(container.querySelectorAll('[data-brand-logo]')).toHaveLength(2)
  })

  it('o círculo decorativo do cartão de status saiu e as barras usam seq-1..5', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('.rounded-full.bg-blue-50')).toBeNull()
    const barras = [...container.querySelectorAll('[class*="bg-seq-"]')]
    expect(barras).toHaveLength(resumoAnualHome.length)
    expect(new Set(barras.map((b) => b.className.match(/bg-seq-\d/)![0]))).toEqual(new Set(['bg-seq-1', 'bg-seq-2', 'bg-seq-3', 'bg-seq-4', 'bg-seq-5']))
  })

  it('barras do status: uma por edição do ENADE-Time, altura proporcional às inscrições', () => {
    const { container } = render(<Home />)
    const barras = [...container.querySelectorAll<HTMLElement>('[class*="bg-seq-"]')]
    expect(barras.map((b) => b.title)).toEqual(resumoAnualHome.map((a) => `${a.nu_ano}: ${a.total_registros.toLocaleString('pt-BR')} inscrições`))
    expect(barras[1].style.height).toBe('100%') // 2008 é a edição com mais inscrições
    expect(barras.every((b) => parseFloat(b.style.height) >= 8)).toBe(true)
  })

  it('um KPI por subprojeto, com valor, detalhe e nome do projeto', () => {
    const { container } = render(<Home />)
    expect(cardsKpi(container).map((c) => [...c.querySelectorAll('p')].map((p) => p.textContent))).toEqual([
      ['Regras de associação', '50', '161 cursos em 3 perfis', 'MultiENADE'],
      ['Estudantes representados', '18.543', '705 cursos · nota média 36,8', 'E-XplainENADE'],
      ['Cursos agrupados', '3.832', '30 áreas de avaliação', 'EduCluster'],
      ['Edições harmonizadas', '06', '2005 a 2021 · 24.967 inscrições', 'ENADE-Time'],
    ])
  })

  it('carregando: skeleton nos KPIs e na série', () => {
    vi.mocked(useKpisHome).mockReturnValue({
      multiEnade: { status: 'carregando' },
      explain: { status: 'carregando' },
      eduCluster: { status: 'carregando' },
      enadeTime: { status: 'carregando' },
      serie: { status: 'carregando' },
    })
    const { container } = render(<Home />)
    expect(cardsKpi(container).every((c) => c.getAttribute('aria-busy') === 'true')).toBe(true)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5)
    expect(screen.getByText('Carregando série histórica…')).toBeInTheDocument()
  })

  it('erro em um módulo só afeta o card dele', () => {
    vi.mocked(useKpisHome).mockReturnValue({ ...carregados, multiEnade: { status: 'erro' }, enadeTime: { status: 'erro' }, serie: { status: 'erro' } })
    const { container } = render(<Home />)
    const [multi, explain, , enadeTime] = cardsKpi(container)
    expect(multi).toHaveTextContent('—Dados indisponíveis')
    expect(enadeTime).toHaveTextContent('—Dados indisponíveis')
    expect(explain).toHaveTextContent('18.543')
    expect(screen.getByText('Série histórica indisponível')).toBeInTheDocument()
  })

  it('sem seletor de edição e sem link para os repositórios de código; "Repositório" leva à tela de repositórios', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('select')).toBeNull()
    const github = [...container.querySelectorAll('a[href*="github.com"]')].map((a) => a.getAttribute('href')!)
    expect(github.every((href) => href.startsWith('https://github.com/EnadeX/EnadeX_Documentacao'))).toBe(true)
    expect(screen.getByRole('link', { name: /Repositório/ })).toHaveAttribute('href', '/repositorios')
  })

  it('metodologia: as oito fases da DSR, em ordem', () => {
    const { container } = render(<Home />)
    const fases = [...container.querySelectorAll('#methodology ol')[0].querySelectorAll('li')].map((li) => li.textContent)
    expect(fases).toEqual([
      'Fase 01Identificação do problema',
      'Fase 02Definição dos objetivos da solução',
      'Fase 03Revisão sistemática ou mapeamento',
      'Fase 04Definição do artefato',
      'Fase 05Construção do artefato',
      'Fase 06Avaliação',
      'Fase 07Contribuição científica',
      'Fase 08Generalização e limitações',
    ])
  })

  it('metodologia: protocolo compartilhado e os sete blocos da infraestrutura', () => {
    const { container } = render(<Home />)
    const metodologia = container.querySelector<HTMLElement>('#methodology')!
    expect(metodologia).toHaveTextContent('Mesma lógica de avaliação: tradicional vs artefato.')
    expect(metodologia.querySelectorAll('ol')[1].querySelectorAll('li')).toHaveLength(7)
  })

  it('documentação: a navegação aponta para a seção, que fica fora do rodapé', () => {
    const { container } = render(<Home />)
    expect(screen.getByRole('link', { name: 'Documentação' })).toHaveAttribute('href', '#documentation')
    expect(container.querySelector('#documentation')!.tagName).toBe('SECTION')
    expect(container.querySelector('footer')!.id).toBe('')
  })

  it('documentação: repositório completo e uma pasta por subprojeto, em nova aba', () => {
    const { container } = render(<Home />)
    const links = [...container.querySelectorAll('#documentation a')]
    const base = 'https://github.com/EnadeX/EnadeX_Documentacao'
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      base,
      ...['00_EnadeX_Geral', '01_MultiENADE', '02_E-XplainENADE', '03_EduCluster', '04_ENADE-Time'].map((pasta) => `${base}/tree/main/${pasta}`),
    ])
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noreferrer')
    }
  })

  it('vitest-axe sem violações', async () => {
    const { container } = render(<Home />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('vitest-axe sem violações enquanto carrega', async () => {
    vi.mocked(useKpisHome).mockReturnValue({
      multiEnade: { status: 'carregando' },
      explain: { status: 'carregando' },
      eduCluster: { status: 'carregando' },
      enadeTime: { status: 'carregando' },
      serie: { status: 'carregando' },
    })
    const { container } = render(<Home />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
