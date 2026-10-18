// Tema claro/escuro da marca (porte do `theme.js` do kit). Sem escolha salva, segue o sistema.

export type EscolhaTema = 'light' | 'dark'

export const CHAVE_TEMA = 'enx-theme'

export function lerTema(): EscolhaTema | null {
  try {
    const salvo = window.localStorage.getItem(CHAVE_TEMA)
    return salvo === 'light' || salvo === 'dark' ? salvo : null
  } catch {
    return null
  }
}

export function salvarTema(tema: EscolhaTema) {
  document.documentElement.dataset.theme = tema
  try {
    window.localStorage.setItem(CHAVE_TEMA, tema)
  } catch {}
}

/** O tema que está valendo: o do `data-theme` (ou o salvo); senão, o do sistema. */
export function temaEfetivo(): EscolhaTema {
  const escolhido = document.documentElement.dataset.theme ?? lerTema()
  if (escolhido === 'light' || escolhido === 'dark') return escolhido
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Script inline do <head>: aplica o tema salvo antes da primeira pintura, para a página não piscar no claro.
 * Fica como string porque roda antes do React.
 */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`
