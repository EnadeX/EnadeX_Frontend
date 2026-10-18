// Receitas de classe da marca EnadeX (manual p. 9, 11, 13–17; kit `enadex.css`).
// Os componentes dos subprojetos continuam existindo; estas receitas só trocam o visual por dentro.
// Regras: sem hex, sem paleta padrão do Tailwind, peso no máximo 500, sem caixa-alta.

/** Anel de foco de 2px em `focus-ring`. */
export const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring'

const botaoBase = `inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-marca-sm border px-4 font-marca text-body font-medium no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${foco}`

export const botao = `${botaoBase} border-border-control bg-surface-card text-ink hover:bg-surface-sunken`

export const botaoPrimario = `${botaoBase} border-accent bg-accent text-on-accent hover:brightness-[.92]`

/** Chip de filtro: estado pelo `aria-pressed`. */
export const chip = `inline-flex h-7 cursor-pointer items-center whitespace-nowrap rounded-marca-sm border border-border-control bg-surface-card px-3 text-small text-ink aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent ${foco}`

export const campo = `h-10 w-full rounded-marca-sm border border-border-control bg-surface-card px-3 font-marca text-body text-ink ${foco}`

export const rotulo = 'mb-1 block text-small font-medium text-ink'

export const card = 'rounded-marca-md border border-border bg-surface-card p-6 text-ink shadow-marca'

export const cardTitulo = 'text-h3 text-ink'

const badgeBase = 'inline-flex items-center gap-1 rounded-marca-sm border px-2 py-0.5 text-caption font-medium'

// Texto de status (success, warning) só sobre `surface-card` ou `surface-page`: em `surface-sunken` não passa
// de 4,5:1 no tema claro.
export const badge = {
  neutro: `${badgeBase} border-border bg-surface-sunken text-ink-muted`,
  success: `${badgeBase} border-success bg-surface-card text-success`,
  warning: `${badgeBase} border-warning bg-surface-card text-warning`,
  danger: `${badgeBase} border-danger bg-surface-card text-danger`,
  info: `${badgeBase} border-accent bg-surface-card text-accent`,
} as const

export const kpiRotulo = 'text-small text-ink-muted'
export const kpiValor = 'mt-1 text-kpi text-ink'
/** A cor da variação vem de quem usa (`text-success`, `text-danger` ou `text-ink-muted`). */
export const kpiVariacao = 'mt-1 num text-small'

export const tabela = {
  wrapper: 'overflow-x-auto rounded-marca-md border border-border bg-surface-card shadow-marca',
  head: 'bg-surface-sunken text-small text-ink-muted',
  th: 'px-3 py-2 text-left font-medium',
  tr: 'border-t border-border hover:bg-surface-sunken',
  td: 'px-3 py-2 text-ink',
} as const

const navItemBase = `inline-flex items-center rounded-marca-sm px-3 py-2 text-small font-medium transition-colors ${foco}`

export const navItem = `${navItemBase} text-ink-muted hover:text-ink`
export const navItemAtivo = `${navItemBase} bg-surface-sunken text-accent`

export const link = `rounded-marca-sm text-accent underline underline-offset-2 hover:no-underline ${foco}`

export const skeleton = 'animate-pulse rounded-marca-sm bg-surface-sunken'
