import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Tom = 'padrao' | 'destaque'

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  hint,
  tom = 'padrao',
}: {
  label: string
  value: ReactNode
  unit?: string
  icon?: LucideIcon
  hint?: ReactNode
  tom?: Tom
}) {
  const destaque = tom === 'destaque'
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-marca-md border p-4 shadow-marca',
        destaque ? 'border-transparent bg-accent text-on-accent' : 'border-border bg-surface-card',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-caption font-medium', destaque ? 'text-on-accent' : 'text-ink-muted')}>
          {label}
        </span>
        {Icon && <Icon className={cn('size-4 shrink-0', destaque ? 'text-on-accent' : 'text-ink-muted')} aria-hidden />}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-kpi">{value}</span>
        {unit && <span className={cn('text-caption', destaque ? 'text-on-accent' : 'text-ink-muted')}>{unit}</span>}
      </div>
      {hint && <span className={cn('text-caption ', destaque ? 'text-on-accent' : 'text-ink-muted')}>{hint}</span>}
    </div>
  )
}

export function KpiGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 | 5 }) {
  const colunas = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-5',
  }[cols]
  return <div className={cn('grid grid-cols-1 gap-3', colunas)}>{children}</div>
}
