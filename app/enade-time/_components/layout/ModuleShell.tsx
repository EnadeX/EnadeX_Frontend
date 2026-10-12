import { BarChart3, Database } from 'lucide-react'
import type { ReactNode } from 'react'

import { Breadcrumb } from './Breadcrumb'
import { ModuleNav } from './ModuleNav'
import { StatusApi } from './StatusApi'

export function ModuleShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
      <header className="border-b border-[#dfe5ee] bg-white">
        <div className="flex h-[70px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Voltar para a Home" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#d97706] text-white">
                <BarChart3 className="size-5" />
              </span>
              <span className="text-[17px] font-bold tracking-tight">EnadeX</span>
            </a>
            <span className="hidden h-8 w-px bg-[#dfe5ee] sm:block" />
            <div className="hidden leading-tight sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f7393]">
                Subprojetos
              </p>
              <p className="text-sm font-semibold">ENADE-Time</p>
            </div>
          </div>
          <ModuleNav variante="topo" />
          <StatusApi />
        </div>
        <div className="border-t border-[#edf1f6] px-4 py-2 md:hidden">
          <ModuleNav variante="abas" />
        </div>
      </header>

      <div className="px-4 py-8 sm:px-6 lg:px-10">
        <Breadcrumb />
        <section className="flex flex-col gap-4 border-b border-[#dfe5ee] pb-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[29px] font-bold tracking-tight">ENADE-Time</h1>
              <span className="rounded-lg border border-[#fde68a] bg-[#fffbeb] px-2.5 py-1 text-[11px] font-semibold text-[#b45309]">
                Análise longitudinal
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-[#5f7393]">
              Séries históricas do ENADE para cursos de Computação no Norte e Nordeste e o
              experimento de processamento paralelo (SPD) sobre os microdados.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5f7393]">
            <Database className="size-4 text-[#89a1c5]" aria-hidden />
            Período: <strong className="text-[#2d4263]">2005–2021</strong> · Computação N/NE
          </div>
        </section>

        <div className="mt-8 space-y-6">{children}</div>
      </div>

      <footer className="border-t border-[#dfe5ee] bg-white px-4 py-4 text-xs text-[#5f7393] sm:px-6 lg:px-10">
        Subprojeto do ecossistema EnadeX · dados INEP/ENADE 2005–2021 (Norte e Nordeste, Computação)
      </footer>
    </main>
  )
}
