'use client'

import { useState } from 'react'

import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { RankingIES } from '@/app/enade-time/_components/tables/RankingIES'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { useResumoIES } from '@/lib/enade-time/hooks/useAnalises'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import { campo, rotulo } from '@/lib/enade-time/ui'

export default function EnadePorIES() {
  const { filtros } = useFiltrosUrl()
  const [limit, setLimit] = useState(20)
  const [minCursos, setMinCursos] = useState(1)

  const q = useResumoIES(filtros, limit, minCursos)

  return (
    <Card>
      <CardHeader
        title="Ranking de IES"
        description="IES ordenadas por Nota Geral (NT GER), com filtro mínimo de cursos para reduzir ruído de amostras pequenas."
        action={
          <div className="flex items-end gap-3">
            <label className={rotulo}>
              Top N
              <select
                className={`${campo} mt-1`}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className={rotulo}>
              Mín. cursos
              <select
                className={`${campo} mt-1`}
                value={minCursos}
                onChange={(e) => setMinCursos(Number(e.target.value))}
              >
                {[1, 2, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      />
      <QueryBoundary query={q} isEmpty={(d) => d.length === 0}>
        {(rows) => <RankingIES items={rows} />}
      </QueryBoundary>
    </Card>
  )
}
