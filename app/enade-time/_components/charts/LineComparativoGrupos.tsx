'use client'

import {
  CartesianGrid,
  Legend,
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

export function LineComparativoGrupos({
  serieA,
  serieB,
  labelA,
  labelB,
}: {
  serieA: ResumoAnual[]
  serieB: ResumoAnual[]
  labelA: string
  labelB: string
}) {
  const anos = Array.from(
    new Set([...serieA.map((p) => p.nu_ano), ...serieB.map((p) => p.nu_ano)]),
  ).sort((a, b) => a - b)

  const idxA = new Map(serieA.map((p) => [p.nu_ano, p.media_geral_ger]))
  const idxB = new Map(serieB.map((p) => [p.nu_ano, p.media_geral_ger]))

  const data = anos.map((nu_ano) => ({
    nu_ano,
    ger_a: idxA.get(nu_ano) ?? null,
    ger_b: idxB.get(nu_ano) ?? null,
  }))

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 24, bottom: 0, left: 0 }}
        title={`Média da Nota Geral por ano: ${labelA} e ${labelB}`}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="nu_ano" {...EIXO} />
        <YAxis domain={[0, 100]} {...EIXO} />
        <Tooltip
          formatter={fmtTooltip((v) => formatDecimal(v, 2))}
          labelFormatter={(l) => `Ano ${l}`}
          contentStyle={TOOLTIP_STYLE}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="ger_a"
          name={labelA}
          stroke={CHART_COLORS.paralelo}
          strokeWidth={2.5}
          dot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="ger_b"
          name={labelB}
          stroke={CHART_COLORS.warn}
          strokeWidth={2.5}
          dot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
