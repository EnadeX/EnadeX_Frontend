'use client'

import { type AssociacaoRow } from '@/lib/multienade/api'
import { DEF_VARIAVEIS } from '@/lib/multienade/constants'
import { VariaveisInfo } from './VariaveisInfo'

export function AssociacaoTab({ associacao }: { associacao: AssociacaoRow[] }) {
  return (
    <div className="py-6">
      <h2 className="text-lg font-bold">Regras de associação (Apriori)</h2>
      <p className="mt-1 text-xs text-[#8aa0c1]">{associacao.length} regras encontradas com suporte mínimo configurado.</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#dfe5ee] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#edf1f6] text-[11px] uppercase tracking-wide text-[#8aa0c1]">
            <tr>
              <th className="px-4 py-3">Se ocorre (antecedente)</th>
              <th className="px-4 py-3">Então ocorre (consequente)</th>
              <th className="px-4 py-3">Suporte</th>
              <th className="px-4 py-3">Confiança</th>
              <th className="px-4 py-3">Lift</th>
            </tr>
          </thead>
          <tbody>
            {associacao.map((r, index) => (
              <tr key={index} className="border-b border-[#f5f7fa] last:border-0">
                <td className="px-4 py-3 font-medium">{r.antecedents}</td>
                <td className="px-4 py-3">{r.consequents}</td>
                <td className="px-4 py-3">{r.support.toFixed(1)}%</td>
                <td className="px-4 py-3">{r.confidence.toFixed(1)}%</td>
                <td className="px-4 py-3">{r.lift.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <VariaveisInfo itens={[DEF_VARIAVEIS.QE_I57, DEF_VARIAVEIS.QE_I56, DEF_VARIAVEIS.QE_I30]} />
      </div>
    </div>
  )
}
