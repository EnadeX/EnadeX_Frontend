'use client'

import { Scale, TrendingDown, Users } from 'lucide-react'

import { LineNotaDificuldade } from '../../_components/charts/LineNotaDificuldade'
import { QueryBoundary } from '../../_components/feedback/QueryBoundary'
import { Aviso } from '../../_components/ui/Aviso'
import { Card, CardHeader } from '../../_components/ui/Card'
import { KpiGrid, MetricCard } from '../../_components/ui/MetricCard'
import { formatDecimal, formatInteiro, formatPercentual, formatSinal } from '@/lib/educluster/format'
import { useCalibracao } from '@/lib/educluster/hooks/useEduCluster'
import { ROTULO_CALIBRACAO } from '@/lib/educluster/rotulos'
import type { PerfilCalibracao, PerfilCalibracaoResumo } from '@/lib/educluster/types'
import { cn } from '@/lib/utils'

const GRADE: { perfil: PerfilCalibracao; calibrado: boolean }[][] = [
  [
    { perfil: 'confianca_confirmada', calibrado: true },
    { perfil: 'insegura_mas_capaz', calibrado: false },
  ],
  [
    { perfil: 'confianca_excessiva', calibrado: false },
    { perfil: 'dificuldade_reconhecida', calibrado: true },
  ],
]

function CartaoPerfil({
  dados,
  total,
  calibrado,
}: {
  dados?: PerfilCalibracaoResumo
  total: number
  calibrado: boolean
}) {
  if (!dados) return <div className="rounded-2xl border border-dashed border-[#dfe5ee] p-4" />
  const rotulo = ROTULO_CALIBRACAO[dados.calibracao]
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        calibrado ? 'border-[#dfe5ee] bg-white' : 'border-[#fdba74] bg-[#fff7ed]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#111827]">{rotulo.titulo}</p>
          <p className="text-[11px] text-[#5f7393]">{rotulo.leitura}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            calibrado ? 'bg-[#f0fdfa] text-[#0f766e]' : 'bg-[#ffedd5] text-[#c2410c]',
          )}
        >
          {calibrado ? 'calibrado' : 'descalibrado'}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{formatInteiro(dados.estudantes)}</p>
      <p className="text-[11px] text-[#5f7393]">{formatPercentual(dados.estudantes / total)} dos estudantes</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-[#5f7393]">Nota geral</dt>
          <dd className="font-semibold tabular-nums">{formatDecimal(dados.NT_GER)}</dd>
        </div>
        <div>
          <dt className="text-[#5f7393]">Dificuldade</dt>
          <dd className="font-semibold tabular-nums">{formatDecimal(dados.dificuldade_percebida)}</dd>
        </div>
        <div>
          <dt className="text-[#5f7393]">Desempenho (z)</dt>
          <dd className="font-semibold tabular-nums">{formatSinal(dados.desempenho_z)}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function CalibracaoPercepcao() {
  const consulta = useCalibracao()

  return (
    <QueryBoundary query={consulta} loadingLabel="Carregando calibração…">
      {(dados) => {
        const m = dados.metricas
        const porPerfil = Object.fromEntries(dados.perfis.map((p) => [p.calibracao, p])) as Partial<
          Record<PerfilCalibracao, PerfilCalibracaoResumo>
        >
        const pico = dados.nota_por_dificuldade.reduce((a, b) => (b.mean > a.mean ? b : a))
        const maisFacil = dados.nota_por_dificuldade[0]
        return (
          <div className="space-y-6">
            <KpiGrid cols={3}>
              <MetricCard label="Estudantes" value={formatInteiro(m.n_estudantes)} icon={Users} hint="com nota e com resposta aos itens de dificuldade" />
              <MetricCard label="Correlação dificuldade e desempenho" value={formatSinal(m.correlacao_dificuldade_desempenho, 4)} icon={TrendingDown} hint="fraca: a percepção da prova pouco prevê a nota" />
              <MetricCard label="Descalibrados" value={formatPercentual(m.taxa_descalibrados)} icon={Scale} hint="percepção e desempenho em direções opostas" tom="destaque" />
            </KpiGrid>

            <Aviso>
              Dificuldade percebida é a média dos itens {Object.keys(m.itens_usados).join(' e ')} do questionário de
              percepção da prova (1 = muito fácil, 5 = muito difícil). O desempenho é a nota geral padronizada dentro da área, porque cada
              área faz uma prova de componente específico diferente. Achou fácil quer dizer dificuldade até a
              mediana; foi bem quer dizer desempenho acima da média da área.
            </Aviso>

            <Card>
              <CardHeader
                title="Percepção da prova contra o desempenho"
                description="Linhas: foi bem ou mal na prova. Colunas: achou a prova fácil ou difícil. Em laranja, os perfis em que a percepção não corresponde ao resultado."
              />
              <div className="grid grid-cols-[auto_1fr_1fr] gap-3">
                <span />
                <p className="text-center text-[11px] font-bold uppercase tracking-wide text-[#5f7393]">Achou fácil</p>
                <p className="text-center text-[11px] font-bold uppercase tracking-wide text-[#5f7393]">Achou difícil</p>
                {GRADE.map((linha, i) => (
                  <div key={i} className="contents">
                    <p className="self-center text-[11px] font-bold uppercase tracking-wide text-[#5f7393] [writing-mode:vertical-rl] rotate-180">
                      {i === 0 ? 'Foi bem' : 'Foi mal'}
                    </p>
                    {linha.map((celula) => (
                      <CartaoPerfil
                        key={celula.perfil}
                        dados={porPerfil[celula.perfil]}
                        total={m.n_estudantes}
                        calibrado={celula.calibrado}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Nota média por nível de dificuldade percebida"
                description="A relação não é monotônica. Passe o mouse para ver quantos estudantes há em cada nível: os extremos têm poucos."
              />
              <LineNotaDificuldade dados={dados.nota_por_dificuldade} />
              <p className="mt-2 text-xs leading-5 text-[#5f7393]">
                Quem marcou dificuldade {formatDecimal(maisFacil.dificuldade_percebida, 1)} tirou em média{' '}
                {formatDecimal(maisFacil.mean)} ({formatInteiro(maisFacil.size)} estudantes), abaixo de quem marcou{' '}
                {formatDecimal(pico.dificuldade_percebida, 1)}, que tirou {formatDecimal(pico.mean)}. O padrão é
                compatível com o efeito Dunning-Kruger, mas não o prova: os dados são observacionais e os níveis
                extremos reúnem poucos estudantes.
              </p>
            </Card>
          </div>
        )
      }}
    </QueryBoundary>
  )
}
