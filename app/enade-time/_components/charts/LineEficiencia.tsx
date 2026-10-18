'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ROTULO_ORDEM, type SerieBenchmark } from '@/lib/enade-time/benchmark'
import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatPercent } from '@/lib/enade-time/format'
import type { OrdemSubmissao } from '@/lib/enade-time/types'

/**
 * Eficiência por número de workers. Uma linha por ordem de submissão
 * (LPT × crescente) quando a campanha mediu as duas; no banco legado todas as
 * paralelas são `crescente` (única ordem que o script 09 conhecia).
 */
export function LineEficiencia({ data }: { data: SerieBenchmark[] }) {
  const paralelos = data.filter((s) => s.modo === 'paralelo' && s.eficiencia !== null)
  const ordens = (['lpt', 'crescente'] as OrdemSubmissao[]).filter((o) =>
    paralelos.some((s) => (s.ordem_submissao ?? 'crescente') === o),
  )
  const workers = Array.from(new Set(paralelos.map((s) => s.num_workers))).sort((a, b) => a - b)

  // Uma linha por (workers); colunas = eficiência de cada ordem.
  const chart = workers.map((w) => {
    const row: Record<string, number | null> = { workers: w }
    for (const o of ordens) {
      const s = paralelos.find(
        (p) => p.num_workers === w && (p.ordem_submissao ?? 'crescente') === o,
      )
      row[o] = s?.eficiencia ?? null
    }
    return row
  })

  const cor: Record<OrdemSubmissao, string> = {
    lpt: CHART_COLORS.paralelo,
    crescente: CHART_COLORS.paralelo2,
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chart}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        title="Eficiência por número de workers"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis
          dataKey="workers"
          type="number"
          domain={['dataMin', 'dataMax']}
          ticks={workers}
          {...EIXO}
          label={{
            value: 'Número de workers',
            position: 'insideBottom',
            offset: -2,
            fontSize: 11,
            fill: 'var(--ink-muted)',
          }}
        />
        <YAxis domain={[0, 1.1]} tickFormatter={(v) => formatPercent(v)} {...EIXO} />
        <Tooltip formatter={fmtTooltip(formatPercent)} contentStyle={TOOLTIP_STYLE} />
        {ordens.length > 1 && <Legend />}
        <ReferenceLine
          y={1}
          stroke={CHART_COLORS.ideal}
          strokeDasharray="4 4"
          label={{
            value: 'ideal (100%)',
            position: 'insideTopRight',
            fontSize: 10,
            fill: CHART_COLORS.ideal,
          }}
        />
        {ordens.map((o) => (
          <Line
            key={o}
            type="monotone"
            dataKey={o}
            name={`Eficiência (${ROTULO_ORDEM[o]})`}
            stroke={cor[o]}
            strokeWidth={2.5}
            dot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
