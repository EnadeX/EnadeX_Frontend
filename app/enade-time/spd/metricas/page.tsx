'use client'

import { useState } from 'react'

import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { MetricasTable } from '@/app/enade-time/_components/tables/MetricasTable'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { useMetricas } from '@/lib/enade-time/hooks/useBenchmark'

export default function SpdMetricas() {
  const [apenasValidas, setApenasValidas] = useState(true)
  const q = useMetricas(apenasValidas)

  return (
    <Card>
      <CardHeader
        title="Métricas detalhadas (view v_benchmark_metricas)"
        description="Uma linha por execução paralela. Speedup e eficiência são calculados na view — definição única do sistema — pareando cada paralela com o sequencial da própria suíte (badge 'mesma suíte'); execuções antigas, anteriores ao conceito de suíte, usam o sequencial imediatamente anterior no tempo (badge 'temporal'). A coluna Baseline mostra qual execução sequencial foi usada."
        action={
          <label className="flex shrink-0 items-center gap-2 text-small font-medium text-ink-muted">
            <input
              type="checkbox"
              className="size-3.5 accent-accent"
              checked={!apenasValidas}
              onChange={(e) => setApenasValidas(!e.target.checked)}
            />
            Mostrar execuções ocultas
          </label>
        }
      />
      <QueryBoundary query={q} isEmpty={(d) => d.length === 0}>
        {(rows) => <MetricasTable data={rows} />}
      </QueryBoundary>
    </Card>
  )
}
