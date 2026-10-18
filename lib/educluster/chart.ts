export const CORES_SERIE = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#4a3aa7',
  '#e87ba4',
  '#eda100',
  '#008300',
  '#e34948',
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

export const INK = {
  primaria: '#111827',
  secundaria: '#475569',
  muda: '#64748b',
  grade: '#e2e8f0',
  eixo: '#cbd5e1',
} as const

export const GRID_COLOR = INK.grade

export const EIXO = {
  stroke: INK.eixo,
  tick: { fontSize: 11, fill: INK.muda },
} as const

export const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 8,
  borderColor: '#dfe5ee',
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

const NEUTRO_DIVERGENTE = '#f0efec'
const POLO_POSITIVO = '#1c5cab'
const POLO_NEGATIVO = '#c23b3a'
const SEQ_CLARO = '#e8f1fd'
const SEQ_ESCURO = '#1c5cab'

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
