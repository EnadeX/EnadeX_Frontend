// Cores e estilos de gráfico da marca (manual p. 10 e 16). Tudo como `var(--token)`: o SVG do Recharts aceita
// variáveis CSS em `fill` e `stroke`, então o gráfico troca de tema sem mudar a lógica do componente.

export const CORES_GRAFICO = {
  grade: 'var(--border)',
  eixo: 'var(--ink-muted)',
  tooltipBorda: 'var(--border)',
  series1: 'var(--series-1)',
  series2: 'var(--series-2)',
  series3: 'var(--series-3)',
  series4: 'var(--series-4)',
  series5: 'var(--series-5)',
  series6: 'var(--series-6)',
  contribPositiva: 'var(--contrib-positive)',
  contribNegativa: 'var(--contrib-negative)',
  seq1: 'var(--seq-1)',
  seq2: 'var(--seq-2)',
  seq3: 'var(--seq-3)',
  seq4: 'var(--seq-4)',
  seq5: 'var(--seq-5)',
  cluster1: 'var(--cluster-1)',
  cluster2: 'var(--cluster-2)',
  cluster3: 'var(--cluster-3)',
  cluster4: 'var(--cluster-4)',
  cluster5: 'var(--cluster-5)',
  cluster6: 'var(--cluster-6)',
} as const

/** Rótulos de eixo: 11px (o menor tamanho do manual), fonte do sistema, `ink-muted`. */
export const EIXO_MARCA = {
  stroke: 'var(--border)',
  tick: { fontSize: 11, fill: 'var(--ink-muted)', fontFamily: 'var(--font-data)' },
} as const

export const TOOLTIP_MARCA = {
  fontSize: 11,
  fontFamily: 'var(--font-data)',
  borderRadius: 8,
  borderColor: 'var(--border)',
  backgroundColor: 'var(--surface-card)',
  color: 'var(--ink)',
} as const
