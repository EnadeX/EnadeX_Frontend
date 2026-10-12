'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { QueryBoundary } from '@/app/enade-time/_components/feedback/QueryBoundary'
import { RegistrosTable } from '@/app/enade-time/_components/tables/RegistrosTable'
import { Card, CardHeader } from '@/app/enade-time/_components/ui/Card'
import { PAGE_SIZE_OPTIONS } from '@/lib/enade-time/constants'
import { formatInt } from '@/lib/enade-time/format'
import { useRegistros } from '@/lib/enade-time/hooks/useAnalises'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import { btnSecondary, campo, rotulo } from '@/lib/enade-time/ui'

export function RegistrosView() {
  const { filtros } = useFiltrosUrl()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(50)

  const q = useRegistros(filtros, page, pageSize)

  return (
    <Card>
      <CardHeader
        title="Registros (paginados)"
        description="Listagem bruta da tabela fato, com paginação no servidor. Combine com os filtros acima."
        action={
          <label className={rotulo}>
            Itens por página
            <select
              className={`${campo} mt-1`}
              value={pageSize}
              onChange={(e) => {
                setPage(1)
                setPageSize(Number(e.target.value))
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        }
      />
      <QueryBoundary
        query={q}
        isEmpty={(d) => d.items.length === 0}
        loadingLabel="Carregando registros…"
      >
        {(data) => (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[#536987]">
              <div>
                Mostrando{' '}
                <strong>
                  {formatInt((data.page - 1) * data.page_size + 1)}–
                  {formatInt(Math.min(data.page * data.page_size, data.total))}
                </strong>{' '}
                de <strong>{formatInt(data.total)}</strong> registros ({formatInt(data.total_pages)}{' '}
                página{data.total_pages !== 1 ? 's' : ''})
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={`${btnSecondary} px-2 py-1`}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <span className="px-2 text-xs">
                  Página {data.page} / {data.total_pages || 1}
                </span>
                <button
                  type="button"
                  className={`${btnSecondary} px-2 py-1`}
                  onClick={() =>
                    setPage((p) => (data.total_pages ? Math.min(data.total_pages, p + 1) : p + 1))
                  }
                  disabled={data.total_pages ? page >= data.total_pages : false}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <RegistrosTable items={data.items} />
          </>
        )}
      </QueryBoundary>
    </Card>
  )
}
