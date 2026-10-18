'use client'

import { useMemo } from 'react'
import { type ClusterRow } from '@/lib/multienade/api'
import { CLUSTER_PALETTE, DEF_VARIAVEIS } from '@/lib/multienade/constants'
import { amostrar, scalePca } from '@/lib/multienade/utils'
import { VariaveisInfo } from './VariaveisInfo'

export function ClustersTab({ clusters }: { clusters: ClusterRow[] }) {
  // Um item de legenda por cluster, com o nome calculado pelo backend (ranking de nota média).
  const grupos = useMemo(() => {
    const porId = new Map<number, { id: number; nome: string; n: number }>()
    for (const c of clusters) {
      const g = porId.get(c.Cluster_ID) ?? { id: c.Cluster_ID, nome: c.Cluster_Nome, n: 0 }
      g.n++
      porId.set(c.Cluster_ID, g)
    }
    return [...porId.values()].sort((a, b) => a.id - b.id)
  }, [clusters])
  const pontos = amostrar(clusters, 500)

  return (
    <div className="py-6">
      <h2 className="text-h2 text-ink">Agrupamento de perfis (K-Means)</h2>
      <p className="mt-1 text-small text-ink-muted">Projeção PCA dos {clusters.length.toLocaleString('pt-BR')} cursos, coloridos por grupo. A nota não entra no agrupamento: só dá nome aos grupos depois de formados.</p>
      <div className="relative mt-5 h-[400px] rounded-marca-md border border-border bg-surface-card p-4 shadow-marca">
        {pontos.map((c, index) => (
          <span
            key={`${c.CO_CURSO}-${index}`}
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-surface-card/70"
            style={{
              left: `${scalePca(c.PCA_X, clusters, 'PCA_X')}%`,
              top: `${scalePca(c.PCA_Y, clusters, 'PCA_Y')}%`,
              backgroundColor: CLUSTER_PALETTE[c.Cluster_ID % CLUSTER_PALETTE.length],
            }}
            title={`Curso ${c.CO_CURSO} — cluster ${c.Cluster_ID}${c.Cluster_Nome ? ` (${c.Cluster_Nome})` : ''}`}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-5 text-small text-ink-muted">
          {grupos.map(({ id, nome, n }) => (
            <span key={id} className="flex items-center gap-1.5">
              <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CLUSTER_PALETTE[id % CLUSTER_PALETTE.length] }} />
              {nome || `Cluster ${id}`} <span className="num">({n.toLocaleString('pt-BR')})</span>
            </span>
          ))}
        </div>
        <VariaveisInfo itens={[DEF_VARIAVEIS.QE_I63, DEF_VARIAVEIS.QE_I15, DEF_VARIAVEIS.QE_I11, DEF_VARIAVEIS.NT_GER]} />
      </div>
    </div>
  )
}
