'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { botao } from '@/lib/brand/classes'
import { salvarTema, temaEfetivo, type EscolhaTema } from '@/lib/brand/theme'
import { cn } from '@/lib/utils'

/** Alterna claro/escuro. `aria-pressed` indica o tema escuro ativo; o rótulo diz para qual tema o botão leva. */
export function ThemeToggle({ className }: { className?: string }) {
  const [tema, setTema] = useState<EscolhaTema | null>(null)

  useEffect(() => {
    setTema(temaEfetivo())
  }, [])

  const escuro = tema === 'dark'
  const rotulo = escuro ? 'Tema claro' : 'Tema escuro'

  return (
    <button
      type="button"
      aria-pressed={escuro}
      onClick={() => {
        const proximo: EscolhaTema = temaEfetivo() === 'dark' ? 'light' : 'dark'
        salvarTema(proximo)
        setTema(proximo)
      }}
      className={cn(botao, 'px-3', className)}
    >
      {escuro ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
      <span className="sr-only sm:not-sr-only">{rotulo}</span>
    </button>
  )
}
