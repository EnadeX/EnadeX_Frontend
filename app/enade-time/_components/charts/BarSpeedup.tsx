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

import type { SerieBenchmark } from '@/lib/enade-time/benchmark'
import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatSpeedup } from '@/lib/enade-time/format'

export function BarSpeedup({ data }: { data: SerieBenchmark[] }) {
  const paralelos = data.filter((s) => s.modo === 'paralelo' && s.speedup !== null)
  const chart = paralelos.map((s) => ({
    label: s.label,
    speedup: s.speedup ?? 0,
    erro: s.speedup_erro ?? undefined,
    workers: s.num_workers,
    cor: s.ordem_submissao === 'crescente' ? CHART_COLORS.paralelo2 : CHART_COLORS.paralelo,
  }))
  const temErro = chart.some((c) => c.erro !== undefined)
  const maxIdeal = Math.max(...chart.map((c) => c.workers), 1)
  const maxObs = Math.max(...chart.map((c) => c.speedup + (c.erro?.[1] ?? 0)), 1)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chart}
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        title="Speedup por configuração"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="label" interval={0} angle={-30} textAnchor="end" height={64} {...EIXO} />
        <YAxis domain={[0, Math.max(Math.min(maxIdeal, 8) + 0.5, maxObs + 0.5, 2)]} {...EIXO} />
        <Tooltip formatter={fmtTooltip(formatSpeedup)} contentStyle={TOOLTIP_STYLE} />
        {/* limiar sem ganho (1×); a legenda está na descrição do card */}
        <ReferenceLine y={1} stroke={CHART_COLORS.alert} strokeDasharray="4 4" />
        <Bar dataKey="speedup" name={temErro ? 'Speedup (mediana; barra = mín–máx)' : 'Speedup'}>
          {chart.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
          {temErro && <ErrorBar dataKey="erro" width={6} strokeWidth={1.5} stroke="#0f172a" />}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
