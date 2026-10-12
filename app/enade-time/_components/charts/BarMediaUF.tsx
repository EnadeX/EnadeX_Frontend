'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatDecimal } from '@/lib/enade-time/format'
import type { ResumoUF } from '@/lib/enade-time/types'

export function BarMediaUF({ data }: { data: ResumoUF[] }) {
  const sorted = [...data].sort((a, b) => (b.media_geral_ger ?? 0) - (a.media_geral_ger ?? 0))

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, sorted.length * 28)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 0, left: 12 }}
        title="Média da Nota Geral por UF"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis type="number" domain={[0, 100]} {...EIXO} />
        <YAxis type="category" dataKey="sigla" width={50} {...EIXO} />
        <Tooltip
          formatter={fmtTooltip((v) => formatDecimal(v, 2))}
          labelFormatter={(l, payload) => payload?.[0]?.payload?.nome ?? String(l)}
          contentStyle={TOOLTIP_STYLE}
        />
        <Bar dataKey="media_geral_ger" name="Média NT GER" fill={CHART_COLORS.paralelo} />
      </BarChart>
    </ResponsiveContainer>
  )
}
