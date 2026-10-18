'use client'

import { Equal, GitCompare, Layers, Percent, Sigma } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

import { QueryBoundary } from '@/app/educluster/_components/feedback/QueryBoundary'
import { Card, CardHeader } from '@/app/educluster/_components/ui/Card'
import { MarcadorSerie } from '@/app/educluster/_components/ui/Legenda'
import { KpiGrid, MetricCard } from '@/app/educluster/_components/ui/MetricCard'
import { Filtros, Selecao } from '@/app/educluster/_components/ui/Selecao'
import { corSequencial, tintaSobre } from '@/lib/educluster/chart'
import { rotularClusters } from '@/lib/educluster/clusters'
import { formatDecimal, formatInteiro, formatPercentual } from '@/lib/educluster/format'
import { useClustersCursos, useComparacaoTradicional } from '@/lib/educluster/hooks/useEduCluster'
import { useParametrosUrl } from '@/lib/educluster/hooks/useParametrosUrl'
import { DIMENSOES, FAIXAS, ROTULO_FAIXA } from '@/lib/educluster/rotulos'
import { ROTAS } from '@/lib/educluster/rotas'
import {
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

const TOLERANCIAS = ['0.1', '0.25', '0.5', '1']

export default function ComparacaoTradicional() {
  const { lerNumero, definir } = useParametrosUrl()
  const tolerancia = lerNumero('tolerancia', 0.5) ?? 0.5
  const consulta = useComparacaoTradicional(tolerancia)
  const clusters = useClustersCursos()
  const rotulos = useMemo(() => rotularClusters(clusters.data?.perfis ?? []), [clusters.data])

  return (
    <div className="space-y-6">
      <Filtros>
        <Selecao
          label="Tolerância para cursos gêmeos (pontos de nota geral)"
          valor={String(tolerancia)}
          opcoes={TOLERANCIAS.map((t) => ({ valor: t, rotulo: `diferença < ${formatDecimal(Number(t), 2)}` }))}
          onChange={(v) => definir({ tolerancia: v === '0.5' ? undefined : v })}
          className="lg:col-span-2"
        />
      </Filtros>

      <QueryBoundary query={consulta} loadingLabel="Comparando com o ranking por nota…">
        {(dados) => {
          const p = dados.comparacao_de_particoes
          const info = dados.informacao_perdida_pelo_ranking
          const colunas = Object.keys(p.tabela_cruzada[0] ?? {})
            .filter((c) => c !== 'rotulo_tradicional')
            .sort((a, b) => Number(a) - Number(b))
          const maximo = Math.max(
            ...p.tabela_cruzada.flatMap((linha) => colunas.map((c) => Number(linha[c] ?? 0))),
          )
          const quaseIguais = dados.gemeos_divergentes_amostra.filter((g) => g.diferenca_nota >= 0.005 && g.diferenca_nota <= 0.05)
          const candidatos = quaseIguais.length > 0 ? quaseIguais : dados.gemeos_divergentes_amostra
          const extremo = candidatos.reduce<(typeof candidatos)[number] | undefined>(
            (melhor, g) => (!melhor || g.diferenca_ODP > melhor.diferenca_ODP ? g : melhor),
            undefined,
          )
          return (
            <>
              <KpiGrid cols={5}>
                <MetricCard label="ARI entre as partições" value={formatDecimal(p.ari, 4)} icon={GitCompare} hint="1 seria a mesma divisão; perto de 0, informação diferente" tom="destaque" />
                <MetricCard label="NMI" value={formatDecimal(p.nmi, 4)} icon={Sigma} hint="informação mútua normalizada" />
                <MetricCard label="Concordância máxima" value={formatPercentual(p.concordancia_maxima)} icon={Percent} hint="melhor casamento possível entre terços e clusters" />
                <MetricCard label="Gêmeos divergentes" value={formatInteiro(dados.total_gemeos_divergentes)} icon={Equal} hint={`pares com nota a menos de ${formatDecimal(dados.tolerancia_nota, 2)} e clusters diferentes`} />
                <MetricCard label="Componentes para 90%" value={info.componentes_para_90_porcento} icon={Layers} hint="dimensionalidade real do espaço do artefato" />
              </KpiGrid>

              <Card>
                <CardHeader
                  title="O artefato contra o ranking"
                  description="A análise tradicional divide os cursos em terços pela nota geral média, como os relatórios oficiais. O artefato agrupa pelas seis dimensões: FG, CE, presença, ODP, OPORT e INFRA."
                />
                <p className="text-body text-ink">
                  O ARI entre os terços de nota e os clusters é {formatDecimal(p.ari, 4)}: as duas partições carregam
                  informação em boa parte diferente. Existem {formatInteiro(dados.total_gemeos_divergentes)} pares de
                  cursos com nota geral quase idêntica que o artefato separa em perfis distintos, porque diferem na
                  qualidade percebida e na taxa de presença.
                  {extremo &&
                    ` Por exemplo, os cursos ${extremo.curso_a} e ${extremo.curso_b} têm nota geral de ${formatDecimal(extremo.NT_GER_a, 2)} e ${formatDecimal(extremo.NT_GER_b, 2)}, mas diferem ${formatDecimal(extremo.diferenca_ODP, 2)} pontos de ODP numa escala de 1 a 6.`}{' '}
                  O artefato não melhora a medida da nota: revela uma dimensão que a nota não mede.
                </p>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader
                    title="Terços de nota contra clusters"
                    description="Quantos cursos de cada terço caem em cada perfil. Quanto mais escura a célula, mais cursos."
                  />
                  <div className={tabelaWrapper}>
                    <table className={tabela}>
                      <thead className={tabelaHead}>
                        <tr>
                          <th className={th}>Faixa de nota</th>
                          {colunas.map((c) => (
                            <th key={c} className={thNum}>
                              <span className="inline-flex items-center gap-1.5">
                                <MarcadorSerie indice={Number(c)} />
                                Cluster {c}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {FAIXAS.map((faixa) => {
                          const linha = p.tabela_cruzada.find((l) => l.rotulo_tradicional === faixa)
                          return (
                            <tr key={faixa} className={trLinha}>
                              <td className={td}>{ROTULO_FAIXA[faixa]}</td>
                              {colunas.map((c) => {
                                const valor = Number(linha?.[c] ?? 0)
                                const fundo = corSequencial(valor, maximo)
                                return (
                                  <td key={c} className="px-2 py-1.5 text-right">
                                    <span
                                      className="inline-block min-w-16 rounded-marca-sm px-2 py-1.5 text-body font-medium num"
                                      style={{ backgroundColor: fundo, color: tintaSobre(fundo) }}
                                    >
                                      {formatInteiro(valor)}
                                    </span>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ul className="mt-3 space-y-1 text-caption text-ink-muted">
                    {colunas.map((c) => (
                      <li key={c}>
                        Cluster {c}: {rotulos[Number(c)] ?? 'carregando…'}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <CardHeader
                    title="Percepção que o ranking esconde"
                    description="Dentro de cada terço de nota, a menor e a maior média percebida entre os cursos. Cursos do mesmo terço vão do pior ao melhor avaliado."
                  />
                  <div className={tabelaWrapper}>
                    <table className={tabela}>
                      <thead className={tabelaHead}>
                        <tr>
                          <th className={th}>Faixa</th>
                          <th className={thNum}>Cursos</th>
                          {DIMENSOES.map((d) => (
                            <th key={d} className={thNum}>
                              {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {info.por_faixa.map((f) => (
                          <tr key={f.faixa} className={trLinha}>
                            <td className={td}>{ROTULO_FAIXA[f.faixa]}</td>
                            <td className={tdNum}>{formatInteiro(f.cursos)}</td>
                            {DIMENSOES.map((d) => (
                              <td key={d} className={tdNum}>
                                <span className="block font-medium">{formatDecimal(f[`${d}_amplitude` as const])}</span>
                                <span className="text-caption text-ink-muted">
                                  {formatDecimal(f[`${d}_min` as const])} a {formatDecimal(f[`${d}_max` as const])}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-caption text-ink-muted">
                    Valor em destaque: amplitude (máximo menos mínimo) na escala de 1 a 6. Os três terços contêm
                    cursos dos três perfis.
                  </p>
                </Card>
              </div>

              <Card>
                <CardHeader
                  title="Gêmeos divergentes"
                  description={`Pares vizinhos na ordenação por nota geral, com diferença menor que ${formatDecimal(dados.tolerancia_nota, 2)} ponto, que o artefato coloca em perfis diferentes. Amostra dos ${dados.gemeos_divergentes_amostra.length} pares com maior diferença de ODP, de um total de ${formatInteiro(dados.total_gemeos_divergentes)}.`}
                />
                <div className={tabelaWrapper}>
                  <table className={tabela}>
                    <thead className={tabelaHead}>
                      <tr>
                        <th className={th}>Curso A</th>
                        <th className={th}>Curso B</th>
                        <th className={thNum}>Nota A</th>
                        <th className={thNum}>Nota B</th>
                        <th className={thNum}>Diferença de nota</th>
                        <th className={th}>Perfis</th>
                        <th className={thNum}>ODP A</th>
                        <th className={thNum}>ODP B</th>
                        <th className={thNum}>Diferença de ODP</th>
                        <th className={thNum}>Presença A / B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.gemeos_divergentes_amostra.map((g) => (
                        <tr key={`${g.curso_a}-${g.curso_b}`} className={trLinha}>
                          <td className={td}>
                            <Link href={ROTAS.curso(g.curso_a)} className={linkTexto}>
                              {g.curso_a}
                            </Link>
                          </td>
                          <td className={td}>
                            <Link href={ROTAS.curso(g.curso_b)} className={linkTexto}>
                              {g.curso_b}
                            </Link>
                          </td>
                          <td className={tdNum}>{formatDecimal(g.NT_GER_a)}</td>
                          <td className={tdNum}>{formatDecimal(g.NT_GER_b)}</td>
                          <td className={tdNum}>{formatDecimal(g.diferenca_nota, 3)}</td>
                          <td className={td}>
                            <span className="inline-flex items-center gap-1.5 text-small">
                              <MarcadorSerie indice={g.cluster_a} /> {g.cluster_a}
                              <span className="text-ink-muted">e</span>
                              <MarcadorSerie indice={g.cluster_b} /> {g.cluster_b}
                            </span>
                          </td>
                          <td className={tdNum}>{formatDecimal(g.ODP_a)}</td>
                          <td className={tdNum}>{formatDecimal(g.ODP_b)}</td>
                          <td className={tdNum}>
                            <strong className="font-medium">{formatDecimal(g.diferenca_ODP)}</strong>
                          </td>
                          <td className={tdNum}>
                            {formatPercentual(g.tx_presenca_a, 0)} / {formatPercentual(g.tx_presenca_b, 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )
        }}
      </QueryBoundary>
    </div>
  )
}
