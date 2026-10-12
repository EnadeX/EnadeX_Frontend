import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

export function LoadingSpinner({
  label = 'Carregando…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-center gap-2 py-6 text-sm text-[#5f7393]',
        className,
      )}
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  )
}
