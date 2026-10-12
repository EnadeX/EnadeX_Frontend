'use client'

import { BarMediaUF } from '@/app/enade-time/_components/charts/BarMediaUF'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import { useResumoUF } from '@/lib/enade-time/hooks/useAnalises'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import { tabela, tabelaHead, td, th, trLinha } from '@/lib/enade-time/ui'

export default function EnadePorUF() {
  const { filtros } = useFiltrosUrl()
  const q = useResumoUF(filtros)

  return (
    <QueryBoundary query={q} isEmpty={(d) => d.length === 0}>
      {(rows) => (
        <>
          <Card>
            <CardHeader
              title="Média Nota Geral por UF"
              description="Ranking horizontal de médias da Nota Geral (NT GER) por unidade federativa (escala 0–100). Use o filtro de região para focar."
            />
            <BarMediaUF data={rows} />
          </Card>

          <Card>
            <CardHeader title="Detalhamento por UF" />
            <div className="overflow-x-auto">
              <table className={tabela}>
                <thead className={tabelaHead}>
                  <tr>
                    <th className={`${th} text-left`}>UF</th>
                    <th className={`${th} text-left`}>Nome</th>
                    <th className={`${th} text-right`}>Região</th>
                    <th className={`${th} text-right`}>Registros</th>
                    <th className={`${th} text-right`}>Média FG</th>
                    <th className={`${th} text-right`}>Mínima FG</th>
                    <th className={`${th} text-right`}>Máxima FG</th>
                    <th className={`${th} text-right`}>Desvio FG</th>
                    <th className={`${th} text-right`}>Média CE</th>
                    <th className={`${th} text-right`}>Média GER</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.co_uf} className={trLinha}>
                      <td className={`${td} font-medium`}>{u.sigla}</td>
                      <td className={td}>{u.nome}</td>
                      <td className={`${td} text-right`}>{u.co_regiao}</td>
                      <td className={`${td} text-right`}>{formatInt(u.total_registros)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(u.media_geral, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(u.media_min, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(u.media_max, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(u.desvio_padrao, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(u.media_geral_ce, 2)}</td>
                      <td className={`${td} text-right`}>{formatDecimal(u.media_geral_ger, 2)}</td>
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
