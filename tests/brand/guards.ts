// Guarda de marca (plano, seção 2.2): regras que olham só classes e estilos, nunca o texto dos subprojetos.
import { readFileSync } from 'node:fs'

export type Violacao = { arquivo: string; linha: number; regra: string; trecho: string }

const PALETA_TAILWIND =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'

const REGRAS: { regra: string; padrao: RegExp }[] = [
  { regra: 'cor hex solta', padrao: /(?<!href=["'])(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g },
  {
    regra: 'paleta padrão do Tailwind',
    padrao: new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|outline|from|to|via|shadow|divide|decoration|accent|caret)-(?:${PALETA_TAILWIND})-\\d{2,3}\\b`, 'g'),
  },
  { regra: 'peso acima de 500', padrao: /\bfont-(?:semibold|bold|extrabold|black)\b/g },
  { regra: 'caixa-alta', padrao: /\buppercase\b/g },
  { regra: 'BarChart3 como logo', padrao: /\bBarChart3\b/g },
]

/** Verifica as regras de marca nos arquivos dados (caminhos relativos à raiz do repositório). */
export function verificarMarca(arquivos: string[]): Violacao[] {
  const violacoes: Violacao[] = []
  for (const arquivo of arquivos) {
    readFileSync(arquivo, 'utf8')
      .split('\n')
      .forEach((texto, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(texto)) return // comentários
        for (const { regra, padrao } of REGRAS)
          for (const m of texto.matchAll(padrao)) violacoes.push({ arquivo, linha: i + 1, regra, trecho: m[0] })
      })
  }
  return violacoes
}

/** Verifica as regras numa string de classes (receitas de `lib/brand/classes.ts`). */
export function verificarClasses(classes: string): string[] {
  return REGRAS.flatMap(({ regra, padrao }) => (classes.match(padrao) ? [regra] : []))
}
