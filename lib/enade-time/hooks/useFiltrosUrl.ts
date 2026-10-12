'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { FiltrosAnalise } from '@/lib/enade-time/types'

const KEYS: (keyof FiltrosAnalise)[] = [
  'nu_ano',
  'co_regiao',
  'co_uf',
  'co_ies',
  'co_grupo',
  'co_modalidade',
  'co_categad',
  'co_orgacad',
]

function parseNumero(v: string | null): number | undefined {
  if (v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

// Os filtros vivem na query string (deep link). Usa useSearchParams, então só pode
// ser chamado abaixo do <Suspense> de app/enade-time/enade/(analises)/layout.tsx.
export function useFiltrosUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // O objeto de searchParams muda a cada navegação; a string só quando a query muda.
  const qs = searchParams.toString()

  const filtros = useMemo<FiltrosAnalise>(() => {
    const params = new URLSearchParams(qs)
    const f: FiltrosAnalise = {}
    for (const k of KEYS) {
      const v = parseNumero(params.get(k))
      if (v !== undefined) f[k] = v
    }
    return f
  }, [qs])

  // Muda quando algum filtro muda: serve de `key` para reiniciar estado local (ex.: página).
  const chave = useMemo(() => JSON.stringify(filtros), [filtros])

  const substituir = useCallback(
    (params: URLSearchParams) => {
      const texto = params.toString()
      router.replace(texto ? `${pathname}?${texto}` : pathname, { scroll: false })
    },
    [router, pathname],
  )

  const setFiltros = useCallback(
    (next: FiltrosAnalise) => {
      const params = new URLSearchParams(qs)
      for (const k of KEYS) {
        const v = next[k]
        if (v === undefined || v === null) params.delete(k)
        else params.set(k, String(v))
      }
      substituir(params)
    },
    [qs, substituir],
  )

  const limpar = useCallback(() => {
    const params = new URLSearchParams(qs)
    for (const k of KEYS) params.delete(k)
    substituir(params)
  }, [qs, substituir])

  return { filtros, chave, qs, setFiltros, limpar }
}
