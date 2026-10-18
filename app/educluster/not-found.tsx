import { House } from 'lucide-react'
import Link from 'next/link'

import { ROTAS } from '@/lib/educluster/rotas'
import { btnPrimary } from '@/lib/educluster/ui'

import { Card } from './_components/ui/Card'

export default function NotFound() {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-kpi">404</h2>
      <p className="mt-2 text-body text-ink-muted">A página solicitada não existe no EduCluster.</p>
      <Link href={ROTAS.inicio} className={`${btnPrimary} mt-4`}>
        <House className="size-4" aria-hidden />
        Voltar à visão geral
      </Link>
    </Card>
  )
}
