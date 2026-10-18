'use client'

import { Gauge, Layers, Sigma, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { BarPerfisNotas } from '../_components/charts/BarPerfisNotas'
import { ScatterGrupos, type PontoGrupo } from '../_components/charts/ScatterGrupos'
import { QueryBoundary } from '../_components/feedback/QueryBoundary'
import { Aviso } from '../_components/ui/Aviso'
import { Card, CardHeader } from '../_components/ui/Card'
import { DescricaoIA } from '../_components/ui/DescricaoIA'
import { Legenda, MarcadorSerie } from '../_components/ui/Legenda'
import { KpiGrid, MetricCard } from '../_components/ui/MetricCard'
import { Selecao } from '../_components/ui/Selecao'
import { formatDecimal, formatInteiro, formatPercentual } from '@/lib/educluster/format'
import {
  useAmostraEstudantes,
  useClustersEstudantes,
  useDescricaoEstudantes,
} from '@/lib/educluster/hooks/useEduCluster'
import { useParametrosUrl } from '@/lib/educluster/hooks/useParametrosUrl'
import { ROTULO_VARIAVEL } from '@/lib/educluster/rotulos'
import type { PerfilClusterEstudante, PontoEstudante } from '@/lib/educluster/types'
import { tabela, tabelaHead, tabelaWrapper, td, tdNum, th, thNum, trLinha } from '@/lib/educluster/ui'

const VARIAVEIS = ['NT_OBJ_FG', 'NT_DIS_FG', 'NT_OBJ_CE', 'NT_DIS_CE'] as const

const TAMANHOS = ['1000', '3000', '10000']

interface PontoAmostra extends PontoGrupo {
  estudante: PontoEstudante
}

function nivelCluster(perfil: PerfilClusterEstudante, perfis: PerfilClusterEstudante[]): string {
  const media = (p: PerfilClusterEstudante) => VARIAVEIS.reduce((s, v) => s + p[v], 0) / VARIAVEIS.length
  const ordenados = [...perfis].sort((a, b) => media(a) - media(b))
  const posicao = ordenados.findIndex((p) => p.Cluster_ID === perfil.Cluster_ID)
  if (ordenados.length === 2) return posicao === 0 ? 'Notas mais baixas' : 'Notas mais altas'
  if (posicao === 0) return 'Notas mais baixas'
  if (posicao === ordenados.length - 1) return 'Notas mais altas'
  return 'Notas intermediárias'
}

export default function DesempenhoEstudante() {
  const { lerNumero, definir } = useParametrosUrl()
  const n = lerNumero('n', 3000) ?? 3000
  const clusters = useClustersEstudantes()
  const amostra = useAmostraEstudantes(n)
  const [descricaoPedida, setDescricaoPedida] = useState(false)
  const descricao = useDescricaoEstudantes(descricaoPedida)

  const pontos = useMemo<PontoAmostra[]>(
    () =>
      (amostra.data?.pontos ?? []).map((p) => ({ x: p.PCA_X, y: p.PCA_Y, grupo: p.Cluster_ID, estudante: p })),
    [amostra.data],
  )

  return (
    <div className="space-y-6">
      <QueryBoundary query={clusters} loadingLabel="Carregando perfis de desempenho…">
        {(dados) => {
          const m = dados.metricas
          const rotulos = Object.fromEntries(dados.perfis.map((p) => [p.Cluster_ID, nivelCluster(p, dados.perfis)]))
          return (
            <>
              <KpiGrid cols={4}>
                <MetricCard label="Estudantes" value={formatInteiro(m.n_estudantes)} icon={Users} hint="presentes com as quatro notas válidas" />
                <MetricCard label="Perfis (k)" value={m.k} icon={Layers} hint="escolhido pelo maior silhouette" tom="destaque" />
                <MetricCard label="Silhouette" value={formatDecimal(m.silhouette, 4)} icon={Gauge} hint={`amostra de ${formatInteiro(m.silhouette_amostra)} estudantes`} />
                <MetricCard label="Variância no plano 2D" value={formatPercentual(m.variancia_explicada_2d)} icon={Sigma} hint="dois primeiros componentes do PCA" />
              </KpiGrid>

              <Aviso>
                Espaço de variáveis: notas objetivas e discursivas da FG e do CE, separadas. Ele substitui o trio
                NT_GER, NT_FG e NT_CE do TCC 1, em que a nota geral é combinação exata das outras duas (25% FG + 75%
                CE). No nível do estudante os perfis tendem a separar por nível de nota, um gradiente, e não por
                padrões distintos; por isso a análise central do EduCluster é no nível do curso.
              </Aviso>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader title="Notas médias por perfil" description="Médias de cada perfil nas quatro notas, de 0 a 100." />
                  <BarPerfisNotas
                    variaveis={VARIAVEIS.map((v) => ({ chave: v, rotulo: ROTULO_VARIAVEL[v] }))}
                    series={dados.perfis.map((p) => ({
                      id: p.Cluster_ID,
                      rotulo: `Cluster ${p.Cluster_ID}`,
                      valores: Object.fromEntries(VARIAVEIS.map((v) => [v, p[v]])),
                    }))}
                  />
                  <div className="mt-3">
                    <Legenda
                      itens={dados.perfis.map((p) => ({
                        indice: p.Cluster_ID,
                        rotulo: `Cluster ${p.Cluster_ID}`,
                        detalhe: rotulos[p.Cluster_ID],
                      }))}
                    />
                  </div>
                  <div className={`${tabelaWrapper} mt-4`}>
                    <table className={tabela}>
                      <thead className={tabelaHead}>
                        <tr>
                          <th className={th}>Perfil</th>
                          <th className={thNum}>Estudantes</th>
                          {VARIAVEIS.map((v) => (
                            <th key={v} className={thNum}>
                              {ROTULO_VARIAVEL[v]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dados.perfis.map((p) => (
                          <tr key={p.Cluster_ID} className={trLinha}>
                            <td className={td}>
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <MarcadorSerie indice={p.Cluster_ID} />
                                Cluster {p.Cluster_ID}
                              </span>
                            </td>
                            <td className={tdNum}>
                              {formatInteiro(p.estudantes)}
                              <span className="block text-caption text-ink-muted">
                                {formatPercentual(p.estudantes / m.n_estudantes)}
                              </span>
                            </td>
                            {VARIAVEIS.map((v) => (
                              <td key={v} className={tdNum}>
                                {formatDecimal(p[v])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Amostra no plano do PCA"
                    description={
                      amostra.data
                        ? `Amostra aleatória de ${formatInteiro(amostra.data.amostra)} dos ${formatInteiro(amostra.data.populacao)} estudantes, semente ${amostra.data.random_state}. A coleção completa não é exposta pela API: seriam cerca de 51 MB.`
                        : 'Amostra aleatória com semente fixa.'
                    }
                    action={
                      <Selecao
                        label="Tamanho da amostra"
                        valor={String(n)}
                        opcoes={TAMANHOS.map((t) => ({ valor: t, rotulo: formatInteiro(Number(t)) }))}
                        onChange={(v) => definir({ n: v === '3000' ? undefined : v })}
                        className="w-40"
                      />
                    }
                  />
                  <QueryBoundary query={amostra} loadingLabel="Carregando amostra…">
                    {() => (
                      <ScatterGrupos
                        pontos={pontos}
                        grupos={dados.perfis.map((p) => p.Cluster_ID)}
                        rotuloX="Componente 1"
                        rotuloY="Componente 2"
                        altura={380}
                        tamanho={18}
                        renderTooltip={(p) => (
                          <>
                            <p className="font-medium text-ink">Cluster {p.estudante.Cluster_ID}</p>
                            <p>
                              FG objetiva {formatDecimal(p.estudante.NT_OBJ_FG, 1)} · discursiva {formatDecimal(p.estudante.NT_DIS_FG, 1)}
                            </p>
                            <p>
                              CE objetiva {formatDecimal(p.estudante.NT_OBJ_CE, 1)} · discursiva {formatDecimal(p.estudante.NT_DIS_CE, 1)}
                            </p>
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

      <DescricaoIA
        titulo="Descrição automática dos perfis de desempenho"
        query={descricao}
        solicitado={descricaoPedida}
        onSolicitar={() => setDescricaoPedida(true)}
      />
    </div>
  )
}
