'use client'

import {
  BarChart3,
  Database,
  Download,
  Network,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  type RegressaoRow,
  type ClusterRow,
  type AssociacaoRow,
  type ShapRow,
  getRelatorioRegressao,
  getRelatorioCluster,
  getRelatorioAssociacao,
  getRelatorioShap,
  calcularMetricasRegressao,
  LABELS_FEATURE,
} from '@/lib/multienade/api'

type Tab = 'Supervisionada' | 'Clusters' | 'Regras de associação' | 'Evolução temporal'
type VariavelCor = 'infraestrutura' | 'cotas'

const CLUSTER_PALETTE = ['#155eef', '#00a56e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6']

const CORES_CATEGORIA: Record<VariavelCor, Record<string, string>> = {
  infraestrutura: {
    'Adequada/Excelente': '#023e8a',
    'Regular/Insuficiente': '#f77f00',
  },
  cotas: {
    'Maioria Ampla Concorr.': '#2a9d8f',
    'Maioria Cotistas': '#e76f51',
  },
}

export default function MultiEnadePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Supervisionada')
  const [variavelCor, setVariavelCor] = useState<VariavelCor>('infraestrutura')

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [erro, setErro] = useState<string | null>(null)

  const [regressao, setRegressao] = useState<RegressaoRow[]>([])
  const [clusters, setClusters] = useState<ClusterRow[]>([])
  const [associacao, setAssociacao] = useState<AssociacaoRow[]>([])
  const [shap, setShap] = useState<ShapRow[] | null>(null)
  const [shapDisponivel, setShapDisponivel] = useState(true)

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
      return
    }

    // Busca do SHAP é isolada: se a tabela ainda não existir no backend, o resto da
    // página continua funcionando normalmente e só o painel de SHAP fica com aviso.
    try {
      setShap(await getRelatorioShap())
    } catch {
      setShapDisponivel(false)
    }
  }

  useEffect(() => {
    carregarBase()
  }, [])

  const metricas = calcularMetricasRegressao(regressao)

  const pontosClassificados = useMemo(
    () => regressao.map((d) => ({ dados: d, ...classificar(d, variavelCor) })),
    [regressao, variavelCor],
  )
  const pontosScatter = amostrar(pontosClassificados, 400)

  // Domínio dos eixos: dedicação vai de 1 a 5 (mapeamento ordinal fixo); nota usa a
  // faixa real observada na base, com uma margem, em vez de assumir 0–100.
  const dedicacaoMin = 1
  const dedicacaoMax = 5
  const notasObservadas = regressao.map((d) => d.NT_GER)
  const notaMin = notasObservadas.length ? Math.floor(Math.min(...notasObservadas) / 5) * 5 - 5 : 0
  const notaMax = notasObservadas.length ? Math.ceil(Math.max(...notasObservadas) / 5) * 5 + 5 : 100

  const reta = useMemo(
    () => regressaoLinear(regressao.map((d) => ({ x: d.QE_I23_ordinal, y: d.NT_GER }))),
    [regressao],
  )

  const shapOrdenado = shap ? [...shap].sort((a, b) => b.importancia_media - a.importancia_media) : []
  const maiorShap = shapOrdenado[0]?.importancia_media ?? 1

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
        <section className="flex items-end justify-between border-b border-[#dfe5ee] pb-9">
          <div>
            <div className="flex items-center gap-3"><h1 className="text-[29px] font-bold tracking-tight">MultiENADE</h1><span className="rounded-lg border border-[#cfe0ff] bg-[#eef5ff] px-2.5 py-1 text-[11px] font-semibold text-[#155eef]">Descoberta de padrões</span></div>
            <p className="mt-2 text-sm text-[#607494]">Descoberta de padrões multidimensionais em microdados do ENADE com apoio de inteligência explicável.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#607494]"><Database className="size-4 text-[#89a1c5]" /> Dataset: <strong className="text-[#2d4263]">ENADE 2021</strong></div>
        </section>

        {status === 'error' && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os dados da API ({erro}). Confira se o backend está rodando em <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}</code>.
          </div>
        )}

        <div className="mt-8 grid grid-cols-[280px_minmax(0,1fr)] gap-8">
          <aside className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold">Base de dados</h2>
            <p className="mt-2 text-xs text-[#8aa0c1]">Microdados do ENADE 2021, já tratados e agregados por curso.</p>
            <button
              onClick={carregarBase}
              disabled={status === 'loading'}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#1742ba] disabled:opacity-60"
            >
              <Play className="size-3.5" /> {status === 'loading' ? 'Carregando…' : 'Recarregar dados'}
            </button>
            <div className="mt-5 flex justify-between border-t border-[#edf1f6] pt-5 text-[11px]">
              <span className="text-[#8aa0c1]">Cursos na amostra</span>
              <strong className="text-[#00a56e]">{status === 'ready' ? `${regressao.length.toLocaleString('pt-BR')}` : '—'}</strong>
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
                    <p className="mt-1 text-xs text-[#8aa0c1]">Peso da dedicação aos estudos sobre a nota, e métricas de desempenho do modelo.</p>
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold">Dedicação aos estudos × Nota geral</h3>
                      <p className="mt-1 text-xs text-[#8aa0c1]">Cada ponto é um curso; a linha tracejada é a tendência geral (regressão linear)</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#dfe5ee] bg-[#f6f8fb] p-1 text-[11px] font-semibold">
                      <button
                        onClick={() => setVariavelCor('infraestrutura')}
                        className={`rounded-lg px-3 py-1.5 transition ${variavelCor === 'infraestrutura' ? 'bg-white text-[#155eef] shadow-sm' : 'text-[#8aa0c1]'}`}
                      >
                        Infraestrutura (QE_I63)
                      </button>
                      <button
                        onClick={() => setVariavelCor('cotas')}
                        className={`rounded-lg px-3 py-1.5 transition ${variavelCor === 'cotas' ? 'bg-white text-[#155eef] shadow-sm' : 'text-[#8aa0c1]'}`}
                      >
                        Perfil de ingresso (QE_I15)
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-4 h-[340px] border-b border-l border-[#dbe6f7] bg-[linear-gradient(to_top,#f7faff_1px,transparent_1px),linear-gradient(to_right,#f7faff_1px,transparent_1px)] bg-[size:100%_25%,10%_100%]">
                    <div className="absolute bottom-[-26px] left-1/2 -translate-x-1/2 text-[10px] text-[#8aa0c1]">Média de dedicação aos estudos (QE_I23, escala 1–5)</div>
                    <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[#8aa0c1]">Nota geral média (NT_GER)</div>

                    <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line
                        x1={escala(dedicacaoMin, dedicacaoMin, dedicacaoMax)}
                        y1={100 - escala(reta.a + reta.b * dedicacaoMin, notaMin, notaMax)}
                        x2={escala(dedicacaoMax, dedicacaoMin, dedicacaoMax)}
                        y2={100 - escala(reta.a + reta.b * dedicacaoMax, notaMin, notaMax)}
                        stroke="#2b2d42"
                        strokeWidth="1"
                        strokeDasharray="3 2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    {pontosScatter.map(({ dados: d, categoria, cor }, index) => (
                      <span
                        key={`${d.CO_CURSO}-${index}`}
                        className="absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-white/70"
                        style={{
                          left: `${clamp(escala(d.QE_I23_ordinal, dedicacaoMin, dedicacaoMax), 1, 99)}%`,
                          bottom: `${clamp(escala(d.NT_GER, notaMin, notaMax), 1, 99)}%`,
                          backgroundColor: cor,
                        }}
                        title={`Curso ${d.CO_CURSO}: dedicação ${d.QE_I23_ordinal.toFixed(1)}, nota ${d.NT_GER.toFixed(1)} — ${categoria}`}
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex gap-5 text-[11px] text-[#607494]">
                    {Object.entries(CORES_CATEGORIA[variavelCor]).map(([categoria, cor]) => (
                      <span key={categoria} className="flex items-center gap-1.5">
                        <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                        {categoria}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Importância global (SHAP)</h3>
                      <p className="mt-1 text-xs text-[#8aa0c1]">Impacto médio absoluto de cada fator na nota prevista</p>
                    </div>
                    <Sparkles className="size-4 text-[#155eef]" />
                  </div>

                  {!shapDisponivel && (
                    <p className="mt-4 rounded-lg bg-[#f6f8fb] px-3 py-4 text-center text-xs text-[#8aa0c1]">
                      Ainda não disponível — o pipeline de treino precisa persistir os valores SHAP numa tabela (ver instruções de backend).
                    </p>
                  )}

                  {shapDisponivel && shapOrdenado.length > 0 && (
                    <div className="mt-5 flex flex-col gap-3">
                      {shapOrdenado.map((s) => (
                        <div key={s.feature}>
                          <div className="flex justify-between text-[11px] text-[#536987]">
                            <span>{LABELS_FEATURE[s.feature] ?? s.feature}</span>
                            <strong>{s.importancia_media.toFixed(2)}</strong>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-[#edf2f8]">
                            <div className="h-full rounded-full bg-[#2463eb]" style={{ width: `${(s.importancia_media / maiorShap) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'Clusters' && <ClustersTab clusters={clusters} />}

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

function ClustersTab({ clusters }: { clusters: ClusterRow[] }) {
  const idsUnicos = useMemo(
    () => Array.from(new Set(clusters.map((c) => c.Cluster_ID))).sort((a, b) => a - b),
    [clusters],
  )
  const pontos = amostrar(clusters, 500)

  return (
    <div className="py-6">
      <h2 className="text-lg font-bold">Agrupamento de perfis (K-Means)</h2>
      <p className="mt-1 text-xs text-[#8aa0c1]">Projeção PCA dos {clusters.length.toLocaleString('pt-BR')} cursos, coloridos por cluster.</p>
      <div className="relative mt-5 h-[400px] rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
        {pontos.map((c, index) => (
          <span
            key={`${c.CO_CURSO}-${index}`}
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
            style={{
              left: `${scalePca(c.PCA_X, clusters, 'PCA_X')}%`,
              top: `${scalePca(c.PCA_Y, clusters, 'PCA_Y')}%`,
              backgroundColor: CLUSTER_PALETTE[c.Cluster_ID % CLUSTER_PALETTE.length],
            }}
            title={`Curso ${c.CO_CURSO} — cluster ${c.Cluster_ID}`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-5 text-xs text-[#607494]">
        {idsUnicos.map((id) => (
          <span key={id} className="flex items-center gap-1.5">
            <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CLUSTER_PALETTE[id % CLUSTER_PALETTE.length] }} />
            Cluster {id}
          </span>
        ))}
      </div>
    </div>
  )
}

function LayersIcon() {
  return <span className="inline-flex size-4 items-center justify-center text-[12px]">▱</span>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function escala(valor: number, min: number, max: number) {
  if (max === min) return 50
  return ((valor - min) / (max - min)) * 100
}

// Classifica cada curso em uma das duas categorias, replicando a lógica de
// preparar_dados_plotagem() do modelo_regressao.py.
function classificar(d: RegressaoRow, variavel: VariavelCor): { categoria: string; cor: string } {
  if (variavel === 'infraestrutura') {
    const categoria = d.QE_I63 >= 4.0 ? 'Adequada/Excelente' : 'Regular/Insuficiente'
    return { categoria, cor: CORES_CATEGORIA.infraestrutura[categoria] }
  }
  const categoria = d.QE_I15_A >= 0.5 ? 'Maioria Ampla Concorr.' : 'Maioria Cotistas'
  return { categoria, cor: CORES_CATEGORIA.cotas[categoria] }
}

// Regressão linear simples (mínimos quadrados), equivalente ao sns.regplot do Python.
function regressaoLinear(pontos: { x: number; y: number }[]): { a: number; b: number } {
  const n = pontos.length
  if (n === 0) return { a: 0, b: 0 }
  const mediaX = pontos.reduce((s, p) => s + p.x, 0) / n
  const mediaY = pontos.reduce((s, p) => s + p.y, 0) / n
  let num = 0
  let den = 0
  for (const p of pontos) {
    num += (p.x - mediaX) * (p.y - mediaY)
    den += (p.x - mediaX) ** 2
  }
  const b = den === 0 ? 0 : num / den
  const a = mediaY - b * mediaX
  return { a, b }
}

// Reduz um array grande para no máximo `n` itens, distribuídos uniformemente.
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