import type { ReactNode } from 'react'

import { PageSection } from '../_components/layout/PageSection'

// Sem <Suspense> aqui de propósito: o redirect de enade/page.tsx precisa responder 307
// (dentro de um Suspense o Next faria streaming com status 200). O Suspense fica em (analises).
export default function EnadeLayout({ children }: { children: ReactNode }) {
  return (
    <PageSection
      title="Análises ENADE"
      description="Indicadores agregados dos microdados ENADE para cursos de Computação no Norte e Nordeste (2005–2021). Use os filtros abaixo para refinar a análise."
    >
      {children}
    </PageSection>
  )
}
