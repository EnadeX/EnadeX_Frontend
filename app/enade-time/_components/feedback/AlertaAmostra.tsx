import { TriangleAlert } from 'lucide-react'

import { LIMIAR_AMOSTRA } from '@/lib/enade-time/constants'

export interface OcorrenciaAmostra {
  grupo: string
  nu_ano: number
  n: number
}

// Laranja, e não âmbar: o âmbar é a cor de acento do módulo e o aviso precisa se destacar dela.
export function AlertaAmostra({
  ocorrencias,
  limiar = LIMIAR_AMOSTRA,
}: {
  ocorrencias: OcorrenciaAmostra[]
  limiar?: number
}) {
  if (ocorrencias.length === 0) return null

  return (
    <div role="status" className="rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#c2410c]" aria-hidden />
        <div>
          <h4 className="text-sm font-semibold text-[#9a3412]">
            Amostra reduzida (n &lt; {limiar})
          </h4>
          <p className="mt-1 text-xs text-[#9a3412]">
            As combinações abaixo têm poucos registros — a média pode ser estatisticamente instável
            e deve ser interpretada com cautela:
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {ocorrencias.map((o) => (
              <li
                key={`${o.grupo}-${o.nu_ano}`}
                className="inline-flex items-center rounded-full bg-[#ffedd5] px-2 py-0.5 text-xs font-medium text-[#9a3412]"
              >
                {o.grupo} · {o.nu_ano}: n={o.n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
