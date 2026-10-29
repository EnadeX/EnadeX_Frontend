// Respostas mínimas das quatro APIs que alimentam os KPIs da home (lib/home/kpis.ts).
// Os totais batem com a base real consultada em 2026-10-28; as linhas são só o necessário para contar.
// A série do ENADE-Time reaproveita a gravação real de tests/fixtures/enade-time/resumo-anual.json.
import type { DatasetResumoResponse } from '@/lib/e-xplainenade/api'
import type { AreasResposta } from '@/lib/educluster/types'
import type { ResumoAnual } from '@/lib/enade-time/types'
import type { AssociacaoRow, ClusterRow } from '@/lib/multienade/api'
import resumoAnualReal from './enade-time/resumo-anual.json'

export const clustersHome = Array.from({ length: 161 }, (_, i) => ({ CO_CURSO: i, Cluster_ID: i % 3 })) as unknown as ClusterRow[]

export const regrasHome = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })) as unknown as AssociacaoRow[]

export const datasetResumoHome: DatasetResumoResponse = {
  n_cursos: 705,
  n_cursos_excluidos: 2,
  motivo_exclusao: null,
  funil_cursos: {},
  n_estudantes_representados: 18543,
  media_nota_geral: 36.80831290783111,
  desvio_padrao_nota_geral: 6.623146971054432,
}

export const areasHome: AreasResposta = {
  total: 30,
  areas: [
    { area: 'A07', cursos: 798, estudantes: 143305, NT_FG: 31.38, NT_CE: 42.4, ODP: 5.45 },
    { area: 'outras', cursos: 3034, estudantes: 172927, NT_FG: 0, NT_CE: 0, ODP: 0 },
  ],
}

export const resumoAnualHome = resumoAnualReal as ResumoAnual[]
