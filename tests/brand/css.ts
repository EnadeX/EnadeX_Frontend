// Leitura de app/globals.css para os testes de sincronia com lib/brand/tokens.ts.
import { readFileSync } from 'node:fs'

export const CSS = readFileSync('app/globals.css', 'utf8')

/** Conteúdo do primeiro bloco `{…}` que segue `cabecalho`. */
export function bloco(cabecalho: string, css = CSS) {
  const inicio = css.indexOf(cabecalho)
  if (inicio < 0) throw new Error(`bloco não encontrado: ${cabecalho}`)
  let i = css.indexOf('{', inicio) + 1
  const comeco = i
  for (let nivel = 1; nivel > 0; i++) {
    if (css[i] === '{') nivel++
    else if (css[i] === '}') nivel--
  }
  return css.slice(comeco, i - 1)
}

export function variaveis(trecho: string): Record<string, string> {
  return Object.fromEntries([...trecho.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, nome, valor]) => [nome, valor.trim()]))
}

export const tokensClaro = () => variaveis(bloco(':root {'))
export const tokensEscuroSistema = () => variaveis(bloco(":root:not([data-theme='light']) {"))
export const tokensEscuroForcado = () => variaveis(bloco(":root[data-theme='dark'] {"))

/** Todos os nomes `--x` definidos em qualquer lugar do globals.css. */
export const nomesDefinidos = () => new Set([...CSS.matchAll(/(--[\w-]+):/g)].map((m) => m[1]))
