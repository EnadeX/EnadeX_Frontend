import { Fragment, type ReactNode } from 'react'

function negrito(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trecho, i) =>
    trecho.startsWith('**') && trecho.endsWith('**') ? (
      <strong key={i} className="font-semibold text-[#111827]">
        {trecho.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{trecho}</Fragment>
    ),
  )
}

type Bloco =
  | { tipo: 'titulo'; texto: string }
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'lista'; itens: string[] }

function emBlocos(texto: string): Bloco[] {
  const blocos: Bloco[] = []
  for (const linhaBruta of texto.split('\n')) {
    const linha = linhaBruta.trim()
    if (!linha) continue
    const titulo = linha.match(/^#{1,6}\s+(.*)$/)
    const item = linha.match(/^[-*]\s+(.*)$/)
    if (titulo) {
      blocos.push({ tipo: 'titulo', texto: titulo[1] })
    } else if (item) {
      const anterior = blocos[blocos.length - 1]
      if (anterior?.tipo === 'lista') anterior.itens.push(item[1])
      else blocos.push({ tipo: 'lista', itens: [item[1]] })
    } else {
      blocos.push({ tipo: 'paragrafo', texto: linha })
    }
  }
  return blocos
}

export function TextoIA({ texto }: { texto: string }) {
  return (
    <div className="space-y-3 text-sm leading-6 text-[#334155]">
      {emBlocos(texto).map((bloco, i) => {
        if (bloco.tipo === 'titulo') {
          return (
            <h4 key={i} className="pt-2 text-sm font-bold text-[#111827]">
              {negrito(bloco.texto)}
            </h4>
          )
        }
        if (bloco.tipo === 'lista') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {bloco.itens.map((item, j) => (
                <li key={j}>{negrito(item)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{negrito(bloco.texto)}</p>
      })}
    </div>
  )
}
