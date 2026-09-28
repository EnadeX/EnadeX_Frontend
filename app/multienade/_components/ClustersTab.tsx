'use client'

import { useMemo } from 'react'
import { type ClusterRow } from '@/lib/multienade/api'
import { CLUSTER_PALETTE, DEF_VARIAVEIS } from '@/lib/multienade/constants'
import { amostrar, scalePca } from '@/lib/multienade/utils'
import { VariaveisInfo } from './VariaveisInfo'

export function ClustersTab({ clusters }: { clusters: ClusterRow[] }) {
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
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-5 text-xs text-[#607494]">
          {idsUnicos.map((id) => (
            <span key={id} className="flex items-center gap-1.5">
              <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: CLUSTER_PALETTE[id % CLUSTER_PALETTE.length] }} />
              Cluster {id}
            </span>
          ))}
        </div>
        <VariaveisInfo itens={[DEF_VARIAVEIS.NT_GER, DEF_VARIAVEIS.QE_I63, DEF_VARIAVEIS.QE_I15]} />
      </div>
    </div>
  )
}
