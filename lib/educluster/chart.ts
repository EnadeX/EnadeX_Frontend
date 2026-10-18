// Séries da marca (manual p. 10): as seis categóricas na ordem; acima de seis, a forma do marcador distingue.
export const CORES_SERIE = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--ink-muted)',
  'var(--seq-4)',
] as const

export const FORMAS_SERIE = [
  'circle',
  'triangle',
  'square',
  'diamond',
  'star',
  'cross',
  'wye',
  'circle',
] as const

export type FormaSerie = (typeof FORMAS_SERIE)[number]

export function corSerie(indice: number): string {
  return CORES_SERIE[indice % CORES_SERIE.length]
}

export function formaSerie(indice: number): FormaSerie {
  return FORMAS_SERIE[indice % FORMAS_SERIE.length]
}

// `primaria` fica em hex: é a tinta escura sobre as células de calor (tintaSobre), que têm cor fixa nos dois temas.
export const INK = {
  primaria: '#0c3350',
  secundaria: 'var(--ink-muted)',
  muda: 'var(--ink-muted)',
  grade: 'var(--border)',
  eixo: 'var(--border)',
} as const

export const GRID_COLOR = INK.grade

export const EIXO = {
  stroke: INK.eixo,
  tick: { fontSize: 11, fill: INK.muda },
} as const

export const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 8,
  borderColor: 'var(--border)',
} as const

export const fmtTooltip = (formatar: (valor: number) => string) => (valor: unknown) =>
  typeof valor === 'number' ? formatar(valor) : String(valor ?? '')

type Rgb = [number, number, number]

function hexParaRgb(hex: string): Rgb {
  const limpo = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16)) as Rgb
}

function rgbParaHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

function misturar(de: string, para: string, t: number): string {
  const a = hexParaRgb(de)
  const b = hexParaRgb(para)
  const f = Math.min(1, Math.max(0, t))
  return rgbParaHex([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f])
}

// Escalas de calor em hex (a mistura é calculada aqui): polos e extremos da marca no tema claro.
// Divergente: azul-marinho e o vermelho de erro (a legenda da tela fala em azul e vermelho). O azul-marinho dá mais
// contraste à tinta das células intermediárias do que o azul de contribuição.
const NEUTRO_DIVERGENTE = '#e7f3f4' // surface-sunken
const POLO_POSITIVO = '#0c3350' // brand-navy
const POLO_NEGATIVO = '#c23b33' // danger
const SEQ_CLARO = '#c8eee8' // seq-1
const SEQ_ESCURO = '#0c3350' // seq-5

export function corDivergente(valor: number, limite: number): string {
  const t = Math.min(1, Math.abs(valor) / limite)
  return misturar(NEUTRO_DIVERGENTE, valor >= 0 ? POLO_POSITIVO : POLO_NEGATIVO, t)
}

export function corSequencial(valor: number, maximo: number): string {
  return misturar(SEQ_CLARO, SEQ_ESCURO, maximo > 0 ? valor / maximo : 0)
}

export function tintaSobre(fundo: string): string {
  const [r, g, b] = hexParaRgb(fundo)
  const luminancia = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminancia < 0.55 ? '#ffffff' : INK.primaria
}
