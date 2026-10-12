import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-[#edf1f6] text-[#536987]',
  success: 'bg-[#f0fdf8] text-[#047857]',
  warning: 'bg-[#fff7ed] text-[#c2410c]',
  danger: 'bg-[#fef2f2] text-[#b91c1c]',
  info: 'bg-[#fffbeb] text-[#b45309]',
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
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
