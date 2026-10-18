'use client'

import type { ReactNode } from 'react'

import { campo, rotulo } from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

export interface Opcao {
  valor: string
  rotulo: string
}

export function Selecao({
  label,
  valor,
  opcoes,
  onChange,
  className,
}: {
  label: string
  valor: string
  opcoes: Opcao[]
  onChange: (valor: string) => void
  className?: string
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className={rotulo}>{label}</span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className={cn(campo, 'mt-1')}>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Filtros({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-marca-md border border-border bg-surface-card p-4 shadow-marca sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}
