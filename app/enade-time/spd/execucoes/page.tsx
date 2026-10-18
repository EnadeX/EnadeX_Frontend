'use client'

import { useState } from 'react'

import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { ExecucoesTable } from '@/app/enade-time/_components/tables/ExecucoesTable'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { useExecucoes } from '@/lib/enade-time/hooks/useBenchmark'

export default function SpdExecucoes() {
  const [apenasValidas, setApenasValidas] = useState(true)
  const q = useExecucoes(apenasValidas)

  return (
    <Card>
      <CardHeader
        title="Execuções de benchmark (histórico completo)"
        description="Cada linha é uma execução completa do pipeline ETL. Execuções de uma campanha trazem campanha, suíte, ordem de submissão, CPU média do sistema, bytes lidos do disco e a condição de cache; as marcadas 'oficial' compõem a campanha exibida no Comparativo. Rodadas antigas (sem campanha) permanecem no banco como histórico. Execuções listadas em BENCHMARK_IDS_EXCLUIR ficam ocultas por padrão."
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
        {(rows) => <ExecucoesTable data={rows} />}
      </QueryBoundary>
    </Card>
  )
}
