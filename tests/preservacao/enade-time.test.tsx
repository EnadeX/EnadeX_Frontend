// Caracterização do ENADE-Time (`/enade-time/*`, telas 4 a 17 do plano), escrita sobre o código anterior à
// migração visual. Este teste NUNCA é atualizado para acompanhar a migração: se ele precisar mudar, a migração
// mexeu em texto, campo, link, dados de gráfico, chamadas à API, exportações ou lógica.
//
// O cabeçalho é conferido item a item (a logo é a única parte que o plano permite trocar). Os gráficos do Recharts
// viram <div> com as props em JSON, sem as de cor e fonte, que podem mudar.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as fx from '../fixtures/enade-time'

// ---------- navegação ----------
const nav = vi.hoisted(() => ({
  pathname: '/enade-time',
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
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`)
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
const CHAVES_VISUAIS = new Set(['fill', 'stroke', 'color', 'cor', 'fontFamily', 'contentStyle', 'wrapperStyle', 'style', 'backgroundColor', 'borderColor', 'fillOpacity', 'strokeWidth', 'radius', 'barSize', 'iconType', 'fontSize', 'activeDot', 'dot'])

function semVisual(valor: unknown): unknown {
  if (typeof valor === 'function') return '[função]'
  if (Array.isArray(valor)) return valor.map(semVisual)
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>)
        .filter(([k]) => !CHAVES_VISUAIS.has(k) && k !== 'children' && k !== 'ref')
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
vi.mock('@/lib/enade-time/api', async (original) => {
  const real = await original<typeof import('@/lib/enade-time/api')>()
  const fx = await import('../fixtures/enade-time')
  return {
    ...real,
    fetchHealth: vi.fn(async () => fx.health),
    fetchRegioes: vi.fn(async () => fx.dim.regioes),
    fetchUFs: vi.fn(async () => fx.dim.ufs),
    fetchAnos: vi.fn(async () => fx.dim.anos),
    fetchGrupos: vi.fn(async () => fx.dim.grupos),
    fetchModalidades: vi.fn(async () => fx.dim.modalidades),
    fetchCategoriasAdm: vi.fn(async () => fx.dim.categoriasAdm),
    fetchOrganizacoesAcademicas: vi.fn(async () => fx.dim.organizacoes),
    fetchResumoAnual: vi.fn(async () => fx.resumoAnual),
    fetchResumoRegiao: vi.fn(async () => fx.resumoRegiao),
    fetchResumoUF: vi.fn(async () => fx.resumoUf),
    fetchResumoIES: vi.fn(async () => fx.resumoIes),
    fetchRegistros: vi.fn(async () => fx.registros),
    fetchExecucoes: vi.fn(async () => fx.execucoes),
    fetchExecucao: vi.fn(async (id: number) => {
      const e = fx.execucao(id)
      if (!e) throw new real.EnadeTimeApiError(404, `Execução ${id} não encontrada`)
      return e
    }),
    fetchEtapas: vi.fn(async (id: number) => fx.etapas(id)),
    fetchMetricas: vi.fn(async () => fx.metricas),
    fetchComparativo: vi.fn(async () => fx.comparativo),
    fetchCarga: vi.fn(async () => fx.carga),
  }
})

import * as api from '@/lib/enade-time/api'
import { ModuleShell } from '@/app/enade-time/_components/layout/ModuleShell'
import EnadeLayout from '@/app/enade-time/enade/layout'
import AnalisesLayout from '@/app/enade-time/enade/(analises)/layout'
import SpdLayout from '@/app/enade-time/spd/layout'
import VisaoGeral from '@/app/enade-time/page'
import Sobre from '@/app/enade-time/sobre/page'
import NotFound from '@/app/enade-time/not-found'
import Anual from '@/app/enade-time/enade/(analises)/anual/page'
import Regional from '@/app/enade-time/enade/(analises)/regional/page'
import Uf from '@/app/enade-time/enade/(analises)/uf/page'
import Ies from '@/app/enade-time/enade/(analises)/ies/page'
import Comparar from '@/app/enade-time/enade/(analises)/comparar/page'
import Registros from '@/app/enade-time/enade/(analises)/registros/page'
import Comparativo from '@/app/enade-time/spd/comparativo/page'
import Execucoes from '@/app/enade-time/spd/execucoes/page'
import Metricas from '@/app/enade-time/spd/metricas/page'
import Carga from '@/app/enade-time/spd/carga/page'
import Etapas from '@/app/enade-time/spd/etapas/[execucaoId]/page'

const FUNCOES = [
  'fetchHealth', 'fetchRegioes', 'fetchUFs', 'fetchAnos', 'fetchGrupos', 'fetchModalidades', 'fetchCategoriasAdm',
  'fetchOrganizacoesAcademicas', 'fetchResumoAnual', 'fetchResumoRegiao', 'fetchResumoUF', 'fetchResumoIES',
  'fetchRegistros', 'fetchExecucoes', 'fetchExecucao', 'fetchEtapas', 'fetchMetricas', 'fetchComparativo', 'fetchCarga',
] as const

/** Chamadas à API sem o AbortSignal, por função. */
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

/** Rótulo de um controle: texto do <label> que o envolve, sem o texto do próprio controle (opções). */
function rotuloDe(el: Element) {
  const label = el.closest('label')
  if (label) {
    const clone = label.cloneNode(true) as HTMLElement
    clone.querySelectorAll('select, input, textarea, option').forEach((x) => x.remove())
    return normalizar(clone.textContent)
  }
  return normalizar(el.getAttribute('aria-label') ?? el.textContent)
}

function campos(container: HTMLElement) {
  return [...container.querySelectorAll('select, input, button, textarea')].map((el) => {
    const rotulo = rotuloDe(el)
    if (el instanceof HTMLSelectElement)
      return { tipo: 'select', rotulo, valor: el.value, opcoes: [...el.options].map((o) => [o.value, normalizar(o.textContent)]), disabled: el.disabled }
    if (el instanceof HTMLInputElement)
      return { tipo: 'input', rotulo, type: el.type, valor: el.value, checked: el.checked, placeholder: el.placeholder, inputMode: el.inputMode, disabled: el.disabled }
    return { tipo: el.tagName.toLowerCase(), rotulo, type: el.getAttribute('type'), disabled: (el as HTMLButtonElement).disabled, pressed: el.getAttribute('aria-pressed') }
  })
}

/** Cartão de filtros das análises: o que contém o botão "Aplicar". */
const cartaoDeFiltros = () => screen.queryByRole('button', { name: 'Aplicar' })?.parentElement?.parentElement ?? document.createElement('div')

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
    nome: normalizar(header.textContent).includes('ENADE-Time'),
  }
}

type Secao = 'analises' | 'spd'

function montar(pagina: ReactNode, { pathname, search = '', params = {}, secao }: { pathname: string; search?: string; params?: Record<string, string>; secao?: Secao }) {
  nav.pathname = pathname
  nav.search = search
  nav.params = params
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })
  const conteudo =
    secao === 'analises' ? (
      <EnadeLayout>
        <AnalisesLayout>{pagina}</AnalisesLayout>
      </EnadeLayout>
    ) : secao === 'spd' ? (
      <SpdLayout>{pagina}</SpdLayout>
    ) : (
      pagina
    )
  return render(
    <QueryClientProvider client={cliente}>
      <ModuleShell>{conteudo}</ModuleShell>
    </QueryClientProvider>,
  )
}

async function estabilizar() {
  for (let i = 0; i < 6; i++) await act(async () => {})
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

type Tela = { nome: string; pagina: () => ReactNode | Promise<ReactNode>; pathname: string; search?: string; params?: Record<string, string>; secao?: Secao }

const FILTROS = 'nu_ano=2017&co_regiao=2&co_modalidade=1'

const TELAS: Tela[] = [
  { nome: 'visão geral', pagina: () => <VisaoGeral />, pathname: '/enade-time' },
  { nome: 'sobre', pagina: () => <Sobre />, pathname: '/enade-time/sobre' },
  { nome: 'não encontrada', pagina: () => <NotFound />, pathname: '/enade-time/xyz' },
  { nome: 'enade anual', pagina: () => <Anual />, pathname: '/enade-time/enade/anual', secao: 'analises' },
  { nome: 'enade anual filtrado', pagina: () => <Anual />, pathname: '/enade-time/enade/anual', search: FILTROS, secao: 'analises' },
  { nome: 'enade regional', pagina: () => <Regional />, pathname: '/enade-time/enade/regional', secao: 'analises' },
  { nome: 'enade uf', pagina: () => <Uf />, pathname: '/enade-time/enade/uf', secao: 'analises' },
  { nome: 'enade ies', pagina: () => <Ies />, pathname: '/enade-time/enade/ies', secao: 'analises' },
  { nome: 'enade comparar', pagina: () => <Comparar />, pathname: '/enade-time/enade/comparar', secao: 'analises' },
  { nome: 'enade registros', pagina: () => <Registros />, pathname: '/enade-time/enade/registros', secao: 'analises' },
  { nome: 'spd comparativo', pagina: () => <Comparativo />, pathname: '/enade-time/spd/comparativo', secao: 'spd' },
  { nome: 'spd execuções', pagina: () => <Execucoes />, pathname: '/enade-time/spd/execucoes', secao: 'spd' },
  { nome: 'spd métricas', pagina: () => <Metricas />, pathname: '/enade-time/spd/metricas', secao: 'spd' },
  { nome: 'spd carga', pagina: () => <Carga />, pathname: '/enade-time/spd/carga', secao: 'spd' },
  // página de servidor assíncrona: recebe params como Promise e valida o id antes de renderizar
  { nome: 'spd etapas', pagina: () => Etapas({ params: Promise.resolve({ execucaoId: '3' }) }), pathname: '/enade-time/spd/etapas/3', secao: 'spd' },
  { nome: 'spd etapas id inexistente', pagina: () => Etapas({ params: Promise.resolve({ execucaoId: '99' }) }), pathname: '/enade-time/spd/etapas/99', secao: 'spd' },
]

beforeEach(() => {
  nav.push.mockClear()
  nav.replace.mockClear()
  nav.back.mockClear()
  for (const nome of FUNCOES) vi.mocked(api[nome] as () => unknown).mockClear()
})

afterEach(() => cleanup())

describe('ENADE-Time: caracterização', () => {
  it.each(TELAS)('$nome: texto, cabeçalho, campos, links, gráficos e API', async ({ pagina, ...opcoes }) => {
    const { container } = montar(await pagina(), opcoes)
    await estabilizar()
    expect(retrato(container)).toMatchSnapshot()
  })

  // "Comparar" esconde a barra de filtros globais (tem seletores próprios)
  it.each(TELAS.filter((t) => t.secao === 'analises' && !t.search && t.nome !== 'enade comparar'))(
    '$nome: filtros na última opção + Aplicar grava a URL; Limpar e Cancelar',
    async ({ pagina, ...opcoes }) => {
      montar(await pagina(), opcoes)
      await estabilizar()
      const filtros = cartaoDeFiltros()
      const selects = () => [...filtros.querySelectorAll('select')]
      // Cancelar volta os campos ao que está na URL
      fireEvent.change(selects()[0], { target: { value: selects()[0].options[1].value } })
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
      await act(async () => {})
      const aposCancelar = selects().map((x) => x.value)
      // todos na última opção + código de IES, depois Aplicar
      for (const select of selects()) {
        fireEvent.change(select, { target: { value: select.options[select.options.length - 1].value } })
        await act(async () => {})
      }
      fireEvent.change(filtros.querySelector('input')!, { target: { value: '1234' } })
      fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
      const aplicado = nav.replace.mock.calls.slice()
      nav.replace.mockClear()
      fireEvent.click(screen.getByRole('button', { name: /Limpar/ }))
      expect({ aposCancelar, aplicado, limpar: nav.replace.mock.calls, campos: selects().map((x) => x.value) }).toMatchSnapshot()
    },
  )

  it.each(TELAS.filter((t) => ['enade ies', 'enade comparar', 'enade registros'].includes(t.nome)))(
    '$nome: seletores próprios da tela mudam as consultas',
    async ({ pagina, ...opcoes }) => {
      const { container } = montar(await pagina(), opcoes)
      await estabilizar()
      const filtros = cartaoDeFiltros()
      const proprios = [...container.querySelectorAll('select')].filter((s) => !filtros.contains(s))
      const resultado: unknown[] = []
      for (const select of proprios) {
        for (const nome of FUNCOES) vi.mocked(api[nome] as () => unknown).mockClear()
        fireEvent.change(select, { target: { value: select.options[select.options.length - 1].value } })
        await estabilizar()
        resultado.push({ rotulo: rotuloDe(select), valor: select.value, api: chamadas(), texto: textoForaDoCabecalho(container).slice(0, 4000) })
      }
      expect(resultado).toMatchSnapshot()
    },
  )

  it('registros: paginação', async () => {
    const { container } = montar(<Registros />, { pathname: '/enade-time/enade/registros', secao: 'analises' })
    await estabilizar()
    const botoes = [screen.getByRole('button', { name: 'Página anterior' }), screen.getByRole('button', { name: 'Próxima página' })]
    const estado = () => botoes.map((b) => [b.getAttribute('aria-label'), (b as HTMLButtonElement).disabled])
    const inicio = estado()
    fireEvent.click(botoes[botoes.length - 1])
    await estabilizar()
    expect({ inicio, depois: estado(), registros: chamadas().fetchRegistros }).toMatchSnapshot()
  })

  it('spd: o checkbox de execuções válidas muda as consultas', async () => {
    const resultado: unknown[] = []
    for (const [Pagina, pathname] of [[Execucoes, '/enade-time/spd/execucoes'], [Metricas, '/enade-time/spd/metricas']] as const) {
      const { container } = montar(<Pagina />, { pathname, secao: 'spd' })
      await estabilizar()
      const caixa = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      fireEvent.click(caixa)
      await estabilizar()
      resultado.push({ pathname, rotulo: rotuloDe(caixa), marcado: caixa.checked, api: chamadas() })
      cleanup()
    }
    expect(resultado).toMatchSnapshot()
  })

  it('comparar: exportação em CSV e Markdown gera os mesmos arquivos', async () => {
    const arquivos: { nome: string; tipo: string; conteudo: string }[] = []
    const criar = vi.fn((blob: Blob) => {
      arquivos.push({ nome: '', tipo: blob.type, conteudo: '' })
      void blob.text().then((t) => (arquivos[arquivos.length - 1].conteudo = t))
      return 'blob:teste'
    })
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: criar, revokeObjectURL: vi.fn() }))
    const clique = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      arquivos[arquivos.length - 1].nome = this.download
    })
    montar(<Comparar />, { pathname: '/enade-time/enade/comparar', secao: 'analises' })
    await estabilizar()
    for (const nome of [/CSV/i, /Markdown|relatório/i]) {
      const botao = screen.getAllByRole('button').find((b) => nome.test(b.textContent ?? ''))
      expect(botao, String(nome)).toBeDefined()
      fireEvent.click(botao!)
      await act(async () => {})
    }
    await waitFor(() => expect(arquivos.every((a) => a.conteudo)).toBe(true))
    clique.mockRestore()
    expect(
      arquivos.map((a) => ({
        ...a,
        nome: a.nome.replace(/_\d{8}_\d{4}/, '_<data>'),
        conteudo: a.conteudo.replace(/\d{2}\/\d{2}\/\d{4}[^\n]*/g, '<data>'),
      })),
    ).toMatchSnapshot()
  })

  it('banco indisponível (503): status e erro', async () => {
    const erro = new api.EnadeTimeApiError(503, 'Banco do ENADE-Time indisponível')
    vi.mocked(api.fetchHealth).mockRejectedValue(erro)
    vi.mocked(api.fetchResumoAnual).mockRejectedValue(erro)
    const { container } = montar(<VisaoGeral />, { pathname: '/enade-time' })
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0))
    await estabilizar()
    expect({ texto: textoForaDoCabecalho(container), cabecalho: cabecalho(container), campos: campos(container) }).toMatchSnapshot()
    vi.mocked(api.fetchHealth).mockImplementation(async () => fx.health)
    vi.mocked(api.fetchResumoAnual).mockImplementation(async () => fx.resumoAnual)
  })

  it('API offline: status', async () => {
    vi.mocked(api.fetchHealth).mockRejectedValue(new api.EnadeTimeApiError(0, 'offline'))
    const { container } = montar(<Sobre />, { pathname: '/enade-time/sobre' })
    await waitFor(() => expect(cabecalho(container).status).not.toBe('● Verificando…'))
    expect(cabecalho(container).status).toMatchSnapshot()
    vi.mocked(api.fetchHealth).mockImplementation(async () => fx.health)
  })

  it('etapas: id que não é número cai no notFound do módulo', async () => {
    await expect(Etapas({ params: Promise.resolve({ execucaoId: 'abc' }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('redirecionamentos de /enade e /spd', async () => {
    const enade = (await import('@/app/enade-time/enade/page')).default
    const spd = (await import('@/app/enade-time/spd/page')).default
    expect(() => enade()).toThrow('NEXT_REDIRECT /enade-time/enade/anual')
    expect(() => spd()).toThrow('NEXT_REDIRECT /enade-time/spd/comparativo')
  })
})
