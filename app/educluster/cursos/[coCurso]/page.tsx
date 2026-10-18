'use client'

import { ArrowLeft, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { ScatterGrupos, type PontoGrupo } from '@/app/educluster/_components/charts/ScatterGrupos'
import { EmptyState } from '@/app/educluster/_components/feedback/EmptyState'
import { QueryBoundary } from '@/app/educluster/_components/feedback/QueryBoundary'
import { PageSection } from '@/app/educluster/_components/layout/PageSection'
import { Card, CardHeader } from '@/app/educluster/_components/ui/Card'
import { MarcadorSerie } from '@/app/educluster/_components/ui/Legenda'
import { KpiGrid, MetricCard } from '@/app/educluster/_components/ui/MetricCard'
import { EduClusterApiError } from '@/lib/educluster/api'
import { rotularClusters } from '@/lib/educluster/clusters'
import { formatDecimal, formatInteiro, formatPercentual, formatSinal } from '@/lib/educluster/format'
import {
  useAreas,
  useClustersCursos,
  useCurso,
  useCursos,
  useDiscrepantes,
} from '@/lib/educluster/hooks/useEduCluster'
import { ROTULO_QUADRANTE, nomeArea } from '@/lib/educluster/rotulos'
import { ROTAS } from '@/lib/educluster/rotas'
import type { Curso } from '@/lib/educluster/types'
import { btnSecondary, tabela, tabelaHead, tabelaWrapper, td, tdNum, th, thNum, trLinha } from '@/lib/educluster/ui'

interface PontoCurso extends PontoGrupo {
  curso: Curso
}

type Linha = {
  rotulo: string
  curso: number
  cluster?: number
  area?: number
  formato: (v: number | undefined) => string
  formatoDelta?: (v: number) => string
}

function decimal(v: number | undefined) {
  return formatDecimal(v)
}

function DiferencaCelula({
  base,
  valor,
  formato,
  formatoDelta = (v) => formatSinal(v),
}: {
  base: number
  valor?: number
  formato: Linha['formato']
  formatoDelta?: (v: number) => string
}) {
  if (valor === undefined) return <td className={tdNum}>-</td>
  const delta = base - valor
  return (
    <td className={tdNum}>
      {formato(valor)}
      <span className={`block text-caption ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
        curso {formatoDelta(delta)}
      </span>
    </td>
  )
}

export default function DetalheCurso() {
  const router = useRouter()
  const params = useParams<{ coCurso: string }>()
  const coCurso = Number(params.coCurso)

  const curso = useCurso(coCurso)
  const clusters = useClustersCursos()
  const areas = useAreas()
  const cursos = useCursos()
  const discrepantes = useDiscrepantes(1)

  const rotulos = useMemo(() => rotularClusters(clusters.data?.perfis ?? []), [clusters.data])

  const pontos = useMemo<PontoCurso[]>(
    () =>
      (cursos.data?.cursos ?? []).map((c) => ({
        x: c.PCA_X,
        y: c.PCA_Y,
        grupo: c.Cluster_ID,
        destacado: c.CO_CURSO === coCurso,
        curso: c,
      })),
    [cursos.data, coCurso],
  )

  if (!Number.isInteger(coCurso) || coCurso <= 0) {
    return <EmptyState title="Código de curso inválido" description={`"${params.coCurso}" não é um CO_CURSO.`} />
  }

  const naoEncontrado = curso.error instanceof EduClusterApiError && curso.error.status === 404

  return (
    <PageSection
      title={`Curso ${coCurso}`}
      description="Detalhe de um curso da base analítica, comparado com o próprio perfil e com a média da área."
      actions={
        <button type="button" className={btnSecondary} onClick={() => router.back()}>
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>
      }
    >
      {naoEncontrado ? (
        <EmptyState
          title="Curso fora da base analítica"
          description={`O curso ${coCurso} não está entre os cursos com pelo menos 20 respondentes no arq3 e no arq4, ou o código não existe no ENADE 2021.`}
        />
      ) : (
        <QueryBoundary query={curso} loadingLabel="Carregando curso…">
          {(c) => {
            const perfil = clusters.data?.perfis.find((p) => p.Cluster_ID === c.Cluster_ID)
            const area = areas.data?.areas.find((a) => a.area === c.area)
            const discrepante = discrepantes.data?.cursos.find((d) => d.CO_CURSO === coCurso)
            const linhas: Linha[] = [
              { rotulo: 'Formação geral (FG)', curso: c.NT_FG, cluster: perfil?.NT_FG, area: area?.NT_FG, formato: decimal },
              { rotulo: 'Componente específico (CE)', curso: c.NT_CE, cluster: perfil?.NT_CE, area: area?.NT_CE, formato: decimal },
              { rotulo: 'Taxa de presença', curso: c.tx_presenca, cluster: perfil?.tx_presenca, formato: (v) => formatPercentual(v, 1), formatoDelta: (v) => `${formatSinal(v * 100, 1)} p.p.` },
              { rotulo: 'ODP', curso: c.ODP, cluster: perfil?.ODP, area: area?.ODP, formato: decimal },
              { rotulo: 'OPORT', curso: c.OPORT, cluster: perfil?.OPORT, formato: decimal },
              { rotulo: 'INFRA', curso: c.INFRA, cluster: perfil?.INFRA, formato: decimal },
            ]
            return (
              <>
                <div className="flex flex-wrap items-center gap-3 rounded-marca-md border border-border bg-surface-card p-4 shadow-marca">
                  <span className="text-body font-medium">{nomeArea(c.area)}</span>
                  <span className="text-small text-ink-muted">{c.area}</span>
                  <span className="h-4 w-px bg-border" />
                  <span className="inline-flex items-center gap-1.5 text-body">
                    <MarcadorSerie indice={c.Cluster_ID} />
                    <strong className="font-medium">Cluster {c.Cluster_ID}</strong>
                    <span className="text-ink-muted">{rotulos[c.Cluster_ID]}</span>
                  </span>
                  <span className="h-4 w-px bg-border" />
                  <span className="text-small text-ink-muted">
                    {formatInteiro(c.n_notas)} estudantes com nota · {formatInteiro(c.n_qe)} respondentes do questionário
                  </span>
                </div>

                {discrepante && (
                  <div className="flex items-start gap-2 rounded-marca-md border border-warning bg-surface-card px-3 py-2.5 text-small text-warning">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      Curso discrepante em relação aos pares da área: <strong className="font-medium">{ROTULO_QUADRANTE[discrepante.quadrante].titulo}</strong>{' '}
                      (tensão {formatSinal(discrepante.tensao)}; desempenho relativo {formatSinal(discrepante.desempenho_relativo)}, percepção
                      relativa {formatSinal(discrepante.percepcao_relativa)}). {ROTULO_QUADRANTE[discrepante.quadrante].leitura}{' '}
                      <Link href={`${ROTAS.cursosDiscrepantes}?quadrante=${discrepante.quadrante}`} className="font-medium underline">
                        Ver os demais
                      </Link>
                    </span>
                  </div>
                )}

                <KpiGrid cols={4}>
                  <MetricCard label="Nota geral" value={formatDecimal(c.NT_GER)} hint="25% FG + 75% CE" tom="destaque" />
                  <MetricCard label="FG objetiva / discursiva" value={`${formatDecimal(c.NT_OBJ_FG, 1)} / ${formatDecimal(c.NT_DIS_FG, 1)}`} hint="formação geral" />
                  <MetricCard label="CE objetiva / discursiva" value={`${formatDecimal(c.NT_OBJ_CE, 1)} / ${formatDecimal(c.NT_DIS_CE, 1)}`} hint="componente específico" />
                  <MetricCard label="Presença" value={formatPercentual(c.tx_presenca)} hint="presentes com resultado válido entre os inscritos" />
                </KpiGrid>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <CardHeader
                      title="Curso, perfil e área"
                      description="Abaixo de cada referência, a diferença do curso para ela. A média da área só está disponível para FG, CE e ODP."
                    />
                    <div className={tabelaWrapper}>
                      <table className={tabela}>
                        <thead className={tabelaHead}>
                          <tr>
                            <th className={th}>Variável</th>
                            <th className={thNum}>Curso</th>
                            <th className={thNum}>Média do cluster</th>
                            <th className={thNum}>Média da área</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linhas.map((l) => (
                            <tr key={l.rotulo} className={trLinha}>
                              <td className={td}>{l.rotulo}</td>
                              <td className={`${tdNum} font-medium`}>{l.formato(l.curso)}</td>
                              <DiferencaCelula base={l.curso} valor={l.cluster} formato={l.formato} formatoDelta={l.formatoDelta} />
                              <DiferencaCelula base={l.curso} valor={l.area} formato={l.formato} formatoDelta={l.formatoDelta} />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader
                      title="Posição no mapa dos cursos"
                      description="O curso aparece colorido; os demais cursos da base ficam em cinza."
                    />
                    <QueryBoundary query={cursos} loadingLabel="Carregando mapa…">
                      {() => (
                        <ScatterGrupos
                          pontos={pontos}
                          grupos={(clusters.data?.perfis ?? []).map((p) => p.Cluster_ID)}
                          rotuloX="Componente 1"
                          rotuloY="Componente 2"
                          altura={320}
                          tamanho={14}
                          tamanhoAtivos={160}
                          onSelecionar={(p) => router.push(ROTAS.curso(p.curso.CO_CURSO))}
                          renderTooltip={(p) => (
                            <>
                              <p className="font-medium text-ink">Curso {p.curso.CO_CURSO}</p>
                              <p>{nomeArea(p.curso.area)}</p>
                            </>
                          )}
                        />
                      )}
                    </QueryBoundary>
                  </Card>
                </div>
              </>
            )
          }}
        </QueryBoundary>
      )}
    </PageSection>
  )
}
