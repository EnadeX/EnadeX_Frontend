import { LIMIAR_AMOSTRA } from '@/lib/enade-time/constants'
import type { ResumoAnual } from '@/lib/enade-time/types'

export type UnidadeAmostra = 'cursos' | 'inscrições'

// Tamanho da amostra de um grupo num ano. A unidade de análise é o curso (582 cursos-ano,
// não 24.967 inscrições); versões antigas da API não informam cursos e caem para inscrições.
export function tamanhoAmostra(p: ResumoAnual): { n: number; unidade: UnidadeAmostra } {
  return p.total_cursos !== undefined
    ? { n: p.total_cursos, unidade: 'cursos' }
    : { n: p.total_registros, unidade: 'inscrições' }
}

// "1 curso", "2 cursos", "1 inscrição", "96 inscrições".
export function rotuloAmostra(n: number, unidade: UnidadeAmostra): string {
  const singular = unidade === 'cursos' ? 'curso' : 'inscrição'
  return `${n} ${n === 1 ? singular : unidade}`
}

export function amostraReduzida(p: ResumoAnual, limiar: number = LIMIAR_AMOSTRA): boolean {
  return tamanhoAmostra(p).n < limiar
}
