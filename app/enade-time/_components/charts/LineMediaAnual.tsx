'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatDecimal } from '@/lib/enade-time/format'
import type { ResumoAnual } from '@/lib/enade-time/types'

export function LineMediaAnual({ data }: { data: ResumoAnual[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        title="Média da Nota Geral por ano"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="nu_ano" {...EIXO} />
        <YAxis domain={[0, 100]} {...EIXO} />
        <Tooltip
          formatter={fmtTooltip((v) => formatDecimal(v, 2))}
          labelFormatter={(l) => `Ano ${l}`}
          contentStyle={TOOLTIP_STYLE}
        />
        <Line
          type="monotone"
          dataKey="media_geral_ger"
          name="Média NT GER"
          stroke={CHART_COLORS.paralelo}
          strokeWidth={2.5}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
