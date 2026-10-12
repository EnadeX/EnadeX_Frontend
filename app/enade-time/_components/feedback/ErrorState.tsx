'use client'

import { RefreshCw, TriangleAlert } from 'lucide-react'

import { btnSecondary } from '@/lib/enade-time/ui'
import { cn } from '@/lib/utils'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#b91c1c]" aria-hidden />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[#b91c1c]">Erro ao carregar dados</h4>
          <p className="mt-1 break-words text-xs text-[#b91c1c]">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(btnSecondary, 'border-[#fecaca] text-[#b91c1c] hover:bg-[#fee2e2]')}
          >
            <RefreshCw className="size-4" aria-hidden />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}
