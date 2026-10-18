import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-marca-md border border-border bg-surface-sunken px-3 py-2.5 text-small text-ink">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}
