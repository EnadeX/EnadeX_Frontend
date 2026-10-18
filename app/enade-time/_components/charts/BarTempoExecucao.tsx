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

import type { SerieBenchmark } from '@/lib/enade-time/benchmark'
import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/enade-time/chart'
import { CHART_COLORS } from '@/lib/enade-time/constants'
import { formatSeconds } from '@/lib/enade-time/format'

function corDaSerie(s: SerieBenchmark): string {
  if (s.modo === 'sequencial') return CHART_COLORS.seq
  return s.ordem_submissao === 'crescente' ? CHART_COLORS.paralelo2 : CHART_COLORS.paralelo
}

export function BarTempoExecucao({ data }: { data: SerieBenchmark[] }) {
  const chart = data.map((s) => ({
    label: s.label,
    tempo: s.tempo,
    erro: s.tempo_erro ?? undefined,
    cor: corDaSerie(s),
  }))
  const temErro = chart.some((c) => c.erro !== undefined)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chart}
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        title="Tempo total de execução por configuração"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey="label" interval={0} angle={-30} textAnchor="end" height={64} {...EIXO} />
        <YAxis {...EIXO} />
        <Tooltip formatter={fmtTooltip(formatSeconds)} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="tempo" name={temErro ? 'Tempo (mediana; barra = mín–máx)' : 'Tempo total'}>
          {chart.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
          {temErro && <ErrorBar dataKey="erro" width={6} strokeWidth={1.5} stroke="var(--ink)" />}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
