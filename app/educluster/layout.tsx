import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Providers } from './_components/Providers'
import { ModuleShell } from './_components/layout/ModuleShell'

export const metadata: Metadata = {
  title: 'EduCluster | EnadeX',
  description:
    'Perfis acadêmicos latentes no ENADE 2021: clusterização de cursos e estudantes, validação e interpretação automática.',
}

export default function EduClusterLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ModuleShell>{children}</ModuleShell>
    </Providers>
  )
}
