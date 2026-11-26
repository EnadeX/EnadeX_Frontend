'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'

import { KpiGrid } from '@/app/enade-time/_components/cards/KpiGrid'
import { MetricCard } from '@/app/enade-time/_components/cards/MetricCard'
import { LineMediaAnual } from '@/app/enade-time/_components/charts/LineMediaAnual'
import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { TabelaDescritiva } from '@/app/enade-time/_components/tables/TabelaDescritiva'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import {
  cursoAnoSemNota,
  NOTA_DA_TABELA,
  NOTA_PADRAO,
  NOTAS,
  TITULO_TABELA,
} from '@/lib/enade-time/descritiva'
import { formatDecimal, formatInt } from '@/lib/enade-time/format'
import { useDescritiva, useResumoAnual } from '@/lib/enade-time/hooks/useAnalises'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import type { DescritivaAnual, NotaChave } from '@/lib/enade-time/types'
import { campo, rotulo } from '@/lib/enade-time/ui'

type ConsultaDescritiva = UseQueryResult<DescritivaAnual[]>

// Dispersão entre cursos (NT GER). Com uma única edição no recorte mostra o desvio-padrão e a média por curso
// dessa edição; com várias, os valores são por edição (não se agrega entre edições, que não são diretamente
// comparáveis) e o cartão remete à tabela.
function CartaoDesvio({ desc }: { desc: ConsultaDescritiva }) {
  const label = 'Desvio-padrão entre cursos (NT GER)'
  if (desc.isPending) return <MetricCard label={label} value="—" hint="Carregando…" />
  if (desc.isError) return <MetricCard label={label} value="—" hint="Indisponível no momento" />
  const rows = desc.data
  if (rows.length === 0) return <MetricCard label={label} value="—" />
  if (rows.length > 1)
    return <MetricCard label={label} value="Por edição" hint="Valores por edição: veja a tabela abaixo." />
  const [unica] = rows
  const ger = unica.nt_ger
  return (
    <MetricCard
      label={label}
      value={formatDecimal(ger.desvio_padrao, 2)}
      hint={`Edição ${unica.nu_ano} · média por curso ${formatDecimal(ger.media, 2)} (n = ${formatInt(ger.n)} cursos)`}
    />
  )
}

function SecaoDescritiva({ desc }: { desc: ConsultaDescritiva }) {
  const [nota, setNota] = useState<NotaChave>(NOTA_PADRAO)
  return (
    <Card>
      <CardHeader
        title={TITULO_TABELA}
        action={
          <label className={rotulo}>
            Nota
            <select
              className={`${campo} mt-1`}
              value={nota}
              onChange={(e) => setNota(e.target.value as NotaChave)}
            >
              {NOTAS.map((n) => (
                <option key={n.chave} value={n.chave}>
                  {n.rotulo}
                </option>
              ))}
            </select>
          </label>
        }
      />
      <QueryBoundary
        query={desc}
        isEmpty={(d) => d.length === 0}
        emptyTitle="Nenhum curso para os filtros aplicados."
        loadingLabel="Carregando estatística descritiva…"
      >
        {(rows) => {
          const semNota = cursoAnoSemNota(rows, nota)
          return (
            <>
              <TabelaDescritiva rows={rows} nota={nota} />
              <p className="mt-3 text-small text-ink-muted">
                {NOTA_DA_TABELA}
                {semNota > 0 &&
                  ` Cursos = curso-ano com a nota válida; ${formatInt(semNota)} curso-ano do recorte não têm a nota.`}
              </p>
            </>
          )
        }}
      </QueryBoundary>
    </Card>
  )
}

export default function EnadeAnual() {
  const { filtros } = useFiltrosUrl()
  const q = useResumoAnual(filtros)
  const desc = useDescritiva(filtros)

  return (
    <QueryBoundary
      query={q}
      isEmpty={(d) => d.length === 0}
      emptyTitle="Nenhum registro para os filtros aplicados."
    >
      {(rows) => {
        const total = rows.reduce((acc, r) => acc + r.total_registros, 0)
        // curso-ano do recorte: `total_cursos` já é por edição, então a soma conta cada curso uma vez por edição
        const cursoAno = rows.every((r) => r.total_cursos !== undefined)
          ? rows.reduce((acc, r) => acc + (r.total_cursos ?? 0), 0)
          : null

        return (
          <>
            <KpiGrid>
              <MetricCard label="Registros (filtro)" value={formatInt(total)} />
              <MetricCard label="Cursos (curso-ano)" value={cursoAno === null ? '—' : formatInt(cursoAno)} />
              <MetricCard label="Edições no recorte" value={formatInt(rows.length)} />
              <CartaoDesvio desc={desc} />
            </KpiGrid>
            <Card>
              <CardHeader
                title="Média Nota Geral (NT GER) por ano"
                description="Variação longitudinal das médias da Nota Geral (NT GER) ao longo das edições."
              />
              <LineMediaAnual data={rows} />
              <p className="mt-2 text-small text-ink-muted">
                A linha usa a média por inscrição (cada curso pesa pelo número de inscritos); a tabela abaixo
                usa a média simples entre cursos.
              </p>
            </Card>
            <SecaoDescritiva desc={desc} />
          </>
        )
      }}
    </QueryBoundary>
  )
}
