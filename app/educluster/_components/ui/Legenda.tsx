import { corSerie, formaSerie, type FormaSerie } from '@/lib/educluster/chart'

function Marcador({ cor, forma }: { cor: string; forma: FormaSerie }) {
  const comum = { fill: cor, stroke: '#ffffff', strokeWidth: 1 }
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden>
      {forma === 'triangle' && <polygon points="6,1 11,11 1,11" {...comum} />}
      {forma === 'square' && <rect x="1.5" y="1.5" width="9" height="9" {...comum} />}
      {forma === 'diamond' && <polygon points="6,0.5 11.5,6 6,11.5 0.5,6" {...comum} />}
      {forma === 'star' && <polygon points="6,0.5 7.6,4.4 11.7,4.6 8.5,7.2 9.6,11.3 6,9 2.4,11.3 3.5,7.2 0.3,4.6 4.4,4.4" {...comum} />}
      {forma === 'cross' && <polygon points="4,1 8,1 8,4 11,4 11,8 8,8 8,11 4,11 4,8 1,8 1,4 4,4" {...comum} />}
      {forma === 'wye' && <polygon points="6,6 10,1.5 11.5,3 7.5,7.2 7.5,11.5 4.5,11.5 4.5,7.2 0.5,3 2,1.5" {...comum} />}
      {forma === 'circle' && <circle cx="6" cy="6" r="5" {...comum} />}
    </svg>
  )
}

export function Legenda({ itens }: { itens: { indice: number; rotulo: string; detalhe?: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#475569]">
      {itens.map((item) => (
        <li key={`${item.indice}-${item.rotulo}`} className="flex items-center gap-1.5">
          <Marcador cor={corSerie(item.indice)} forma={formaSerie(item.indice)} />
          <span className="font-semibold text-[#111827]">{item.rotulo}</span>
          {item.detalhe && <span>{item.detalhe}</span>}
        </li>
      ))}
    </ul>
  )
}

export function MarcadorSerie({ indice }: { indice: number }) {
  return <Marcador cor={corSerie(indice)} forma={formaSerie(indice)} />
}
