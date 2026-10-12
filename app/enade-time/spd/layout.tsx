import type { ReactNode } from 'react'

import { PageSection } from '../_components/layout/PageSection'
import { SpdTabs } from '../_components/layout/SpdTabs'

export default function SpdLayout({ children }: { children: ReactNode }) {
  return (
    <PageSection
      title="Benchmark SPD"
      description="Resultados do experimento de processamento paralelo dos microdados ENADE. Comparação entre execução sequencial e paralela (2, 3, 4 e 6 workers, em duas ordens de submissão)."
    >
      <SpdTabs />
      {children}
    </PageSection>
  )
}
