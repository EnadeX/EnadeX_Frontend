'use client'

import { EnadeTimeApiError } from '@/lib/enade-time/api'
import { useHealth } from '@/lib/enade-time/hooks/useHealth'
import { cn } from '@/lib/utils'

type Estado = { texto: string; classe: string }

const NEUTRO = 'border-slate-200 bg-slate-50 text-slate-500'
const VERDE = 'border-[#a7efd0] bg-[#f0fdf8] text-[#047857]'
const LARANJA = 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
const VERMELHO = 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]'

export function StatusApi() {
  const health = useHealth()

  let estado: Estado = { texto: '● Verificando…', classe: NEUTRO }
  if (health.isSuccess && health.data.status === 'ok') {
    const fonte =
      health.data.fonte === 'supabase'
        ? ' · Supabase'
        : health.data.fonte === 'local'
          ? ' · local'
          : ''
    estado = { texto: `● API conectada · v${health.data.version}${fonte}`, classe: VERDE }
  } else if (health.isError) {
    const erro = health.error
    const status = erro instanceof EnadeTimeApiError ? erro.status : 0
    if (status === 503) estado = { texto: '● Banco indisponível', classe: LARANJA }
    else if (status === 0) estado = { texto: '● API offline', classe: VERMELHO }
    else estado = { texto: '● Erro na API', classe: VERMELHO }
  }

  return (
    <span
      aria-live="polite"
      className={cn(
        'inline-flex shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold',
        estado.classe,
      )}
    >
      {estado.texto}
    </span>
  )
}
