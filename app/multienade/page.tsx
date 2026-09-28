'use client'

import { BarChart3, Database, Network, Sparkles } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import {
  type RegressaoRow,
  type ClusterRow,
  type AssociacaoRow,
  type ShapRow,
  getRelatorioRegressao,
  getRelatorioCluster,
  getRelatorioAssociacao,
  getRelatorioShap,
} from '@/lib/multienade/api'
import { DICIONARIO_TABELAS, TOPICOS, type Topico } from '@/lib/multienade/constants'
import { SupervisionadaTab } from './_components/SupervisionadaTab'
import { ClustersTab } from './_components/ClustersTab'
import { AssociacaoTab } from './_components/AssociacaoTab'
import { DatasetSection } from './_components/DatasetSection'
import { MetodologiaSection } from './_components/MetodologiaSection'

const ICONE_TOPICO: Record<Topico, ReactNode> = {
  regressao: <Sparkles className="size-4" />,
  clusters: <Network className="size-4" />,
  associacao: <LayersIcon />,
}

export default function MultiEnadePage() {
  const [topico, setTopico] = useState<Topico>('regressao')

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
          <div className="flex items-center gap-5 text-xs text-[#607494]">
            <span>Cursos na amostra: <strong className="text-[#2d4263]">{status === 'ready' ? regressao.length.toLocaleString('pt-BR') : '—'}</strong></span>
            <span className="flex items-center gap-2"><Database className="size-4 text-[#89a1c5]" /> Dataset: <strong className="text-[#2d4263]">ENADE 2021</strong></span>
          </div>
        </section>

        {status === 'error' && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os dados da API ({erro}). Confira se o backend está rodando em <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}</code>.
          </div>
        )}

        {/* Menu único: controla o gráfico, a tabela do dataset e a metodologia ao mesmo tempo */}
        <div className="mt-8 flex w-fit items-center gap-1 rounded-xl border border-[#dfe5ee] bg-[#f6f8fb] p-1 text-[11px] font-semibold">
          {TOPICOS.map((chave) => (
            <button
              key={chave}
              onClick={() => setTopico(chave)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${topico === chave ? 'bg-white text-[#155eef] shadow-sm' : 'text-[#8aa0c1]'}`}
            >
              {ICONE_TOPICO[chave]}
              {DICIONARIO_TABELAS[chave].titulo}
            </button>
          ))}
        </div>

        <section id="analysis" className="mt-2 min-w-0">
          {topico === 'regressao' && (
            <SupervisionadaTab
              regressao={regressao}
              shap={shap}
              shapDisponivel={shapDisponivel}
              status={status}
              onAtualizar={carregarBase}
            />
          )}
          {topico === 'clusters' && <ClustersTab clusters={clusters} />}
          {topico === 'associacao' && <AssociacaoTab associacao={associacao} />}
        </section>

        <DatasetSection topico={topico} regressao={regressao} clusters={clusters} associacao={associacao} />

        <MetodologiaSection topico={topico} />
      </div>
    </main>
  )
}

function LayersIcon() {
  return <span className="inline-flex size-4 items-center justify-center text-[12px]">▱</span>
}
