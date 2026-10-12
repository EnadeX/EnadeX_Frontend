'use client'

import { BarMediaRegiao } from '@/app/enade-time/_components/charts/BarMediaRegiao'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import { useResumoRegiao } from '@/lib/enade-time/hooks/useAnalises'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import { tabela, tabelaHead, td, th, trLinha } from '@/lib/enade-time/ui'

export default function EnadeRegional() {
  const { filtros } = useFiltrosUrl()
  const q = useResumoRegiao(filtros)

  return (
    <QueryBoundary query={q} isEmpty={(d) => d.length === 0}>
      {(rows) => (
        <>
          <Card>
            <CardHeader
              title="Média Nota Geral por região"
              description="Comparação Norte vs. Nordeste — médias da Nota Geral (NT GER) e volume de registros."
            />
            <BarMediaRegiao data={rows} />
          </Card>
          <Card>
            <CardHeader title="Detalhamento por região" />
            <div className="overflow-x-auto">
              <table className={tabela}>
                <thead className={tabelaHead}>
                  <tr>
                    <th className={`${th} text-left`}>Região</th>
                    <th className={`${th} text-right`}>Registros</th>
                    <th className={`${th} text-right`}>Média FG</th>
                    <th className={`${th} text-right`}>Mínima FG</th>
                    <th className={`${th} text-right`}>Máxima FG</th>
                    <th className={`${th} text-right`}>Desvio-padrão FG</th>
                    <th className={`${th} text-right`}>Média CE</th>
                    <th className={`${th} text-right`}>Média GER</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.co_regiao} className={trLinha}>
                      <td className={`${td} font-medium`}>{r.nome}</td>
                      <td className={`${td} text-right`}>{formatInt(r.total_registros)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(r.media_geral, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(r.media_min, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(r.media_max, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(r.desvio_padrao, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(r.media_geral_ce, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(r.media_geral_ger, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </QueryBoundary>
  )
}
