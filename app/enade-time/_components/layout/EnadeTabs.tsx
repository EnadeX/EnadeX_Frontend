'use client'

import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import { ROTAS } from '@/lib/enade-time/rotas'

import { SectionTabs, type TabItem } from './SectionTabs'

const ABAS: TabItem[] = [
  { href: ROTAS.enadeAnual, label: 'Por Ano' },
  { href: ROTAS.enadeRegional, label: 'Por Região' },
  { href: ROTAS.enadeUf, label: 'Por UF' },
  { href: ROTAS.enadeIes, label: 'Ranking IES' },
  { href: ROTAS.enadeComparar, label: 'Comparar' },
  { href: ROTAS.enadeRegistros, label: 'Registros' },
]

// Lê a URL (filtros), então só pode ser renderizado sob o <Suspense> de enade/(analises).
export function EnadeTabs() {
  const { qs } = useFiltrosUrl()
  return <SectionTabs itens={ABAS} search={qs} label="Análises ENADE" />
}
