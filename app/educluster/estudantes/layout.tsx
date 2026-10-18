import { Suspense, type ReactNode } from 'react'

import { LoadingSpinner } from '../_components/feedback/LoadingSpinner'
import { PageSection } from '../_components/layout/PageSection'
import { SectionTabs, type TabItem } from '../_components/layout/SectionTabs'
import { ROTAS } from '@/lib/educluster/rotas'

const ABAS: TabItem[] = [
  { href: ROTAS.estudantes, label: 'Desempenho (A1)' },
  { href: ROTAS.estudantesCalibracao, label: 'Calibração (A3)' },
  { href: ROTAS.estudantesDiscursivas, label: 'Discursivas (A4)' },
]

export default function EstudantesLayout({ children }: { children: ReactNode }) {
  return (
    <PageSection
      title="Perfis de estudante"
      description="Unidade de análise: o estudante, usando só o arq3 (notas, percepção da prova e situação das discursivas). Variáveis de outros arquivos não entram aqui porque a versão LGPD não permite ligar arquivos no nível do indivíduo."
    >
      <SectionTabs itens={ABAS} label="Análises de estudante" />
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </PageSection>
  )
}
