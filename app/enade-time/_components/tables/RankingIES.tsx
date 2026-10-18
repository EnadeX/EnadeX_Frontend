import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import type { ResumoIES } from '@/lib/enade-time/types'
import { tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

export function RankingIES({ items }: { items: ResumoIES[] }) {
  return (
    <div className={tabelaWrapper}>
      <table className={tabela}>
        <thead className={tabelaHead}>
          <tr>
            <th className={`${th} text-left`}>#</th>
            <th className={`${th} text-right`}>Cód. IES</th>
            <th className={`${th} text-right`}>Cat. Adm.</th>
            <th className={`${th} text-right`}>Org. Acad.</th>
            <th className={`${th} text-right`}>UF (cód.)</th>
            <th className={`${th} text-right`}>Registros</th>
            <th className={`${th} text-right`}>Média FG</th>
            <th className={`${th} text-right`}>Média CE</th>
            <th className={`${th} text-right`}>Média GER</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={r.co_ies} className={trLinha}>
              <td className={`${td} font-medium`}>{i + 1}</td>
              <td className={`${td} text-right`}>{r.co_ies}</td>
              <td className={`${td} text-right`}>{r.co_categad}</td>
              <td className={`${td} text-right`}>{r.co_orgacad}</td>
              <td className={`${td} text-right`}>{r.co_uf_curso}</td>
              <td className={`${td} text-right`}>{formatInt(r.total_registros)}</td>
              <td className={`${td} text-right`}>{formatDecimal(r.media_geral, 2)}</td>
              <td className={`${td} text-right`}>{formatDecimal(r.media_geral_ce, 2)}</td>
              <td className={`${td} text-right font-medium`}>
                {formatDecimal(r.media_geral_ger, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
