import type { HTMLAttributes, ReactNode } from 'react'

import { card } from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(card, className)} {...props} />
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
        {description && <p className="mt-1 max-w-3xl text-xs leading-5 text-[#5f7393]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
