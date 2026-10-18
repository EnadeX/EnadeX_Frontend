import { Info } from 'lucide-react'

// Legenda compacta de variáveis, sempre visível abaixo de cada gráfico, em uma
// única linha: "CÓDIGO: definição curta · CÓDIGO: definição curta".
export function VariaveisInfo({ itens }: { itens: { codigo: string; texto: string }[] }) {
  return (
    <p className="flex items-start gap-1.5 text-caption text-ink-muted">
      <Info className="mt-0.5 size-3 shrink-0" />
      <span>
        {itens.map((item, index) => (
          <span key={item.codigo}>
            <strong className="font-medium text-ink">{item.codigo}</strong>: {item.texto}
            {index < itens.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </span>
    </p>
  )
}
