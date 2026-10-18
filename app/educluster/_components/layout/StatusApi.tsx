'use client'

import { EduClusterApiError } from '@/lib/educluster/api'
import { useHealth } from '@/lib/educluster/hooks/useEduCluster'
import { cn } from '@/lib/utils'

// A barra do módulo é azul-marinho nos dois temas: o texto fica em ink-on-nav e o estado vem da cor da borda.
const NEUTRO = 'border-ink-on-nav/40 text-ink-on-nav'
const VERDE = 'border-success text-ink-on-nav'
const LARANJA = 'border-warning text-ink-on-nav'
const VERMELHO = 'border-danger text-ink-on-nav'

export function StatusApi() {
  const health = useHealth()

  let texto = '● Verificando…'
  let classe = NEUTRO
  if (health.isSuccess && health.data.status === 'ok') {
    const fonte = health.data.origem === 'supabase' ? 'Supabase' : health.data.origem
    if (health.data.base_cursos_em_memoria) {
      texto = `● API conectada · v${health.data.versao} · ${fonte}`
      classe = VERDE
    } else {
      texto = `● API conectada · base ainda não carregada`
      classe = LARANJA
    }
  } else if (health.isError) {
    const status = health.error instanceof EduClusterApiError ? health.error.status : 0
    texto = status === 0 ? '● API offline' : '● Erro na API'
    classe = VERMELHO
  }

  return (
    <span
      aria-live="polite"
      className={cn('inline-flex min-w-0 rounded-marca-sm border px-2 py-1 text-caption font-medium sm:px-3 sm:text-small', classe)}
    >
      {texto}
    </span>
  )
}
