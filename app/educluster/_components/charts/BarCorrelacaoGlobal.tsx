'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, TOOLTIP_STYLE, corDivergente, fmtTooltip } from '@/lib/educluster/chart'
import { formatSinal } from '@/lib/educluster/format'

export function BarCorrelacaoGlobal({ dados }: { dados: { rotulo: string; valor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
        <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" domain={[-0.3, 0.3]} ticks={[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3]} {...EIXO} tickFormatter={(v: number) => formatSinal(v, 1)} />
        <YAxis type="category" dataKey="rotulo" {...EIXO} width={64} />
        <ReferenceLine x={0} stroke="var(--border-control)" />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtTooltip((v) => formatSinal(v, 3))} />
        <Bar dataKey="valor" name="Correlação" radius={4} barSize={18} isAnimationActive={false}>
          {dados.map((d) => (
            <Cell key={d.rotulo} fill={corDivergente(d.valor, 0.3)} />
          ))}
          <LabelList
            dataKey="valor"
            position="right"
            formatter={(v: unknown) => (typeof v === 'number' ? formatSinal(v, 3) : '')}
            style={{ fontSize: 11, fill: 'var(--ink)' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
