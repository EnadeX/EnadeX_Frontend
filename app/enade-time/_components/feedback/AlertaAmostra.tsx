import { TriangleAlert } from 'lucide-react'

import { rotuloAmostra } from '@/lib/enade-time/amostra'
import { LIMIAR_AMOSTRA } from '@/lib/enade-time/constants'

export interface OcorrenciaAmostra {
  grupo: string
  nu_ano: number
  /** Cursos do grupo no ano (ou inscrições, se a API for antiga e não informar cursos). */
  n: number
  unidade: 'cursos' | 'inscrições'
  /** Inscrições do grupo no ano, para contexto. */
  inscricoes: number
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
  const unidadeDoAlerta = ocorrencias.every((o) => o.unidade === 'cursos') ? 'cursos' : 'registros'

  return (
    <div role="status" className="rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#c2410c]" aria-hidden />
        <div>
          <h4 className="text-sm font-semibold text-[#9a3412]">
            Amostra reduzida (menos de {limiar} {unidadeDoAlerta})
          </h4>
          <p className="mt-1 text-xs text-[#9a3412]">
            A unidade de análise é o curso: as combinações abaixo têm poucos {unidadeDoAlerta},
            então a média pode ser estatisticamente instável e deve ser interpretada com cautela:
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {ocorrencias.map((o) => (
              <li
                key={`${o.grupo}-${o.nu_ano}`}
                className="inline-flex items-center rounded-full bg-[#ffedd5] px-2 py-0.5 text-xs font-medium text-[#9a3412]"
              >
                {o.grupo} · {o.nu_ano}: {rotuloAmostra(o.n, o.unidade)}
                {o.unidade === 'cursos' && ` (${o.inscricoes} inscrições)`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
