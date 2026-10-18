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
      className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-marca-md border border-border bg-surface-sunken p-1 text-caption font-medium"
    >
      {itens.map((item) => {
        const ativo = pathname === item.href
        return (
          <Link
            key={item.href}
            href={search ? `${item.href}?${search}` : item.href}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-marca-sm px-3.5 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
              ativo ? 'bg-surface-card text-accent shadow-marca' : 'text-ink-muted hover:text-ink-muted',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
