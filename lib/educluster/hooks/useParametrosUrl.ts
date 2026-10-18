'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useParametrosUrl() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qs = searchParams.toString()

  const ler = useCallback((chave: string) => new URLSearchParams(qs).get(chave), [qs])

  const lerNumero = useCallback(
    (chave: string, padrao?: number): number | undefined => {
      const valor = new URLSearchParams(qs).get(chave)
      if (valor === null || valor === '') return padrao
      const numero = Number(valor)
      return Number.isFinite(numero) ? numero : padrao
    },
    [qs],
  )

  const definir = useCallback(
    (valores: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams(qs)
      for (const [chave, valor] of Object.entries(valores)) {
        if (valor === undefined || valor === null || valor === '') params.delete(chave)
        else params.set(chave, String(valor))
      }
      const texto = params.toString()
      router.replace(texto ? `${pathname}?${texto}` : pathname, { scroll: false })
    },
    [qs, pathname, router],
  )

  return { qs, ler, lerNumero, definir }
}
