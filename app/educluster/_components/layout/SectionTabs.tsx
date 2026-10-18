'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export interface TabItem {
  href: string
  label: string
}

export function SectionTabs({ itens, label }: { itens: TabItem[]; label: string }) {
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
            href={item.href}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#14b8a6]/40',
              ativo ? 'bg-white text-[#0f766e] shadow-sm' : 'text-[#5f7393] hover:text-[#536987]',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
