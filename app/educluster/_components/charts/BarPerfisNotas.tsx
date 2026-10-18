'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE, corSerie, fmtTooltip } from '@/lib/educluster/chart'
import { formatDecimal } from '@/lib/educluster/format'

export interface SeriePerfil {
  id: number
  rotulo: string
  valores: Record<string, number>
}

export function BarPerfisNotas({
  variaveis,
  series,
  altura = 280,
}: {
  variaveis: { chave: string; rotulo: string }[]
  series: SeriePerfil[]
  altura?: number
}) {
  const linhas = variaveis.map((v) => {
    const linha: Record<string, string | number> = { variavel: v.rotulo }
    for (const s of series) linha[`s${s.id}`] = s.valores[v.chave] ?? 0
    return linha
  })

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={linhas} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="24%" barGap={2}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="variavel" {...EIXO} />
        <YAxis {...EIXO} width={36} domain={[0, 'auto']} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtTooltip((v) => formatDecimal(v, 2))} cursor={{ fill: '#f1f5f9' }} />
        {series.map((s) => (
          <Bar
            key={s.id}
            dataKey={`s${s.id}`}
            name={s.rotulo}
            fill={corSerie(s.id)}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
