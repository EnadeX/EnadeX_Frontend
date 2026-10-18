import type { ReactNode } from 'react'

export function PageSection({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-h2">{title}</h2>
          {description && <p className="mt-1 max-w-3xl text-small text-ink-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
