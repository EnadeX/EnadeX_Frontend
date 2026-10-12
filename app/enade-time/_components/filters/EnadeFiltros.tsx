'use client'

import { usePathname } from 'next/navigation'

import { ROTAS } from '@/lib/enade-time/rotas'

import { FiltrosAnaliseBar } from './FiltrosAnalise'

// A página de comparação tem seus próprios seletores (dimensão + 2 grupos); a barra de
// filtros globais é ocultada ali para evitar conflito.
export function EnadeFiltros() {
  if (usePathname().startsWith(ROTAS.enadeComparar)) return null
  return <FiltrosAnaliseBar />
}
