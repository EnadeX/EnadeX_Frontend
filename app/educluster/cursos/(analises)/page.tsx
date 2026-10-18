'use client'

import { BookOpen, Gauge, Layers, Shuffle, Sigma, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { BarEstabilidade } from '@/app/educluster/_components/charts/BarEstabilidade'
import { ScatterGrupos, type PontoGrupo } from '@/app/educluster/_components/charts/ScatterGrupos'
import { QueryBoundary } from '@/app/educluster/_components/feedback/QueryBoundary'
import { Aviso } from '@/app/educluster/_components/ui/Aviso'
import { BuscaCurso } from '@/app/educluster/_components/ui/BuscaCurso'
import { Card, CardHeader } from '@/app/educluster/_components/ui/Card'
import { DescricaoIA } from '@/app/educluster/_components/ui/DescricaoIA'
import { Legenda, MarcadorSerie } from '@/app/educluster/_components/ui/Legenda'
import { KpiGrid, MetricCard } from '@/app/educluster/_components/ui/MetricCard'
import { Filtros, Selecao } from '@/app/educluster/_components/ui/Selecao'
import { rotularClusters } from '@/lib/educluster/clusters'
import { formatDecimal, formatInteiro, formatPercentual } from '@/lib/educluster/format'
import {
  useAreas,
  useClustersCursos,
  useCursos,
  useDescricaoCursos,
  useEstabilidadePorK,
} from '@/lib/educluster/hooks/useEduCluster'
import { useParametrosUrl } from '@/lib/educluster/hooks/useParametrosUrl'
import { nomeArea } from '@/lib/educluster/rotulos'
import { ROTAS } from '@/lib/educluster/rotas'
import type { Curso, MetricasModeloCursos, PerfilClusterCurso } from '@/lib/educluster/types'
import { tabela, tabelaHead, tabelaWrapper, td, tdNum, th, thNum, trLinha } from '@/lib/educluster/ui'

const RODADAS = 20

interface PontoCurso extends PontoGrupo {
  curso: Curso
}

function metricasCompletas(m: unknown): m is MetricasModeloCursos {
  return typeof m === 'object' && m !== null && 'silhouette' in m
}

function TabelaPerfis({ perfis, rotulos }: { perfis: PerfilClusterCurso[]; rotulos: Record<number, string> }) {
  const totalCursos = perfis.reduce((s, p) => s + p.cursos, 0)
  return (
    <div className={tabelaWrapper}>
      <table className={tabela}>
        <thead className={tabelaHead}>
          <tr>
            <th className={th}>Perfil</th>
            <th className={thNum}>Cursos</th>
            <th className={thNum}>Estudantes</th>
            <th className={thNum}>FG</th>
            <th className={thNum}>CE</th>
            <th className={thNum}>Presença</th>
            <th className={thNum}>ODP</th>
            <th className={thNum}>OPORT</th>
            <th className={thNum}>INFRA</th>
          </tr>
        </thead>
        <tbody>
          {perfis.map((p) => (
            <tr key={p.Cluster_ID} className={trLinha}>
              <td className={td}>
                <div className="flex items-center gap-2">
                  <MarcadorSerie indice={p.Cluster_ID} />
                  <div>
                    <p className="font-medium">Cluster {p.Cluster_ID}</p>
                    <p className="text-caption text-ink-muted">{rotulos[p.Cluster_ID]}</p>
                  </div>
                </div>
              </td>
              <td className={tdNum}>
                {formatInteiro(p.cursos)}
                <span className="block text-caption text-ink-muted">{formatPercentual(p.cursos / totalCursos)}</span>
              </td>
              <td className={tdNum}>{formatInteiro(p.estudantes)}</td>
              <td className={tdNum}>{formatDecimal(p.NT_FG)}</td>
              <td className={tdNum}>{formatDecimal(p.NT_CE)}</td>
              <td className={tdNum}>{formatPercentual(p.tx_presenca, 0)}</td>
              <td className={tdNum}>{formatDecimal(p.ODP)}</td>
              <td className={tdNum}>{formatDecimal(p.OPORT)}</td>
              <td className={tdNum}>{formatDecimal(p.INFRA)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PerfisDeCurso() {
  const router = useRouter()
  const { lerNumero, ler, definir } = useParametrosUrl()
  const kUrl = lerNumero('k')
  const area = ler('area') ?? ''

  const treinado = useClustersCursos()
  const metricasTreinado = treinado.data?.metricas
  const kTreinado = metricasCompletas(metricasTreinado) ? metricasTreinado.k : undefined
  const k = kUrl !== undefined && kUrl !== kTreinado ? kUrl : undefined

  const clusters = useClustersCursos(k)
  const cursos = useCursos(k)
  const areas = useAreas()
  const estabilidade = useEstabilidadePorK(RODADAS)
  const [descricaoPedida, setDescricaoPedida] = useState(false)
  const descricao = useDescricaoCursos(k, descricaoPedida)

  const opcoesK = [
    { valor: '', rotulo: kTreinado ? `Modelo treinado (k = ${kTreinado})` : 'Modelo treinado' },
    ...[2, 3, 4, 5, 6, 7, 8]
      .filter((n) => n !== kTreinado)
      .map((n) => ({ valor: String(n), rotulo: `k = ${n}, reagrupado em memória` })),
  ]

  const opcoesArea = [
    { valor: '', rotulo: 'Todas as áreas' },
    ...(areas.data?.areas ?? [])
      .map((a) => ({ valor: a.area, rotulo: `${nomeArea(a.area)} (${formatInteiro(a.cursos)})` }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
  ]

  const rotulos = useMemo(() => rotularClusters(clusters.data?.perfis ?? []), [clusters.data])

  const pontos = useMemo<PontoCurso[]>(
    () =>
      (cursos.data?.cursos ?? []).map((c) => ({
        x: c.PCA_X,
        y: c.PCA_Y,
        grupo: c.Cluster_ID,
        destacado: area ? c.area === area : undefined,
        curso: c,
      })),
    [cursos.data, area],
  )

  const kAtual = k ?? kTreinado ?? 3
  const cursosNaArea = area ? pontos.filter((p) => p.curso.area === area).length : null

  return (
    <div className="space-y-6">
      <Filtros>
        <Selecao label="Número de perfis" valor={k ? String(k) : ''} opcoes={opcoesK} onChange={(v) => definir({ k: v || undefined })} />
        <Selecao
          label="Destacar uma área"
          valor={area}
          opcoes={opcoesArea}
          onChange={(v) => definir({ area: v || undefined })}
          className="lg:col-span-2"
        />
        <BuscaCurso />
      </Filtros>

      {k !== undefined && (
        <Aviso>
          Com k = {k} o backend reagrupa os mesmos cursos em memória, com a mesma semente, sem sobrescrever o
          modelo treinado. Silhouette, variância e ARI contra a área ficam disponíveis só para o modelo treinado.
        </Aviso>
      )}

      <QueryBoundary query={clusters} loadingLabel="Carregando perfis de curso…">
        {(dados) => {
          const m = metricasCompletas(dados.metricas) ? dados.metricas : null
          const totalCursos = dados.perfis.reduce((s, p) => s + p.cursos, 0)
          const totalEstudantes = dados.perfis.reduce((s, p) => s + p.estudantes, 0)
          return (
            <>
              <KpiGrid cols={3}>
                <MetricCard label="Cursos na base" value={formatInteiro(totalCursos)} icon={BookOpen} hint={`${formatInteiro(totalEstudantes)} estudantes representados`} />
                <MetricCard label="Perfis (k)" value={dados.perfis.length} icon={Layers} hint={m ? 'escolhido pelo maior silhouette' : 'reagrupado em memória'} tom="destaque" />
                <MetricCard label="Silhouette" value={m ? formatDecimal(m.silhouette, 4) : '-'} icon={Gauge} hint="separação moderada: grupos sem vazios entre si" />
                <MetricCard label="Variância no plano 2D" value={m ? formatPercentual(m.variancia_explicada_2d) : '-'} icon={Sigma} hint="dois primeiros componentes do PCA" />
                <MetricCard label="ARI contra a área" value={m ? formatDecimal(m.ari_contra_area, 4) : '-'} icon={Shuffle} hint="perto de zero: os perfis não espelham a área" />
                <MetricCard label="Estudantes" value={formatInteiro(totalEstudantes)} icon={Users} hint="soma dos inscritos com nota nos cursos da base" />
              </KpiGrid>

              <Card>
                <CardHeader
                  title="Mapa dos cursos no plano do PCA"
                  description={
                    <>
                      Cada ponto é um curso, colorido e com forma pelo perfil. No modelo treinado o componente 1
                      concentra a percepção do curso (ODP, OPORT, INFRA) e o componente 2 o desempenho (FG e CE).
                      Clique em um ponto para abrir o curso.
                      {cursosNaArea !== null && ` Área destacada: ${nomeArea(area)}, ${formatInteiro(cursosNaArea)} cursos.`}
                    </>
                  }
                />
                <QueryBoundary query={cursos} loadingLabel="Carregando cursos…">
                  {() => (
                    <ScatterGrupos
                      pontos={pontos}
                      grupos={dados.perfis.map((p) => p.Cluster_ID)}
                      rotuloX="Componente 1"
                      rotuloY="Componente 2"
                      onSelecionar={(p) => router.push(ROTAS.curso(p.curso.CO_CURSO))}
                      renderTooltip={(p) => (
                        <>
                          <p className="font-medium text-ink">Curso {p.curso.CO_CURSO}</p>
                          <p>{nomeArea(p.curso.area)}</p>
                          <p>
                            Cluster {p.curso.Cluster_ID}: {rotulos[p.curso.Cluster_ID]}
                          </p>
                          <p>
                            FG {formatDecimal(p.curso.NT_FG)} · CE {formatDecimal(p.curso.NT_CE)} · presença{' '}
                            {formatPercentual(p.curso.tx_presenca, 0)}
                          </p>
                          <p>
                            ODP {formatDecimal(p.curso.ODP)} · OPORT {formatDecimal(p.curso.OPORT)} · INFRA{' '}
                            {formatDecimal(p.curso.INFRA)}
                          </p>
                        </>
                      )}
                    />
                  )}
                </QueryBoundary>
                <div className="mt-3">
                  <Legenda
                    itens={dados.perfis.map((p) => ({
                      indice: p.Cluster_ID,
                      rotulo: `Cluster ${p.Cluster_ID}`,
                      detalhe: `${rotulos[p.Cluster_ID]} · ${formatInteiro(p.cursos)} cursos`,
                    }))}
                  />
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Perfil médio de cada cluster"
                  description="Médias dos cursos de cada perfil. Notas de 0 a 100; ODP, OPORT e INFRA na escala de concordância de 1 a 6, já sem os códigos 7 (não sei) e 8 (não se aplica). O nome descritivo compara cada perfil com a média ponderada dos demais."
                />
                <TabelaPerfis perfis={dados.perfis} rotulos={rotulos} />
              </Card>
            </>
          )
        }}
      </QueryBoundary>

      <Card>
        <CardHeader
          title="Estabilidade por reamostragem"
          description={`Em cada rodada o K-Means é reajustado em 80% dos cursos e prevê a base inteira; o ARI mede a concordância com a partição de referência (1 = idêntica). ${RODADAS} rodadas por k, semente fixa. Barra escura: k exibido acima.`}
        />
        <QueryBoundary query={estabilidade} loadingLabel="Calculando estabilidade para k de 2 a 8…">
          {(dados) => (
            <>
              <BarEstabilidade dados={dados.por_k} kAtual={kAtual} />
              <p className="mt-2 text-small text-ink-muted">
                Separação e estabilidade são propriedades diferentes: o silhouette moderado indica grupos sem vazios
                entre si, e o ARI alto indica que a mesma partição reaparece quando a base muda.
              </p>
            </>
          )}
        </QueryBoundary>
      </Card>

      <DescricaoIA
        titulo="Descrição automática dos perfis"
        query={descricao}
        solicitado={descricaoPedida}
        onSolicitar={() => setDescricaoPedida(true)}
      />
    </div>
  )
}
