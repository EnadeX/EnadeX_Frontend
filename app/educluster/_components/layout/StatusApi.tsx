'use client'

import { EduClusterApiError } from '@/lib/educluster/api'
import { useHealth } from '@/lib/educluster/hooks/useEduCluster'
import { cn } from '@/lib/utils'

const NEUTRO = 'border-slate-200 bg-slate-50 text-slate-500'
const VERDE = 'border-[#a7efd0] bg-[#f0fdf8] text-[#047857]'
const LARANJA = 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
const VERMELHO = 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]'

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
      className={cn('inline-flex shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold', classe)}
    >
      {texto}
    </span>
  )
}
