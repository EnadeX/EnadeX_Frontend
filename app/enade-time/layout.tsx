import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Providers } from './_components/Providers'
import { ModuleShell } from './_components/layout/ModuleShell'

export const metadata: Metadata = {
  title: 'ENADE-Time | EnadeX',
  description:
    'Análise longitudinal do ENADE (2005–2021) para cursos de Computação no Norte e Nordeste e benchmark de processamento paralelo.',
}

export default function EnadeTimeLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ModuleShell>{children}</ModuleShell>
    </Providers>
  )
}
