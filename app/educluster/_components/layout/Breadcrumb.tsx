'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROTAS } from '@/lib/educluster/rotas'

function secaoAtual(pathname: string): string | null {
  if (pathname === ROTAS.cursos || pathname.startsWith(`${ROTAS.cursos}/`)) return 'Perfis de curso'
  if (pathname === ROTAS.estudantes || pathname.startsWith(`${ROTAS.estudantes}/`)) {
    return 'Perfis de estudante'
  }
  if (pathname === ROTAS.sobre) return 'Sobre'
  return null
}

export function Breadcrumb() {
  const secao = secaoAtual(usePathname())

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[#5f7393]">
      <a href={ROTAS.homeEnadex} className="hover:text-[#0f766e]">
        Home
      </a>
      <span aria-hidden>/</span>
      <span>Subprojetos</span>
      <span aria-hidden>/</span>
      {secao ? (
        <>
          <Link href={ROTAS.inicio} className="hover:text-[#0f766e]">
            EduCluster
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-[#2d4263]">
            {secao}
          </span>
        </>
      ) : (
        <span aria-current="page" className="text-[#2d4263]">
          EduCluster
        </span>
      )}
    </nav>
  )
}
