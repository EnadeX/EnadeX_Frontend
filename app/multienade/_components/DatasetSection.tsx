'use client'

import { type RegressaoRow, type ClusterRow, type AssociacaoRow } from '@/lib/multienade/api'
import { DICIONARIO_TABELAS, MAX_LINHAS_TABELA, type Topico } from '@/lib/multienade/constants'
import { formatarCelula } from '@/lib/multienade/utils'

interface DatasetSectionProps {
  topico: Topico
  regressao: RegressaoRow[]
  clusters: ClusterRow[]
  associacao: AssociacaoRow[]
}

export function DatasetSection({ topico, regressao, clusters, associacao }: DatasetSectionProps) {
  const linhasCompletas = (
    topico === 'regressao' ? regressao : topico === 'clusters' ? clusters : associacao
  ) as unknown as Record<string, unknown>[]

  const linhas = linhasCompletas.slice(0, MAX_LINHAS_TABELA)
  const colunasTabela = linhas.length > 0 ? Object.keys(linhas[0]) : []
  const info = DICIONARIO_TABELAS[topico]

  return (
    <section id="dataset" className="mt-14 scroll-mt-20">
      <div className="border-b border-[#dfe5ee] pb-4">
        <h2 className="text-lg font-bold">Dataset</h2>
        <p className="mt-1 text-xs text-[#8aa0c1]">Amostra bruta de {info.titulo.toLowerCase()}, com o dicionário de variáveis.</p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#edf1f6] px-4 py-2.5 text-[11px] text-[#8aa0c1]">
          <code className="font-mono">{info.tabelaBanco}</code>
          <span>{linhasCompletas.length.toLocaleString('pt-BR')} linha(s) no total — exibindo {linhas.length}</span>
        </div>
        {linhas.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-[#8aa0c1]">Sem dados carregados ainda.</p>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-max text-left text-xs">
              <thead className="sticky top-0 z-10 bg-white text-[10px] uppercase tracking-wide text-[#8aa0c1] shadow-[0_1px_0_#edf1f6]">
                <tr>
                  {colunasTabela.map((c) => (
                    <th key={c} className="whitespace-nowrap px-3 py-2 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, index) => (
                  <tr key={index} className="border-b border-[#f5f7fa] last:border-0 hover:bg-[#f9fafc]">
                    {colunasTabela.map((c) => (
                      <td key={c} className="whitespace-nowrap px-3 py-2 text-[#536987]">{formatarCelula(linha[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold">Dicionário de variáveis</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {info.colunas.map((c) => (
            <div key={c.coluna} className="flex gap-2 text-xs">
              <code className="shrink-0 rounded bg-[#f6f8fb] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#155eef]">{c.coluna}</code>
              <span className="text-[#607494]">{c.descricao}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
