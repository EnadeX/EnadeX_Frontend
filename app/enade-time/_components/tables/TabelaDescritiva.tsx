import { rotuloNota, TITULO_TABELA, formatDecimal1 } from '@/lib/enade-time/descritiva'
import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import type { DescritivaAnual, NotaChave } from '@/lib/enade-time/types'
import { foco } from '@/lib/brand/classes'
import { tabela, tabelaHead, tabelaWrapper, td, th, trLinha } from '@/lib/enade-time/ui'

const COLUNAS = ['Média', 'DP', 'Variância', 'CV (%)', 'Mín', 'Q1', 'Mediana', 'Q3', 'Máx'] as const

// Tabela de estatística descritiva por edição, da nota escolhida. Uma linha por edição, todas as medidas
// sobre as médias de curso (uma observação por curso-ano). A região rola na horizontal em telas estreitas e
// recebe foco do teclado (axe: scrollable-region-focusable).
export function TabelaDescritiva({ rows, nota }: { rows: DescritivaAnual[]; nota: NotaChave }) {
  const rotulo = rotuloNota(nota)
  return (
    <div
      className={`${tabelaWrapper} ${foco}`}
      role="region"
      tabIndex={0}
      aria-label={`${TITULO_TABELA}, ${rotulo}`}
    >
      <table className={tabela}>
        <caption className="sr-only">
          {TITULO_TABELA}: {rotulo}. Uma linha por edição do ENADE.
        </caption>
        <thead className={tabelaHead}>
          <tr>
            <th scope="col" className={`${th} text-left`}>
              Ano
            </th>
            <th scope="col" className={`${th} text-right`} title="Curso-ano com a nota válida (n)">
              Cursos
            </th>
            {COLUNAS.map((c) => (
              <th key={c} scope="col" className={`${th} text-right`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const e = r[nota]
            return (
              <tr key={r.nu_ano} className={trLinha}>
                <th scope="row" className={`${td} text-left font-medium`}>
                  {r.nu_ano}
                </th>
                <td className={`${td} text-right tabular-nums`}>{formatInt(e.n)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.media, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.desvio_padrao, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.variancia, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal1(e.coef_variacao)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.minimo, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.q1, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.mediana, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.q3, 2)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatDecimal(e.maximo, 2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
