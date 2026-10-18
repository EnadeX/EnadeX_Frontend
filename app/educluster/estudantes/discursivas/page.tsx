'use client'

import { FileX, PenLine, Users } from 'lucide-react'

import { BarSituacaoQuestao } from '../../_components/charts/BarSituacaoQuestao'
import { QueryBoundary } from '../../_components/feedback/QueryBoundary'
import { Aviso } from '../../_components/ui/Aviso'
import { Card, CardHeader } from '../../_components/ui/Card'
import { KpiGrid, MetricCard } from '../../_components/ui/MetricCard'
import { formatDecimal, formatInteiro, formatPercentual } from '@/lib/educluster/format'
import { useDiscursivas } from '@/lib/educluster/hooks/useEduCluster'
import { ROTULO_DISCURSIVO, ROTULO_VARIAVEL } from '@/lib/educluster/rotulos'
import type { PerfilDiscursivo, PerfilDiscursivoResumo } from '@/lib/educluster/types'
import { tabela, tabelaHead, tabelaWrapper, td, tdNum, th, thNum, trLinha } from '@/lib/educluster/ui'
import { cn } from '@/lib/utils'

const GRADE: PerfilDiscursivo[][] = [
  ['sabe_e_escreve', 'sabe_mas_nao_escreve'],
  ['escreve_mas_nao_domina', 'dificuldade_ampla'],
]

const NOTAS = ['NT_OBJ_CE', 'NT_DIS_CE', 'NT_OBJ_FG', 'NT_DIS_FG', 'NT_GER'] as const

function CartaoPerfil({ dados, total }: { dados?: PerfilDiscursivoResumo; total: number }) {
  if (!dados) return <div className="rounded-marca-md border border-dashed border-border p-4" />
  const rotulo = ROTULO_DISCURSIVO[dados.perfil_discursivo]
  const destaque = dados.perfil_discursivo === 'sabe_mas_nao_escreve'
  return (
    <div className={cn('rounded-marca-md border p-4 shadow-marca', destaque ? 'border-accent bg-surface-card' : 'border-border bg-surface-card')}>
      <p className="text-h3 text-ink">{rotulo.titulo}</p>
      <p className="text-caption text-ink-muted">{rotulo.leitura}</p>
      <p className="mt-3 text-kpi">{formatInteiro(dados.estudantes)}</p>
      <p className="text-caption text-ink-muted">{formatPercentual(dados.estudantes / total)} dos estudantes</p>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-small sm:grid-cols-3">
        <div>
          <dt className="text-ink-muted">CE objetiva</dt>
          <dd className="font-medium num">{formatDecimal(dados.NT_OBJ_CE)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">CE discursiva</dt>
          <dd className="font-medium num">{formatDecimal(dados.NT_DIS_CE)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Abandono</dt>
          <dd className="font-medium num">{formatPercentual(dados.taxa_abandono, 0)}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function SituacaoDiscursivas() {
  const consulta = useDiscursivas()

  return (
    <QueryBoundary query={consulta} loadingLabel="Carregando situação das discursivas…">
      {(dados) => {
        const m = dados.metricas
        const porPerfil = Object.fromEntries(dados.perfis.map((p) => [p.perfil_discursivo, p])) as Partial<
          Record<PerfilDiscursivo, PerfilDiscursivoResumo>
        >
        const sabeNaoEscreve = porPerfil.sabe_mas_nao_escreve
        return (
          <div className="space-y-6">
            <KpiGrid cols={4}>
              <MetricCard label="Estudantes" value={formatInteiro(m.n_estudantes)} icon={Users} hint="presentes com nota válida" />
              <MetricCard label="Abandono médio" value={formatPercentual(m.taxa_abandono_media)} icon={FileX} hint="das cinco discursivas, por estudante" />
              <MetricCard label="Abandonaram todas" value={formatPercentual(m.abandonaram_todas)} icon={FileX} hint="nenhuma discursiva entregue" />
              <MetricCard label="Sabem, mas não escrevem" value={formatPercentual(m.sabe_mas_nao_escreve)} icon={PenLine} hint="dominam a objetiva e abandonam discursivas" tom="destaque" />
            </KpiGrid>

            <Aviso>
              Abandono é deixar a questão em branco, dar resposta nula ou responder fora do tema. Domina o conteúdo quem tem a nota objetiva do CE acima da média da
              própria área; entrega quem não abandonou nenhuma discursiva. A separação distingue desistência de erro
              conceitual: a nota discursiva baixa de quem abandona não mede o que ele sabe.
            </Aviso>

            <Card>
              <CardHeader
                title="Domínio do conteúdo contra entrega das discursivas"
                description="Linhas: domina ou não o conteúdo objetivo. Colunas: entrega ou abandona discursivas."
              />
              <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:gap-3">
                <span />
                <p className="text-center text-caption font-medium text-ink-muted">Entrega</p>
                <p className="text-center text-caption font-medium text-ink-muted">Abandona</p>
                {GRADE.map((linha, i) => (
                  <div key={i} className="contents">
                    <p className="self-center text-caption font-medium text-ink-muted [writing-mode:vertical-rl] rotate-180">
                      {i === 0 ? 'Domina' : 'Não domina'}
                    </p>
                    {linha.map((perfil) => (
                      <CartaoPerfil key={perfil} dados={porPerfil[perfil]} total={m.n_estudantes} />
                    ))}
                  </div>
                ))}
              </div>
              {sabeNaoEscreve && (
                <p className="mt-4 text-small text-ink-muted">
                  {formatPercentual(sabeNaoEscreve.estudantes / m.n_estudantes)} dos estudantes estão acima da área na
                  parte objetiva do CE ({formatDecimal(sabeNaoEscreve.NT_OBJ_CE)}) e abandonam em média{' '}
                  {formatPercentual(sabeNaoEscreve.taxa_abandono, 0)} das discursivas, tirando{' '}
                  {formatDecimal(sabeNaoEscreve.NT_DIS_CE)} nelas. Numa análise que olha só a nota final, eles se
                  confundem com quem não sabe o conteúdo.
                </p>
              )}
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader
                  title="Abandono por questão"
                  description="Percentual de estudantes em cada situação de abandono, na ordem da prova. O restante é resposta válida."
                />
                <BarSituacaoQuestao dados={dados.situacao_por_questao} />
              </Card>

              <Card>
                <CardHeader title="Notas médias por perfil" description="Médias de 0 a 100." />
                <div className={tabelaWrapper}>
                  <table className={tabela}>
                    <thead className={tabelaHead}>
                      <tr>
                        <th className={th}>Perfil</th>
                        {NOTAS.map((n) => (
                          <th key={n} className={thNum}>
                            {ROTULO_VARIAVEL[n]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dados.perfis.map((p) => (
                        <tr key={p.perfil_discursivo} className={trLinha}>
                          <td className={td}>{ROTULO_DISCURSIVO[p.perfil_discursivo].titulo}</td>
                          {NOTAS.map((n) => (
                            <td key={n} className={tdNum}>
                              {formatDecimal(p[n])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )
      }}
    </QueryBoundary>
  )
}
