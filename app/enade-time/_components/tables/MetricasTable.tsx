import { Badge } from '@/app/enade-time/_components/ui/Badge'
import { ROTULO_ORDEM } from '@/lib/enade-time/benchmark'
import {
  formatDateTime,
  formatPercent,
  formatSeconds,
  formatSpeedup,
  formatThroughput,
} from '@/lib/enade-time/format'
import type { BenchmarkMetrica } from '@/lib/enade-time/types'
import { tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

function curto(id: string | null | undefined): string {
  return id ? id.slice(0, 8) : '—'
}

export function MetricasTable({ data }: { data: BenchmarkMetrica[] }) {
  return (
    <div className={tabelaWrapper}>
      <table className={tabela}>
        <thead className={tabelaHead}>
          <tr>
            <th className={`${th} text-left`}>Exec. ID</th>
            <th className={`${th} text-left`}>Início</th>
            <th className={`${th} text-right`}>Workers</th>
            <th className={`${th} text-left`}>Ordem</th>
            <th className={`${th} text-left`}>Baseline</th>
            <th className={`${th} text-left`}>Pareamento</th>
            <th className={`${th} text-right`}>Tempo Seq.</th>
            <th className={`${th} text-right`}>Tempo Par.</th>
            <th className={`${th} text-right`}>Speedup</th>
            <th className={`${th} text-right`}>Eficiência</th>
            <th className={`${th} text-right`}>Thr. Seq.</th>
            <th className={`${th} text-right`}>Thr. Par.</th>
            <th className={`${th} text-left`}>Suíte</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.execucao_id} className={trLinha}>
              <td className={`${td} font-medium`}>{m.execucao_id}</td>
              <td className={`${td} whitespace-nowrap`}>{formatDateTime(m.timestamp_inicio)}</td>
              <td className={`${td} text-right`}>{m.num_workers}</td>
              <td className={td}>{m.ordem_submissao ? ROTULO_ORDEM[m.ordem_submissao] : '—'}</td>
              <td className={td}>
                {m.baseline_execucao_id !== null && m.baseline_execucao_id !== undefined
                  ? `#${m.baseline_execucao_id}`
                  : '—'}
              </td>
              <td className={td}>
                {m.pareamento ? (
                  <Badge tone={m.pareamento === 'suite' ? 'success' : 'warning'}>
                    {m.pareamento === 'suite' ? 'mesma suíte' : 'temporal'}
                  </Badge>
                ) : (
                  '—'
                )}
              </td>
              <td className={`${td} text-right`}>{formatSeconds(m.tempo_sequencial)}</td>
              <td className={`${td} text-right`}>{formatSeconds(m.tempo_paralelo)}</td>
              <td className={`${td} text-right font-semibold`}>{formatSpeedup(m.speedup)}</td>
              <td className={`${td} text-right`}>{formatPercent(m.eficiencia)}</td>
              <td className={`${td} text-right`}>{formatThroughput(m.throughput_sequencial)}</td>
              <td className={`${td} text-right`}>{formatThroughput(m.throughput_paralelo)}</td>
              <td className={`${td} font-mono text-xs text-[#5f7393]`} title={m.suite_id ?? ''}>
                {curto(m.suite_id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
