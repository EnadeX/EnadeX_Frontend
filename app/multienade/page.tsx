'use client'

import {
  BarChart3,
  ChevronDown,
  Database,
  Download,
  Filter,
  Info,
  Network,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  type RegressaoRow,
  type ClusterRow,
  type AssociacaoRow,
  getRelatorioRegressao,
  getRelatorioCluster,
  getRelatorioAssociacao,
  calcularMetricasRegressao,
} from '@/lib/multienade/api'

type Tab = 'Supervisionada' | 'Clusters' | 'Regras de associação' | 'Evolução temporal'

const CLUSTER_COLORS = ['#155eef', '#00a56e', '#f59e0b']

export default function MultiEnadePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Supervisionada')
  const [year, setYear] = useState('2021')

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [erro, setErro] = useState<string | null>(null)

  const [regressao, setRegressao] = useState<RegressaoRow[]>([])
  const [clusters, setClusters] = useState<ClusterRow[]>([])
  const [associacao, setAssociacao] = useState<AssociacaoRow[]>([])

  async function carregarBase() {
    setStatus('loading')
    setErro(null)
    try {
      const [dadosRegressao, dadosClusters, dadosAssociacao] = await Promise.all([
        getRelatorioRegressao(),
        getRelatorioCluster(),
        getRelatorioAssociacao(),
      ])
      setRegressao(dadosRegressao)
      setClusters(dadosClusters)
      setAssociacao(dadosAssociacao)
      setStatus('ready')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido ao consultar a API.')
      setStatus('error')
    }
  }

  // Carrega automaticamente na primeira visita; o botão na sidebar permite recarregar.
  useEffect(() => {
    carregarBase()
  }, [])

  const metricas = calcularMetricasRegressao(regressao)

  // Amostra os pontos do scatter para não desenhar milhares de círculos.
  const pontosScatter = amostrar(regressao, 60)
  const notaMin = 0
  const notaMax = 100
  const horasMin = 1
  const horasMax = 4

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
      <header className="border-b border-[#dfe5ee] bg-white">
        <div className="flex h-[70px] items-center justify-between px-10">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Voltar para a Home" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#1d4ed8] text-white"><BarChart3 className="size-5" /></span>
              <span className="text-[17px] font-bold tracking-tight">EnadeX</span>
            </a>
            <span className="h-8 w-px bg-[#dfe5ee]" />
            <div className="leading-tight"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#91a4c3]">Subprojetos</p><p className="text-sm font-semibold">MultiENADE</p></div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[#607494] md:flex"><a className="font-medium text-[#111827]" href="#analysis">Análise</a><a href="#dataset">Dataset</a><a href="#methodology">Metodologia</a></nav>
          <div className="flex items-center gap-3">
            <span className={`hidden rounded-full border px-3 py-1.5 text-xs font-semibold sm:inline-flex ${status === 'ready' ? 'border-[#a7efd0] bg-[#f0fdf8] text-[#009b67]' : status === 'error' ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {status === 'ready' ? '● Conectado' : status === 'error' ? '● Falha na conexão' : status === 'loading' ? '● Carregando…' : '● Aguardando'}
            </span>
            <button aria-label="Baixar relatório" className="flex size-9 items-center justify-center rounded-xl border border-[#dfe5ee] bg-white text-[#607494]"><Download className="size-4" /></button>
          </div>
        </div>
      </header>

      <div className="px-10 py-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-[#8aa0c1]"><a href="/" className="hover:text-[#1d4ed8]">Home</a><span>/</span><span>Subprojetos</span><span>/</span><span className="text-[#2d4263]">MultiENADE</span></div>
        <section className="flex items-end justify-between border-b border-[#dfe5ee] pb-9"><div><div className="flex items-center gap-3"><h1 className="text-[29px] font-bold tracking-tight">MultiENADE</h1><span className="rounded-lg border border-[#cfe0ff] bg-[#eef5ff] px-2.5 py-1 text-[11px] font-semibold text-[#155eef]">Descoberta de padrões</span></div><p className="mt-2 text-sm text-[#607494]">Descoberta de padrões multidimensionais em microdados do ENADE com apoio de inteligência explicável.</p></div><div className="flex items-center gap-2 text-xs text-[#607494]"><Database className="size-4 text-[#89a1c5]" /> Dataset: <strong className="text-[#2d4263]">Curado 2021</strong><span className="text-emerald-500">•</span></div></section>

        {status === 'error' && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os dados da API ({erro}). Confira se o backend está rodando em <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}</code>.
          </div>
        )}

        <div className="mt-8 grid grid-cols-[280px_minmax(0,1fr)] gap-8">
          <aside className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold"><Filter className="size-4 text-[#155eef]" /> Filtros globais</h2><button className="text-[11px] text-[#8aa0c1]">Limpar</button></div>
            <p className="mt-2 text-xs text-[#8aa0c1]">Defina o contexto da amostra</p>
            <label className="mt-6 block text-xs font-semibold text-[#536987]">Ano
              <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#155eef]">
                <option>2021</option><option>2019</option><option>2018</option><option>2017</option>
              </select>
            </label>
            <button
              onClick={carregarBase}
              disabled={status === 'loading'}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#1742ba] disabled:opacity-60"
            >
              <Play className="size-3.5" /> {status === 'loading' ? 'Carregando…' : 'Carregar base'}
            </button>
            <div className="mt-5 flex justify-between border-t border-[#edf1f6] pt-5 text-[11px]">
              <span className="text-[#8aa0c1]">Amostra selecionada</span>
              <strong className="text-[#00a56e]">{status === 'ready' ? `${regressao.length.toLocaleString('pt-BR')} registros` : '—'}</strong>
            </div>
          </aside>

          <section id="analysis" className="min-w-0">
            <div className="flex items-center gap-7 border-b border-[#dfe5ee]">
              {(['Supervisionada', 'Clusters', 'Regras de associação', 'Evolução temporal'] as Tab[]).map((tab, index) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 border-b-2 px-2 pb-3 text-xs font-semibold ${activeTab === tab ? 'border-[#155eef] text-[#155eef]' : 'border-transparent text-[#8aa0c1]'}`}>
                  {index === 0 ? <Sparkles className="size-4" /> : index === 1 ? <Network className="size-4" /> : index === 2 ? <LayersIcon /> : <TrendingUp className="size-4" />}
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Supervisionada' && (
              <>
                <div className="flex items-start justify-between py-6">
                  <div>
                    <h2 className="text-lg font-bold">Modelagem supervisionada & explicabilidade</h2>
                    <p className="mt-1 text-xs text-[#8aa0c1]">Regressão e métricas de desempenho calculadas a partir da nota real vs. prevista.</p>
                  </div>
                  <button onClick={carregarBase} className="flex items-center gap-2 rounded-xl border border-[#dfe5ee] bg-white px-3 py-2 text-xs font-semibold text-[#536987]"><RotateCcw className="size-3.5" /> Atualizar análise</button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ['R²', 'Poder explicativo', metricas.r2.toFixed(3).replace('.', ',')],
                    ['MAE', 'Erro absoluto', metricas.mae.toFixed(2).replace('.', ',')],
                    ['RMSE', 'Raiz do erro', metricas.rmse.toFixed(2).replace('.', ',')],
                  ].map(([code, label, value]) => (
                    <div key={code} className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
                      <p className="text-[11px] text-[#8aa0c1]">{code} <span className="ml-1">— {label}</span></p>
                      <p className="mt-2 text-2xl font-bold tracking-tight">{status === 'ready' ? value : '—'}</p>
                      <p className="mt-1 text-[10px] text-[#8aa0c1]">{status === 'ready' ? `base de ${metricas.n.toLocaleString('pt-BR')} cursos` : 'aguardando dados'}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Nota real × Nota prevista</h3>
                      <p className="mt-1 text-xs text-[#8aa0c1]">Cada ponto é um curso; quanto mais perto da diagonal, melhor a previsão</p>
                    </div>
                    <button aria-label="Mais informações" className="flex size-8 items-center justify-center rounded-lg border border-[#dfe5ee] text-[#8aa0c1]"><Info className="size-4" /></button>
                  </div>
                  <div className="relative mt-4 h-[290px] border-b border-l border-[#dbe6f7] bg-[linear-gradient(to_top,#f7faff_1px,transparent_1px),linear-gradient(to_right,#f7faff_1px,transparent_1px)] bg-[size:100%_25%,10%_100%]">
                    <div className="absolute bottom-[-26px] left-1/2 text-[10px] text-[#8aa0c1]">Nota real (NT_GER)</div>
                    <div className="absolute left-[-31px] top-1/2 -rotate-90 text-[10px] text-[#8aa0c1]">Nota prevista</div>
                    {/* Diagonal de referência (previsto = real) desenhada em SVG para não depender
                        da proporção do container — rotate() do CSS distorce em retângulos não-quadrados. */}
                    <svg
                      className="pointer-events-none absolute inset-0 size-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <line x1="0" y1="100" x2="100" y2="0" stroke="#a8c8ff" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>
                    {pontosScatter.map((d, index) => {
                      const left = clamp(((d.NT_GER - notaMin) / (notaMax - notaMin)) * 100, 2, 98)
                      const bottom = clamp(((d.NT_GER_PREVISTA - notaMin) / (notaMax - notaMin)) * 100, 2, 98)
                      return (
                        <span
                          key={`${d.CO_CURSO}-${index}`}
                          className="absolute size-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-[#4d88f5] shadow-[0_0_0_1px_#c7dcff]"
                          style={{ left: `${left}%`, bottom: `${bottom}%` }}
                          title={`Curso ${d.CO_CURSO}: real ${d.NT_GER.toFixed(1)}, previsto ${d.NT_GER_PREVISTA.toFixed(1)}`}
                        />
                      )
                    })}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Importância global (SHAP)</h3>
                      <p className="mt-1 text-xs text-[#8aa0c1]">Ainda não disponível — depende de um export específico do pipeline de modelagem</p>
                    </div>
                    <Sparkles className="size-4 text-[#c7d2e3]" />
                  </div>
                  <p className="mt-4 rounded-lg bg-[#f6f8fb] px-3 py-4 text-center text-xs text-[#8aa0c1]">Em breve, assim que os valores SHAP forem exportados junto com o modelo.</p>
                </div>
              </>
            )}

            {activeTab === 'Clusters' && (
              <div className="py-6">
                <h2 className="text-lg font-bold">Agrupamento de perfis (K-Means)</h2>
                <p className="mt-1 text-xs text-[#8aa0c1]">Projeção PCA dos {clusters.length.toLocaleString('pt-BR')} cursos, coloridos por cluster.</p>
                <div className="relative mt-5 h-[360px] rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
                  {amostrar(clusters, 200).map((c, index) => (
                    <span
                      key={`${c.CO_CURSO}-${index}`}
                      className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${scalePca(c.PCA_X, clusters, 'PCA_X')}%`,
                        top: `${scalePca(c.PCA_Y, clusters, 'PCA_Y')}%`,
                        backgroundColor: CLUSTER_COLORS[c.Cluster_ID % CLUSTER_COLORS.length],
                      }}
                      title={`Curso ${c.CO_CURSO} — cluster ${c.Cluster_ID}`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-5 text-xs text-[#607494]">
                  {[0, 1, 2].map((id) => (
                    <span key={id} className="flex items-center gap-1.5">
                      <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[id] }} />
                      Cluster {id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Regras de associação' && (
              <div className="py-6">
                <h2 className="text-lg font-bold">Regras de associação (Apriori)</h2>
                <p className="mt-1 text-xs text-[#8aa0c1]">{associacao.length} regras encontradas com suporte mínimo configurado.</p>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-[#dfe5ee] bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#edf1f6] text-[11px] uppercase tracking-wide text-[#8aa0c1]">
                      <tr>
                        <th className="px-4 py-3">Se ocorre (antecedente)</th>
                        <th className="px-4 py-3">Então ocorre (consequente)</th>
                        <th className="px-4 py-3">Suporte</th>
                        <th className="px-4 py-3">Confiança</th>
                        <th className="px-4 py-3">Lift</th>
                      </tr>
                    </thead>
                    <tbody>
                      {associacao.map((r, index) => (
                        <tr key={index} className="border-b border-[#f5f7fa] last:border-0">
                          <td className="px-4 py-3 font-medium">{r.antecedents}</td>
                          <td className="px-4 py-3">{r.consequents}</td>
                          <td className="px-4 py-3">{r.support.toFixed(1)}%</td>
                          <td className="px-4 py-3">{r.confidence.toFixed(1)}%</td>
                          <td className="px-4 py-3">{r.lift.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Evolução temporal' && (
              <div className="py-6 text-sm text-[#8aa0c1]">
                Ainda não há endpoint de série histórica — esta aba pertence ao subprojeto ENADE-Time.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function LayersIcon() {
  return <span className="inline-flex size-4 items-center justify-center text-[12px]">▱</span>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Reduz um array grande para no máximo `n` itens, distribuídos uniformemente,
// para não desenhar milhares de elementos no DOM.
function amostrar<T>(dados: T[], n: number): T[] {
  if (dados.length <= n) return dados
  const passo = dados.length / n
  const resultado: T[] = []
  for (let i = 0; i < n; i++) {
    resultado.push(dados[Math.floor(i * passo)])
  }
  return resultado
}

function scalePca<K extends 'PCA_X' | 'PCA_Y'>(valor: number, dados: ClusterRow[], campo: K): number {
  const valores = dados.map((d) => d[campo])
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  if (max === min) return 50
  return clamp(((valor - min) / (max - min)) * 100, 2, 98)
}