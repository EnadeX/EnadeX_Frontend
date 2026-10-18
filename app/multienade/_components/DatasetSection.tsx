'use client'

import { type RegressaoRow, type ClusterRow, type AssociacaoRow } from '@/lib/multienade/api'
import { DICIONARIO_TABELAS, MAX_LINHAS_TABELA, type Topico } from '@/lib/multienade/constants'
import { formatarCelula } from '@/lib/multienade/utils'
import { card, tabela } from '@/lib/brand/classes'

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
  // A tabela do banco guarda colunas de modelagens anteriores, hoje sempre nulas: só mostramos as que têm valor.
  const colunasTabela = linhas.length > 0 ? Object.keys(linhas[0]).filter((c) => linhasCompletas.some((l) => l[c] != null)) : []
  const info = DICIONARIO_TABELAS[topico]

  return (
    <section id="dataset" className="mt-14 scroll-mt-20">
      <div className="border-b border-border pb-4">
        <h2 className="text-h2 text-ink">Dataset</h2>
        <p className="mt-1 text-small text-ink-muted">Amostra bruta de {info.titulo.toLowerCase()}, com o dicionário de variáveis.</p>
      </div>

      <div className="mt-5 rounded-marca-md border border-border bg-surface-card shadow-marca">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-caption text-ink-muted">
          <code className="font-mono">{info.tabelaBanco}</code>
          <span>{linhasCompletas.length.toLocaleString('pt-BR')} linha(s) no total — exibindo {linhas.length}</span>
        </div>
        {linhas.length === 0 ? (
          <p className="px-4 py-8 text-center text-small text-ink-muted">Sem dados carregados ainda.</p>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-max text-left text-table-num">
              <thead className={`sticky top-0 z-10 shadow-[0_1px_0_var(--border)] ${tabela.head}`}>
                <tr>
                  {colunasTabela.map((c) => (
                    <th key={c} className="whitespace-nowrap px-3 py-2 font-dados font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, index) => (
                  <tr key={index} className={tabela.tr}>
                    {colunasTabela.map((c) => (
                      <td key={c} className="num whitespace-nowrap px-3 py-2 text-ink">{formatarCelula(linha[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${card} mt-5 p-5`}>
        <h3 className="text-h3 text-ink">Dicionário de variáveis</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {info.colunas.map((c) => (
            <div key={c.coluna} className="flex gap-2 text-small">
              <code className="shrink-0 rounded-marca-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-caption font-medium text-ink">{c.coluna}</code>
              <span className="text-ink-muted">{c.descricao}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
