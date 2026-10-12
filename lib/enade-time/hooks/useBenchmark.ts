'use client'

import { useQuery } from '@tanstack/react-query'

import {
  fetchCarga,
  fetchComparativo,
  fetchEtapas,
  fetchExecucao,
  fetchExecucoes,
  fetchMetricas,
} from '@/lib/enade-time/api'

const STALE = 5 * 60_000

export function useExecucoes(apenasValidas: boolean) {
  return useQuery({
    queryKey: ['enade-time', 'benchmark', 'execucoes', apenasValidas],
    queryFn: ({ signal }) => fetchExecucoes(apenasValidas, signal),
    staleTime: STALE,
  })
}

export function useExecucao(id: number | null, apenasValidas: boolean) {
  return useQuery({
    queryKey: ['enade-time', 'benchmark', 'execucao', id, apenasValidas],
    queryFn: ({ signal }) => fetchExecucao(id as number, apenasValidas, signal),
    enabled: id !== null,
    staleTime: STALE,
  })
}

export function useEtapas(execucaoId: number | null, apenasValidas: boolean) {
  return useQuery({
    queryKey: ['enade-time', 'benchmark', 'etapas', execucaoId, apenasValidas],
    queryFn: ({ signal }) => fetchEtapas(execucaoId as number, apenasValidas, signal),
    enabled: execucaoId !== null,
    staleTime: STALE,
  })
}

export function useMetricas(apenasValidas: boolean) {
  return useQuery({
    queryKey: ['enade-time', 'benchmark', 'metricas', apenasValidas],
    queryFn: ({ signal }) => fetchMetricas(apenasValidas, signal),
    staleTime: STALE,
  })
}

export function useComparativo(apenasValidas: boolean) {
  return useQuery({
    queryKey: ['enade-time', 'benchmark', 'comparativo', apenasValidas],
    queryFn: ({ signal }) => fetchComparativo(apenasValidas, signal),
    staleTime: STALE,
  })
}

export function useCarga() {
  return useQuery({
    queryKey: ['enade-time', 'benchmark', 'carga'],
    queryFn: ({ signal }) => fetchCarga(signal),
    staleTime: STALE,
  })
}
