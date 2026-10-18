// Diff só de estilo (plano, seção 2.1 d): compara cada arquivo com a versão de uma referência do Git (padrão:
// master) depois de remover o que é só visual: atributos className, style, fill, stroke e color, strings que são
// listas de classes do Tailwind e os imports de lib/brand e components/brand. Se sobrar diferença, o arquivo
// mudou algo além da aparência.
//
// Uso: node scripts/verificar-diff-estilo.mjs [--ref master] arquivo.tsx [arquivo.tsx…]
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const ATRIBUTOS_VISUAIS = new Set(['className', 'style', 'fill', 'stroke', 'color'])
const MODULOS_VISUAIS = /^@\/(lib\/brand|components\/brand)\//

// Uma string é "lista de classes" quando todo token parece classe e pelo menos um é utilitário comum de estilo.
const TOKEN_CLASSE = /^[!a-z0-9\-:[\]#/.%_()&>*~=,]+$/i
const UTILITARIO = /^(?:[a-z-]+:)*-?(?:text|bg|border|rounded|font|shadow|ring|outline|p[xytblr]?|m[xytblr]?|gap|size|h|w|min-w|max-w|leading|tracking|flex|grid|inline|block|hidden|items|justify|space|divide|opacity|cursor|transition|animate|num|uppercase|truncate|shrink|grow|self|underline|whitespace|list|sr-only|absolute|relative|fixed|sticky|top|left|right|bottom|inset|z|overflow|object|aspect|col|row|order|contents|align|decoration)(?:-|$)/
// Valor de cor: hex ou variável CSS (token da marca).
const COR = /^(?:#[0-9a-f]{3,8}|var\(--[\w-]+\))$/i

function eListaDeClasses(texto) {
  const tokens = texto.trim().split(/\s+/).filter(Boolean)
  return tokens.length > 0 && tokens.every((t) => TOKEN_CLASSE.test(t)) && tokens.some((t) => UTILITARIO.test(t))
}

function normalizar(codigo, nome) {
  const fonte = ts.createSourceFile(nome, codigo, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const remover = (ctx) => (raiz) => {
    const visitar = (no) => {
      if (ts.isJsxAttribute(no) && ATRIBUTOS_VISUAIS.has(no.name.getText(fonte))) return undefined
      if (ts.isImportDeclaration(no) && MODULOS_VISUAIS.test(no.moduleSpecifier.text)) return undefined
      if ((ts.isStringLiteral(no) || ts.isNoSubstitutionTemplateLiteral(no)) && (eListaDeClasses(no.text) || COR.test(no.text)) && !ts.isImportDeclaration(no.parent))
        return ts.factory.createStringLiteral('')
      if (ts.isTemplateExpression(no) && (eListaDeClasses(no.head.text) || no.templateSpans.some((s) => eListaDeClasses(s.literal.text))))
        return ts.factory.createStringLiteral('')
      return ts.visitEachChild(no, visitar, ctx)
    }
    return ts.visitNode(raiz, visitar)
  }
  const [saida] = ts.transform(fonte, [remover]).transformed
  return ts.createPrinter({ removeComments: true }).printFile(saida)
}

const args = process.argv.slice(2)
const i = args.indexOf('--ref')
const ref = i >= 0 ? args.splice(i, 2)[1] : 'master'

let falhas = 0
for (const arquivo of args) {
  let antes
  try {
    antes = execFileSync('git', ['show', `${ref}:${arquivo}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    console.log(`novo     ${arquivo}`)
    continue
  }
  const a = normalizar(antes, arquivo).split('\n')
  const d = normalizar(readFileSync(arquivo, 'utf8'), arquivo).split('\n')
  if (a.join('\n') === d.join('\n')) {
    console.log(`só estilo ${arquivo}`)
    continue
  }
  falhas++
  console.log(`MUDOU    ${arquivo}`)
  for (let k = 0; k < Math.max(a.length, d.length); k++)
    if (a[k] !== d[k]) {
      console.log(`  - ${a[k] ?? ''}\n  + ${d[k] ?? ''}`)
      break
    }
}
process.exit(falhas ? 1 : 0)
