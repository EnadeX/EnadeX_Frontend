'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  fetchAmostraEstudantes,
  fetchAreas,
  fetchCalibracao,
  fetchClustersCursos,
  fetchClustersEstudantes,
  fetchComparacaoTradicional,
  fetchCurso,
  fetchCursos,
  fetchDescricaoCursos,
  fetchDescricaoEstudantes,
  fetchDimensoes,
  fetchDimensoesDesempenho,
  fetchDiscrepantes,
  fetchDiscursivas,
  fetchEstabilidadeK,
  fetchEstabilidadePorK,
  fetchHealth,
} from '@/lib/educluster/api'
import type { AlvoDesempenho, Quadrante } from '@/lib/educluster/types'

const ESTAVEL = 30 * 60_000

export function useHealth() {
  return useQuery({
    queryKey: ['educluster', 'health'],
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: (query) =>
      query.state.status === 'error' || query.state.data?.base_cursos_em_memoria === false
        ? 5_000
        : 30_000,
    staleTime: 0,
    retry: 0,
  })
}

export function useCursos(k?: number) {
  return useQuery({
    queryKey: ['educluster', 'cursos', k ?? null],
    queryFn: ({ signal }) => fetchCursos({ k }, signal),
    staleTime: ESTAVEL,
    placeholderData: keepPreviousData,
  })
}

export function useClustersCursos(k?: number) {
  return useQuery({
    queryKey: ['educluster', 'cursos-clusters', k ?? null],
    queryFn: ({ signal }) => fetchClustersCursos(k, signal),
    staleTime: ESTAVEL,
    placeholderData: keepPreviousData,
  })
}

export function useEstabilidadePorK(rodadas: number) {
  return useQuery({
    queryKey: ['educluster', 'estabilidade', rodadas],
    queryFn: ({ signal }) => fetchEstabilidadePorK(rodadas, signal),
    staleTime: ESTAVEL,
  })
}

export function useEstabilidadeK(k: number, rodadas: number) {
  return useQuery({
    queryKey: ['educluster', 'estabilidade-k', k, rodadas],
    queryFn: ({ signal }) => fetchEstabilidadeK(k, rodadas, signal),
    staleTime: ESTAVEL,
  })
}

export function useDescricaoCursos(k: number | undefined, habilitado: boolean) {
  return useQuery({
    queryKey: ['educluster', 'descricao-cursos', k ?? null],
    queryFn: ({ signal }) => fetchDescricaoCursos(k, false, signal),
    staleTime: ESTAVEL,
    enabled: habilitado,
    retry: 0,
  })
}

export function useDescricaoEstudantes(habilitado: boolean) {
  return useQuery({
    queryKey: ['educluster', 'descricao-estudantes'],
    queryFn: ({ signal }) => fetchDescricaoEstudantes(false, signal),
    staleTime: ESTAVEL,
    enabled: habilitado,
    retry: 0,
  })
}

export function useDiscrepantes(limiar: number, quadrante?: Quadrante) {
  return useQuery({
    queryKey: ['educluster', 'discrepantes', limiar, quadrante ?? null],
    queryFn: ({ signal }) => fetchDiscrepantes({ limiar, quadrante, limite: 4000 }, signal),
    staleTime: ESTAVEL,
    placeholderData: keepPreviousData,
  })
}

export function useDimensoesDesempenho(alvo: AlvoDesempenho) {
  return useQuery({
    queryKey: ['educluster', 'dimensoes-desempenho', alvo],
    queryFn: ({ signal }) => fetchDimensoesDesempenho(alvo, signal),
    staleTime: ESTAVEL,
    placeholderData: keepPreviousData,
  })
}

export function useComparacaoTradicional(tolerancia: number) {
  return useQuery({
    queryKey: ['educluster', 'comparacao', tolerancia],
    queryFn: ({ signal }) => fetchComparacaoTradicional(tolerancia, signal),
    staleTime: ESTAVEL,
    placeholderData: keepPreviousData,
  })
}

export function useCurso(coCurso: number) {
  return useQuery({
    queryKey: ['educluster', 'curso', coCurso],
    queryFn: ({ signal }) => fetchCurso(coCurso, signal),
    staleTime: ESTAVEL,
    enabled: Number.isFinite(coCurso),
  })
}

export function useClustersEstudantes() {
  return useQuery({
    queryKey: ['educluster', 'estudantes-clusters'],
    queryFn: ({ signal }) => fetchClustersEstudantes(signal),
    staleTime: ESTAVEL,
  })
}

export function useAmostraEstudantes(n: number) {
  return useQuery({
    queryKey: ['educluster', 'estudantes-amostra', n],
    queryFn: ({ signal }) => fetchAmostraEstudantes(n, signal),
    staleTime: ESTAVEL,
    placeholderData: keepPreviousData,
  })
}

export function useCalibracao() {
  return useQuery({
    queryKey: ['educluster', 'calibracao'],
    queryFn: ({ signal }) => fetchCalibracao(signal),
    staleTime: ESTAVEL,
  })
}

export function useDiscursivas() {
  return useQuery({
    queryKey: ['educluster', 'discursivas'],
    queryFn: ({ signal }) => fetchDiscursivas(signal),
    staleTime: ESTAVEL,
  })
}

export function useAreas() {
  return useQuery({
    queryKey: ['educluster', 'areas'],
    queryFn: ({ signal }) => fetchAreas(signal),
    staleTime: ESTAVEL,
  })
}

export function useDimensoes() {
  return useQuery({
    queryKey: ['educluster', 'dimensoes'],
    queryFn: ({ signal }) => fetchDimensoes(signal),
    staleTime: Infinity,
  })
}
