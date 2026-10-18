'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { useHealth } from '@/lib/educluster/hooks/useEduCluster'

import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingSpinner } from './LoadingSpinner'

export function QueryBoundary<TData>({
  query,
  isEmpty,
  emptyTitle,
  emptyDescription,
  loadingLabel,
  children,
}: {
  query: UseQueryResult<TData>
  isEmpty?: (data: TData) => boolean
  emptyTitle?: string
  emptyDescription?: ReactNode
  loadingLabel?: string
  children: (data: TData) => ReactNode
}) {
  const health = useHealth()

  if (query.isPending) {
    const frio = health.data?.base_cursos_em_memoria === false
    return (
      <LoadingSpinner
        label={loadingLabel}
        detalhe={
          frio
            ? 'Primeira consulta desde que a API subiu: o backend está baixando a base do Supabase (cerca de 1 minuto). As próximas respostas saem do cache.'
            : undefined
        }
      />
    )
  }
  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : 'Erro desconhecido'
    return <ErrorState message={message} onRetry={() => query.refetch()} />
  }
  const data = query.data as TData
  if (isEmpty?.(data)) return <EmptyState title={emptyTitle} description={emptyDescription} />
  return <>{children(data)}</>
}
