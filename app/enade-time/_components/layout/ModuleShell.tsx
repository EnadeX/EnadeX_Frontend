import { Database } from 'lucide-react'
import type { ReactNode } from 'react'

import { BarraModulo } from '@/components/brand/layout/BarraModulo'
import { badge } from '@/lib/brand/classes'

import { Breadcrumb } from './Breadcrumb'
import { ModuleNav } from './ModuleNav'
import { StatusApi } from './StatusApi'

export function ModuleShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface-page font-marca text-body text-ink">
      <BarraModulo
        nome={
          <span className="flex flex-col leading-tight">
            <span className="hidden text-caption font-normal text-ink-on-nav/80 sm:block">Subprojetos</span>
            <span className="hidden text-h3 sm:block">ENADE-Time</span>
          </span>
        }
        inferior={
          <div className="border-t border-ink-on-nav/15 px-4 py-2 md:hidden">
            <ModuleNav variante="abas" />
          </div>
        }
      >
        <ModuleNav variante="topo" />
        <StatusApi />
      </BarraModulo>

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <Breadcrumb />
        <section className="flex flex-col gap-4 border-b border-border pb-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-display text-ink">ENADE-Time</h1>
              <span className={badge.info}>Análise longitudinal</span>
            </div>
            <p className="mt-2 max-w-3xl text-body text-ink-muted">
              Séries históricas do ENADE para cursos de Computação no Norte e Nordeste e o
              experimento de processamento paralelo (SPD) sobre os microdados.
            </p>
          </div>
          <div className="flex items-center gap-2 text-small text-ink-muted">
            <Database className="size-4 text-ink-muted" aria-hidden />
            Período: <strong className="font-medium text-ink">2005–2021</strong> · Computação N/NE
          </div>
        </section>

        <div className="mt-8 space-y-6">{children}</div>
      </div>

      <footer className="border-t border-border bg-surface-card px-4 py-4 text-small text-ink-muted sm:px-6 lg:px-10">
        Subprojeto do ecossistema EnadeX · dados INEP/ENADE 2005–2021 (Norte e Nordeste, Computação)
      </footer>
    </main>
  )
}
