'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROTAS } from '@/lib/enade-time/rotas'
import { cn } from '@/lib/utils'

interface Item {
  href: string
  label: string
  // Prefixo que mantém o item ativo nas sub-rotas; sem ele, só a rota exata.
  prefixo?: string
}

const ITENS: Item[] = [
  { href: ROTAS.inicio, label: 'Visão geral' },
  { href: ROTAS.enadeAnual, label: 'Análises ENADE', prefixo: ROTAS.enade },
  { href: ROTAS.spdComparativo, label: 'Benchmark SPD', prefixo: ROTAS.spd },
  { href: ROTAS.sobre, label: 'Sobre' },
]

function itemAtivo(pathname: string, item: Item): boolean {
  if (!item.prefixo) return pathname === item.href
  return pathname === item.prefixo || pathname.startsWith(`${item.prefixo}/`)
}

export function ModuleNav({ variante }: { variante: 'topo' | 'abas' }) {
  const pathname = usePathname()

  if (variante === 'topo') {
    return (
      <nav aria-label="Seções do ENADE-Time" className="hidden items-center gap-7 text-sm md:flex">
        {ITENS.map((item) => {
          const ativo = itemAtivo(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'rounded-md py-1 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40',
                ativo ? 'font-medium text-[#111827]' : 'text-[#5f7393] hover:text-[#111827]',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Seções do ENADE-Time"
      className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-[#dfe5ee] bg-[#f6f8fb] p-1 text-[11px] font-semibold md:hidden"
    >
      {ITENS.map((item) => {
        const ativo = itemAtivo(pathname, item)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40',
              ativo ? 'bg-white text-[#b45309] shadow-sm' : 'text-[#5f7393]',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
