// Classes compartilhadas do EduCluster, montadas com as receitas da marca EnadeX (lib/brand/classes.ts).
import { foco, tabela as tabelaMarca } from '@/lib/brand/classes'

export const card = 'min-w-0 rounded-marca-md border border-border bg-surface-card p-5 text-ink shadow-marca'

const botao = `inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-marca-sm border px-3 font-marca text-small font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${foco}`

export const btnPrimary = `${botao} border-accent bg-accent px-4 text-on-accent hover:brightness-[.92]`

export const btnSecondary = `${botao} border-border-control bg-surface-card text-ink hover:bg-surface-sunken`

export const campo = `h-10 w-full rounded-marca-sm border border-border-control bg-surface-card px-3 text-body text-ink ${foco}`

export const rotulo = 'block text-small font-medium text-ink'

export const tabelaWrapper = tabelaMarca.wrapper
export const tabela = 'min-w-full text-body'
export const tabelaHead = tabelaMarca.head
export const th = 'px-3 py-2 text-left font-medium'
export const thNum = 'px-3 py-2 text-right font-medium'
export const trLinha = tabelaMarca.tr
export const td = 'px-3 py-2 text-ink'
export const tdNum = 'num px-3 py-2 text-right text-ink'

export const linkTexto = `rounded-marca-sm font-medium text-accent underline underline-offset-2 hover:no-underline ${foco}`

export const textoApoio = 'text-small text-ink-muted'
