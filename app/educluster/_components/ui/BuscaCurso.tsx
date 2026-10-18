'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { ROTAS } from '@/lib/educluster/rotas'
import { btnSecondary, campo, rotulo } from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

export function BuscaCurso() {
  const router = useRouter()
  const [valor, setValor] = useState('')

  function abrir(evento: FormEvent) {
    evento.preventDefault()
    const codigo = Number(valor.trim())
    if (Number.isInteger(codigo) && codigo > 0) router.push(ROTAS.curso(codigo))
  }

  return (
    <form onSubmit={abrir} className="flex items-end gap-2">
      <label className="min-w-0 flex-1">
        <span className={rotulo}>Abrir curso pelo código</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/\D/g, ''))}
          placeholder="Ex.: 19"
          className={cn(campo, 'mt-1')}
        />
      </label>
      <button type="submit" className={cn(btnSecondary, 'h-[38px]')} disabled={!valor}>
        <Search className="size-4" aria-hidden />
        Abrir
      </button>
    </form>
  )
}
