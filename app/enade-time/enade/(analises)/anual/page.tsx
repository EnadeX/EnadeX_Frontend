'use client'

import { KpiGrid } from '@/app/enade-time/_components/cards/KpiGrid'
import { MetricCard } from '@/app/enade-time/_components/cards/MetricCard'
import { LineMediaAnual } from '@/app/enade-time/_components/charts/LineMediaAnual'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import { useResumoAnual } from '@/lib/enade-time/hooks/useAnalises'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'

export default function EnadeAnual() {
  const { filtros } = useFiltrosUrl()
  const q = useResumoAnual(filtros)

  return (
    <QueryBoundary
      query={q}
      isEmpty={(d) => d.length === 0}
      emptyTitle="Nenhum registro para os filtros aplicados."
    >
      {(rows) => {
        const total = rows.reduce((acc, r) => acc + r.total_registros, 0)
        const comNota = rows.filter((r) => r.media_geral_ger !== null)
        const mediaGeral =
          comNota.length === 0
            ? null
            : comNota.reduce((acc, r) => acc + (r.media_geral_ger ?? 0), 0) / comNota.length
        const melhor = rows.reduce<(typeof rows)[number] | null>(
          (b, r) =>
            r.media_geral_ger !== null &&
            (b === null || (r.media_geral_ger ?? 0) > (b.media_geral_ger ?? 0))
              ? r
              : b,
          null,
        )
        const pior = rows.reduce<(typeof rows)[number] | null>(
          (b, r) =>
            r.media_geral_ger !== null &&
            (b === null || (r.media_geral_ger ?? 100) < (b.media_geral_ger ?? 100))
              ? r
              : b,
          null,
        )

        return (
          <>
            <KpiGrid>
              <MetricCard label="Registros (filtrado)" value={formatInt(total)} />
              <MetricCard label="Anos no recorte" value={formatInt(rows.length)} />
              <MetricCard label="Média NT GER" value={formatDecimal(mediaGeral, 2)} />
              <MetricCard
                label="Melhor ano"
                value={melhor ? String(melhor.nu_ano) : '—'}
                hint={melhor ? `Média ${formatDecimal(melhor.media_geral_ger, 2)}` : undefined}
              />
            </KpiGrid>
            <Card>
              <CardHeader
                title="Média Nota Geral (NT GER) por ano"
                description="Variação longitudinal das médias da Nota Geral (NT GER) ao longo das edições."
              />
              <LineMediaAnual data={rows} />
              {pior && (
                <p className="mt-2 text-small text-ink-muted">
                  Menor média observada: {pior.nu_ano} ({formatDecimal(pior.media_geral_ger, 2)}).
                </p>
              )}
            </Card>
          </>
        )
      }}
    </QueryBoundary>
  )
}
