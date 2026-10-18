// Caracterização da Tela 2 (`/multienade`). Escrita sobre o código anterior à migração visual e regravada
// UMA vez, em 18/10/2026, quando o autor refez a modelagem do MultiENADE (EnadeX/multi_enade/EXPLORACAO_MODELO_*.md):
// novas variáveis de regressão, clusters com nome e regras de associação com banda de desempenho.
// Fora de uma mudança de modelagem, este teste NÃO é atualizado para acompanhar mudanças visuais.
//
// O cabeçalho é conferido item a item, porque a logo (BarChart3 + "EnadeX" em texto) é a única parte que o plano
// permite trocar. As cores dos pontos podem mudar; o que fica fixo é a posição, o título e qual ponto recebe qual
// cor (mesma categoria/cluster → mesma cor da legenda).
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MultiEnadePage from '@/app/multienade/page'
import * as api from '@/lib/multienade/api'
import type { AssociacaoRow, ClusterRow, RegressaoRow, ShapRow } from '@/lib/multienade/api'

vi.mock('@/lib/multienade/api', async (original) => {
  const real = await original<typeof import('@/lib/multienade/api')>()
  return {
    ...real,
    getRelatorioRegressao: vi.fn(),
    getRelatorioCluster: vi.fn(),
    getRelatorioAssociacao: vi.fn(),
    getRelatorioShap: vi.fn(),
  }
})

const base = {
  QE_I04_media: 2.5, CO_TURNO_GRADUACAO_4: 0, QE_I13_D: 0.05, QE_I24_A: 0.3, QE_I12_A: 0.6, QE_I11_A: 0.9,
  QE_I19_B: 0.6, PCA_ECON_2: 0.1, QT_ALUNOS: 30,
}
const REGRESSAO: RegressaoRow[] = [
  { ...base, CO_CURSO: 101, NT_GER: 42.5, QE_I57: 5.2, QE_I15_C: 0.05, QE_I15_E: 0.02, QE_I13_A: 0.7, QE_I13_B: 0.1, PCA_ECON_1: -1.4, NT_GER_PREVISTA: 44.1 },
  { ...base, CO_CURSO: 102, NT_GER: 55.25, QE_I57: 4.1, QE_I15_C: 0.2, QE_I15_E: 0.15, QE_I13_A: 0.5, QE_I13_B: 0.3, PCA_ECON_1: 1.2, NT_GER_PREVISTA: 51.9 },
  { ...base, CO_CURSO: 103, NT_GER: 61, QE_I57: 5.6, QE_I15_C: 0.1, QE_I15_E: 0.1, QE_I13_A: 0.4, QE_I13_B: 0.35, PCA_ECON_1: 2.3, NT_GER_PREVISTA: 58.3 },
  { ...base, CO_CURSO: 104, NT_GER: 38.75, QE_I57: 3.9, QE_I15_C: 0.02, QE_I15_E: 0.03, QE_I13_A: 0.8, QE_I13_B: 0.05, PCA_ECON_1: -2.6, NT_GER_PREVISTA: 40.2 },
]

const q = (n: number) => Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((i) => [`QE_I63_${i}`, (n + i) / 10]))
const cotas = { QE_I15_A: 0.6, QE_I15_B: 0.1, QE_I15_C: 0.1, QE_I15_D: 0.1, QE_I15_E: 0.05, QE_I15_F: 0.05 }
const bolsa = Object.fromEntries('ABCDEFGHIJK'.split('').map((l, i) => [`QE_I11_${l}`, i === 0 ? 0.9 : 0.01]))
const CLUSTERS: ClusterRow[] = [
  { CO_CURSO: 201, NT_GER: 47.3, ...q(1), ...cotas, ...bolsa, Cluster_Nome: 'Desempenho Alto', Cluster_ID: 0, PCA_X: -1.2, PCA_Y: 0.4 },
  { CO_CURSO: 202, NT_GER: 52.1, ...q(2), ...cotas, ...bolsa, Cluster_Nome: 'Desempenho Médio', Cluster_ID: 1, PCA_X: 0.3, PCA_Y: -0.8 },
  { CO_CURSO: 203, NT_GER: 58.9, ...q(3), ...cotas, ...bolsa, Cluster_Nome: 'Desempenho Baixo', Cluster_ID: 2, PCA_X: 1.7, PCA_Y: 1.1 },
  { CO_CURSO: 204, NT_GER: 44.0, ...q(4), ...cotas, ...bolsa, Cluster_Nome: 'Desempenho Médio', Cluster_ID: 1, PCA_X: 0.9, PCA_Y: -0.2 },
  { CO_CURSO: 205, NT_GER: 49.5, ...q(5), ...cotas, ...bolsa, Cluster_Nome: 'Desempenho Baixo', Cluster_ID: 7, PCA_X: -0.4, PCA_Y: 0.9 },
] as ClusterRow[]

const ASSOCIACAO: AssociacaoRow[] = [
  { id: 1, antecedents: 'metodologia_inovadora_5, profs_disponibilidade_5', consequents: 'oportunidades_ic_5', support: 5.33, confidence: 53.1, lift: 2.408 },
  { id: 2, antecedents: 'desempenho_desempenho_baixo, professores_dominio_5', consequents: 'profs_disponibilidade_5', support: 4.44, confidence: 50.74, lift: 1.937 },
  { id: 3, antecedents: 'infra_salas_6', consequents: 'formacao_critica_6, item_desconhecido_2', support: 12.345, confidence: 67.89, lift: 1.23456 },
]

const SHAP: ShapRow[] = [
  { feature: 'QE_I13_B', importancia_media: 1.25 },
  { feature: 'PCA_ECON_1', importancia_media: 3.5 },
  { feature: 'QE_I24_A', importancia_media: 0.75 },
  { feature: 'QE_I13_B', importancia_media: 9.9 }, // duplicada: some
  { feature: 'COLUNA_NOVA', importancia_media: 0.5 },
]

const mocks = () => ({
  regressao: vi.mocked(api.getRelatorioRegressao),
  cluster: vi.mocked(api.getRelatorioCluster),
  associacao: vi.mocked(api.getRelatorioAssociacao),
  shap: vi.mocked(api.getRelatorioShap),
})

function respostasOk() {
  const m = mocks()
  m.regressao.mockResolvedValue(REGRESSAO)
  m.cluster.mockResolvedValue(CLUSTERS)
  m.associacao.mockResolvedValue(ASSOCIACAO)
  m.shap.mockResolvedValue(SHAP)
}

const normalizar = (texto: string | null | undefined) => (texto ?? '').replace(/\s+/g, ' ').trim()

function textoForaDoCabecalho(container: HTMLElement) {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelector('header')?.remove()
  return normalizar(clone.textContent)
}

/** Valor de uma propriedade no atributo `style` (lido do atributo, para não depender do parser de CSS do jsdom). */
function estilo(el: Element, prop: string) {
  const m = (el.getAttribute('style') ?? '').match(new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`))
  return m?.[1].trim()
}

/** Pontos de um gráfico: elementos com `title` e posição em `style`. */
function pontos(container: HTMLElement) {
  return [...container.querySelectorAll('span[title]')].map((el) => ({
    title: el.getAttribute('title'),
    left: estilo(el, 'left'),
    top: estilo(el, 'top'),
    bottom: estilo(el, 'bottom'),
    cor: estilo(el, 'background-color'),
  }))
}

/** Itens de legenda: `<i>` com cor + texto do item. */
function legenda(container: HTMLElement) {
  return [...container.querySelectorAll('i[style]')].map((i) => ({ texto: normalizar(i.parentElement!.textContent), cor: estilo(i, 'background-color') }))
}

async function renderPronto() {
  const r = render(<MultiEnadePage />)
  await screen.findByText(/● Conectado/)
  await waitFor(() => expect(mocks().shap).toHaveBeenCalled())
  await act(async () => {})
  return r
}

const botaoTopico = (nome: string) => screen.getByRole('button', { name: new RegExp(nome) })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MultiENADE: caracterização', () => {
  it('carregando: texto e chamadas à API', async () => {
    const m = mocks()
    m.regressao.mockReturnValue(new Promise(() => {}))
    m.cluster.mockReturnValue(new Promise(() => {}))
    m.associacao.mockReturnValue(new Promise(() => {}))
    const { container } = render(<MultiEnadePage />)
    await act(async () => {})
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
    expect(normalizar(container.querySelector('header')!.textContent)).toContain('● Carregando…')
    expect(m.regressao).toHaveBeenCalledTimes(1)
    expect(m.regressao).toHaveBeenCalledWith()
    expect(m.cluster).toHaveBeenCalledWith()
    expect(m.associacao).toHaveBeenCalledWith()
    expect(m.shap).not.toHaveBeenCalled()
  })

  it('pronto: texto de cada aba', async () => {
    respostasOk()
    const { container } = await renderPronto()
    const textos: Record<string, string> = { regressao: textoForaDoCabecalho(container) }
    fireEvent.click(botaoTopico('Agrupamento de perfis'))
    textos.clusters = textoForaDoCabecalho(container)
    fireEvent.click(botaoTopico('Regras de associação'))
    textos.associacao = textoForaDoCabecalho(container)
    fireEvent.click(botaoTopico('Modelagem supervisionada'))
    expect(textoForaDoCabecalho(container)).toBe(textos.regressao)
    expect(textos).toMatchSnapshot()
  })

  it('pronto: botões na ordem', async () => {
    respostasOk()
    await renderPronto()
    expect(screen.getAllByRole('button').map((b) => normalizar(b.textContent))).toMatchSnapshot()
  })

  it('cabeçalho: link para a home, nome do subprojeto, navegação e status', async () => {
    respostasOk()
    const { container } = await renderPronto()
    const header = container.querySelector('header')!
    expect(header.querySelector('a[href="/"]')).not.toBeNull()
    const texto = normalizar(header.textContent)
    for (const t of ['Subprojetos', 'MultiENADE', 'Análise', 'Dataset', 'Metodologia', '● Conectado']) expect(texto).toContain(t)
    expect([...header.querySelectorAll('nav a')].map((a) => [normalizar(a.textContent), a.getAttribute('href')])).toEqual([
      ['Análise', '#analysis'],
      ['Dataset', '#dataset'],
      ['Metodologia', '#methodology'],
    ])
  })

  it('lista de hrefs da página', async () => {
    respostasOk()
    const { container } = await renderPronto()
    expect([...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toMatchSnapshot()
  })

  it('"Atualizar análise" chama as mesmas APIs de novo', async () => {
    respostasOk()
    await renderPronto()
    fireEvent.click(screen.getByRole('button', { name: /Atualizar análise/ }))
    await waitFor(() => expect(mocks().shap).toHaveBeenCalledTimes(2))
    const m = mocks()
    for (const fn of [m.regressao, m.cluster, m.associacao, m.shap]) {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenLastCalledWith()
    }
  })

  it('erro: texto e status', async () => {
    const m = mocks()
    m.regressao.mockRejectedValue(new Error('Falha na requisição (500) para /api/multienade/relatorio-regressao'))
    m.cluster.mockResolvedValue(CLUSTERS)
    m.associacao.mockResolvedValue(ASSOCIACAO)
    const { container } = render(<MultiEnadePage />)
    await screen.findByText(/● Falha na conexão/)
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
    expect(m.shap).not.toHaveBeenCalled()
  })

  it('erro sem mensagem: texto padrão', async () => {
    const m = mocks()
    m.regressao.mockRejectedValue('x')
    m.cluster.mockResolvedValue(CLUSTERS)
    m.associacao.mockResolvedValue(ASSOCIACAO)
    const { container } = render(<MultiEnadePage />)
    await screen.findByText(/● Falha na conexão/)
    expect(textoForaDoCabecalho(container)).toContain('Erro desconhecido ao consultar a API.')
  })

  it('SHAP indisponível: só o painel do SHAP muda', async () => {
    respostasOk()
    mocks().shap.mockRejectedValue(new Error('tabela não existe'))
    const { container } = render(<MultiEnadePage />)
    await screen.findByText(/Ainda não disponível/)
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
  })

  it('dispersão supervisionada: pontos, legenda e regra de cor, nas duas variáveis', async () => {
    respostasOk()
    const { container } = await renderPronto()
    const linha = container.querySelector('svg line')!
    const reta = ['x1', 'y1', 'x2', 'y2'].map((a) => linha.getAttribute(a))

    const porVariavel: Record<string, unknown> = {}
    for (const nome of ['Domínio docente (QE_I57)', 'Perfil de ingresso (QE_I15)']) {
      fireEvent.click(screen.getByRole('button', { name: nome }))
      const p = pontos(container)
      const l = legenda(container)
      // cada ponto tem a cor do item da legenda da sua categoria
      for (const ponto of p) {
        const item = l.find((x) => ponto.title!.endsWith(`— ${x.texto}`))
        expect(item, ponto.title!).toBeDefined()
        expect(ponto.cor).toBe(item!.cor)
      }
      porVariavel[nome] = { pontos: p.map(({ cor: _, ...resto }) => resto), legenda: l.map((x) => x.texto) }
    }
    expect({ reta, porVariavel }).toMatchSnapshot()
  })

  it('SHAP: ordem, rótulos, valores e larguras', async () => {
    respostasOk()
    const { container } = await renderPronto()
    const barras = [...container.querySelectorAll('div[style*="width"]')].map((b) => {
      const item = b.parentElement!.parentElement!
      return { texto: normalizar(item.firstElementChild!.textContent), largura: estilo(b, 'width') }
    })
    expect(barras).toMatchSnapshot()
  })

  it('clusters: pontos, legenda e mesmo cluster → mesma cor', async () => {
    respostasOk()
    const { container } = await renderPronto()
    fireEvent.click(botaoTopico('Agrupamento de perfis'))
    const p = pontos(container)
    const l = legenda(container)
    expect(l.map((x) => x.texto)).toEqual(['Desempenho Alto (1)', 'Desempenho Médio (2)', 'Desempenho Baixo (1)', 'Desempenho Baixo (1)'])
    for (const ponto of p) {
      const id = Number(ponto.title!.match(/cluster (\d+)/)![1])
      const nome = CLUSTERS.find((c) => c.Cluster_ID === id)!.Cluster_Nome
      expect(ponto.title).toContain(`(${nome})`)
      expect(ponto.cor).toBe(`var(--cluster-${(id % 6) + 1})`)
    }
    // um item de legenda por Cluster_ID, com nome e contagem; Cluster_ID % 6: o 7 repete a cor do 1
    expect(l.map((x) => x.cor)).toEqual(['var(--cluster-1)', 'var(--cluster-2)', 'var(--cluster-3)', 'var(--cluster-2)'])
    expect(p.map(({ cor: _, ...resto }) => resto)).toMatchSnapshot()
  })

  it('dataset: colunas e linhas de cada tópico', async () => {
    respostasOk()
    const { container } = await renderPronto()
    const tabelaDataset = () => {
      const t = container.querySelector('#dataset table')!
      return {
        colunas: [...t.querySelectorAll('th')].map((th) => normalizar(th.textContent)),
        linhas: [...t.querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => normalizar(td.textContent))),
      }
    }
    const r: Record<string, unknown> = { regressao: tabelaDataset() }
    fireEvent.click(botaoTopico('Agrupamento de perfis'))
    r.clusters = tabelaDataset()
    fireEvent.click(botaoTopico('Regras de associação'))
    r.associacao = tabelaDataset()
    expect(r).toMatchSnapshot()
  })

  it('dados reais: colunas antigas nulas e cursos sem índice não quebram a tela', async () => {
    const legado = { QE_I63: null, QE_I15_A: null, QE_I23_ordinal: null, QE_I08_media: null }
    const comNulos = [
      ...REGRESSAO.map((r) => ({ ...r, ...legado })),
      { ...REGRESSAO[0], ...legado, CO_CURSO: 999, PCA_ECON_1: null },
    ] as unknown as RegressaoRow[]
    respostasOk()
    mocks().regressao.mockResolvedValue(comNulos)
    const { container } = await renderPronto()
    // o curso sem índice fica fora da dispersão, mas continua no Dataset
    expect(pontos(container).map((p) => p.title).some((t) => t!.startsWith('Curso 999'))).toBe(false)
    expect(pontos(container)).toHaveLength(4)
    const colunas = [...container.querySelectorAll('#dataset th')].map((th) => normalizar(th.textContent))
    expect(colunas).not.toContain('QE_I63')
    expect(colunas).not.toContain('QE_I23_ordinal')
    expect(colunas).toContain('PCA_ECON_1')
  })
})
