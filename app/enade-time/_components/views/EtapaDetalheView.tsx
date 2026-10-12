'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { BarEtapasAno } from '@/app/enade-time/_components/charts/BarEtapasAno'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { EtapasTable } from '@/app/enade-time/_components/tables/EtapasTable'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { formatDecimal, formatInt, formatSeconds, formatThroughput } from '@/lib/enade-time/format'
import { useEtapas, useExecucao } from '@/lib/enade-time/hooks/useBenchmark'
import { ROTAS } from '@/lib/enade-time/rotas'

export function EtapaDetalheView({ id }: { id: number }) {
  const exec = useExecucao(id, false)
  const etapas = useEtapas(id, false)

  return (
    <>
      <Link
        href={ROTAS.spdExecucoes}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#b45309] hover:text-[#92400e]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para execuções
      </Link>

      <QueryBoundary query={exec} loadingLabel="Carregando execução…">
        {(e) => (
          <Card>
            <CardHeader
              title={`Execução #${e.id} — ${e.modo}${
                e.modo === 'paralelo' ? ` (${e.num_workers} workers)` : ''
              }`}
              description={e.observacoes ?? undefined}
            />
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <div className="text-[11px] text-[#5f7393]">Tempo total</div>
                <div className="font-semibold">{formatSeconds(e.tempo_total_seg)}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#5f7393]">Linhas processadas</div>
                <div className="font-semibold">{formatInt(e.linhas_processadas)}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#5f7393]">Throughput</div>
                <div className="font-semibold">{formatThroughput(e.throughput_lps)}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#5f7393]">Memória de pico</div>
                <div className="font-semibold">
                  {e.memoria_pico_mb !== null ? `${formatDecimal(e.memoria_pico_mb, 2)} MB` : '—'}
                </div>
              </div>
            </div>
          </Card>
        )}
      </QueryBoundary>

      <Card>
        <CardHeader
          title="Tempo por ano (etapas)"
          description="Decomposição do tempo total por edição do ENADE. Em execuções paralelas, as cores diferenciam os workers."
        />
        <QueryBoundary
          query={etapas}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Carregando etapas…"
        >
          {(rows) => <BarEtapasAno data={rows} />}
        </QueryBoundary>
      </Card>

      <Card>
        <CardHeader title="Detalhamento das etapas" />
        <QueryBoundary query={etapas} isEmpty={(d) => d.length === 0}>
          {(rows) => <EtapasTable data={rows} />}
        </QueryBoundary>
      </Card>
    </>
  )
}
