'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export interface TabItem {
  href: string
  label: string
}

// Abas segmentadas (padrão do MultiENADE). Componente puro: a query string a preservar
// chega por `search`, para que só quem já está sob um <Suspense> precise ler a URL.
export function SectionTabs({
  itens,
  search,
  label,
}: {
  itens: TabItem[]
  search?: string
  label: string
}) {
  const pathname = usePathname()

  return (
    <nav
      aria-label={label}
      className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[#dfe5ee] bg-[#f6f8fb] p-1 text-[11px] font-semibold"
    >
      {itens.map((item) => {
        const ativo = pathname === item.href
        return (
          <Link
            key={item.href}
            href={search ? `${item.href}?${search}` : item.href}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40',
              ativo ? 'bg-white text-[#b45309] shadow-sm' : 'text-[#5f7393] hover:text-[#536987]',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
