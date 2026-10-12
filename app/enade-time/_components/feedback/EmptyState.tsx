import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  title = 'Nenhum dado encontrado',
  description,
}: {
  title?: string
  description?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#dbe6f7] bg-white px-4 py-10 text-center">
      <Inbox className="mb-2 size-8 text-[#5f7393]" aria-hidden />
      <p className="text-sm font-semibold text-[#536987]">{title}</p>
      {description && <p className="mt-1 max-w-xl text-xs text-[#5f7393]">{description}</p>}
    </div>
  )
}
