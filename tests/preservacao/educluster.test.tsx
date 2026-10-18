// Caracterização do EduCluster (`/educluster/*`), escrita sobre o código anterior à migração visual.
// Este teste NUNCA é atualizado para acompanhar a migração: se ele precisar mudar, a migração mexeu em texto,
// campo, link, dados de gráfico, chamadas à API ou lógica.
//
// O cabeçalho é conferido item a item (a logo é a única parte que o plano permite trocar). Os gráficos do Recharts
// são substituídos por um mock fino que registra as props, sem as de cor e fonte, que podem mudar.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as fx from '../fixtures/educluster'

// ---------- navegação ----------
const nav = vi.hoisted(() => ({
  pathname: '/educluster',
  search: '',
  params: {} as Record<string, string>,
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
  useParams: () => nav.params,
  useRouter: () => ({ push: nav.push, replace: nav.replace, back: nav.back, prefetch: vi.fn(), refresh: vi.fn() }),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

vi.mock('next/link', () => ({
  default: ({ href, children, prefetch: _p, ...props }: { href: string; children: ReactNode; prefetch?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// ---------- Recharts: cada componente vira um <div> com as props (sem cor e fonte) em JSON ----------
// O retrato lê esses <div> do DOM no fim, então só conta o estado final, não quantas vezes o React renderizou.

const CHAVES_VISUAIS = new Set(['fill', 'stroke', 'color', 'fontFamily', 'contentStyle', 'wrapperStyle', 'style', 'backgroundColor', 'borderColor', 'fillOpacity', 'strokeWidth', 'radius', 'barSize', 'iconType', 'fontSize'])

function semVisual(valor: unknown): unknown {
  if (typeof valor === 'function') return '[função]'
  if (Array.isArray(valor)) return valor.map(semVisual)
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>)
        .filter(([k]) => !CHAVES_VISUAIS.has(k) && k !== 'children')
        .map(([k, v]) => [k, semVisual(v)]),
    )
  }
  return valor
}

vi.mock('recharts', async (original) => {
  const real = await original<Record<string, unknown>>()
  const falsos: Record<string, unknown> = {}
  for (const nome of Object.keys(real)) {
    if (!/^[A-Z]/.test(nome)) {
      falsos[nome] = real[nome]
      continue
    }
    falsos[nome] = (props: Record<string, unknown>) => (
      <div data-recharts={nome} data-props={JSON.stringify(semVisual(props))}>
        {props.children as ReactNode}
      </div>
    )
  }
  return falsos
})

// ---------- API ----------
vi.mock('@/lib/educluster/api', async (original) => {
  const real = await original<typeof import('@/lib/educluster/api')>()
  const fx = await import('../fixtures/educluster')
  return {
    ...real,
    fetchHealth: vi.fn(async () => fx.health),
    fetchCursos: vi.fn(async () => fx.cursos),
    fetchClustersCursos: vi.fn(async () => fx.clustersCursos),
    fetchEstabilidadePorK: vi.fn(async () => fx.estabilidadePorK),
    fetchEstabilidadeK: vi.fn(async (k: number) => fx.estabilidadeK(k)),
    fetchDescricaoCursos: vi.fn(async () => fx.descricao),
    fetchDescricaoEstudantes: vi.fn(async () => fx.descricao),
    fetchDiscrepantes: vi.fn(async () => fx.discrepantes),
    fetchDimensoesDesempenho: vi.fn(async (alvo: 'NT_FG' | 'NT_CE') => fx.dimensoesDesempenho(alvo)),
    fetchComparacaoTradicional: vi.fn(async (t: number) => fx.comparacao(t)),
    fetchCurso: vi.fn(async (co: number) => fx.curso(co)),
    fetchClustersEstudantes: vi.fn(async () => fx.clustersEstudantes),
    fetchAmostraEstudantes: vi.fn(async (n: number) => fx.amostraEstudantes(n)),
    fetchCalibracao: vi.fn(async () => fx.calibracao),
    fetchDiscursivas: vi.fn(async () => fx.discursivas),
    fetchAreas: vi.fn(async () => fx.areas),
    fetchDimensoes: vi.fn(async () => fx.dimensoes),
  }
})

import * as api from '@/lib/educluster/api'
import { ModuleShell } from '@/app/educluster/_components/layout/ModuleShell'
import CursosLayout from '@/app/educluster/cursos/(analises)/layout'
import EstudantesLayout from '@/app/educluster/estudantes/layout'
import VisaoGeral from '@/app/educluster/page'
import PerfisDeCurso from '@/app/educluster/cursos/(analises)/page'
import Discrepantes from '@/app/educluster/cursos/(analises)/discrepantes/page'
import Dimensoes from '@/app/educluster/cursos/(analises)/dimensoes/page'
import Comparacao from '@/app/educluster/cursos/(analises)/comparacao/page'
import DetalheCurso from '@/app/educluster/cursos/[coCurso]/page'
import DesempenhoEstudante from '@/app/educluster/estudantes/page'
import Calibracao from '@/app/educluster/estudantes/calibracao/page'
import Discursivas from '@/app/educluster/estudantes/discursivas/page'
import Sobre from '@/app/educluster/sobre/page'
import NotFound from '@/app/educluster/not-found'

const FUNCOES = [
  'fetchHealth', 'fetchCursos', 'fetchClustersCursos', 'fetchEstabilidadePorK', 'fetchEstabilidadeK',
  'fetchDescricaoCursos', 'fetchDescricaoEstudantes', 'fetchDiscrepantes', 'fetchDimensoesDesempenho',
  'fetchComparacaoTradicional', 'fetchCurso', 'fetchClustersEstudantes', 'fetchAmostraEstudantes',
  'fetchCalibracao', 'fetchDiscursivas', 'fetchAreas', 'fetchDimensoes',
] as const

/** Chamadas à API sem o AbortSignal, ordenadas por função. */
function chamadas() {
  return Object.fromEntries(
    FUNCOES.map((nome) => [
      nome,
      vi.mocked(api[nome] as (...a: unknown[]) => unknown).mock.calls.map((args) => args.filter((a) => !(a instanceof AbortSignal))),
    ]).filter(([, lista]) => (lista as unknown[]).length > 0),
  )
}

const normalizar = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim()

function textoForaDoCabecalho(container: HTMLElement) {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelector('header')?.remove()
  return normalizar(clone.textContent)
}

function campos(container: HTMLElement) {
  return [...container.querySelectorAll('select, input, button, textarea')].map((el) => {
    const rotulo = normalizar(el.closest('label')?.querySelector('span')?.textContent ?? el.getAttribute('aria-label') ?? el.textContent)
    if (el instanceof HTMLSelectElement)
      return { tipo: 'select', rotulo, valor: el.value, opcoes: [...el.options].map((o) => [o.value, normalizar(o.textContent)]), disabled: el.disabled }
    if (el instanceof HTMLInputElement)
      return { tipo: 'input', rotulo, valor: el.value, placeholder: el.placeholder, inputMode: el.inputMode, pattern: el.pattern, disabled: el.disabled }
    return { tipo: el.tagName.toLowerCase(), rotulo, type: el.getAttribute('type'), disabled: (el as HTMLButtonElement).disabled, pressed: el.getAttribute('aria-pressed') }
  })
}

const hrefs = (c: HTMLElement) => [...c.querySelectorAll('a')].map((a) => a.getAttribute('href'))

function cabecalho(container: HTMLElement) {
  const header = container.querySelector('header')!
  return {
    linkHome: header.querySelector('a[href="/"]') !== null,
    navs: [...header.querySelectorAll('nav')].map((n) => ({
      label: n.getAttribute('aria-label'),
      itens: [...n.querySelectorAll('a')].map((a) => [normalizar(a.textContent), a.getAttribute('href'), a.getAttribute('aria-current')]),
    })),
    status: normalizar(header.querySelector('[aria-live]')?.textContent),
    nome: normalizar(header.textContent).includes('EduCluster'),
  }
}

function montar(pagina: ReactNode, { pathname, search = '', params = {}, secao }: { pathname: string; search?: string; params?: Record<string, string>; secao?: 'cursos' | 'estudantes' }) {
  nav.pathname = pathname
  nav.search = search
  nav.params = params
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })
  const conteudo = secao === 'cursos' ? <CursosLayout>{pagina}</CursosLayout> : secao === 'estudantes' ? <EstudantesLayout>{pagina}</EstudantesLayout> : pagina
  return render(
    <QueryClientProvider client={cliente}>
      <ModuleShell>{conteudo}</ModuleShell>
    </QueryClientProvider>,
  )
}

async function estabilizar() {
  for (let i = 0; i < 5; i++) await act(async () => {})
  await waitFor(() => expect(document.querySelector('[role="status"]')).toBeNull())
}

function retrato(container: HTMLElement) {
  return {
    texto: textoForaDoCabecalho(container),
    cabecalho: cabecalho(container),
    campos: campos(container),
    hrefs: hrefs(container),
    graficos: [...container.querySelectorAll('[data-recharts]')].map((el) => ({
      componente: el.getAttribute('data-recharts'),
      props: JSON.parse(el.getAttribute('data-props')!),
    })),
    api: chamadas(),
  }
}

const TELAS: { nome: string; pagina: () => ReactNode; pathname: string; search?: string; params?: Record<string, string>; secao?: 'cursos' | 'estudantes' }[] = [
  { nome: 'visão geral', pagina: () => <VisaoGeral />, pathname: '/educluster' },
  { nome: 'perfis de curso', pagina: () => <PerfisDeCurso />, pathname: '/educluster/cursos', secao: 'cursos' },
  { nome: 'perfis de curso com k=5 e área', pagina: () => <PerfisDeCurso />, pathname: '/educluster/cursos', search: 'k=5&area=A14', secao: 'cursos' },
  { nome: 'discrepantes', pagina: () => <Discrepantes />, pathname: '/educluster/cursos/discrepantes', secao: 'cursos' },
  { nome: 'discrepantes filtrado', pagina: () => <Discrepantes />, pathname: '/educluster/cursos/discrepantes', search: 'limiar=1.5&quadrante=entrega_sem_reconhecimento&area=A07', secao: 'cursos' },
  { nome: 'dimensões', pagina: () => <Dimensoes />, pathname: '/educluster/cursos/dimensoes', secao: 'cursos' },
  { nome: 'dimensões NT_FG', pagina: () => <Dimensoes />, pathname: '/educluster/cursos/dimensoes', search: 'alvo=NT_FG', secao: 'cursos' },
  { nome: 'comparação', pagina: () => <Comparacao />, pathname: '/educluster/cursos/comparacao', secao: 'cursos' },
  { nome: 'detalhe de curso', pagina: () => <DetalheCurso />, pathname: '/educluster/cursos/1000', params: { coCurso: '1000' } },
  { nome: 'detalhe com código inválido', pagina: () => <DetalheCurso />, pathname: '/educluster/cursos/abc', params: { coCurso: 'abc' } },
  { nome: 'estudantes', pagina: () => <DesempenhoEstudante />, pathname: '/educluster/estudantes', secao: 'estudantes' },
  { nome: 'calibração', pagina: () => <Calibracao />, pathname: '/educluster/estudantes/calibracao', secao: 'estudantes' },
  { nome: 'discursivas', pagina: () => <Discursivas />, pathname: '/educluster/estudantes/discursivas', secao: 'estudantes' },
  { nome: 'sobre', pagina: () => <Sobre />, pathname: '/educluster/sobre' },
  { nome: 'não encontrada', pagina: () => <NotFound />, pathname: '/educluster/xyz' },
]

beforeEach(() => {
  nav.push.mockClear()
  nav.replace.mockClear()
  nav.back.mockClear()
  for (const nome of FUNCOES) vi.mocked(api[nome] as () => unknown).mockClear()
})

afterEach(() => cleanup())

describe('EduCluster: caracterização', () => {
  it.each(TELAS)('$nome: texto, cabeçalho, campos, links, gráficos e API', async ({ pagina, ...opcoes }) => {
    const { container } = montar(pagina(), opcoes)
    await estabilizar()
    expect(retrato(container)).toMatchSnapshot()
  })

  it.each(TELAS.filter((t) => !t.search))('$nome: cada select escolhendo a última opção grava a URL', async ({ pagina, ...opcoes }) => {
    const { container } = montar(pagina(), opcoes)
    await estabilizar()
    const resultado: unknown[] = []
    for (const select of [...container.querySelectorAll('select')]) {
      nav.replace.mockClear()
      const ultima = select.options[select.options.length - 1].value
      fireEvent.change(select, { target: { value: ultima } })
      resultado.push([ultima, nav.replace.mock.calls])
    }
    expect(resultado).toMatchSnapshot()
  })

  it('perfis de curso: busca por código abre o curso', async () => {
    montar(<PerfisDeCurso />, { pathname: '/educluster/cursos', secao: 'cursos' })
    await estabilizar()
    const campo = screen.getByPlaceholderText('Ex.: 19')
    fireEvent.change(campo, { target: { value: '12a3' } })
    expect((campo as HTMLInputElement).value).toBe('123')
    fireEvent.submit(campo.closest('form')!)
    expect(nav.push).toHaveBeenCalledWith('/educluster/cursos/123')
  })

  it('perfis de curso: "Gerar descrição" pede a descrição e mostra o texto', async () => {
    const { container } = montar(<PerfisDeCurso />, { pathname: '/educluster/cursos', secao: 'cursos' })
    await estabilizar()
    expect(api.fetchDescricaoCursos).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /Gerar descrição/ }))
    await screen.findByText(/servido do cache/)
    expect(vi.mocked(api.fetchDescricaoCursos).mock.calls.map((c) => c.slice(0, 2))).toEqual([[undefined, false]])
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
  })

  it('discrepantes: clicar num quadrante filtra pela URL; paginação da tabela', async () => {
    montar(<Discrepantes />, { pathname: '/educluster/cursos/discrepantes', secao: 'cursos' })
    await estabilizar()
    const botoes = screen.getAllByRole('button', { pressed: false })
    fireEvent.click(botoes[0])
    expect(nav.replace.mock.calls).toMatchSnapshot()
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Próxima/ })).toBeDisabled()
  })

  it('detalhe de curso: 404 vira "Curso fora da base analítica"', async () => {
    vi.mocked(api.fetchCurso).mockRejectedValueOnce(new api.EduClusterApiError(404, 'não encontrado'))
    const { container } = montar(<DetalheCurso />, { pathname: '/educluster/cursos/999', params: { coCurso: '999' } })
    await estabilizar()
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
  })

  it('detalhe de curso: "Voltar" chama router.back', async () => {
    montar(<DetalheCurso />, { pathname: '/educluster/cursos/1000', params: { coCurso: '1000' } })
    await estabilizar()
    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }))
    expect(nav.back).toHaveBeenCalledTimes(1)
  })

  it('API offline: status, erro e "Tentar novamente"', async () => {
    const offline = new api.EduClusterApiError(0, 'API do EduCluster indisponível em http://localhost:8001.')
    vi.mocked(api.fetchHealth).mockRejectedValue(offline)
    vi.mocked(api.fetchClustersCursos).mockRejectedValue(offline)
    const { container } = montar(<VisaoGeral />, { pathname: '/educluster' })
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0))
    await estabilizar()
    expect({ texto: textoForaDoCabecalho(container), cabecalho: cabecalho(container), campos: campos(container) }).toMatchSnapshot()
    const antes = vi.mocked(api.fetchClustersCursos).mock.calls.length
    fireEvent.click(screen.getAllByRole('button', { name: /Tentar novamente/ })[0])
    await waitFor(() => expect(vi.mocked(api.fetchClustersCursos).mock.calls.length).toBeGreaterThan(antes))
    vi.mocked(api.fetchHealth).mockImplementation(async () => fx.health)
    vi.mocked(api.fetchClustersCursos).mockImplementation(async () => fx.clustersCursos)
  })

  it('carregando: rótulos dos estados de carregamento', async () => {
    vi.mocked(api.fetchClustersCursos).mockReturnValueOnce(new Promise(() => {}))
    vi.mocked(api.fetchDimensoesDesempenho).mockReturnValueOnce(new Promise(() => {}))
    const { container } = montar(<VisaoGeral />, { pathname: '/educluster' })
    await act(async () => {})
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
  })
})
