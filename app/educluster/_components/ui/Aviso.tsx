import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2.5 text-xs leading-5 text-[#1e3a8a]">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}
