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
      <div className="flex items-center gap-2 text-body text-ink-muted">
        <LoaderCircle className="size-4 animate-spin text-accent" aria-hidden />
        <span>{label}</span>
      </div>
      {detalhe && <p className="max-w-md text-small text-ink-muted">{detalhe}</p>}
    </div>
  )
}
