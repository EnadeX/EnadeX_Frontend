'use client'

import { Database } from 'lucide-react'
import { type Topico } from '@/lib/multienade/constants'
import { METODOLOGIA } from '@/lib/multienade/metodologia'

export function MetodologiaSection({ topico }: { topico: Topico }) {
  const info = METODOLOGIA[topico]

  return (
    <section id="methodology" className="mt-14 scroll-mt-20">
      <div className="border-b border-[#dfe5ee] pb-4">
        <h2 className="text-lg font-bold">Metodologia</h2>
        <p className="mt-1 text-xs text-[#8aa0c1]">Do dado bruto ao gráfico: como {info.titulo.toLowerCase()} é construída.</p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
        <p className="text-sm leading-6 text-[#536987]">{info.resumo}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#8aa0c1]">
          <Database className="size-3.5 shrink-0" />
          <span>Fontes: {info.fontes.join(' · ')}</span>
        </div>
      </div>

      <ol className="mt-5 flex flex-col">
        {info.passos.map((passo, index) => (
          <li key={passo.titulo} className="relative flex gap-4 pb-8 last:pb-0">
            {index < info.passos.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-[#dfe5ee]" aria-hidden />
            )}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-xs font-bold text-[#155eef]">
              {index + 1}
            </span>
            <div className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold">{passo.titulo}</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#607494]">{passo.descricao}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
