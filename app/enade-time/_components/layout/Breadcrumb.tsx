'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROTAS } from '@/lib/enade-time/rotas'

function secaoAtual(pathname: string): string | null {
  if (pathname === ROTAS.enade || pathname.startsWith(`${ROTAS.enade}/`)) return 'Análises ENADE'
  if (pathname === ROTAS.spd || pathname.startsWith(`${ROTAS.spd}/`)) return 'Benchmark SPD'
  if (pathname === ROTAS.sobre) return 'Sobre'
  return null
}

export function Breadcrumb() {
  const secao = secaoAtual(usePathname())

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-2 text-small text-ink-muted"
    >
      <a href={ROTAS.homeEnadex} className="hover:text-accent">
        Home
      </a>
      <span aria-hidden>/</span>
      <span>Subprojetos</span>
      <span aria-hidden>/</span>
      {secao ? (
        <>
          <Link href={ROTAS.inicio} className="hover:text-accent">
            ENADE-Time
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-ink">
            {secao}
          </span>
        </>
      ) : (
        <span aria-current="page" className="text-ink">
          ENADE-Time
        </span>
      )}
    </nav>
  )
}
