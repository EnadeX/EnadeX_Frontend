const BASE = '/educluster'

export const ROTAS = {
  homeEnadex: '/',
  inicio: BASE,
  sobre: `${BASE}/sobre`,
  cursos: `${BASE}/cursos`,
  cursosDiscrepantes: `${BASE}/cursos/discrepantes`,
  cursosDimensoes: `${BASE}/cursos/dimensoes`,
  cursosComparacao: `${BASE}/cursos/comparacao`,
  curso: (coCurso: number | string) => `${BASE}/cursos/${coCurso}`,
  estudantes: `${BASE}/estudantes`,
  estudantesCalibracao: `${BASE}/estudantes/calibracao`,
  estudantesDiscursivas: `${BASE}/estudantes/discursivas`,
} as const
