'use client'

import { RotateCcw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { type RegressaoRow, type ShapRow, calcularMetricasRegressao, LABELS_FEATURE } from '@/lib/multienade/api'
import { CORES_CATEGORIA, DEF_VARIAVEIS, type VariavelCor } from '@/lib/multienade/constants'
import { amostrar, clamp, classificar, deduplicarPorFeature, escala, regressaoLinear } from '@/lib/multienade/utils'
import { VariaveisInfo } from './VariaveisInfo'

interface SupervisionadaTabProps {
  regressao: RegressaoRow[]
  shap: ShapRow[] | null
  shapDisponivel: boolean
  status: 'idle' | 'loading' | 'error' | 'ready'
  onAtualizar: () => void
}

export function SupervisionadaTab({ regressao, shap, shapDisponivel, status, onAtualizar }: SupervisionadaTabProps) {
  const [variavelCor, setVariavelCor] = useState<VariavelCor>('infraestrutura')

  const metricas = useMemo(() => calcularMetricasRegressao(regressao), [regressao])

  const pontosClassificados = useMemo(
    () => regressao.map((d) => ({ dados: d, ...classificar(d, variavelCor) })),
    [regressao, variavelCor],
  )
  const pontosScatter = amostrar(pontosClassificados, 400)

  // Domínio dos eixos: dedicação vai de 1 a 5 (mapeamento ordinal fixo); nota usa a
  // faixa real observada na base, com uma margem, em vez de assumir 0–100.
  const dedicacaoMin = 1
  const dedicacaoMax = 5
  const notasObservadas = regressao.map((d) => d.NT_GER)
  const notaMin = notasObservadas.length ? Math.floor(Math.min(...notasObservadas) / 5) * 5 - 5 : 0
  const notaMax = notasObservadas.length ? Math.ceil(Math.max(...notasObservadas) / 5) * 5 + 5 : 100

  const reta = useMemo(
    () => regressaoLinear(regressao.map((d) => ({ x: d.QE_I23_ordinal, y: d.NT_GER }))),
    [regressao],
  )

  const shapOrdenado = shap ? deduplicarPorFeature(shap).sort((a, b) => b.importancia_media - a.importancia_media) : []
  const maiorShap = shapOrdenado[0]?.importancia_media ?? 1

  return (
    <>
      <div className="flex items-start justify-between py-6">
        <div>
          <h2 className="text-lg font-bold">Modelagem supervisionada & explicabilidade</h2>
          <p className="mt-1 text-xs text-[#8aa0c1]">Peso da dedicação aos estudos sobre a nota, e métricas de desempenho do modelo.</p>
        </div>
        <button onClick={onAtualizar} className="flex items-center gap-2 rounded-xl border border-[#dfe5ee] bg-white px-3 py-2 text-xs font-semibold text-[#536987]"><RotateCcw className="size-3.5" /> Atualizar análise</button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['R²', 'Poder explicativo', metricas.r2.toFixed(3).replace('.', ',')],
          ['MAE', 'Erro absoluto', metricas.mae.toFixed(2).replace('.', ',')],
          ['RMSE', 'Raiz do erro', metricas.rmse.toFixed(2).replace('.', ',')],
        ].map(([code, label, value]) => (
          <div key={code} className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
            <p className="text-[11px] text-[#8aa0c1]">{code} <span className="ml-1">— {label}</span></p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{status === 'ready' ? value : '—'}</p>
            <p className="mt-1 text-[10px] text-[#8aa0c1]">{status === 'ready' ? `base de ${metricas.n.toLocaleString('pt-BR')} cursos` : 'aguardando dados'}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">Dedicação aos estudos × Nota geral</h3>
            <p className="mt-1 text-xs text-[#8aa0c1]">Cada ponto é um curso; a linha tracejada é a tendência geral (regressão linear)</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#dfe5ee] bg-[#f6f8fb] p-1 text-[11px] font-semibold">
            <button
              onClick={() => setVariavelCor('infraestrutura')}
              className={`rounded-lg px-3 py-1.5 transition ${variavelCor === 'infraestrutura' ? 'bg-white text-[#155eef] shadow-sm' : 'text-[#8aa0c1]'}`}
            >
              Infraestrutura (QE_I63)
            </button>
            <button
              onClick={() => setVariavelCor('cotas')}
              className={`rounded-lg px-3 py-1.5 transition ${variavelCor === 'cotas' ? 'bg-white text-[#155eef] shadow-sm' : 'text-[#8aa0c1]'}`}
            >
              Perfil de ingresso (QE_I15)
            </button>
          </div>
        </div>

        <div className="relative mt-4 h-[340px] border-b border-l border-[#dbe6f7] bg-[linear-gradient(to_top,#f7faff_1px,transparent_1px),linear-gradient(to_right,#f7faff_1px,transparent_1px)] bg-[size:100%_25%,10%_100%]">
          <div className="absolute bottom-[-26px] left-1/2 -translate-x-1/2 text-[10px] text-[#8aa0c1]">Média de dedicação aos estudos (QE_I23, escala 1–5)</div>
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[#8aa0c1]">Nota geral média (NT_GER)</div>

          <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              x1={escala(dedicacaoMin, dedicacaoMin, dedicacaoMax)}
              y1={100 - escala(reta.a + reta.b * dedicacaoMin, notaMin, notaMax)}
              x2={escala(dedicacaoMax, dedicacaoMin, dedicacaoMax)}
              y2={100 - escala(reta.a + reta.b * dedicacaoMax, notaMin, notaMax)}
              stroke="#2b2d42"
              strokeWidth="1"
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {pontosScatter.map(({ dados: d, categoria, cor }, index) => (
            <span
              key={`${d.CO_CURSO}-${index}`}
              className="absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-white/70"
              style={{
                left: `${clamp(escala(d.QE_I23_ordinal, dedicacaoMin, dedicacaoMax), 1, 99)}%`,
                bottom: `${clamp(escala(d.NT_GER, notaMin, notaMax), 1, 99)}%`,
                backgroundColor: cor,
              }}
              title={`Curso ${d.CO_CURSO}: dedicação ${d.QE_I23_ordinal.toFixed(1)}, nota ${d.NT_GER.toFixed(1)} — ${categoria}`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-5 text-[11px] text-[#607494]">
            {Object.entries(CORES_CATEGORIA[variavelCor]).map(([categoria, cor]) => (
              <span key={categoria} className="flex items-center gap-1.5">
                <i className="inline-block size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                {categoria}
              </span>
            ))}
          </div>
          <VariaveisInfo
            itens={
              variavelCor === 'infraestrutura'
                ? [DEF_VARIAVEIS.NT_GER, DEF_VARIAVEIS.QE_I23, DEF_VARIAVEIS.QE_I63]
                : [DEF_VARIAVEIS.NT_GER, DEF_VARIAVEIS.QE_I23, DEF_VARIAVEIS.QE_I15]
            }
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold">Importância global (SHAP)</h3>
            <p className="mt-1 text-xs text-[#8aa0c1]">Impacto médio absoluto de cada fator na nota prevista</p>
          </div>
          <Sparkles className="size-4 text-[#155eef]" />
        </div>

        {!shapDisponivel && (
          <p className="mt-4 rounded-lg bg-[#f6f8fb] px-3 py-4 text-center text-xs text-[#8aa0c1]">
            Ainda não disponível — o pipeline de treino precisa persistir os valores SHAP numa tabela (ver instruções de backend).
          </p>
        )}

        {shapDisponivel && shapOrdenado.length > 0 && (
          <>
            <div className="mt-5 flex flex-col gap-3">
              {shapOrdenado.map((s) => (
                <div key={s.feature}>
                  <div className="flex justify-between text-[11px] text-[#536987]">
                    <span>{LABELS_FEATURE[s.feature] ?? s.feature}</span>
                    <strong>{s.importancia_media.toFixed(2)}</strong>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[#edf2f8]">
                    <div className="h-full rounded-full bg-[#2463eb]" style={{ width: `${(s.importancia_media / maiorShap) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <VariaveisInfo itens={[DEF_VARIAVEIS.QE_I23, DEF_VARIAVEIS.QE_I63, DEF_VARIAVEIS.QE_I57, DEF_VARIAVEIS.QE_I15]} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
