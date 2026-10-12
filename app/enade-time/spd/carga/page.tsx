'use client'

import { Database, Info } from 'lucide-react'

import { BarCarga } from '@/app/enade-time/_components/charts/BarCarga'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { Badge } from '@/app/enade-time/_components/ui/Badge'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { ROTULO_ESTRATEGIA, ehControle, leituraCarga, ordenarResumo } from '@/lib/enade-time/carga'
import { formatDecimal, formatInt, formatSeconds } from '@/lib/enade-time/format'
import { useCarga } from '@/lib/enade-time/hooks/useBenchmark'
import { tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

export default function SpdCusto() {
  const q = useCarga()

  return (
    <QueryBoundary
      query={q}
      isEmpty={(d) => d.resumo.length === 0}
      emptyTitle="Nenhuma medição do custo de publicação."
      emptyDescription="Rode scripts/15_benchmark_carga.py e publique o resultado com scripts/12_publicar_supabase.py."
    >
      {(data) => {
        const linhas = ordenarResumo(data.resumo)
        return (
          <>
            <Card>
              <div className="flex items-start gap-3 text-xs leading-6 text-[#536987]">
                <Database className="mt-0.5 size-5 shrink-0 text-[#5f7393]" aria-hidden />
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Custo de publicar a base: local × nuvem
                  </h3>
                  <p className="mt-1">
                    Medição à parte do experimento de paralelismo: quanto custa carregar as{' '}
                    {formatInt(linhas[0].linhas_destino)} linhas num destino vazio. Mediana e
                    variação entre {linhas[0].n} repetições; <strong>não é speedup</strong> e não se
                    compara com a aba Comparativo.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Tempo de carga por estratégia"
                description="Mediana entre as repetições; a barra de erro vai do mínimo ao máximo. Em cinza, os controles (destino com menos estrutura)."
              />
              <BarCarga data={data.resumo} />
            </Card>

            <Card>
              <CardHeader title="Resultados por estratégia" />
              <div className={tabelaWrapper}>
                <table className={tabela}>
                  <thead className={tabelaHead}>
                    <tr>
                      <th className={`${th} text-left`}>Estratégia</th>
                      <th className={`${th} text-right`}>n</th>
                      <th className={`${th} text-right`}>Mediana</th>
                      <th className={`${th} text-right`}>Mín – máx</th>
                      <th className={`${th} text-right`}>IQR</th>
                      <th className={`${th} text-right`}>Linhas/s</th>
                      <th className={`${th} text-right`}>RTT mediano</th>
                      <th className={`${th} text-left`}>Conferência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((r) => (
                      <tr key={r.estrategia} className={trLinha}>
                        <td className={`${td} font-medium`}>
                          {ROTULO_ESTRATEGIA[r.estrategia] ?? r.estrategia}
                          {ehControle(r.estrategia) && (
                            <>
                              {' '}
                              <Badge tone="neutral">controle</Badge>
                            </>
                          )}
                        </td>
                        <td className={`${td} text-right`}>{r.n}</td>
                        <td className={`${td} text-right font-semibold`}>
                          {formatSeconds(r.tempo_mediana)}
                        </td>
                        <td className={`${td} whitespace-nowrap text-right`}>
                          {formatSeconds(r.tempo_min)} – {formatSeconds(r.tempo_max)}
                        </td>
                        <td className={`${td} text-right`}>{formatSeconds(r.tempo_iqr)}</td>
                        <td className={`${td} text-right`}>
                          {formatInt(Math.round(r.throughput_mediana))}
                        </td>
                        <td className={`${td} text-right`}>
                          {formatDecimal(r.rtt_mediana_ms, 2)} ms
                        </td>
                        <td className={td}>
                          <Badge tone={r.md5_confere ? 'success' : 'danger'}>
                            {r.md5_confere ? 'md5 confere' : 'md5 diverge'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-5 shrink-0 text-[#5f7393]" aria-hidden />
                <div className="space-y-2 text-xs leading-6 text-[#536987]">
                  <h3 className="text-sm font-bold text-[#111827]">Como ler</h3>
                  {leituraCarga(data).map((paragrafo) => (
                    <p key={paragrafo.slice(0, 40)}>{paragrafo}</p>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )
      }}
    </QueryBoundary>
  )
}
