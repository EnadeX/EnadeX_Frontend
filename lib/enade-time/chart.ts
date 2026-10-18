// Estilo comum dos gráficos Recharts do módulo: grade, eixos e tooltip com os tokens da marca EnadeX.

export const GRID_COLOR = 'var(--border)'

export const EIXO = {
  stroke: 'var(--border)',
  tick: { fontSize: 11, fill: 'var(--ink-muted)' },
} as const

export const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 8,
  borderColor: 'var(--border)',
} as const

// O Recharts 3 tipa o valor do tooltip como ValueType | undefined, não number.
export const fmtTooltip = (formatar: (valor: number) => string) => (valor: unknown) =>
  typeof valor === 'number' ? formatar(valor) : String(valor ?? '')
