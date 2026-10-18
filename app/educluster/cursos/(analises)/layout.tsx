import { Suspense, type ReactNode } from 'react'

import { LoadingSpinner } from '../../_components/feedback/LoadingSpinner'
import { PageSection } from '../../_components/layout/PageSection'
import { SectionTabs, type TabItem } from '../../_components/layout/SectionTabs'
import { ROTAS } from '@/lib/educluster/rotas'

const ABAS: TabItem[] = [
  { href: ROTAS.cursos, label: 'Perfis (A6)' },
  { href: ROTAS.cursosDiscrepantes, label: 'Discrepantes (A7)' },
  { href: ROTAS.cursosDimensoes, label: 'Dimensões e desempenho (A8)' },
  { href: ROTAS.cursosComparacao, label: 'Comparação com o ranking' },
]

export default function CursosLayout({ children }: { children: ReactNode }) {
  return (
    <PageSection
      title="Perfis de curso"
      description="Unidade de análise: o curso. Na versão LGPD dos microdados cada arquivo foi embaralhado de forma independente, então desempenho (arq3) e percepção do curso (arq4) só podem ser cruzados agregando por CO_CURSO. Base: cursos com pelo menos 20 respondentes nos dois arquivos."
    >
      <SectionTabs itens={ABAS} label="Análises de curso" />
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </PageSection>
  )
}
