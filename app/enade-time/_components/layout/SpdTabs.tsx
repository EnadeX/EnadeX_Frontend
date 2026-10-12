'use client'

import { usePathname } from 'next/navigation'

import { ROTAS } from '@/lib/enade-time/rotas'

import { SectionTabs, type TabItem } from './SectionTabs'

const ABAS: TabItem[] = [
  { href: ROTAS.spdComparativo, label: 'Comparativo' },
  { href: ROTAS.spdExecucoes, label: 'Execuções' },
  { href: ROTAS.spdMetricas, label: 'Métricas' },
]

export function SpdTabs() {
  // O detalhe de etapas é uma página filha: as abas somem e fica só o link de voltar.
  if (usePathname().startsWith(ROTAS.spdEtapasPrefixo)) return null
  return <SectionTabs itens={ABAS} label="Benchmark SPD" />
}
