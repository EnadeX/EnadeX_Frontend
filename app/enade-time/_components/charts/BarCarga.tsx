'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/enade-time/chart'
import { ROTULO_CURTO, ehControle, ordenarResumo } from '@/lib/enade-time/carga'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatSeconds } from '@/lib/enade-time/format'
import type { ResumoCarga } from '@/lib/enade-time/types'

// Mediana do tempo de carga por estratégia; a barra de erro vai do mínimo ao máximo das repetições.
export function BarCarga({ data }: { data: ResumoCarga[] }) {
  const chart = ordenarResumo(data).map((r) => ({
    label: ROTULO_CURTO[r.estrategia] ?? r.estrategia,
    tempo: r.tempo_mediana,
    erro: [
      Math.max(0, r.tempo_mediana - r.tempo_min),
      Math.max(0, r.tempo_max - r.tempo_mediana),
    ] as [number, number],
    cor: ehControle(r.estrategia)
      ? CHART_COLORS.seq
      : r.estrategia === 'copy_local'
        ? CHART_COLORS.paralelo
        : r.estrategia === 'upsert_postgrest'
          ? CHART_COLORS.warn
          : CHART_COLORS.paralelo2,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, chart.length * 46)}>
      <BarChart
        data={chart}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        title="Custo de publicação por estratégia: mediana e variação entre repetições"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis type="number" domain={[0, 'auto']} {...EIXO} tickFormatter={(v) => `${v} s`} />
        <YAxis type="category" dataKey="label" width={150} {...EIXO} />
        <Tooltip formatter={fmtTooltip(formatSeconds)} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="tempo" name="Mediana (barra = mín–máx)">
          {chart.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
          <ErrorBar dataKey="erro" width={6} strokeWidth={1.5} stroke="var(--ink)" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
