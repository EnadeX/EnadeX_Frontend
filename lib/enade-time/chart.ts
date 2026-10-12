// Estilo comum dos gráficos Recharts do módulo (grade, eixos e tooltip no padrão do grupo).

export const GRID_COLOR = '#edf1f6'

export const EIXO = {
  stroke: '#dfe5ee',
  tick: { fontSize: 11, fill: '#5f7393' },
} as const

export const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 8,
  borderColor: '#dfe5ee',
} as const

// O Recharts 3 tipa o valor do tooltip como ValueType | undefined, não number.
export const fmtTooltip = (formatar: (valor: number) => string) => (valor: unknown) =>
  typeof valor === 'number' ? formatar(valor) : String(valor ?? '')
