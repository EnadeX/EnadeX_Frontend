'use client'

import { Database } from 'lucide-react'
import { type Topico } from '@/lib/multienade/constants'
import { METODOLOGIA } from '@/lib/multienade/metodologia'
import { card } from '@/lib/brand/classes'

export function MetodologiaSection({ topico }: { topico: Topico }) {
  const info = METODOLOGIA[topico]

  return (
    <section id="methodology" className="mt-14 scroll-mt-20">
      <div className="border-b border-border pb-4">
        <h2 className="text-h2 text-ink">Metodologia</h2>
        <p className="mt-1 text-small text-ink-muted">Do dado bruto ao gráfico: como {info.titulo.toLowerCase()} é construída.</p>
      </div>

      <div className={`${card} mt-5 p-5`}>
        <p className="text-body text-ink">{info.resumo}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-caption text-ink-muted">
          <Database className="size-3.5 shrink-0" />
          <span>Fontes: {info.fontes.join(' · ')}</span>
        </div>
      </div>

      <ol className="mt-5 flex flex-col">
        {info.passos.map((passo, index) => (
          <li key={passo.titulo} className="relative flex gap-4 pb-8 last:pb-0">
            {index < info.passos.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-border" aria-hidden />
            )}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent bg-surface-card font-dados text-small font-medium text-accent">
              {index + 1}
            </span>
            <div className={`${card} p-4`}>
              <h3 className="text-h3 text-ink">{passo.titulo}</h3>
              <p className="mt-1.5 text-small text-ink-muted">{passo.descricao}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
