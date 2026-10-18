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

import { EIXO, GRID_COLOR, TOOLTIP_STYLE } from '@/lib/educluster/chart'
import { formatDecimal, formatInteiro } from '@/lib/educluster/format'

interface Linha {
  dificuldade_percebida: number
  size: number
  mean: number
}

export function LineNotaDificuldade({ dados }: { dados: Linha[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={dados} margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} />
        <XAxis
          dataKey="dificuldade_percebida"
          type="number"
          domain={[1, 5]}
          ticks={[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]}
          {...EIXO}
          tickFormatter={(v: number) => formatDecimal(v, 1)}
          label={{ value: 'Dificuldade percebida (1 muito fácil, 5 muito difícil)', position: 'insideBottom', offset: -14, fontSize: 11, fill: 'var(--ink-muted)' }}
        />
        <YAxis {...EIXO} width={40} domain={[25, 50]} ticks={[25, 30, 35, 40, 45, 50]} tickFormatter={(v: number) => formatDecimal(v, 0)} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={(l: unknown) => `Dificuldade ${typeof l === 'number' ? formatDecimal(l, 1) : String(l)}`}
          formatter={(valor: unknown, _nome: unknown, item: { payload?: Linha }) => [
            `${typeof valor === 'number' ? formatDecimal(valor, 2) : String(valor)} (${formatInteiro(item.payload?.size)} estudantes)`,
            'Nota geral média',
          ]}
        />
        <Line
          type="linear"
          dataKey="mean"
          name="Nota geral média"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--series-1)', stroke: 'var(--surface-card)', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
