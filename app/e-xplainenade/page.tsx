'use client'

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Info,
  Play,
  Scale,
  Sparkles,
  Wand2,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  DatasetResumoResponse,
  ExplainApiError,
  HipoteseRequest,
  HipoteseResponse,
  OpcoesResponse,
  getDatasetResumo,
  getOpcoes,
  postHipotese,
  postRelatorio,
} from '@/lib/e-xplainenade/api'
import { BarraModulo } from '@/components/brand/layout/BarraModulo'
import { CORES_GRAFICO, EIXO_MARCA, TOOLTIP_MARCA } from '@/lib/brand/chart'
import { badge as badgeMarca, botao, botaoPrimario, campo, foco } from '@/lib/brand/classes'

// Mesmo default de app.py (Streamlit) — Renda Familiar + Escolaridade da Mãe +
// Horas de Estudo por Semana, o trio mais testado nas sessões de validação.
const DEFAULT_X = ['Renda Familiar', 'Escolaridade da Mãe', 'Horas de Estudo por Semana']

function formatP(p: number | null | undefined): string {
  if (p === null || p === undefined) return '—'
  return p < 0.001 ? '< 0,001' : p.toFixed(3).replace('.', ',')
}

function formatCoef(c: number): string {
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}`
}

// Os textos de interpretação da API usam **negrito** no estilo markdown —
// renderiza só esse marcador (o resto é texto puro).
function TextoInterpretacao({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split(/\*\*(.+?)\*\*/g)
  return (
    <p className={`whitespace-pre-line ${className ?? ''}`}>
      {partes.map((parte, i) => (i % 2 === 1 ? <strong key={i}>{parte}</strong> : parte))}
    </p>
  )
}

// recharts tipa o valor do tooltip como `ValueType | undefined` (pode ser
// string, número, array ou ausente) — normalizamos para exibição segura.
function formatTooltipValue(value: unknown): string {
  return typeof value === 'number' ? value.toFixed(2) : String(value ?? '')
}

function vifBadgeStyle(alerta: string) {
  if (alerta.startsWith('severo')) return { bg: 'var(--surface-card)', fg: 'var(--danger)', label: 'Severo' }
  if (alerta.startsWith('moderado')) return { bg: 'var(--surface-card)', fg: 'var(--warning)', label: 'Moderado' }
  return { bg: 'var(--surface-card)', fg: 'var(--success)', label: 'Ok' }
}

export default function EXplainEnadePage() {
  const [opcoes, setOpcoes] = useState<OpcoesResponse | null>(null)
  const [opcoesErro, setOpcoesErro] = useState<string | null>(null)

  const [resumo, setResumo] = useState<DatasetResumoResponse | null>(null)

  const [cursoSel, setCursoSel] = useState<string>('Todos (CC + SI)')
  const [iesSel, setIesSel] = useState<string>('Todas')
  const [ySel, setYSel] = useState<string>('')
  const [xSel, setXSel] = useState<string[]>([])
  // Pares de rótulos (não códigos) selecionados para termos de interação —
  // só faz sentido testar interação entre variáveis já selecionadas como X.
  const [interacoesSel, setInteracoesSel] = useState<string[][]>([])
  // Corte opcional de nº mínimo de presentes por curso — vazio = sem corte.
  const [minAlunosTxt, setMinAlunosTxt] = useState<string>('')
  const minAlunos = useMemo(() => {
    const n = Number.parseInt(minAlunosTxt, 10)
    return Number.isFinite(n) && n >= 1 ? n : null
  }, [minAlunosTxt])

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<HipoteseResponse | null>(null)

  const [gerandoPdf, setGerandoPdf] = useState(false)
  const [pdfErro, setPdfErro] = useState<string | null>(null)

  useEffect(() => {
    getOpcoes()
      .then((data) => {
        setOpcoes(data)
        setYSel(Object.keys(data.y)[0] ?? '')
        const defaults = DEFAULT_X.filter((label) => label in data.x)
        setXSel(defaults.length > 0 ? defaults : Object.keys(data.x).slice(0, 1))
      })
      .catch((e) => setOpcoesErro(e instanceof Error ? e.message : String(e)))
  }, [])

  // Resumo da base com os mesmos filtros do formulário (curso, IES, mínimo de
  // presentes), para o nº de cursos da capa bater com o que o modelo vai usar.
  useEffect(() => {
    // Espera /opcoes: sem ele não há como traduzir os filtros, e disparar antes
    // geraria duas cargas frias simultâneas do Supabase no backend.
    if (!opcoes) return
    getDatasetResumo({
      grupos: opcoes.curso[cursoSel] ?? null,
      ies: opcoes.ies[iesSel] ?? null,
      min_alunos: minAlunos,
    })
      .then(setResumo)
      .catch(() => {
        // silencioso — o resumo é só um indicador na capa; o erro real aparece
        // com destaque quando o usuário tentar rodar uma hipótese de verdade
      })
  }, [opcoes, cursoSel, iesSel, minAlunos])

  // code -> rótulo amigável, para exibir os nomes das variáveis nos resultados
  // (a API devolve os códigos crus, ex: "QE_RENDA", nas tabelas de coeficientes/VIF)
  const codeToLabel = useMemo(() => {
    const map: Record<string, string> = { Intercept: 'Intercepto' }
    if (opcoes) {
      for (const [label, code] of Object.entries(opcoes.y)) map[code] = label
      for (const [label, code] of Object.entries(opcoes.x)) map[code] = label
    }
    return map
  }, [opcoes])

  function labelFor(variavel: string): string {
    if (variavel.includes(':')) {
      return variavel.split(':').map((v) => codeToLabel[v] ?? v).join(' × ')
    }
    return codeToLabel[variavel] ?? variavel
  }

  function toggleX(label: string) {
    setXSel((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
  }

  // Todos os pares possíveis entre as variáveis X já selecionadas — só faz
  // sentido oferecer interação entre variáveis que já são efeito principal.
  const paresDisponiveis = useMemo(() => {
    const pares: string[][] = []
    for (let i = 0; i < xSel.length; i++) {
      for (let j = i + 1; j < xSel.length; j++) {
        pares.push([xSel[i], xSel[j]])
      }
    }
    return pares
  }, [xSel])

  // Se uma variável é desmarcada em X, qualquer interação que dependesse dela
  // deixa de fazer sentido — remove automaticamente.
  useEffect(() => {
    setInteracoesSel((prev) => prev.filter(([a, b]) => xSel.includes(a) && xSel.includes(b)))
  }, [xSel])

  function toggleInteracao(par: string[]) {
    setInteracoesSel((prev) =>
      prev.some(([a, b]) => a === par[0] && b === par[1])
        ? prev.filter(([a, b]) => !(a === par[0] && b === par[1]))
        : [...prev, par],
    )
  }

  // code -> rótulo da UI selecionado (reverso de opcoes.x), usado para saber
  // qual checkbox desmarcar quando removemos uma variável pelo VIF alto.
  function labelSelecionadoParaCode(code: string): string | undefined {
    if (!opcoes) return undefined
    return Object.entries(opcoes.x).find(([lbl]) => xSel.includes(lbl) && opcoes.x[lbl] === code)?.[0]
  }

  interface Overrides {
    xVars?: string[]
    interacoes?: string[][]
  }

  function montarRequest(overrides?: Overrides): HipoteseRequest | null {
    if (!opcoes || !ySel) return null
    const labels = overrides?.xVars ?? xSel
    if (labels.length === 0) return null
    // Filtra contra `labels` (não `xSel`) para o caso de override — ex: depois
    // de remover uma variável pelo VIF alto, qualquer interação que dependia
    // dela não pode ir junto, mesmo antes do efeito de limpeza rodar.
    const interacoesBase = overrides?.interacoes ?? interacoesSel
    const interacoesValidas = interacoesBase.filter(([a, b]) => labels.includes(a) && labels.includes(b))
    return {
      y: opcoes.y[ySel],
      x_vars: labels.map((label) => opcoes.x[label]),
      interactions: interacoesValidas.map(([a, b]) => [opcoes.x[a], opcoes.x[b]]),
      grupos: opcoes.curso[cursoSel] ?? null,
      ies_filter: opcoes.ies[iesSel] ?? null,
      min_alunos: minAlunos,
    }
  }

  async function executarHipotese(overrides?: Overrides) {
    const body = montarRequest(overrides)
    if (!body) return
    setLoading(true)
    setErro(null)
    try {
      const resposta = await postHipotese(body)
      setResultado(resposta)
      if (overrides?.xVars) setXSel(overrides.xVars)
      if (overrides?.interacoes) setInteracoesSel(overrides.interacoes)
    } catch (e) {
      setResultado(null)
      setErro(e instanceof ExplainApiError ? e.message : 'Falha inesperada ao consultar a API.')
    } finally {
      setLoading(false)
    }
  }

  // Mesmo laço do app.py (Streamlit): remove o termo com maior VIF acima do
  // limiar moderado e reexecuta a hipótese automaticamente. O termo pode ser
  // uma variável simples OU um termo de interação (ex: "QE_RENDA:QE_HORAS_ESTUDO")
  // — interações costumam ter VIF bem mais alto que qualquer variável isolada
  // (A, B e A:B são, por construção, correlacionadas entre si), então tratar
  // só o caso "variável simples" deixaria o botão sem efeito nesse cenário.
  function removerVariavelProblematica() {
    if (!resultado || !opcoes) return
    const problemáticas = resultado.vif_table.filter((row) => row.alerta !== 'ok')
    if (problemáticas.length === 0) return
    const pior = problemáticas.reduce((a, b) => (b.vif > a.vif ? b : a))

    if (pior.variavel.includes(':')) {
      const [codeA, codeB] = pior.variavel.split(':')
      const novaInteracoes = interacoesSel.filter(
        ([a, b]) => !(opcoes.x[a] === codeA && opcoes.x[b] === codeB),
      )
      executarHipotese({ interacoes: novaInteracoes })
      return
    }

    const labelParaRemover = labelSelecionadoParaCode(pior.variavel)
    if (!labelParaRemover) return
    const novaSelecao = xSel.filter((l) => l !== labelParaRemover)
    if (novaSelecao.length === 0) return
    executarHipotese({ xVars: novaSelecao })
  }

  async function baixarRelatorio() {
    const body = montarRequest()
    if (!body) return
    setGerandoPdf(true)
    setPdfErro(null)
    try {
      const { blob, filename } = await postRelatorio(body)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setPdfErro(e instanceof ExplainApiError ? e.message : 'Falha inesperada ao gerar o PDF.')
    } finally {
      setGerandoPdf(false)
    }
  }

  const conectado = opcoes !== null && opcoesErro === null

  return (
    <main className="min-h-screen bg-surface-page font-marca text-body text-ink">
      <BarraModulo
        nome={<span className="flex flex-col leading-tight"><span className="text-caption font-normal text-ink-on-nav/80">Subprojetos</span><span className="text-h3">E-XplainENADE</span></span>}
      >
        <div className="flex items-center gap-3">
          {conectado ? (
            <span className="hidden rounded-marca-sm border border-success px-3 py-1 text-small font-medium text-ink-on-nav sm:inline-flex">
              ● Conectado
            </span>
          ) : (
            <span className="hidden rounded-marca-sm border border-danger px-3 py-1 text-small font-medium text-ink-on-nav sm:inline-flex">
              ● API indisponível
            </span>
          )}
        </div>
      </BarraModulo>

      <div className="px-4 py-8 sm:px-10">
        <div className="mb-5 flex items-center gap-2 text-small text-ink-muted">
          <a href="/" className={`rounded-marca-sm hover:text-accent ${foco}`}>Home</a>
          <span>/</span><span>Subprojetos</span><span>/</span>
          <span className="text-ink">E-XplainENADE</span>
        </div>

        <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-9">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-display text-ink">E-XplainENADE</h1>
              <span className={badgeMarca.info}>
                Modelagem estatística
              </span>
            </div>
            <p className="mt-2 text-body text-ink-muted">
              Teste hipóteses sobre fatores associados ao desempenho no ENADE — regressão WLS,
              multicolinearidade (VIF), diagnóstico de resíduos e explicabilidade (SHAP).
            </p>
          </div>
          <div className="text-right text-small text-ink-muted">
            <div className="flex items-center justify-end gap-2">
              Base: <strong className="num font-medium text-ink">
                {resumo ? `${resumo.n_cursos.toLocaleString('pt-BR')} cursos (CC + SI, 2021)` : '—'}
              </strong>
            </div>
            {resumo && resumo.n_cursos_excluidos > 0 && (
              <p className="mt-1 max-w-[340px] text-caption text-ink-muted" title={resumo.motivo_exclusao ?? undefined}>
                {resumo.n_cursos_excluidos} curso(s) excluído(s): IES de categoria &ldquo;Especial&rdquo;
                (CO_CATEGAD = 7), sem classificação pública/privada no dicionário do INEP.
              </p>
            )}
          </div>
        </section>

        {opcoesErro && (
          <div className="mt-6 flex items-start gap-3 rounded-marca-md border border-danger bg-surface-card p-4 text-body text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Não foi possível carregar as opções da API.</p>
              <p className="mt-1 text-small">{opcoesErro}</p>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
            <h2 className="flex items-center gap-2 text-h3 text-ink">
              <Filter className="size-4 text-accent" /> Definição da hipótese
            </h2>
            <p className="mt-2 text-small text-ink-muted">Escolha o recorte e as variáveis</p>

            <label className="mt-6 block text-small font-medium text-ink">
              Curso
              <select
                value={cursoSel}
                onChange={(e) => setCursoSel(e.target.value)}
                disabled={!opcoes}
                className={`${campo} mt-2`}
              >
                {opcoes && Object.keys(opcoes.curso).map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <label className="mt-5 block text-small font-medium text-ink">
              Tipo de IES
              <select
                value={iesSel}
                onChange={(e) => setIesSel(e.target.value)}
                disabled={!opcoes}
                className={`${campo} mt-2`}
              >
                {opcoes && Object.keys(opcoes.ies).map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <label className="mt-5 block text-small font-medium text-ink">
              Mínimo de presentes por curso
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="Sem corte"
                value={minAlunosTxt}
                onChange={(e) => setMinAlunosTxt(e.target.value)}
                disabled={!opcoes}
                className={`${campo} mt-2`}
              />
              <span className="mt-1 block text-caption font-normal text-ink-muted">
                Opcional. Cursos com menos alunos presentes ficam fora do modelo.
              </span>
            </label>

            <label className="mt-5 block text-small font-medium text-ink">
              Variável dependente (Y)
              <select
                value={ySel}
                onChange={(e) => setYSel(e.target.value)}
                disabled={!opcoes}
                className={`${campo} mt-2`}
              >
                {opcoes && Object.keys(opcoes.y).map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <fieldset className="mt-5">
              <legend className="text-small font-medium text-ink">Variáveis explicativas (X)</legend>
              {opcoes && Object.entries(opcoes.x_categorias).map(([categoria, { vars }]) => (
                <div key={categoria} className="mt-3">
                  <p className="text-caption font-medium text-ink-muted">{categoria}</p>
                  <div className="mt-2 flex flex-col gap-2 text-small text-ink">
                    {vars.map((label) => (
                      <label key={label} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={xSel.includes(label)}
                          onChange={() => toggleX(label)}
                          className="size-3.5 accent-accent"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>

            {paresDisponiveis.length > 0 && (
              <fieldset className="mt-5">
                <legend className="text-small font-medium text-ink">Testar interações?</legend>
                <p className="mt-1 text-caption text-ink-muted">Só entre variáveis já marcadas em X</p>
                <div className="mt-2 flex flex-col gap-2 text-small text-ink">
                  {paresDisponiveis.map((par) => {
                    const marcado = interacoesSel.some(([a, b]) => a === par[0] && b === par[1])
                    return (
                      <label key={`${par[0]}__${par[1]}`} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() => toggleInteracao(par)}
                          className="size-3.5 accent-accent"
                        />
                        {par[0]} × {par[1]}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )}

            <button
              onClick={() => executarHipotese()}
              disabled={!opcoes || xSel.length === 0 || loading}
              className={`${botaoPrimario} mt-6 w-full`}
            >
              <Play className="size-3.5" /> {loading ? 'Calculando...' : 'Executar hipótese'}
            </button>
          </aside>

          <section className="min-w-0">
            {erro && (
              <div className="mb-5 flex items-start gap-3 rounded-marca-md border border-danger bg-surface-card p-4 text-body text-danger">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Não foi possível calcular a hipótese.</p>
                  <p className="mt-1 text-small">{erro}</p>
                </div>
              </div>
            )}

            {!resultado && !erro && (
              <div className="flex h-64 items-center justify-center rounded-marca-md border-2 border-dashed border-border text-body text-ink-muted">
                Escolha as variáveis e clique em &ldquo;Executar hipótese&rdquo; para ver os resultados.
              </div>
            )}

            {resultado && (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="rounded-marca-md border border-border bg-surface-card px-4 py-2 font-mono text-small text-ink">
                    {resultado.formula}
                  </p>
                  <button
                    onClick={baixarRelatorio}
                    disabled={gerandoPdf}
                    className={`${botao} h-9 px-3 text-small`}
                  >
                    <Download className="size-3.5" /> {gerandoPdf ? 'Gerando PDF...' : 'Baixar relatório PDF'}
                  </button>
                </div>
                {pdfErro && (
                  <p className="mb-4 text-small text-danger">Falha ao gerar o PDF: {pdfErro}</p>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-marca-md border border-border bg-surface-card p-4 shadow-marca">
                    <p className="text-caption text-ink-muted">R² — Poder explicativo</p>
                    <p className="num mt-2 text-kpi text-ink">{(resultado.model_metrics.r2 * 100).toFixed(1)}%</p>
                    <p className="mt-1 text-caption text-ink-muted">R² ajustado: {resultado.model_metrics.r2_adj.toFixed(4)}</p>
                  </div>
                  <div className="rounded-marca-md border border-border bg-surface-card p-4 shadow-marca">
                    <p className="text-caption text-ink-muted">Cursos analisados</p>
                    <p className="num mt-2 text-kpi text-ink">{resultado.model_metrics.n_obs.toLocaleString('pt-BR')}</p>
                    <p className="mt-1 text-caption text-ink-muted">Base agregada por curso (WLS)</p>
                  </div>
                  <div className="rounded-marca-md border border-border bg-surface-card p-4 shadow-marca">
                    <p className="text-caption text-ink-muted">Significância global (F)</p>
                    <p className="num mt-2 text-kpi text-ink">{formatP(resultado.model_metrics.f_pvalue)}</p>
                    <p className="mt-1 text-caption text-ink-muted">F = {resultado.model_metrics.f_stat.toFixed(2)}</p>
                  </div>
                </div>

                {resultado.model_metrics.n_obs < resultado.reprodutibilidade.n_cursos_base && (
                  <div className="mt-4 flex items-start gap-2 rounded-marca-md border border-warning bg-surface-card px-4 py-3 text-small text-warning">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    O modelo usou {resultado.model_metrics.n_obs.toLocaleString('pt-BR')} dos{' '}
                    {resultado.reprodutibilidade.n_cursos_base.toLocaleString('pt-BR')} cursos da base: os demais
                    têm valor ausente em alguma variável da hipótese.
                  </div>
                )}

                <div className="mt-5 rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                  <h3 className="text-h3 text-ink">Efeito de cada fator</h3>
                  {Object.keys(resultado.medias_centragem).length > 0 && (
                    <div className="mt-3 flex items-start gap-2 rounded-marca-md border border-border bg-surface-sunken px-3 py-2.5 text-small text-ink">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      <span>
                        <strong>Variáveis centradas na média</strong> (por causa das interações):{' '}
                        {Object.entries(resultado.medias_centragem)
                          .map(([code, m]) => `${labelFor(code)} = ${m.toFixed(2).replace('.', ',')}`)
                          .join(' · ')}
                        . O β de cada efeito principal é o efeito quando a outra variável está na média dos cursos.
                      </span>
                    </div>
                  )}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-table-num">
                      <thead>
                        <tr className="text-ink-muted">
                          <th className="pb-2 pr-4 font-medium">Fator</th>
                          <th className="pb-2 pr-4 font-medium">β</th>
                          <th className="pb-2 pr-4 font-medium">p-valor</th>
                          <th className="pb-2 pr-4 font-medium" title={`Erro-padrão robusto a heterocedasticidade (${resultado.cov_type})`}>
                            EP robusto ({resultado.cov_type})
                          </th>
                          <th className="pb-2 pr-4 font-medium" title={`p-valor com erro-padrão ${resultado.cov_type}`}>
                            p robusto ({resultado.cov_type})
                          </th>
                          <th className="pb-2 pr-4 font-medium">IC 95%</th>
                          <th className="pb-2 font-medium">Confiável?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.coef_table.map((row) => (
                          <tr key={row.variavel} className="border-t border-border">
                            <td className="py-2 pr-4 font-medium text-ink">{labelFor(row.variavel)}</td>
                            <td className="py-2 pr-4">{formatCoef(row.coeficiente)}</td>
                            <td className="py-2 pr-4">{formatP(row.p_valor)}</td>
                            <td className="py-2 pr-4">{row.erro_padrao_robusto?.toFixed(3).replace('.', ',') ?? '—'}</td>
                            <td className="py-2 pr-4">{formatP(row.p_valor_robusto)}</td>
                            <td className="py-2 pr-4 text-ink-muted">[{row.ic_inf_95.toFixed(2)} ; {row.ic_sup_95.toFixed(2)}]</td>
                            <td className="py-2">
                              {row.p_valor < 0.05 ? (
                                <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Sim</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-ink-muted"><XCircle className="size-3.5" /> Não</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TextoInterpretacao texto={resultado.interpretacao_modelo} className="mt-4 text-small text-ink" />
                </div>

                <div className="mt-5 rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                  <h3 className="flex items-center gap-2 text-h3 text-ink">
                    <Scale className="size-4 text-accent" /> Sensibilidade à ponderação
                  </h3>
                  <p className="mt-1 text-small text-ink-muted">
                    O mesmo modelo como WLS (principal, peso = alunos presentes) e como OLS sem pesos, cada um com
                    erro-padrão clássico e robusto ({resultado.cov_type}). Linhas em amarelo mudam de sinal ou de
                    significância (p &lt; 0,05) conforme o ajuste.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-table-num">
                      <thead>
                        <tr className="text-ink-muted">
                          <th className="pb-2 pr-4 font-medium">Fator</th>
                          <th className="pb-2 pr-4 font-medium">β WLS</th>
                          <th className="pb-2 pr-4 font-medium">p WLS</th>
                          <th className="pb-2 pr-4 font-medium">p WLS {resultado.cov_type}</th>
                          <th className="pb-2 pr-4 font-medium">β OLS</th>
                          <th className="pb-2 pr-4 font-medium">p OLS</th>
                          <th className="pb-2 pr-4 font-medium">p OLS {resultado.cov_type}</th>
                          <th className="pb-2 font-medium">Diverge?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.comparison_table
                          .filter((row) => row.variavel !== 'Intercept')
                          .map((row) => {
                            const diverge = row.sinal_diverge || row.signif_diverge
                            return (
                              <tr
                                key={row.variavel}
                                className={`border-t border-border ${diverge ? 'bg-warning/10' : ''}`}
                              >
                                <td className="py-2 pr-4 font-medium text-ink">{labelFor(row.variavel)}</td>
                                <td className="py-2 pr-4">{formatCoef(row.coef_wls)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_wls)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_wls_robust)}</td>
                                <td className="py-2 pr-4">{formatCoef(row.coef_ols)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_ols)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_ols_robust)}</td>
                                <td className="py-2">
                                  {diverge ? (
                                    <span className="inline-flex items-center gap-1 text-ink">
                                      <AlertTriangle className="size-3.5 text-warning" />
                                      {[row.sinal_diverge && 'sinal', row.signif_diverge && 'significância']
                                        .filter(Boolean)
                                        .join(' e ')}
                                    </span>
                                  ) : (
                                    <span className="text-ink-muted">Não</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                  <TextoInterpretacao texto={resultado.interpretacao_sensibilidade} className="mt-4 text-small text-ink" />

                  <div className="mt-4 rounded-marca-md border border-border bg-surface-sunken p-4">
                    <p className="text-small font-medium text-ink">Por que ponderar? Diagnóstico do OLS sem pesos</p>
                    <div className="mt-3 flex flex-col gap-2 text-small">
                      <div className="flex items-center justify-between">
                        <span className="text-ink">Breusch-Pagan (OLS sem pesos)</span>
                        <span className="flex items-center gap-2">
                          <span className="text-ink-muted">p {formatP(resultado.diagnostics_ols.bp_pvalue)}</span>
                          {resultado.diagnostics_ols.bp_homocedastic ? (
                            <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Homocedástico</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle className="size-3.5" /> Heterocedástico</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ink">Spearman |resíduo| × alunos presentes</span>
                        <span className="flex items-center gap-2">
                          <span className="text-ink-muted">
                            ρ = {resultado.diagnostics_ols.spearman_rho.toFixed(3).replace('.', ',')} · p{' '}
                            {formatP(resultado.diagnostics_ols.spearman_pvalue)}
                          </span>
                          {resultado.diagnostics_ols.erro_cai_com_tamanho ? (
                            <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle className="size-3.5" /> Cursos pequenos erram mais</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Sem relação</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <TextoInterpretacao texto={resultado.interpretacao_ponderacao} className="mt-3 text-small text-ink" />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                    <h3 className="text-h3 text-ink">Multicolinearidade (VIF)</h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {resultado.vif_table.map((row) => {
                        const badge = vifBadgeStyle(row.alerta)
                        return (
                          <div key={row.variavel} className="flex items-center justify-between text-small">
                            <span className="text-ink">{labelFor(row.variavel)}</span>
                            <span className="flex items-center gap-2">
                              <strong>{row.vif.toFixed(2)}</strong>
                              <span
                                className="rounded-marca-sm border px-2 py-0.5 text-caption font-medium"
                                style={{ backgroundColor: badge.bg, color: badge.fg, borderColor: badge.fg }}
                              >
                                {badge.label}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <TextoInterpretacao texto={resultado.interpretacao_vif} className="mt-4 text-small text-ink" />
                    {resultado.vif_table.some((row) => row.alerta !== 'ok') && xSel.length > 1 && (
                      <button
                        onClick={removerVariavelProblematica}
                        disabled={loading}
                        className={`${botao} mt-4 w-full border-warning text-small text-warning`}
                      >
                        <Wand2 className="size-3.5" /> Remover variável de maior VIF e reexecutar
                      </button>
                    )}
                  </div>

                  <div className="rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                    <h3 className="text-h3 text-ink">Diagnóstico de resíduos</h3>
                    <div className="mt-3 flex flex-col gap-3 text-small">
                      <div className="flex items-center justify-between">
                        <span className="text-ink">Normalidade (Shapiro-Wilk)</span>
                        {resultado.residuals_diag.shapiro_normal ? (
                          <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Normal</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle className="size-3.5" /> Não normal</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ink">Homocedasticidade (Breusch-Pagan)</span>
                        {resultado.residuals_diag.bp_homocedastic ? (
                          <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Homocedástico</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle className="size-3.5" /> Heterocedástico</span>
                        )}
                      </div>
                    </div>
                    <TextoInterpretacao texto={resultado.interpretacao_residuos} className="mt-4 text-small text-ink" />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                    <h3 className="text-h3 text-ink">Resíduos vs. valores ajustados</h3>
                    <p className="mt-1 text-small text-ink-muted">Sem padrão visível = homocedasticidade</p>
                    <ScatterChart width={380} height={220} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} className="mx-auto mt-2">
                      <CartesianGrid stroke={CORES_GRAFICO.grade} />
                      <XAxis type="number" dataKey="fitted" name="Ajustado" tick={EIXO_MARCA.tick} />
                      <YAxis type="number" dataKey="residual" name="Resíduo" tick={EIXO_MARCA.tick} />
                      <ReferenceLine y={0} stroke="var(--border-control)" />
                      <Tooltip
                        contentStyle={TOOLTIP_MARCA}
                        formatter={formatTooltipValue}
                      />
                      <Scatter data={resultado.residuals_plot} fill={CORES_GRAFICO.series3} fillOpacity={0.6} />
                    </ScatterChart>
                  </div>

                  <div className="rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                    <h3 className="text-h3 text-ink">QQ-plot (normalidade)</h3>
                    <p className="mt-1 text-small text-ink-muted">Pontos sobre a reta = resíduos normais</p>
                    <ComposedChart width={380} height={220} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} className="mx-auto mt-2">
                      <CartesianGrid stroke={CORES_GRAFICO.grade} />
                      <XAxis type="number" dataKey="theoretical" name="Quantil teórico" tick={EIXO_MARCA.tick} />
                      <YAxis type="number" dataKey="sample" name="Quantil amostral" tick={EIXO_MARCA.tick} />
                      <Tooltip
                        contentStyle={TOOLTIP_MARCA}
                        formatter={formatTooltipValue}
                      />
                      <Line data={resultado.qqplot} dataKey="line_y" stroke="var(--border-control)" dot={false} strokeWidth={1.5} />
                      <Scatter data={resultado.qqplot} dataKey="sample" fill={CORES_GRAFICO.series3} fillOpacity={0.6} />
                    </ComposedChart>
                  </div>
                </div>

                <div className="mt-5 rounded-marca-md border border-border bg-surface-card p-5 shadow-marca">
                  <h3 className="flex items-center gap-2 text-h3 text-ink">
                    <Sparkles className="size-4" /> Importância dos fatores (SHAP)
                  </h3>
                  <BarChart
                    width={720}
                    height={Math.max(120, resultado.shap_summary.length * 34)}
                    data={resultado.shap_summary}
                    layout="vertical"
                    margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                    className="mt-3 max-w-full"
                  >
                    <XAxis type="number" tick={EIXO_MARCA.tick} />
                    <YAxis
                      type="category"
                      dataKey="variavel"
                      tickFormatter={(code: string) => labelFor(code)}
                      width={160}
                      tick={EIXO_MARCA.tick}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_MARCA}
                      formatter={formatTooltipValue}
                      labelFormatter={(label) => labelFor(String(label ?? ''))}
                    />
                    <Bar dataKey="shap_mean_abs" radius={[0, 4, 4, 0]}>
                      {resultado.shap_summary.map((row) => (
                        <Cell key={row.variavel} fill={CORES_GRAFICO.series2} />
                      ))}
                    </Bar>
                  </BarChart>
                  <TextoInterpretacao texto={resultado.interpretacao_shap} className="mt-3 text-small text-ink" />
                  <p className="mt-2 text-caption text-ink-muted">
                    Linha de base: média dos cursos ponderada pelo nº de alunos presentes (mesmo peso do WLS).
                  </p>
                </div>

                <details className="mt-5 rounded-marca-md border border-border bg-surface-card p-5 text-small shadow-marca">
                  <summary className="cursor-pointer text-h3 text-ink">Reprodutibilidade desta execução</summary>
                  <dl className="mt-3 grid grid-cols-[180px_minmax(0,1fr)] gap-x-4 gap-y-2 text-ink">
                    <dt className="font-medium text-ink">Base (SHA-256)</dt>
                    <dd className="break-all font-mono text-caption">{resultado.reprodutibilidade.hash_base_sha256}</dd>
                    <dt className="font-medium text-ink">Funil de cursos</dt>
                    <dd>
                      {[
                        ['recorte', resultado.reprodutibilidade.funil_cursos.cursos_recorte],
                        ['com nota', resultado.reprodutibilidade.funil_cursos.cursos_com_nota],
                        ['excluídos CO_CATEGAD = 7', resultado.reprodutibilidade.funil_cursos.cursos_excluidos_categad],
                        ['após tipo de IES', resultado.reprodutibilidade.funil_cursos.cursos_apos_ies],
                        ['após mínimo de presentes', resultado.reprodutibilidade.funil_cursos.cursos_apos_min_alunos],
                        ['base', resultado.reprodutibilidade.n_cursos_base],
                        ['no modelo', resultado.reprodutibilidade.n_obs_modelo],
                      ]
                        .filter(([, n]) => n !== undefined && n !== null)
                        .map(([etapa, n]) => `${etapa}: ${n}`)
                        .join(' → ')}
                    </dd>
                    <dt className="font-medium text-ink">Filtros</dt>
                    <dd>
                      grupos = {JSON.stringify(resultado.reprodutibilidade.filtros.grupos)} · IES ={' '}
                      {JSON.stringify(resultado.reprodutibilidade.filtros.ies_filter)} · mínimo de presentes ={' '}
                      {resultado.reprodutibilidade.filtros.min_alunos ?? 'sem corte'}
                    </dd>
                    <dt className="font-medium text-ink">Erro-padrão robusto</dt>
                    <dd>{resultado.reprodutibilidade.cov_type}</dd>
                    <dt className="font-medium text-ink">Aleatoriedade</dt>
                    <dd>{resultado.reprodutibilidade.aleatoriedade}</dd>
                    <dt className="font-medium text-ink">Versões</dt>
                    <dd>
                      {Object.entries(resultado.reprodutibilidade.versoes)
                        .map(([lib, v]) => `${lib} ${v}`)
                        .join(' · ')}
                    </dd>
                    <dt className="font-medium text-ink">Fonte</dt>
                    <dd>{resultado.reprodutibilidade.fonte_dados}</dd>
                  </dl>
                </details>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
