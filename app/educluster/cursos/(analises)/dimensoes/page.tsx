'use client'

import { Trophy } from 'lucide-react'

import { BarCorrelacaoGlobal } from '@/app/educluster/_components/charts/BarCorrelacaoGlobal'
import { QueryBoundary } from '@/app/educluster/_components/feedback/QueryBoundary'
import { Card, CardHeader } from '@/app/educluster/_components/ui/Card'
import { KpiGrid, MetricCard } from '@/app/educluster/_components/ui/MetricCard'
import { Filtros, Selecao } from '@/app/educluster/_components/ui/Selecao'
import { corDivergente, tintaSobre } from '@/lib/educluster/chart'
import { formatInteiro, formatSinal } from '@/lib/educluster/format'
import { useDimensoesDesempenho } from '@/lib/educluster/hooks/useEduCluster'
import { useParametrosUrl } from '@/lib/educluster/hooks/useParametrosUrl'
import { DIMENSOES, ROTULO_DIMENSAO, ROTULO_VARIAVEL, nomeArea } from '@/lib/educluster/rotulos'
import type { AlvoDesempenho } from '@/lib/educluster/types'
import { tabela, tabelaHead, tabelaWrapper, td, tdNum, th, thNum, trLinha } from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

const LIMITE_COR = 0.6

function CelulaCorrelacao({ valor, dominante }: { valor: number; dominante: boolean }) {
  const fundo = corDivergente(valor, LIMITE_COR)
  return (
    <td className="px-2 py-1.5 text-right">
      <span
        className={cn(
          'inline-flex min-w-16 items-center justify-end gap-1 rounded-md px-2 py-1 text-xs tabular-nums',
          dominante ? 'font-bold ring-2 ring-[#111827]/70' : 'font-medium',
        )}
        style={{ backgroundColor: fundo, color: tintaSobre(fundo) }}
      >
        {dominante && <Trophy className="size-3" aria-label="dominante" />}
        {formatSinal(valor, 3)}
      </span>
    </td>
  )
}

export default function DimensoesDesempenho() {
  const { ler, definir } = useParametrosUrl()
  const alvo: AlvoDesempenho = ler('alvo') === 'NT_FG' ? 'NT_FG' : 'NT_CE'
  const consulta = useDimensoesDesempenho(alvo)

  return (
    <div className="space-y-6">
      <Filtros>
        <Selecao
          label="Nota de referência"
          valor={alvo}
          opcoes={[
            { valor: 'NT_CE', rotulo: 'Componente específico (NT_CE)' },
            { valor: 'NT_FG', rotulo: 'Formação geral (NT_FG)' },
          ]}
          onChange={(v) => definir({ alvo: v === 'NT_CE' ? undefined : v })}
        />
      </Filtros>

      <QueryBoundary query={consulta} loadingLabel="Calculando correlações por área…">
        {(dados) => {
          const r = dados.ranking
          const vencedora = DIMENSOES.reduce((melhor, d) =>
            (r.vitorias_por_dimensao[d] ?? 0) > (r.vitorias_por_dimensao[melhor] ?? 0) ? d : melhor,
          )
          const porArea = [...dados.por_area].sort(
            (a, b) => Math.abs(b.correlacao_dominante) - Math.abs(a.correlacao_dominante),
          )
          return (
            <>
              <KpiGrid cols={4}>
                <MetricCard label="Áreas avaliadas" value={formatInteiro(r.areas_avaliadas)} hint="áreas com 30 ou mais cursos na base" />
                {DIMENSOES.map((d) => (
                  <MetricCard
                    key={d}
                    label={`${d}: dominante em`}
                    value={`${formatInteiro(r.vitorias_por_dimensao[d] ?? 0)} áreas`}
                    hint={`correlação média ${formatSinal(r.correlacao_media_entre_areas[d], 3)} · positiva em ${formatInteiro(r.areas_com_correlacao_positiva[d])}`}
                    tom={d === vencedora ? 'destaque' : 'padrao'}
                  />
                ))}
              </KpiGrid>

              <Card>
                <CardHeader
                  title={`Correlação global com ${ROTULO_VARIAVEL[alvo].toLowerCase()}`}
                  description="Pearson entre a média de cada dimensão percebida e a nota média do curso, sobre todos os cursos da base, sem separar por área."
                />
                <BarCorrelacaoGlobal
                  dados={dados.correlacao_global.map((c) => ({ rotulo: c.dimensao, valor: c[alvo] }))}
                />
                <ul className="mt-2 grid gap-1 text-[11px] text-[#5f7393] sm:grid-cols-3">
                  {DIMENSOES.map((d) => (
                    <li key={d}>
                      <strong className="text-[#334155]">{d}</strong>: {ROTULO_DIMENSAO[d]}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <CardHeader
                  title="Correlação dentro de cada área"
                  description="Controla o confundidor de área: a correlação é calculada só entre cursos da mesma área. Azul é associação positiva, vermelho negativa; a moldura e o troféu marcam a dimensão de maior valor absoluto. Ordenado pela força da dimensão dominante."
                />
                <div className={tabelaWrapper}>
                  <table className={tabela}>
                    <thead className={tabelaHead}>
                      <tr>
                        <th className={th}>Área</th>
                        <th className={thNum}>Cursos</th>
                        {DIMENSOES.map((d) => (
                          <th key={d} className={thNum}>
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {porArea.map((a) => (
                        <tr key={a.area} className={trLinha}>
                          <td className={td}>
                            <span className="text-sm">{nomeArea(a.area)}</span>
                            <span className="ml-2 text-[11px] text-[#94a3b8]">{a.area}</span>
                          </td>
                          <td className={tdNum}>{formatInteiro(a.cursos)}</td>
                          {DIMENSOES.map((d) => (
                            <CelulaCorrelacao key={d} valor={a[d]} dominante={a.dimensao_dominante === d} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )
        }}
      </QueryBoundary>
    </div>
  )
}
