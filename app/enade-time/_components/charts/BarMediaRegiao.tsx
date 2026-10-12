'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE } from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import type { ResumoRegiao } from '@/lib/enade-time/types'

export function BarMediaRegiao({ data }: { data: ResumoRegiao[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        title="Média da Nota Geral e total de registros por região"
      >
        <CartesianGrid yAxisId="left" strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="nome" {...EIXO} />
        <YAxis yAxisId="left" domain={[0, 100]} {...EIXO} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...EIXO}
          tick={{ fontSize: 11, fill: '#64748b' }}
        />
        <Tooltip
          // Duas séries com unidades diferentes: o formato depende do nome da série.
          formatter={(valor, nome) =>
            typeof valor !== 'number'
              ? String(valor ?? '')
              : nome === 'Total de registros'
                ? formatInt(valor)
                : formatDecimal(valor, 2)
          }
          contentStyle={TOOLTIP_STYLE}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="left"
          dataKey="media_geral_ger"
          name="Média NT GER"
          fill={CHART_COLORS.paralelo}
        />
        <Bar
          yAxisId="right"
          dataKey="total_registros"
          name="Total de registros"
          fill={CHART_COLORS.neutral}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
