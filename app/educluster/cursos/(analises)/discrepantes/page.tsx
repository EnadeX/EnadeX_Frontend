'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ScatterGrupos, type PontoGrupo } from '@/app/educluster/_components/charts/ScatterGrupos'
import { QueryBoundary } from '@/app/educluster/_components/feedback/QueryBoundary'
import { Aviso } from '@/app/educluster/_components/ui/Aviso'
import { BuscaCurso } from '@/app/educluster/_components/ui/BuscaCurso'
import { Card, CardHeader } from '@/app/educluster/_components/ui/Card'
import { Legenda, MarcadorSerie } from '@/app/educluster/_components/ui/Legenda'
import { Filtros, Selecao } from '@/app/educluster/_components/ui/Selecao'
import { formatDecimal, formatInteiro, formatPercentual, formatSinal } from '@/lib/educluster/format'
import { useDiscrepantes } from '@/lib/educluster/hooks/useEduCluster'
import { useParametrosUrl } from '@/lib/educluster/hooks/useParametrosUrl'
import { AREAS, QUADRANTES, ROTULO_QUADRANTE, nomeArea } from '@/lib/educluster/rotulos'
import { ROTAS } from '@/lib/educluster/rotas'
import type { CursoDiscrepante, Quadrante } from '@/lib/educluster/types'
import {
  btnSecondary,
  linkTexto,
  tabela,
  tabelaHead,
  tabelaWrapper,
  td,
  tdNum,
  th,
  thNum,
  trLinha,
} from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

const LIMIARES = ['0.5', '1', '1.5', '2', '2.5']

const POR_PAGINA = 25

interface PontoDiscrepante extends PontoGrupo {
  curso: CursoDiscrepante
}

function indiceQuadrante(q: Quadrante): number {
  return QUADRANTES.indexOf(q)
}

function TabelaDiscrepantes({ cursos }: { cursos: CursoDiscrepante[] }) {
  const [pagina, setPagina] = useState(0)
  const paginas = Math.max(1, Math.ceil(cursos.length / POR_PAGINA))
  const atual = Math.min(pagina, paginas - 1)
  const visiveis = cursos.slice(atual * POR_PAGINA, (atual + 1) * POR_PAGINA)

  return (
    <div className="space-y-3">
      <div className={tabelaWrapper}>
        <table className={tabela}>
          <thead className={tabelaHead}>
            <tr>
              <th className={th}>Curso</th>
              <th className={th}>Área</th>
              <th className={th}>Quadrante</th>
              <th className={thNum}>FG</th>
              <th className={thNum}>CE</th>
              <th className={thNum}>ODP</th>
              <th className={thNum}>Desempenho relativo</th>
              <th className={thNum}>Percepção relativa</th>
              <th className={thNum}>Tensão</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((c) => (
              <tr key={c.CO_CURSO} className={trLinha}>
                <td className={td}>
                  <Link href={ROTAS.curso(c.CO_CURSO)} className={linkTexto}>
                    {c.CO_CURSO}
                  </Link>
                </td>
                <td className={cn(td, 'max-w-64 text-xs')}>{nomeArea(c.area)}</td>
                <td className={cn(td, 'text-xs')}>
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <MarcadorSerie indice={indiceQuadrante(c.quadrante)} />
                    {ROTULO_QUADRANTE[c.quadrante].titulo}
                  </span>
                </td>
                <td className={tdNum}>{formatDecimal(c.NT_FG)}</td>
                <td className={tdNum}>{formatDecimal(c.NT_CE)}</td>
                <td className={tdNum}>{formatDecimal(c.ODP)}</td>
                <td className={tdNum}>{formatSinal(c.desempenho_relativo)}</td>
                <td className={tdNum}>{formatSinal(c.percepcao_relativa)}</td>
                <td className={cn(tdNum, 'font-semibold')}>{formatSinal(c.tensao)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-[#5f7393]">
        <span>
          {formatInteiro(cursos.length)} cursos · página {atual + 1} de {paginas}
        </span>
        <div className="flex gap-2">
          <button type="button" className={btnSecondary} disabled={atual === 0} onClick={() => setPagina(atual - 1)}>
            <ChevronLeft className="size-4" aria-hidden />
            Anterior
          </button>
          <button type="button" className={btnSecondary} disabled={atual >= paginas - 1} onClick={() => setPagina(atual + 1)}>
            Próxima
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CursosDiscrepantes() {
  const router = useRouter()
  const { ler, lerNumero, definir } = useParametrosUrl()
  const limiar = lerNumero('limiar', 1) ?? 1
  const quadranteUrl = ler('quadrante')
  const quadrante = QUADRANTES.includes(quadranteUrl as Quadrante) ? (quadranteUrl as Quadrante) : undefined
  const area = ler('area') ?? ''

  const consulta = useDiscrepantes(limiar)

  const opcoesArea = [
    { valor: '', rotulo: 'Todas as áreas' },
    ...Object.entries(AREAS)
      .map(([codigo, info]) => ({ valor: codigo, rotulo: info.nome }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
  ]

  const filtrados = useMemo(() => {
    const cursos = consulta.data?.cursos ?? []
    return cursos
      .filter((c) => (!quadrante || c.quadrante === quadrante) && (!area || c.area === area))
      .sort((a, b) => Math.abs(b.tensao) - Math.abs(a.tensao))
  }, [consulta.data, quadrante, area])

  const pontos = useMemo<PontoDiscrepante[]>(
    () =>
      (consulta.data?.cursos ?? []).map((c) => ({
        x: c.desempenho_relativo,
        y: c.percepcao_relativa,
        grupo: indiceQuadrante(c.quadrante),
        destacado: quadrante || area ? (!quadrante || c.quadrante === quadrante) && (!area || c.area === area) : undefined,
        curso: c,
      })),
    [consulta.data, quadrante, area],
  )

  return (
    <div className="space-y-6">
      <Filtros>
        <Selecao
          label="Limiar de tensão (desvios padrão)"
          valor={String(limiar)}
          opcoes={LIMIARES.map((v) => ({ valor: v, rotulo: `|tensão| ≥ ${formatDecimal(Number(v), 1)}` }))}
          onChange={(v) => definir({ limiar: v === '1' ? undefined : v })}
        />
        <Selecao
          label="Quadrante"
          valor={quadrante ?? ''}
          opcoes={[
            { valor: '', rotulo: 'Todos os quadrantes' },
            ...QUADRANTES.map((q) => ({ valor: q, rotulo: ROTULO_QUADRANTE[q].titulo })),
          ]}
          onChange={(v) => definir({ quadrante: v || undefined })}
        />
        <Selecao label="Área" valor={area} opcoes={opcoesArea} onChange={(v) => definir({ area: v || undefined })} />
        <BuscaCurso />
      </Filtros>

      <Aviso>
        Cada curso é comparado só com os pares da própria área: FG, CE e ODP viram z-scores dentro da área.
        Desempenho relativo é a média dos z de FG e CE; percepção relativa é o z de ODP; tensão é percepção menos
        desempenho. Entram aqui os cursos com |tensão| acima do limiar.
      </Aviso>

      <QueryBoundary query={consulta} loadingLabel="Identificando cursos discrepantes…">
        {(dados) => (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {QUADRANTES.map((q) => {
                const total = dados.por_quadrante[q] ?? 0
                const ativo = quadrante === q
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => definir({ quadrante: ativo ? undefined : q })}
                    aria-pressed={ativo}
                    className={cn(
                      'rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-[#99f6e4] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#14b8a6]/40',
                      ativo ? 'border-[#0d9488] ring-1 ring-[#0d9488]' : 'border-[#dfe5ee]',
                    )}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
                      <MarcadorSerie indice={indiceQuadrante(q)} />
                      {ROTULO_QUADRANTE[q].titulo}
                    </span>
                    <span className="mt-2 block text-2xl font-bold tracking-tight">{formatInteiro(total)}</span>
                    <span className="text-[11px] text-[#5f7393]">
                      {formatPercentual(dados.total ? total / dados.total : 0)} dos discrepantes
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-[#5f7393]">{ROTULO_QUADRANTE[q].leitura}</span>
                  </button>
                )
              })}
            </div>

            <Card>
              <CardHeader
                title={`${formatInteiro(dados.total)} cursos discrepantes com |tensão| ≥ ${formatDecimal(dados.limiar, 1)}`}
                description="Eixo horizontal: desempenho relativo à área. Eixo vertical: percepção relativa à área. Acima da diagonal tracejada o curso é mais bem avaliado do que o desempenho sugere; abaixo dela, o contrário. Clique em um ponto para abrir o curso."
              />
              <ScatterGrupos
                pontos={pontos}
                grupos={QUADRANTES.map((_, i) => i)}
                rotuloX="Desempenho relativo (z)"
                rotuloY="Percepção relativa (z)"
                altura={400}
                diagonal
                onSelecionar={(p) => router.push(ROTAS.curso(p.curso.CO_CURSO))}
                renderTooltip={(p) => (
                  <>
                    <p className="font-semibold text-[#111827]">Curso {p.curso.CO_CURSO}</p>
                    <p>{nomeArea(p.curso.area)}</p>
                    <p>{ROTULO_QUADRANTE[p.curso.quadrante].titulo}</p>
                    <p>
                      Desempenho {formatSinal(p.curso.desempenho_relativo)} · percepção {formatSinal(p.curso.percepcao_relativa)} ·
                      tensão {formatSinal(p.curso.tensao)}
                    </p>
                  </>
                )}
              />
              <div className="mt-3">
                <Legenda
                  itens={QUADRANTES.map((q, i) => ({
                    indice: i,
                    rotulo: ROTULO_QUADRANTE[q].titulo,
                    detalhe: formatInteiro(dados.por_quadrante[q] ?? 0),
                  }))}
                />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Cursos ordenados pela tensão"
                description="Do maior para o menor valor absoluto. Os filtros de quadrante e área acima também valem aqui."
              />
              <TabelaDiscrepantes key={`${quadrante}-${area}-${limiar}`} cursos={filtrados} />
            </Card>
          </>
        )}
      </QueryBoundary>
    </div>
  )
}
