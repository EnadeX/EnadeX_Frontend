import Link from 'next/link'

import { Badge } from '@/app/enade-time/_components/ui/Badge'
import { ROTULO_ORDEM } from '@/lib/enade-time/benchmark'
import {
  formatDateTime,
  formatDecimal,
  formatInt,
  formatSeconds,
  formatThroughput,
} from '@/lib/enade-time/format'
import { ROTAS } from '@/lib/enade-time/rotas'
import type { BenchmarkExecucao } from '@/lib/enade-time/types'
import { linkTexto, tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

function curto(id: string | null | undefined): string {
  return id ? id.slice(0, 8) : '—'
}

function mb(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—'
  return `${formatDecimal(bytes / 1_000_000, 2)} MB`
}

export function ExecucoesTable({ data }: { data: BenchmarkExecucao[] }) {
  return (
    <div className={tabelaWrapper}>
      <table className={tabela}>
        <thead className={tabelaHead}>
          <tr>
            <th className={`${th} text-left`}>ID</th>
            <th className={`${th} text-left`}>Início</th>
            <th className={`${th} text-left`}>Modo</th>
            <th className={`${th} text-right`}>Workers</th>
            <th className={`${th} text-left`}>Ordem</th>
            <th className={`${th} text-right`}>Tempo</th>
            <th className={`${th} text-right`}>Linhas</th>
            <th className={`${th} text-right`}>Throughput</th>
            <th className={`${th} text-right`}>CPU méd.</th>
            <th className={`${th} text-right`}>Disco lido</th>
            <th className={`${th} text-left`}>Cache</th>
            <th className={`${th} text-left`}>Campanha</th>
            <th className={`${th} text-left`}>Suíte</th>
            <th className={`${th} text-right`}>Mem. pico</th>
            <th className={`${th} text-left`}>Observações</th>
            <th className={`${th} text-left`}>Etapas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.id} className={trLinha}>
              <td className={`${td} font-medium`}>{e.id}</td>
              <td className={`${td} whitespace-nowrap`}>{formatDateTime(e.timestamp_inicio)}</td>
              <td className={`${td} whitespace-nowrap`}>
                <Badge tone={e.modo === 'sequencial' ? 'neutral' : 'info'}>{e.modo}</Badge>
                {e.aquecimento && (
                  <>
                    {' '}
                    <Badge tone="warning">aquecimento</Badge>
                  </>
                )}
              </td>
              <td className={`${td} text-right`}>{e.num_workers}</td>
              <td className={td}>{e.ordem_submissao ? ROTULO_ORDEM[e.ordem_submissao] : '—'}</td>
              <td className={`${td} text-right`}>{formatSeconds(e.tempo_total_seg)}</td>
              <td className={`${td} text-right`}>{formatInt(e.linhas_processadas)}</td>
              <td className={`${td} text-right`}>{formatThroughput(e.throughput_lps)}</td>
              <td className={`${td} text-right`}>
                {e.cpu_percent_medio !== null && e.cpu_percent_medio !== undefined
                  ? `${formatDecimal(e.cpu_percent_medio, 2)} %`
                  : '—'}
              </td>
              <td className={`${td} text-right`}>{mb(e.disco_bytes_lidos)}</td>
              <td className={td}>
                {e.cache_quente === true ? 'quente' : e.cache_quente === false ? 'frio' : '—'}
              </td>
              <td
                className={`${td} whitespace-nowrap font-mono text-small`}
                title={e.campanha_id ?? ''}
              >
                {curto(e.campanha_id)}
                {e.oficial && (
                  <>
                    {' '}
                    <Badge tone="success">oficial</Badge>
                  </>
                )}
              </td>
              <td className={`${td} font-mono text-small text-ink-muted`} title={e.suite_id ?? ''}>
                {curto(e.suite_id)}
              </td>
              <td className={`${td} text-right`}>
                {e.memoria_pico_mb !== null ? `${formatDecimal(e.memoria_pico_mb, 2)} MB` : '—'}
              </td>
              <td
                className={`${td} max-w-[300px] truncate text-ink-muted`}
                title={e.observacoes ?? ''}
              >
                {e.observacoes ?? '—'}
              </td>
              <td className={td}>
                <Link href={ROTAS.spdEtapas(e.id)} className={linkTexto}>
                  ver etapas
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
