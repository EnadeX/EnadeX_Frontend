'use client'

import {
  Award,
  Calendar,
  Cpu,
  Database,
  Flag,
  Gauge,
  Map as MapIcon,
  Timer,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import { KpiGrid } from '@/app/enade-time/_components/cards/KpiGrid'
import { MetricCard } from '@/app/enade-time/_components/cards/MetricCard'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { PageSection } from '@/app/enade-time/_components/layout/PageSection'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import {
  ROTULO_ORDEM,
  melhorSerie,
  seriesDoComparativo,
  type SerieBenchmark,
} from '@/lib/enade-time/benchmark'
import {
  formatDecimal,
  formatInt,
  formatPercent,
  formatSeconds,
  formatSpeedup,
} from '@/lib/enade-time/format'
import { useResumoAnual, useResumoRegiao, useResumoUF } from '@/lib/enade-time/hooks/useAnalises'
import { useComparativo } from '@/lib/enade-time/hooks/useBenchmark'
import { ROTAS } from '@/lib/enade-time/rotas'
import { linkTexto } from '@/lib/enade-time/ui'

const TITULO_SECAO = 'mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f7393]'

function dica(s: SerieBenchmark | null, agregado: boolean): string | undefined {
  if (!s) return undefined
  const ordem = s.ordem_submissao ? ` · ${ROTULO_ORDEM[s.ordem_submissao]}` : ''
  if (agregado) return `${s.num_workers} workers${ordem} · mediana de ${s.n} suítes`
  return `${s.num_workers} workers${ordem} (#${s.execucao_id})`
}

export default function EnadeTimeVisaoGeral() {
  const anual = useResumoAnual({})
  const regiao = useResumoRegiao({})
  const uf = useResumoUF({})
  const comparativo = useComparativo(true)

  const totalRegistros = anual.data?.reduce((acc, r) => acc + r.total_registros, 0) ?? null
  const anosCobertos = anual.data?.length ?? null
  const totalRegioes = regiao.data?.length ?? null
  const totalUFs = uf.data?.length ?? null

  const tempoBase = comparativo.data?.tempo_baseline_seg ?? null
  const { series, agregado } = comparativo.data
    ? seriesDoComparativo(comparativo.data)
    : { series: [] as SerieBenchmark[], agregado: false }
  const paralelos = series.filter((s) => s.modo === 'paralelo')
  const melhorSpeedup = melhorSerie(series)
  const melhorEficiencia = paralelos.reduce<SerieBenchmark | null>(
    (best, cur) =>
      cur.eficiencia !== null && (best === null || (cur.eficiencia ?? 0) > (best.eficiencia ?? 0))
        ? cur
        : best,
    null,
  )
  const melhorThroughput = paralelos.reduce<SerieBenchmark | null>(
    (best, cur) => (best === null || cur.throughput > best.throughput ? cur : best),
    null,
  )
  const dicaBaseline = agregado
    ? comparativo.data?.n_suites
      ? `mediana de ${comparativo.data.n_suites} suítes`
      : 'mediana da campanha'
    : comparativo.data?.baseline_sequencial_id
      ? `Execução #${comparativo.data.baseline_sequencial_id}`
      : undefined

  return (
    <PageSection
      title="Visão geral"
      description="Indicadores principais do projeto: cobertura dos microdados ENADE (Norte e Nordeste, Computação) e resultados do experimento de processamento paralelo."
    >
      <section>
        <h3 className={TITULO_SECAO}>Microdados ENADE</h3>
        <KpiGrid>
          <MetricCard
            label="Total de registros"
            value={
              anual.isPending ? '…' : totalRegistros !== null ? formatInt(totalRegistros) : '—'
            }
            unit="inscrições (582 cursos-ano)"
            icon={Database}
          />
          <MetricCard
            label="Anos analisados"
            value={anual.isPending ? '…' : formatInt(anosCobertos)}
            unit="edições ENADE"
            icon={Calendar}
            hint="2005 a 2021"
          />
          <MetricCard
            label="Regiões cobertas"
            value={regiao.isPending ? '…' : formatInt(totalRegioes)}
            unit="Norte + Nordeste"
            icon={MapIcon}
          />
          <MetricCard
            label="UFs cobertas"
            value={uf.isPending ? '…' : formatInt(totalUFs)}
            unit="estados"
            icon={Flag}
          />
        </KpiGrid>
      </section>

      <section>
        <h3 className={TITULO_SECAO}>Processamento paralelo (SPD)</h3>
        <KpiGrid>
          <MetricCard
            label="Tempo sequencial (baseline)"
            value={formatSeconds(tempoBase)}
            icon={Timer}
            hint={dicaBaseline}
          />
          <MetricCard
            label="Melhor speedup"
            value={formatSpeedup(melhorSpeedup?.speedup ?? null)}
            icon={Zap}
            tone="primary"
            hint={dica(melhorSpeedup, agregado)}
          />
          <MetricCard
            label="Melhor eficiência"
            value={formatPercent(melhorEficiencia?.eficiencia ?? null)}
            icon={Gauge}
            tone="success"
            hint={dica(melhorEficiencia, agregado)}
          />
          <MetricCard
            label="Throughput máximo"
            value={melhorThroughput ? formatDecimal(melhorThroughput.throughput, 2) : '—'}
            unit="linhas/s"
            icon={Cpu}
            tone="dark"
            hint={dica(melhorThroughput, agregado)}
          />
        </KpiGrid>
      </section>

      <Card className="border-[#a7efd0] bg-[#f0fdf8]">
        <div className="flex items-start gap-3">
          <Award className="size-6 shrink-0 text-[#047857]" aria-hidden />
          <div>
            <h3 className="text-sm font-bold text-[#065f46]">
              {melhorSpeedup
                ? `Melhor configuração da ${agregado ? 'campanha oficial' : 'rodada carregada'}: ${melhorSpeedup.num_workers} workers${
                    melhorSpeedup.ordem_submissao
                      ? ` · ${ROTULO_ORDEM[melhorSpeedup.ordem_submissao]}`
                      : ''
                  }`
                : 'Benchmark de processamento paralelo'}
            </h3>
            <p className="mt-1 max-w-3xl text-xs leading-6 text-[#047857]">
              {melhorSpeedup ? (
                <>
                  {agregado
                    ? 'Na campanha oficial carregada no banco, a configuração com '
                    : 'Na rodada de benchmark atualmente carregada no banco, a configuração com '}
                  <strong>{melhorSpeedup.num_workers} workers</strong> obteve o melhor desempenho:
                  speedup {agregado ? 'mediano ' : ''}de{' '}
                  <strong>{formatSpeedup(melhorSpeedup.speedup)}</strong> e eficiência de{' '}
                  <strong>{formatPercent(melhorSpeedup.eficiencia)}</strong>
                  {agregado
                    ? ` (${melhorSpeedup.n} suítes, cada paralela pareada com o sequencial da própria suíte)`
                    : ''}
                  . A melhor configuração depende da máquina (núcleos físicos, cache, ordem de
                  submissão).{' '}
                </>
              ) : (
                <>
                  A melhor configuração pode variar conforme a rodada (CPU, disco e condições da
                  máquina).{' '}
                </>
              )}
              Consulte{' '}
              <Link className={linkTexto} href={ROTAS.spdComparativo}>
                Benchmark · Comparativo
              </Link>{' '}
              para ver os resultados carregados no banco.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Status dos dados carregados"
          description="Carregamento direto da API, por edição do ENADE."
        />
        <QueryBoundary
          query={anual}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Carregando resumo anual…"
        >
          {(rows) => (
            <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
              {rows.map((r) => (
                <li key={r.nu_ano} className="rounded-xl border border-[#dfe5ee] px-3 py-2">
                  <div className="text-[11px] text-[#5f7393]">Edição {r.nu_ano}</div>
                  <div className="font-semibold">{formatInt(r.total_registros)} reg.</div>
                  <div className="text-xs text-[#5f7393]">
                    média {formatDecimal(r.media_geral, 2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </Card>
    </PageSection>
  )
}
