import type { PerfilClusterCurso } from '@/lib/educluster/types'

function desempenho(perfil: PerfilClusterCurso): number {
  return (perfil.NT_FG + perfil.NT_CE) / 2
}

function percepcao(perfil: PerfilClusterCurso): number {
  return (perfil.ODP + perfil.OPORT + perfil.INFRA) / 3
}

function mediaPonderada(perfis: PerfilClusterCurso[], valor: (p: PerfilClusterCurso) => number) {
  const total = perfis.reduce((soma, p) => soma + p.cursos, 0)
  if (total === 0) return 0
  return perfis.reduce((soma, p) => soma + valor(p) * p.cursos, 0) / total
}

function nivel(diferenca: number, limiar: number, feminino: boolean): string {
  if (diferenca > limiar) return feminino ? 'alta' : 'alto'
  if (diferenca < -limiar) return feminino ? 'baixa' : 'baixo'
  return feminino ? 'intermediária' : 'intermediário'
}

export function rotularClusters(perfis: PerfilClusterCurso[]): Record<number, string> {
  const mediaDesempenho = mediaPonderada(perfis, desempenho)
  const mediaPercepcao = mediaPonderada(perfis, percepcao)
  const rotulos: Record<number, string> = {}
  for (const perfil of perfis) {
    const d = nivel(desempenho(perfil) - mediaDesempenho, 2, false)
    const p = nivel(percepcao(perfil) - mediaPercepcao, 0.15, true)
    rotulos[perfil.Cluster_ID] = `Desempenho ${d}, percepção ${p}`
  }
  return rotulos
}
