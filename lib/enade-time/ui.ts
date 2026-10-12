// Classes compartilhadas do módulo ENADE-Time. Seguem a casca dos demais subprojetos
// (hex do grupo: borda #dfe5ee, texto #536987…) com acento âmbar, a cor do card na home.
// Substituem o @layer components da SPA original sem tocar no globals.css do grupo.

export const card = 'rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm'

const botao =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40 disabled:cursor-not-allowed disabled:opacity-50'

export const btnPrimary = `${botao} rounded-xl bg-[#b45309] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#92400e]`

export const btnSecondary = `${botao} rounded-xl border border-[#dfe5ee] bg-white px-3 py-2 text-xs font-semibold text-[#536987] hover:bg-[#f6f8fb]`

export const campo =
  'w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-2.5 text-sm outline-hidden focus:border-[#d97706] focus-visible:ring-2 focus-visible:ring-[#f59e0b]/40'

export const rotulo = 'block text-xs font-semibold text-[#536987]'

// Tabelas
export const tabelaWrapper =
  'overflow-x-auto rounded-2xl border border-[#dfe5ee] bg-white shadow-sm'
export const tabela = 'min-w-full text-sm'
export const tabelaHead = 'bg-[#f6f8fb] text-[11px] uppercase tracking-wide text-[#5f7393]'
export const th = 'px-3 py-2 font-semibold'
export const trLinha = 'border-t border-[#edf1f6] hover:bg-[#f9fafc]'
export const td = 'px-3 py-2'

export const linkTexto = 'font-medium text-[#b45309] underline hover:text-[#92400e]'
