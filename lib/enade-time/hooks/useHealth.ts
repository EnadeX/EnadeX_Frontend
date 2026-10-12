'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchHealth } from '@/lib/enade-time/api'

export function useHealth() {
  return useQuery({
    queryKey: ['enade-time', 'health'],
    queryFn: ({ signal }) => fetchHealth(signal),
    // Consulta mais seguido enquanto a API/banco estão fora, para a pill voltar logo.
    refetchInterval: (query) => (query.state.status === 'error' ? 5_000 : 30_000),
    staleTime: 0,
    retry: 0,
  })
}
