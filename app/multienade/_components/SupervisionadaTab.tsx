'use client'

import { RotateCcw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { type RegressaoRow, type ShapRow, calcularMetricasRegressao, LABELS_FEATURE } from '@/lib/multienade/api'
import { CORES_CATEGORIA, DEF_VARIAVEIS, type VariavelCor } from '@/lib/multienade/constants'
import { amostrar, clamp, classificar, deduplicarPorFeature, escala, mediana, proporcaoCotas, regressaoLinear } from '@/lib/multienade/utils'
import { VariaveisInfo } from './VariaveisInfo'
import { botao, card, foco, kpiRotulo, kpiValor } from '@/lib/brand/classes'

interface SupervisionadaTabProps {
  regressao: RegressaoRow[]
  shap: ShapRow[] | null
  shapDisponivel: boolean
  status: 'idle' | 'loading' | 'error' | 'ready'
  onAtualizar: () => void
}

export function SupervisionadaTab({ regressao, shap, shapDisponivel, status, onAtualizar }: SupervisionadaTabProps) {
  const [variavelCor, setVariavelCor] = useState<VariavelCor>('professores')

  const metricas = useMemo(() => calcularMetricasRegressao(regressao), [regressao])

  // Só entram no gráfico cursos com índice socioeconômico e nota preenchidos.
  const validos = useMemo(
    () => regressao.filter((d) => Number.isFinite(d.PCA_ECON_1) && Number.isFinite(d.NT_GER)),
    [regressao],
  )
  const medianaCotas = useMemo(() => mediana(validos.map(proporcaoCotas)), [validos])

  const pontosClassificados = useMemo(
    () => validos.map((d) => ({ dados: d, ...classificar(d, variavelCor, medianaCotas) })),
    [validos, variavelCor, medianaCotas],
  )
  const pontosScatter = amostrar(pontosClassificados, 400)

  // Domínio dos eixos: o índice socioeconômico (PCA_ECON_1) é um escore padronizado, sem faixa fixa; os dois
  // eixos usam a faixa real observada na base, com uma margem.
  const indices = validos.map((d) => d.PCA_ECON_1)
  const indiceMin = indices.length ? Math.floor(Math.min(...indices)) - 0.5 : -1
  const indiceMax = indices.length ? Math.ceil(Math.max(...indices)) + 0.5 : 1
  const notasObservadas = validos.map((d) => d.NT_GER)
  const notaMin = notasObservadas.length ? Math.floor(Math.min(...notasObservadas) / 5) * 5 - 5 : 0
  const notaMax = notasObservadas.length ? Math.ceil(Math.max(...notasObservadas) / 5) * 5 + 5 : 100

  const reta = useMemo(
    () => regressaoLinear(validos.map((d) => ({ x: d.PCA_ECON_1, y: d.NT_GER }))),
    [validos],
  )

  const shapOrdenado = shap ? deduplicarPorFeature(shap).sort((a, b) => b.importancia_media - a.importancia_media) : []
  const maiorShap = shapOrdenado[0]?.importancia_media ?? 1

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div>
          <h2 className="text-h2 text-ink">Modelagem supervisionada & explicabilidade</h2>
          <p className="mt-1 text-small text-ink-muted">Peso do perfil socioeconômico e acadêmico sobre a nota, e métricas de desempenho do modelo.</p>
        </div>
        <button onClick={onAtualizar} className={`${botao} h-9 px-3 text-small`}><RotateCcw className="size-3.5" /> Atualizar análise</button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['R²', 'Poder explicativo', metricas.r2.toFixed(3).replace('.', ',')],
          ['MAE', 'Erro absoluto', metricas.mae.toFixed(2).replace('.', ',')],
          ['RMSE', 'Raiz do erro', metricas.rmse.toFixed(2).replace('.', ',')],
        ].map(([code, label, value]) => (
          <div key={code} className={`${card} p-4`}>
            <p className={kpiRotulo}>{code} <span className="ml-1">— {label}</span></p>
            <p className={`${kpiValor} num`}>{status === 'ready' ? value : '—'}</p>
            <p className="mt-1 text-caption text-ink-muted">{status === 'ready' ? `ajuste em ${metricas.n.toLocaleString('pt-BR')} cursos, incluindo o treino` : 'aguardando dados'}</p>
          </div>
        ))}
      </div>

      <div className={`${card} mt-5 p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-h3 text-ink">Índice socioeconômico × Nota geral</h3>
            <p className="mt-1 text-small text-ink-muted">Cada ponto é um curso; a linha tracejada é a tendência geral (regressão linear)</p>
          </div>
          <div className="flex max-w-full flex-wrap items-center gap-1 rounded-marca-md border border-border bg-surface-sunken p-1 text-small font-medium">
            <button
              onClick={() => setVariavelCor('professores')}
              className={`cursor-pointer rounded-marca-sm px-3 py-1.5 transition-colors ${foco} ${variavelCor === 'professores' ? 'bg-surface-card text-accent shadow-marca' : 'text-ink-muted hover:text-ink'}`}
            >
              Domínio docente (QE_I57)
            </button>
            <button
              onClick={() => setVariavelCor('cotas')}
              className={`cursor-pointer rounded-marca-sm px-3 py-1.5 transition-colors ${foco} ${variavelCor === 'cotas' ? 'bg-surface-card text-accent shadow-marca' : 'text-ink-muted hover:text-ink'}`}
            >
              Perfil de ingresso (QE_I15)
            </button>
          </div>
        </div>

        <div className="relative mt-4 h-[340px] border-b border-l border-border-control bg-[linear-gradient(to_top,var(--border)_1px,transparent_1px),linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[size:100%_25%,10%_100%]">
          <div className="absolute inset-x-0 top-full mt-1.5 text-center font-dados text-axis text-ink-muted">Índice socioeconômico do curso (PCA_ECON_1: renda, situação financeira e trabalho)</div>
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 -rotate-90 font-dados text-axis text-ink-muted">Nota geral média (NT_GER)</div>

          <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              x1={escala(indiceMin, indiceMin, indiceMax)}
              y1={100 - escala(reta.a + reta.b * indiceMin, notaMin, notaMax)}
              x2={escala(indiceMax, indiceMin, indiceMax)}
              y2={100 - escala(reta.a + reta.b * indiceMax, notaMin, notaMax)}
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {pontosScatter.map(({ dados: d, categoria, cor }, index) => (
            <span
              key={`${d.CO_CURSO}-${index}`}
              className="absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-surface-card/70"
              style={{
                left: `${clamp(escala(d.PCA_ECON_1, indiceMin, indiceMax), 1, 99)}%`,
                bottom: `${clamp(escala(d.NT_GER, notaMin, notaMax), 1, 99)}%`,
                backgroundColor: cor,
              }}
              title={`Curso ${d.CO_CURSO}: índice socioeconômico ${d.PCA_ECON_1.toFixed(2)}, nota ${d.NT_GER.toFixed(1)} — ${categoria}`}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:mt-10">
          <div className="flex flex-wrap gap-5 text-small text-ink-muted">
            {Object.entries(CORES_CATEGORIA[variavelCor]).map(([categoria, cor]) => (
              <span key={categoria} className="flex items-center gap-1.5">
                <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                {categoria}
              </span>
            ))}
          </div>
          <VariaveisInfo
            itens={
              variavelCor === 'professores'
                ? [DEF_VARIAVEIS.NT_GER, DEF_VARIAVEIS.PCA_ECON, DEF_VARIAVEIS.QE_I57]
                : [DEF_VARIAVEIS.NT_GER, DEF_VARIAVEIS.PCA_ECON, DEF_VARIAVEIS.QE_I15]
            }
          />
        </div>
      </div>

      <div className={`${card} mt-5 p-5`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-h3 text-ink">Importância global (SHAP)</h3>
            <p className="mt-1 text-small text-ink-muted">Impacto médio absoluto de cada fator na nota prevista</p>
          </div>
          <Sparkles className="size-4 text-ink-muted" />
        </div>

        {!shapDisponivel && (
          <p className="mt-4 rounded-marca-sm bg-surface-sunken px-3 py-4 text-center text-small text-ink-muted">
            Ainda não disponível — o pipeline de treino precisa persistir os valores SHAP numa tabela (ver instruções de backend).
          </p>
        )}

        {shapDisponivel && shapOrdenado.length > 0 && (
          <>
            <div className="mt-5 flex flex-col gap-3">
              {shapOrdenado.map((s) => (
                <div key={s.feature}>
                  <div className="flex justify-between gap-4 text-small text-ink">
                    <span>{LABELS_FEATURE[s.feature] ?? s.feature}</span>
                    <strong className="num font-medium">{s.importancia_media.toFixed(2)}</strong>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full bg-series-2" style={{ width: `${(s.importancia_media / maiorShap) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <VariaveisInfo itens={[DEF_VARIAVEIS.PCA_ECON, DEF_VARIAVEIS.QE_I13, DEF_VARIAVEIS.QE_I24, DEF_VARIAVEIS.QE_I04, DEF_VARIAVEIS.QE_I15]} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
