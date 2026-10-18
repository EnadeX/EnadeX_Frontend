'use client'

import {
  ArrowUpRight,
  BookOpen,
  Gauge,
  GraduationCap,
  Layers,
  Map as MapIcon,
  Repeat,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

import { QueryBoundary } from './_components/feedback/QueryBoundary'
import { Card, CardHeader } from './_components/ui/Card'
import { MarcadorSerie } from './_components/ui/Legenda'
import { KpiGrid, MetricCard } from './_components/ui/MetricCard'
import { rotularClusters } from '@/lib/educluster/clusters'
import { corDivergente, tintaSobre } from '@/lib/educluster/chart'
import { formatDecimal, formatInteiro, formatPercentual, formatSinal } from '@/lib/educluster/format'
import {
  useAreas,
  useClustersCursos,
  useDimensoesDesempenho,
  useEstabilidadeK,
} from '@/lib/educluster/hooks/useEduCluster'
import { DIMENSOES, ROTULO_DIMENSAO } from '@/lib/educluster/rotulos'
import { ROTAS } from '@/lib/educluster/rotas'
import type { MetricasModeloCursos } from '@/lib/educluster/types'

const TITULO_SECAO = 'mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5f7393]'

const ANALISES = [
  {
    href: ROTAS.cursos,
    sigla: 'A6',
    titulo: 'Perfis de curso',
    texto: 'Agrupa cursos por desempenho, presença e qualidade percebida. Mapa PCA, perfis, estabilidade e descrição por IA.',
  },
  {
    href: ROTAS.cursosDiscrepantes,
    sigla: 'A7',
    titulo: 'Cursos discrepantes',
    texto: 'Cursos cuja percepção destoa do desempenho, sempre comparados aos pares da própria área.',
  },
  {
    href: ROTAS.cursosDimensoes,
    sigla: 'A8',
    titulo: 'Dimensões e desempenho',
    texto: 'Qual dimensão percebida mais acompanha a nota, área por área.',
  },
  {
    href: ROTAS.cursosComparacao,
    sigla: 'Fase 6',
    titulo: 'Comparação com o ranking',
    texto: 'O que o artefato mostra e a divisão em terços pela nota média não mostra.',
  },
  {
    href: ROTAS.estudantes,
    sigla: 'A1',
    titulo: 'Desempenho do estudante',
    texto: 'Perfis por notas objetivas e discursivas, no nível do estudante.',
  },
  {
    href: ROTAS.estudantesCalibracao,
    sigla: 'A3',
    titulo: 'Calibração da percepção',
    texto: 'Quem achou a prova fácil foi bem? Percepção da prova contra o desempenho real.',
  },
  {
    href: ROTAS.estudantesDiscursivas,
    sigla: 'A4',
    titulo: 'Discursivas',
    texto: 'Desistência contra erro conceitual: quem sabe o conteúdo e não entrega a resposta escrita.',
  },
]

function metricasCompletas(m: unknown): m is MetricasModeloCursos {
  return typeof m === 'object' && m !== null && 'silhouette' in m
}

function MatrizCorrelacao() {
  const correlacoes = useDimensoesDesempenho('NT_CE')

  return (
    <QueryBoundary query={correlacoes} loadingLabel="Calculando correlações…">
      {(dados) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#5f7393]">
                <th className="px-2 py-1.5 text-left font-semibold">Dimensão percebida</th>
                <th className="px-2 py-1.5 text-right font-semibold">Formação geral</th>
                <th className="px-2 py-1.5 text-right font-semibold">Componente específico</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSOES.map((d) => {
                const linha = dados.correlacao_global.find((c) => c.dimensao === d)
                const valorCe = linha?.NT_CE ?? 0
                const valorFg = linha?.NT_FG ?? 0
                return (
                  <tr key={d} className="border-t border-[#edf1f6]">
                    <td className="px-2 py-2">
                      <span className="font-semibold">{d}</span>
                      <span className="ml-2 text-xs text-[#5f7393]">{ROTULO_DIMENSAO[d]}</span>
                    </td>
                    {[valorFg, valorCe].map((v, i) => {
                      const fundo = corDivergente(v, 0.6)
                      return (
                        <td key={i} className="px-2 py-1.5 text-right">
                          <span
                            className="inline-block min-w-16 rounded-md px-2 py-1 text-xs font-semibold tabular-nums"
                            style={{ backgroundColor: fundo, color: tintaSobre(fundo) }}
                          >
                            {formatSinal(v, 3)}
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
      )}
    </QueryBoundary>
  )
}

export default function EduClusterVisaoGeral() {
  const clusters = useClustersCursos()
  const areas = useAreas()
  const metricasBrutas = clusters.data?.metricas
  const m = metricasCompletas(metricasBrutas) ? metricasBrutas : undefined
  const estabilidade = useEstabilidadeK(m?.k ?? 3, 20)
  const rotulos = useMemo(() => rotularClusters(clusters.data?.perfis ?? []), [clusters.data])
  const ari = estabilidade.data?.k === m?.k ? estabilidade.data?.ari_medio : undefined

  return (
    <div className="space-y-8">
      <section>
        <h2 className={TITULO_SECAO}>Base analítica e modelo</h2>
        <KpiGrid cols={3}>
          <MetricCard label="Cursos na base" value={formatInteiro(m?.n_cursos)} icon={BookOpen} hint="com 20 ou mais respondentes no arq3 e no arq4" />
          <MetricCard label="Estudantes representados" value={formatInteiro(m?.n_estudantes)} icon={Users} hint="inscritos com nota nesses cursos" />
          <MetricCard label="Áreas de avaliação" value={formatInteiro(areas.data?.total)} icon={MapIcon} hint="edição 2021: licenciaturas, ciências, computação e TI" />
          <MetricCard label="Perfis de curso" value={m?.k ?? '-'} icon={Layers} hint="k escolhido pelo maior silhouette" tom="destaque" />
          <MetricCard label="Silhouette" value={formatDecimal(m?.silhouette, 4)} icon={Gauge} hint="separação moderada entre os perfis" />
          <MetricCard label="Estabilidade (ARI)" value={formatDecimal(ari, 3)} icon={Repeat} hint="20 reamostragens de 80% da base" />
        </KpiGrid>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            title="Achado central: o que o estudante percebe quase não acompanha a nota"
            description="Correlação de Pearson entre as dimensões percebidas do curso (arq4) e as notas médias (arq3), no nível do curso. Valores perto de zero indicam que as duas coisas variam de forma quase independente."
          />
          <MatrizCorrelacao />
          <p className="mt-4 text-xs leading-5 text-[#5f7393]">
            {m
              ? `O PCA da análise central separou as duas coisas sozinho: o componente 1 (${formatPercentual(m.variancia_por_componente[0])} da variância) concentra a percepção e o componente 2 (${formatPercentual(m.variancia_por_componente[1])}) concentra o desempenho. `
              : ''}
            A área do curso é um confundidor forte; a aba Discrepantes compara cada curso só com os pares da mesma área.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Perfis de curso do modelo treinado"
            action={
              <Link href={ROTAS.cursos} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f766e] hover:underline">
                Ver mapa <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          <QueryBoundary query={clusters} loadingLabel="Carregando perfis…">
            {(dados) => (
              <ul className="space-y-3">
                {dados.perfis.map((p) => (
                  <li key={p.Cluster_ID} className="rounded-xl border border-[#edf1f6] p-3">
                    <div className="flex items-center gap-2">
                      <MarcadorSerie indice={p.Cluster_ID} />
                      <p className="text-sm font-semibold">Cluster {p.Cluster_ID}</p>
                      <p className="text-xs text-[#5f7393]">{rotulos[p.Cluster_ID]}</p>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#475569]">
                      {formatInteiro(p.cursos)} cursos · FG {formatDecimal(p.NT_FG)} · CE {formatDecimal(p.NT_CE)} · presença{' '}
                      {formatPercentual(p.tx_presenca, 0)} · ODP {formatDecimal(p.ODP)} · OPORT {formatDecimal(p.OPORT)} · INFRA{' '}
                      {formatDecimal(p.INFRA)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </QueryBoundary>
        </Card>
      </div>

      <section>
        <h2 className={TITULO_SECAO}>Análises</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ANALISES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#99f6e4] hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#14b8a6]/40"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#f0fdfa] px-2 py-0.5 text-[10px] font-bold text-[#0f766e]">{a.sigla}</span>
                <ArrowUpRight className="size-4 text-[#94a3b8] transition group-hover:text-[#0f766e]" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-semibold text-[#111827]">{a.titulo}</p>
              <p className="mt-1 text-xs leading-5 text-[#5f7393]">{a.texto}</p>
            </Link>
          ))}
          <Link
            href={ROTAS.sobre}
            className="group flex flex-col justify-between rounded-2xl border border-dashed border-[#cbd5e1] p-4 transition hover:border-[#99f6e4] hover:bg-[#f0fdfa]/50"
          >
            <GraduationCap className="size-5 text-[#0f766e]" aria-hidden />
            <div>
              <p className="mt-3 text-sm font-semibold text-[#111827]">Método e limitações</p>
              <p className="mt-1 text-xs leading-5 text-[#5f7393]">Dados, LGPD, pipeline, validação e o que a análise não permite concluir.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
