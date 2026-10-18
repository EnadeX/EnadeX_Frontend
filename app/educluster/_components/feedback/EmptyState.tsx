import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  title = 'Nenhum dado encontrado',
  description,
}: {
  title?: string
  description?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-marca-md border-2 border-dashed border-border-control bg-surface-card px-4 py-10 text-center">
      <Inbox className="mb-2 size-8 text-ink-muted" aria-hidden />
      <p className="text-body font-medium text-ink-muted">{title}</p>
      {description && <p className="mt-1 max-w-xl text-small text-ink-muted">{description}</p>}
    </div>
  )
}
