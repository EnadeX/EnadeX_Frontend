'use client'

import { useQuery } from '@tanstack/react-query'

import {
  fetchRegistros,
  fetchResumoAnual,
  fetchResumoIES,
  fetchResumoRegiao,
  fetchResumoUF,
} from '@/lib/enade-time/api'
import type { FiltrosAnalise } from '@/lib/enade-time/types'

const STALE = 5 * 60_000

export function useResumoAnual(filtros: FiltrosAnalise) {
  return useQuery({
    queryKey: ['enade-time', 'analises', 'resumo-anual', filtros],
    queryFn: ({ signal }) => fetchResumoAnual(filtros, signal),
    staleTime: STALE,
  })
}

export function useResumoRegiao(filtros: FiltrosAnalise) {
  return useQuery({
    queryKey: ['enade-time', 'analises', 'resumo-regiao', filtros],
    queryFn: ({ signal }) => fetchResumoRegiao(filtros, signal),
    staleTime: STALE,
  })
}

export function useResumoUF(filtros: FiltrosAnalise) {
  return useQuery({
    queryKey: ['enade-time', 'analises', 'resumo-uf', filtros],
    queryFn: ({ signal }) => fetchResumoUF(filtros, signal),
    staleTime: STALE,
  })
}

export function useResumoIES(filtros: FiltrosAnalise, limit: number, minCursos: number) {
  return useQuery({
    queryKey: ['enade-time', 'analises', 'resumo-ies', filtros, limit, minCursos],
    queryFn: ({ signal }) => fetchResumoIES(filtros, limit, minCursos, signal),
    staleTime: STALE,
  })
}

export function useRegistros(filtros: FiltrosAnalise, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['enade-time', 'analises', 'registros', filtros, page, pageSize],
    queryFn: ({ signal }) => fetchRegistros(filtros, page, pageSize, signal),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  })
}
