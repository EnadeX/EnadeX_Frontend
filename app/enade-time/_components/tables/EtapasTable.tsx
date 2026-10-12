import { formatDateTime, formatInt, formatSeconds } from '@/lib/enade-time/format'
import type { BenchmarkEtapa } from '@/lib/enade-time/types'
import { tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

export function EtapasTable({ data }: { data: BenchmarkEtapa[] }) {
  return (
    <div className={tabelaWrapper}>
      <table className={tabela}>
        <thead className={tabelaHead}>
          <tr>
            <th className={`${th} text-left`}>Ano</th>
            <th className={`${th} text-right`}>Tempo (s)</th>
            <th className={`${th} text-right`}>Linhas (arq3)</th>
            <th className={`${th} text-right`}>Worker PID</th>
            <th className={`${th} text-left`}>Início</th>
            <th className={`${th} text-left`}>Fim</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.id} className={trLinha}>
              <td className={`${td} font-medium`}>{e.ano}</td>
              <td className={`${td} text-right`}>{formatSeconds(e.tempo_seg)}</td>
              <td className={`${td} text-right`}>{formatInt(e.linhas_arq3)}</td>
              <td className={`${td} text-right`}>{e.worker_pid ?? '—'}</td>
              <td className={`${td} whitespace-nowrap`}>{formatDateTime(e.timestamp_inicio)}</td>
              <td className={`${td} whitespace-nowrap`}>{formatDateTime(e.timestamp_fim)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
