'use client'

import { type AssociacaoRow } from '@/lib/multienade/api'
import { DEF_VARIAVEIS } from '@/lib/multienade/constants'
import { envolveDesempenho, itensAssociacao } from '@/lib/multienade/utils'
import { VariaveisInfo } from './VariaveisInfo'
import { tabela } from '@/lib/brand/classes'

function Itens({ texto }: { texto: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {itensAssociacao(texto).map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function AssociacaoTab({ associacao }: { associacao: AssociacaoRow[] }) {
  const comDesempenho = associacao.filter(envolveDesempenho).length

  return (
    <div className="py-6">
      <h2 className="text-h2 text-ink">Regras de associação (Apriori)</h2>
      <p className="mt-1 text-small text-ink-muted">{associacao.length} regras de maior lift (suporte mínimo de 3%, confiança mínima de 50%, até 3 itens por regra). {comDesempenho} {comDesempenho === 1 ? 'envolve' : 'envolvem'} a banda de desempenho do curso. O número após cada item é o nível da resposta, de 1 (discordo totalmente) a 6 (concordo totalmente).</p>
      <div className={`${tabela.wrapper} mt-4`}>
        <table className="w-full text-left text-body">
          <thead className={tabela.head}>
            <tr>
              <th className="px-4 py-3 font-medium">Se ocorre (antecedente)</th>
              <th className="px-4 py-3 font-medium">Então ocorre (consequente)</th>
              <th className="px-4 py-3 font-medium">Suporte</th>
              <th className="px-4 py-3 font-medium">Confiança</th>
              <th className="px-4 py-3 font-medium">Lift</th>
            </tr>
          </thead>
          <tbody>
            {associacao.map((r, index) => (
              <tr key={r.id ?? index} className={`${tabela.tr} ${envolveDesempenho(r) ? 'bg-surface-sunken/60' : ''}`}>
                <td className="px-4 py-3 align-top font-medium text-ink"><Itens texto={r.antecedents} /></td>
                <td className="px-4 py-3 align-top text-ink"><Itens texto={r.consequents} /></td>
                <td className="num px-4 py-3 align-top text-ink">{r.support.toFixed(1)}%</td>
                <td className="num px-4 py-3 align-top text-ink">{r.confidence.toFixed(1)}%</td>
                <td className="num px-4 py-3 align-top text-ink">{r.lift.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <VariaveisInfo itens={[DEF_VARIAVEIS.QE_I57, DEF_VARIAVEIS.QE_I61, DEF_VARIAVEIS.QE_I34, DEF_VARIAVEIS.QE_I44, DEF_VARIAVEIS.QE_I30, DEF_VARIAVEIS.QE_I56]} />
      </div>
    </div>
  )
}
