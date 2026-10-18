// Cores dos gráficos: tokens da marca EnadeX (manual p. 9 e 10); trocam de tema sozinhas.
export const CHART_COLORS = {
  seq: 'var(--ink-muted)',
  paralelo: 'var(--series-2)',
  paralelo2: 'var(--series-3)',
  ideal: 'var(--success)',
  alert: 'var(--danger)',
  warn: 'var(--warning)',
  neutral: 'var(--ink-muted)',
} as const

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250] as const

// Limiar de amostra: abaixo de 30 cursos por ano/grupo a média é considerada
// estatisticamente frágil e um alerta é exibido (Módulo 3 — Critério B). A unidade
// analítica é o curso-ano (as inscrições replicadas funcionam como peso), então o que
// conta é o número de cursos, não o de inscrições (enade_time, DESIGN_LOG D16).
export const LIMIAR_AMOSTRA = 30
