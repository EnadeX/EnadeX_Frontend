import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function LoadingSpinner({
  label = 'Carregando…',
  detalhe,
  className,
}: {
  label?: string
  detalhe?: ReactNode
  className?: string
}) {
  return (
    <div role="status" className={cn('flex flex-col items-center justify-center gap-1 py-8 text-center', className)}>
      <div className="flex items-center gap-2 text-sm text-[#5f7393]">
        <LoaderCircle className="size-4 animate-spin text-[#0d9488]" aria-hidden />
        <span>{label}</span>
      </div>
      {detalhe && <p className="max-w-md text-xs leading-5 text-[#5f7393]">{detalhe}</p>}
    </div>
  )
}
