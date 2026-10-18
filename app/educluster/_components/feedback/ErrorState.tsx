'use client'

import { RefreshCw, TriangleAlert } from 'lucide-react'

import { btnSecondary } from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-marca-md border border-danger bg-surface-card p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="flex-1">
          <h4 className="text-body font-medium text-danger">Erro ao carregar dados</h4>
          <p className="mt-1 break-words text-small text-danger">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(btnSecondary, 'border-danger text-danger hover:bg-surface-sunken')}
          >
            <RefreshCw className="size-4" aria-hidden />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}
