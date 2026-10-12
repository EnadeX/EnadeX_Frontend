import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Tone = 'default' | 'primary' | 'success' | 'dark'

const TONE_BG: Record<Tone, string> = {
  default: 'border-[#dfe5ee] bg-white',
  primary: 'border-transparent bg-[#b45309] text-white',
  success: 'border-transparent bg-[#047857] text-white',
  dark: 'border-transparent bg-[#2d4263] text-white',
}

const TONE_LABEL: Record<Tone, string> = {
  default: 'text-[#5f7393]',
  primary: 'text-[#fffbeb]',
  success: 'text-[#d1fae5]',
  dark: 'text-[#dfe5ee]',
}

const TONE_ICON: Record<Tone, string> = {
  default: 'text-[#5f7393]',
  primary: 'text-[#fffbeb]',
  success: 'text-[#d1fae5]',
  dark: 'text-[#dfe5ee]',
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
    <div className={cn('flex flex-col gap-1 rounded-2xl border p-4 shadow-sm', TONE_BG[tone])}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-[11px] font-semibold', TONE_LABEL[tone])}>{label}</span>
        {Icon && <Icon className={cn('size-4 shrink-0', TONE_ICON[tone])} aria-hidden />}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {unit && <span className={cn('text-[11px]', TONE_LABEL[tone])}>{unit}</span>}
      </div>
      {hint && <span className={cn('text-[10px]', TONE_LABEL[tone])}>{hint}</span>}
    </div>
  )
}
