import { formatDecimal } from '@/lib/enade-time/format'
import type { Registro } from '@/lib/enade-time/types'
import { tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

export function RegistrosTable({ items }: { items: Registro[] }) {
  return (
    <div className={tabelaWrapper}>
      <table className={tabela}>
        <thead className={tabelaHead}>
          <tr>
            <th className={`${th} text-left`}>ID</th>
            <th className={`${th} text-left`}>Ano</th>
            <th className={`${th} text-right`}>IES</th>
            <th className={`${th} text-right`}>Curso</th>
            <th className={`${th} text-right`}>Categ.</th>
            <th className={`${th} text-right`}>Org.</th>
            <th className={`${th} text-right`}>Grupo</th>
            <th className={`${th} text-right`}>Modal.</th>
            <th className={`${th} text-right`}>UF</th>
            <th className={`${th} text-right`}>Região</th>
            <th className={`${th} text-right`}>Média NT FG</th>
            <th className={`${th} text-right`}>Média NT CE</th>
            <th className={`${th} text-right`}>Média NT GER</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className={trLinha}>
              <td className={`${td} text-left`}>{r.id}</td>
              <td className={td}>{r.nu_ano}</td>
              <td className={`${td} text-right`}>{r.co_ies}</td>
              <td className={`${td} text-right`}>{r.co_curso}</td>
              <td className={`${td} text-right`}>{r.co_categad}</td>
              <td className={`${td} text-right`}>{r.co_orgacad}</td>
              <td className={`${td} text-right`}>{r.co_grupo}</td>
              <td className={`${td} text-right`}>{r.co_modalidade ?? '—'}</td>
              <td className={`${td} text-right`}>{r.co_uf_curso}</td>
              <td className={`${td} text-right`}>{r.co_regiao_curso}</td>
              <td className={`${td} text-right font-medium`}>{formatDecimal(r.media_nt_fg, 2)}</td>
              <td className={`${td} text-right`}>{formatDecimal(r.media_nt_ce, 2)}</td>
              <td className={`${td} text-right`}>{formatDecimal(r.media_nt_ger, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
