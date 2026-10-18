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

// Aviso em warning, a cor de atenção da marca. (Antes era laranja para se destacar do âmbar do módulo; com a
// identidade visual o acento passou a ser o accent único da marca e o warning cumpre esse papel.)
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
    <div role="status" className="rounded-marca-md border border-warning bg-surface-card p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div>
          <h4 className="text-body font-medium text-warning">
            Amostra reduzida (menos de {limiar} {unidadeDoAlerta})
          </h4>
          <p className="mt-1 text-small text-warning">
            A unidade de análise é o curso: as combinações abaixo têm poucos {unidadeDoAlerta},
            então a média pode ser estatisticamente instável e deve ser interpretada com cautela:
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {ocorrencias.map((o) => (
              <li
                key={`${o.grupo}-${o.nu_ano}`}
                className="inline-flex items-center rounded-marca-sm border border-warning bg-surface-card px-2 py-0.5 text-small font-medium text-warning"
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
