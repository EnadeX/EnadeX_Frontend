'use client'

import { Database, Network, Sparkles } from 'lucide-react'
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
import { BarraModulo } from '@/components/brand/layout/BarraModulo'
import { badge, foco } from '@/lib/brand/classes'
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
    <main className="min-h-screen bg-surface-page font-marca text-body text-ink">
      <BarraModulo
        nome={<span className="flex flex-col leading-tight"><span className="text-caption font-normal text-ink-on-nav/80">Subprojetos</span><span className="text-h3">MultiENADE</span></span>}
      >
        <nav className="hidden items-center gap-6 text-small text-ink-on-nav/80 md:flex"><a className={`rounded-marca-sm font-medium text-ink-on-nav ${foco}`} href="#analysis">Análise</a><a className={`rounded-marca-sm hover:text-ink-on-nav ${foco}`} href="#dataset">Dataset</a><a className={`rounded-marca-sm hover:text-ink-on-nav ${foco}`} href="#methodology">Metodologia</a></nav>
        <div className="flex items-center gap-3">
          <span className={`hidden rounded-marca-sm border px-3 py-1 text-small font-medium text-ink-on-nav sm:inline-flex ${status === 'ready' ? 'border-success' : status === 'error' ? 'border-danger' : 'border-ink-on-nav/40'}`}>
            {status === 'ready' ? '● Conectado' : status === 'error' ? '● Falha na conexão' : status === 'loading' ? '● Carregando…' : '● Aguardando'}
          </span>
        </div>
      </BarraModulo>

      <div className="px-4 py-8 sm:px-10">
        <div className="mb-5 flex items-center gap-2 text-small text-ink-muted"><a href="/" className={`rounded-marca-sm hover:text-accent ${foco}`}>Home</a><span>/</span><span>Subprojetos</span><span>/</span><span className="text-ink">MultiENADE</span></div>
        <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-9">
          <div>
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-display text-ink">MultiENADE</h1><span className={badge.info}>Descoberta de padrões</span></div>
            <p className="mt-2 text-body text-ink-muted">Descoberta de padrões multidimensionais em microdados do ENADE com apoio de inteligência explicável.</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-small text-ink-muted">
            <span>Cursos na amostra: <strong className="num font-medium text-ink">{status === 'ready' ? regressao.length.toLocaleString('pt-BR') : '—'}</strong></span>
            <span className="flex items-center gap-2"><Database className="size-4 text-ink-muted" /> Dataset: <strong className="font-medium text-ink">ENADE 2021</strong></span>
          </div>
        </section>

        {status === 'error' && (
          <div className="mt-6 rounded-marca-md border border-danger bg-surface-card px-4 py-3 text-body text-danger">
            Não foi possível carregar os dados da API ({erro}). Confira se o backend está rodando em <code className="font-mono">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}</code>.
          </div>
        )}

        {/* Menu único: controla o gráfico, a tabela do dataset e a metodologia ao mesmo tempo */}
        <div className="mt-8 flex w-fit max-w-full flex-wrap items-center gap-1 rounded-marca-md border border-border bg-surface-sunken p-1 text-small font-medium">
          {TOPICOS.map((chave) => (
            <button
              key={chave}
              onClick={() => setTopico(chave)}
              className={`flex cursor-pointer items-center gap-2 rounded-marca-sm px-3.5 py-2 transition-colors ${foco} ${topico === chave ? 'bg-surface-card text-accent shadow-marca' : 'text-ink-muted hover:text-ink'}`}
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
