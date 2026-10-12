export const CHART_COLORS = {
  seq: '#94a3b8',
  paralelo: '#2563eb',
  paralelo2: '#7c3aed',
  ideal: '#10b981',
  alert: '#ef4444',
  warn: '#f59e0b',
  neutral: '#64748b',
} as const

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250] as const

// Limiar de amostra: abaixo de 30 cursos por ano/grupo a média é considerada
// estatisticamente frágil e um alerta é exibido (Módulo 3 — Critério B). A unidade
// analítica é o curso-ano (as inscrições replicadas funcionam como peso), então o que
// conta é o número de cursos, não o de inscrições (enade_time, DESIGN_LOG D16).
export const LIMIAR_AMOSTRA = 30
