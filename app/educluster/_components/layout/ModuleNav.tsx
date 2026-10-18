'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROTAS } from '@/lib/educluster/rotas'
import { cn } from '@/lib/utils'

interface Item {
  href: string
  label: string
  prefixo?: string
}

const ITENS: Item[] = [
  { href: ROTAS.inicio, label: 'Visão geral' },
  { href: ROTAS.cursos, label: 'Perfis de curso', prefixo: ROTAS.cursos },
  { href: ROTAS.estudantes, label: 'Perfis de estudante', prefixo: ROTAS.estudantes },
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
      <nav aria-label="Seções do EduCluster" className="hidden items-center gap-7 text-body md:flex">
        {ITENS.map((item) => {
          const ativo = itemAtivo(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'rounded-marca-sm py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
                ativo ? 'font-medium text-ink-on-nav' : 'text-ink-on-nav/75 hover:text-ink-on-nav',
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
      aria-label="Seções do EduCluster"
      className="flex w-full items-center gap-1 overflow-x-auto rounded-marca-md border border-ink-on-nav/20 p-1 text-small font-medium md:hidden"
    >
      {ITENS.map((item) => {
        const ativo = itemAtivo(pathname, item)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-marca-sm px-3.5 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring',
              ativo ? 'bg-ink-on-nav/15 text-ink-on-nav' : 'text-ink-on-nav/75',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
