import { Suspense, type ReactNode } from 'react'

import { EnadeFiltros } from '../../_components/filters/EnadeFiltros'
import { LoadingSpinner } from '../../_components/feedback/LoadingSpinner'
import { EnadeTabs } from '../../_components/layout/EnadeTabs'

// As abas e os filtros leem a query string (useSearchParams), que exige um <Suspense>
// acima para o build estático não falhar. O grupo (analises) não altera as URLs.
export default function AnalisesLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner label="Carregando…" />}>
      <EnadeTabs />
      <EnadeFiltros />
      {children}
    </Suspense>
  )
}
