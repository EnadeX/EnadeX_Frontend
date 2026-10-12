import { House } from 'lucide-react'
import Link from 'next/link'

import { ROTAS } from '@/lib/enade-time/rotas'
import { btnPrimary } from '@/lib/enade-time/ui'

import { Card } from './_components/ui/Card'

export default function NotFound() {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold">404</h2>
      <p className="mt-2 text-sm text-[#5f7393]">A página solicitada não existe no ENADE-Time.</p>
      <Link href={ROTAS.inicio} className={`${btnPrimary} mt-4`}>
        <House className="size-4" aria-hidden />
        Voltar à visão geral
      </Link>
    </Card>
  )
}
