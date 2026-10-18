'use client'

import { Funnel, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Card } from '@/app/enade-time/_components/ui/Card'
import {
  useAnos,
  useCategoriasAdm,
  useGrupos,
  useModalidades,
  useOrganizacoesAcademicas,
  useRegioes,
  useUFs,
} from '@/lib/enade-time/hooks/useDimensoes'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'
import type { FiltrosAnalise } from '@/lib/enade-time/types'
import { btnPrimary, btnSecondary, campo, rotulo } from '@/lib/enade-time/ui'

function toNumOrUndef(v: string): number | undefined {
  if (v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

// Lê e grava a URL (useFiltrosUrl), então só pode ser renderizada sob o <Suspense> de enade/(analises).
export function FiltrosAnaliseBar() {
  const { filtros, setFiltros, limpar } = useFiltrosUrl()
  const [local, setLocal] = useState<FiltrosAnalise>(filtros)

  useEffect(() => {
    setLocal(filtros)
  }, [filtros])

  const regioes = useRegioes()
  const ufs = useUFs(local.co_regiao)
  const anos = useAnos()
  const grupos = useGrupos()
  const modalidades = useModalidades()
  const categorias = useCategoriasAdm()
  const orgacads = useOrganizacoesAcademicas()

  const update = <K extends keyof FiltrosAnalise>(k: K, v: FiltrosAnalise[K]) => {
    setLocal((p) => ({ ...p, [k]: v }))
  }

  const algumFiltro = Object.values(local).some((v) => v !== undefined)

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-h3 text-ink">
        <Funnel className="size-4" aria-hidden />
        Filtros
        {algumFiltro && (
          <button
            type="button"
            onClick={() => {
              setLocal({})
              limpar()
            }}
            className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-marca-sm text-small font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring"
          >
            <X className="size-3" aria-hidden />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <label className={rotulo}>
          Ano
          <select
            className={`${campo} mt-1`}
            value={local.nu_ano ?? ''}
            onChange={(e) => update('nu_ano', toNumOrUndef(e.target.value))}
          >
            <option value="">Todos</option>
            {anos.data?.map((a) => (
              <option key={a.co_ano} value={a.co_ano}>
                {a.co_ano}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          Região
          <select
            className={`${campo} mt-1`}
            value={local.co_regiao ?? ''}
            onChange={(e) => {
              const v = toNumOrUndef(e.target.value)
              setLocal((p) => ({ ...p, co_regiao: v, co_uf: undefined }))
            }}
          >
            <option value="">Todas</option>
            {regioes.data?.map((r) => (
              <option key={r.co_regiao} value={r.co_regiao}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          UF
          <select
            className={`${campo} mt-1`}
            value={local.co_uf ?? ''}
            onChange={(e) => update('co_uf', toNumOrUndef(e.target.value))}
          >
            <option value="">Todas</option>
            {ufs.data?.map((u) => (
              <option key={u.co_uf} value={u.co_uf}>
                {u.sigla} — {u.nome}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          Grupo (curso)
          <select
            className={`${campo} mt-1`}
            value={local.co_grupo ?? ''}
            onChange={(e) => update('co_grupo', toNumOrUndef(e.target.value))}
          >
            <option value="">Todos</option>
            {grupos.data?.map((g) => (
              <option key={g.co_grupo} value={g.co_grupo}>
                {g.co_grupo} — {g.nome}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          Modalidade
          <select
            className={`${campo} mt-1`}
            value={local.co_modalidade ?? ''}
            onChange={(e) => update('co_modalidade', toNumOrUndef(e.target.value))}
          >
            <option value="">Todas</option>
            {modalidades.data?.map((m) => (
              <option key={m.co_modalidade} value={m.co_modalidade}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          Categoria Adm.
          <select
            className={`${campo} mt-1`}
            value={local.co_categad ?? ''}
            onChange={(e) => update('co_categad', toNumOrUndef(e.target.value))}
          >
            <option value="">Todas</option>
            {categorias.data?.map((c) => (
              <option key={c.co_categad} value={c.co_categad}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          Org. Acadêmica
          <select
            className={`${campo} mt-1`}
            value={local.co_orgacad ?? ''}
            onChange={(e) => update('co_orgacad', toNumOrUndef(e.target.value))}
          >
            <option value="">Todas</option>
            {orgacads.data?.map((o) => (
              <option key={o.co_orgacad} value={o.co_orgacad}>
                {o.nome}
              </option>
            ))}
          </select>
        </label>

        <label className={rotulo}>
          Cód. IES
          <input
            type="number"
            inputMode="numeric"
            placeholder="ex.: 1234"
            className={`${campo} mt-1`}
            value={local.co_ies ?? ''}
            onChange={(e) => update('co_ies', toNumOrUndef(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={btnSecondary} onClick={() => setLocal(filtros)}>
          Cancelar
        </button>
        <button type="button" className={btnPrimary} onClick={() => setFiltros(local)}>
          Aplicar
        </button>
      </div>
    </Card>
  )
}
