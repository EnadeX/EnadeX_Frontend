// Tokens da marca EnadeX (manual v1.0, p. 9 e 10; kit `enadex-marca/web/enadex.css`).
// Fonte única e tipada: `app/globals.css` repete estes valores como variáveis CSS e um teste confere que os
// dois arquivos continuam iguais.
//

export const marca = {
  'brand-navy': '#0c3350',
  'brand-aqua': '#19d3cb',
  'brand-blue': '#12afd3',
  'brand-mint': '#2fd6ae',
} as const

const interfaceClaro = {
  'surface-page': '#f4fafa',
  'surface-card': '#ffffff',
  'surface-sunken': '#e7f3f4',
  'surface-nav': '#0c3350',
  ink: '#0c3350',
  'ink-muted': '#4a6270',
  'ink-on-nav': '#f2fbfb',
  border: '#d3e5e8',
  'border-control': '#6e8e99',
  accent: '#087380',
  'on-accent': '#ffffff',
  'focus-ring': '#0b86a8',
  success: '#14805a',
  warning: '#9a6700',
  danger: '#c23b33',
} as const

export type TokenInterface = keyof typeof interfaceClaro

const interfaceEscuro: Record<TokenInterface, string> = {
  'surface-page': '#071c2c',
  'surface-card': '#0d2a40',
  'surface-sunken': '#0a2234',
  'surface-nav': '#05141f',
  ink: '#e4f2f4',
  'ink-muted': '#9db8c3',
  'ink-on-nav': '#f2fbfb',
  border: '#1d3d54',
  'border-control': '#5d7f93',
  accent: '#3fdcd4',
  'on-accent': '#062030',
  'focus-ring': '#4cc8e6',
  success: '#3dd39a',
  warning: '#f2c14e',
  danger: '#f27a72',
}

export const interfaceTemas = { claro: interfaceClaro, escuro: interfaceEscuro } as const

const dadosClaro = {
  'contrib-positive': '#1488b8',
  'contrib-negative': '#c9661f',
  // séries categóricas: use na ordem; series-1 é a entidade em foco
  'series-1': '#0c3350',
  'series-2': '#206f6f',
  'series-3': '#2e96dc',
  'series-4': '#cc6a28',
  'series-5': '#7632c3',
  'series-6': '#8a2b40',
  // escala do conceito ENADE (1 a 5)
  'seq-1': '#c8eee8',
  'seq-2': '#9fe6da',
  'seq-3': '#3cc4c0',
  'seq-4': '#11789f',
  'seq-5': '#0c3350',
} as const

export type TokenDados = keyof typeof dadosClaro

const dadosEscuro: Record<TokenDados, string> = {
  'contrib-positive': '#4cc8e6',
  'contrib-negative': '#f29a55',
  'series-1': '#e4f2f4',
  'series-2': '#37beb5',
  'series-3': '#467cb9',
  'series-4': '#f1ad6a',
  'series-5': '#b899f5',
  'series-6': '#d34a61',
  'seq-1': '#174a63',
  'seq-2': '#156a84',
  'seq-3': '#22a0b2',
  'seq-4': '#2fc4c0',
  'seq-5': '#8cf1ea',
}

export const dados = { claro: dadosClaro, escuro: dadosEscuro } as const

const CLUSTERS = ['cluster-1', 'cluster-2', 'cluster-3', 'cluster-4', 'cluster-5', 'cluster-6'] as const
export type TokenCluster = (typeof CLUSTERS)[number]

/**
 * Cores dos clusters do MultiENADE: as seis séries categóricas do manual (p. 10), na mesma ordem.
 * No CSS são `--cluster-n: var(--series-n)`, então trocam de tema junto com as séries.
 */
export const clusters = {
  claro: Object.fromEntries(CLUSTERS.map((c, i) => [c, dadosClaro[`series-${i + 1}` as TokenDados]])) as Record<TokenCluster, string>,
  escuro: Object.fromEntries(CLUSTERS.map((c, i) => [c, dadosEscuro[`series-${i + 1}` as TokenDados]])) as Record<TokenCluster, string>,
} as const

/**
 * Diferença mínima (ΔE2000) entre dois clusters, também na simulação de deuteranopia e protanopia.
 * O grupo adotou 13 (e não 15) para seguir as séries do manual: no tema escuro com protanopia, os pares
 * series-3 × series-5 e series-1 × series-2 ficam entre 13,8 e 14,7 (decisão de 18/10/2026).
 */
export const DELTA_E_MIN_CLUSTERS = 13

export type Tema = keyof typeof interfaceTemas
export type TokenCor = TokenInterface | TokenDados

/** Todas as cores de um tema, interface e dados juntos. */
export function coresDoTema(tema: Tema): Record<TokenCor, string> {
  return { ...interfaceTemas[tema], ...dados[tema] }
}

export const espaco = { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 12: '48px' } as const
export const raio = { sm: '4px', md: '8px', lg: '12px' } as const
export const sombra = {
  claro: { card: '0 1px 2px rgba(12, 51, 80, .08)', overlay: '0 8px 24px rgba(12, 51, 80, .16)' },
  escuro: { card: '0 1px 2px rgba(0, 0, 0, .4)', overlay: '0 8px 24px rgba(0, 0, 0, .5)' },
} as const

/** Pares texto × fundo que o manual garante acima de 4,5:1 nos dois temas. */
export const PARES_TEXTO: ReadonlyArray<readonly [TokenCor, TokenCor]> = [
  ['ink', 'surface-page'],
  ['ink', 'surface-card'],
  ['ink', 'surface-sunken'],
  ['ink-muted', 'surface-page'],
  ['ink-muted', 'surface-card'],
  ['ink-muted', 'surface-sunken'],
  ['ink-on-nav', 'surface-nav'],
  ['accent', 'surface-page'],
  ['accent', 'surface-card'],
  ['on-accent', 'accent'],
  ['success', 'surface-page'],
  ['success', 'surface-card'],
  ['warning', 'surface-page'],
  ['warning', 'surface-card'],
  ['danger', 'surface-page'],
  ['danger', 'surface-card'],
]

/** Bordas de controle e anel de foco: 3:1 sobre as superfícies (WCAG 1.4.11). */
export const PARES_GRAFICOS: ReadonlyArray<readonly [TokenCor, TokenCor]> = [
  ['border-control', 'surface-page'],
  ['border-control', 'surface-card'],
  ['focus-ring', 'surface-page'],
  ['focus-ring', 'surface-card'],
]

/** Pares que NÃO passam de 4,5:1 no tema claro: texto de status nunca vai sobre `surface-sunken`. */
export const PARES_PROIBIDOS: ReadonlyArray<readonly [TokenCor, TokenCor]> = [
  ['success', 'surface-sunken'],
  ['warning', 'surface-sunken'],
]

function luminancia(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste WCAG 2.1 entre duas cores `#rrggbb`. */
export function contraste(a: string, b: string) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

export { luminancia }
