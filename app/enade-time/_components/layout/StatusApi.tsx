'use client'

import { EnadeTimeApiError } from '@/lib/enade-time/api'
import { useHealth } from '@/lib/enade-time/hooks/useHealth'
import { cn } from '@/lib/utils'

type Estado = { texto: string; classe: string }

// A barra do módulo é azul-marinho nos dois temas: o texto fica em ink-on-nav e o estado vem da cor da borda.
const NEUTRO = 'border-ink-on-nav/40 text-ink-on-nav'
const VERDE = 'border-success text-ink-on-nav'
const LARANJA = 'border-warning text-ink-on-nav'
const VERMELHO = 'border-danger text-ink-on-nav'

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
        'inline-flex min-w-0 rounded-marca-sm border px-2 py-1 text-caption font-medium sm:px-3 sm:text-small',
        estado.classe,
      )}
    >
      {estado.texto}
    </span>
  )
}
