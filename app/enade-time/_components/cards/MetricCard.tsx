import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'default' | 'primary' | 'success' | 'dark'

const TONE_BG: Record<Tone, string> = {
  default: 'border-border bg-surface-card',
  primary: 'border-transparent bg-accent text-on-accent',
  success: 'border-transparent bg-success text-on-accent',
  dark: 'border-transparent bg-surface-nav text-ink-on-nav',
}

const TONE_LABEL: Record<Tone, string> = {
  default: 'text-ink-muted',
  primary: 'text-on-accent',
  success: 'text-on-accent',
  dark: 'text-ink-on-nav',
}

const TONE_ICON: Record<Tone, string> = {
  default: 'text-ink-muted',
  primary: 'text-on-accent',
  success: 'text-on-accent',
  dark: 'text-ink-on-nav',
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  hint,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  unit?: string
  icon?: LucideIcon
  hint?: ReactNode
  tone?: Tone
}) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-marca-md border p-4 shadow-marca', TONE_BG[tone])}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-caption font-medium', TONE_LABEL[tone])}>{label}</span>
        {Icon && <Icon className={cn('size-4 shrink-0', TONE_ICON[tone])} aria-hidden />}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-kpi">{value}</span>
        {unit && <span className={cn('text-caption', TONE_LABEL[tone])}>{unit}</span>}
      </div>
      {hint && <span className={cn('text-caption', TONE_LABEL[tone])}>{hint}</span>}
    </div>
  )
}
