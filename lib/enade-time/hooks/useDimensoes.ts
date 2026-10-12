'use client'

import { useQuery } from '@tanstack/react-query'

import {
  fetchAnos,
  fetchCategoriasAdm,
  fetchGrupos,
  fetchModalidades,
  fetchOrganizacoesAcademicas,
  fetchRegioes,
  fetchUFs,
} from '@/lib/enade-time/api'

const LONG_STALE = 24 * 60 * 60_000

export function useRegioes() {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'regioes'],
    queryFn: ({ signal }) => fetchRegioes(signal),
    staleTime: LONG_STALE,
  })
}

export function useUFs(co_regiao?: number) {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'ufs', co_regiao ?? null],
    queryFn: ({ signal }) => fetchUFs(co_regiao, signal),
    staleTime: LONG_STALE,
  })
}

export function useAnos() {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'anos'],
    queryFn: ({ signal }) => fetchAnos(signal),
    staleTime: LONG_STALE,
  })
}

export function useGrupos() {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'grupos'],
    queryFn: ({ signal }) => fetchGrupos(signal),
    staleTime: LONG_STALE,
  })
}

export function useModalidades() {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'modalidades'],
    queryFn: ({ signal }) => fetchModalidades(signal),
    staleTime: LONG_STALE,
  })
}

export function useCategoriasAdm() {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'categorias-adm'],
    queryFn: ({ signal }) => fetchCategoriasAdm(signal),
    staleTime: LONG_STALE,
  })
}

export function useOrganizacoesAcademicas() {
  return useQuery({
    queryKey: ['enade-time', 'dim', 'organizacoes-academicas'],
    queryFn: ({ signal }) => fetchOrganizacoesAcademicas(signal),
    staleTime: LONG_STALE,
  })
}
