import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'border border-border bg-surface-sunken text-ink-muted',
  success: 'border border-success bg-surface-card text-success',
  warning: 'border border-warning bg-surface-card text-warning',
  danger: 'border border-danger bg-surface-card text-danger',
  info: 'border border-accent bg-surface-card text-accent',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-marca-sm px-2 py-0.5 text-caption font-medium',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
