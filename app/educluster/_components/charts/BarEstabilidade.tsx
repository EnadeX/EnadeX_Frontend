'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE } from '@/lib/educluster/chart'
import { formatDecimal } from '@/lib/educluster/format'
import type { Estabilidade } from '@/lib/educluster/types'

export function BarEstabilidade({ dados, kAtual }: { dados: Estabilidade[]; kAtual: number }) {
  const linhas = dados.map((d) => ({ ...d, rotulo: `k = ${d.k}`, erro: d.ari_desvio }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={linhas} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="rotulo" {...EIXO} />
        <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 0.9, 1]} {...EIXO} width={40} tickFormatter={(v: number) => formatDecimal(v, 2)} />
        <ReferenceLine y={0.9} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'muito estável', position: 'insideTopRight', fontSize: 10, fill: '#64748b' }} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(valor: unknown, _nome: unknown, item: { payload?: Estabilidade }) => {
            const p = item.payload
            if (!p) return [String(valor), 'ARI médio']
            return [
              `${formatDecimal(p.ari_medio, 3)} (desvio ${formatDecimal(p.ari_desvio, 3)}, mínimo ${formatDecimal(p.ari_minimo, 3)})`,
              'ARI médio',
            ]
          }}
        />
        <Bar dataKey="ari_medio" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {linhas.map((d) => (
            <Cell key={d.k} fill={d.k === kAtual ? '#0f766e' : '#99d5cd'} />
          ))}
          <ErrorBar dataKey="erro" width={6} stroke="#334155" strokeWidth={1} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
