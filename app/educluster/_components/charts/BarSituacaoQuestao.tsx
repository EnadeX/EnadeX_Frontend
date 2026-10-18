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

import { EIXO, GRID_COLOR, TOOLTIP_STYLE, fmtTooltip } from '@/lib/educluster/chart'
import { formatPercentualDireto } from '@/lib/educluster/format'
import { QUESTOES, ROTULO_QUESTAO, ROTULO_SITUACAO } from '@/lib/educluster/rotulos'
import type { SituacaoDiscursiva, SituacaoPorQuestao } from '@/lib/educluster/types'

const ORDEM: SituacaoDiscursiva[] = ['em_branco', 'divergente_do_tema', 'resposta_nula']

const COR: Record<SituacaoDiscursiva, string> = {
  em_branco: '#2a78d6',
  divergente_do_tema: '#eb6834',
  resposta_nula: '#4a3aa7',
  valida: '#cbd5e1',
}

export function BarSituacaoQuestao({ dados }: { dados: SituacaoPorQuestao[] }) {
  const linhas = QUESTOES.map((questao) => {
    const linha: Record<string, string | number> = { questao: ROTULO_QUESTAO[questao] ?? questao }
    for (const situacao of ORDEM) {
      linha[situacao] = dados.find((d) => d.questao === questao && d.situacao === situacao)?.percentual ?? 0
    }
    return linha
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={linhas} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="questao" {...EIXO} />
        <YAxis {...EIXO} width={44} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtTooltip((v) => formatPercentualDireto(v, 1))} />
        <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
        {ORDEM.map((situacao, i) => (
          <Bar
            key={situacao}
            dataKey={situacao}
            name={ROTULO_SITUACAO[situacao]}
            stackId="abandono"
            fill={COR[situacao]}
            stroke="#ffffff"
            strokeWidth={1}
            radius={i === ORDEM.length - 1 ? [4, 4, 0, 0] : 0}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
