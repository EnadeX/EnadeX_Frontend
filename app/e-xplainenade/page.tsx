'use client'

import {
  AlertTriangle,
  BarChart3,
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
  if (alerta.startsWith('severo')) return { bg: '#fef2f2', fg: '#b91c1c', label: 'Severo' }
  if (alerta.startsWith('moderado')) return { bg: '#fffbeb', fg: '#b45309', label: 'Moderado' }
  return { bg: '#f0fdf8', fg: '#009b67', label: 'Ok' }
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
    <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
      <header className="border-b border-[#dfe5ee] bg-white">
        <div className="flex h-[70px] items-center justify-between px-10">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Voltar para a Home" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#7c3aed] text-white">
                <BarChart3 className="size-5" />
              </span>
              <span className="text-[17px] font-bold tracking-tight">EnadeX</span>
            </a>
            <span className="h-8 w-px bg-[#dfe5ee]" />
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#91a4c3]">Subprojetos</p>
              <p className="text-sm font-semibold">E-XplainENADE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {conectado ? (
              <span className="hidden rounded-full border border-[#a7efd0] bg-[#f0fdf8] px-3 py-1.5 text-xs font-semibold text-[#009b67] sm:inline-flex">
                ● Conectado
              </span>
            ) : (
              <span className="hidden rounded-full border border-[#fecaca] bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] sm:inline-flex">
                ● API indisponível
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="px-10 py-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-[#8aa0c1]">
          <a href="/" className="hover:text-[#7c3aed]">Home</a>
          <span>/</span><span>Subprojetos</span><span>/</span>
          <span className="text-[#2d4263]">E-XplainENADE</span>
        </div>

        <section className="flex items-end justify-between border-b border-[#dfe5ee] pb-9">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[29px] font-bold tracking-tight">E-XplainENADE</h1>
              <span className="rounded-lg border border-[#e4d4fe] bg-[#f5f0ff] px-2.5 py-1 text-[11px] font-semibold text-[#7c3aed]">
                Modelagem estatística
              </span>
            </div>
            <p className="mt-2 text-sm text-[#607494]">
              Teste hipóteses sobre fatores associados ao desempenho no ENADE — regressão WLS,
              multicolinearidade (VIF), diagnóstico de resíduos e explicabilidade (SHAP).
            </p>
          </div>
          <div className="text-right text-xs text-[#607494]">
            <div className="flex items-center justify-end gap-2">
              Base: <strong className="text-[#2d4263]">
                {resumo ? `${resumo.n_cursos.toLocaleString('pt-BR')} cursos (CC + SI, 2021)` : '—'}
              </strong>
            </div>
            {resumo && resumo.n_cursos_excluidos > 0 && (
              <p className="mt-1 max-w-[340px] text-[10px] text-[#8aa0c1]" title={resumo.motivo_exclusao ?? undefined}>
                {resumo.n_cursos_excluidos} curso(s) excluído(s): IES de categoria &ldquo;Especial&rdquo;
                (CO_CATEGAD = 7), sem classificação pública/privada no dicionário do INEP.
              </p>
            )}
          </div>
        </section>

        {opcoesErro && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Não foi possível carregar as opções da API.</p>
              <p className="mt-1 text-xs">{opcoesErro}</p>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-[280px_minmax(0,1fr)] gap-8">
          <aside className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Filter className="size-4 text-[#7c3aed]" /> Definição da hipótese
            </h2>
            <p className="mt-2 text-xs text-[#8aa0c1]">Escolha o recorte e as variáveis</p>

            <label className="mt-6 block text-xs font-semibold text-[#536987]">
              Curso
              <select
                value={cursoSel}
                onChange={(e) => setCursoSel(e.target.value)}
                disabled={!opcoes}
                className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#7c3aed]"
              >
                {opcoes && Object.keys(opcoes.curso).map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <label className="mt-5 block text-xs font-semibold text-[#536987]">
              Tipo de IES
              <select
                value={iesSel}
                onChange={(e) => setIesSel(e.target.value)}
                disabled={!opcoes}
                className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#7c3aed]"
              >
                {opcoes && Object.keys(opcoes.ies).map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <label className="mt-5 block text-xs font-semibold text-[#536987]">
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
                className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#7c3aed]"
              />
              <span className="mt-1 block text-[10px] font-normal text-[#8aa0c1]">
                Opcional. Cursos com menos alunos presentes ficam fora do modelo.
              </span>
            </label>

            <label className="mt-5 block text-xs font-semibold text-[#536987]">
              Variável dependente (Y)
              <select
                value={ySel}
                onChange={(e) => setYSel(e.target.value)}
                disabled={!opcoes}
                className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#7c3aed]"
              >
                {opcoes && Object.keys(opcoes.y).map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>

            <fieldset className="mt-5">
              <legend className="text-xs font-semibold text-[#536987]">Variáveis explicativas (X)</legend>
              {opcoes && Object.entries(opcoes.x_categorias).map(([categoria, { vars }]) => (
                <div key={categoria} className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#a7b6cc]">{categoria}</p>
                  <div className="mt-2 flex flex-col gap-2 text-xs text-[#536987]">
                    {vars.map((label) => (
                      <label key={label} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={xSel.includes(label)}
                          onChange={() => toggleX(label)}
                          className="size-3.5 accent-[#7c3aed]"
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
                <legend className="text-xs font-semibold text-[#536987]">Testar interações?</legend>
                <p className="mt-1 text-[10px] text-[#8aa0c1]">Só entre variáveis já marcadas em X</p>
                <div className="mt-2 flex flex-col gap-2 text-xs text-[#536987]">
                  {paresDisponiveis.map((par) => {
                    const marcado = interacoesSel.some(([a, b]) => a === par[0] && b === par[1])
                    return (
                      <label key={`${par[0]}__${par[1]}`} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() => toggleInteracao(par)}
                          className="size-3.5 accent-[#7c3aed]"
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c3aed] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="size-3.5" /> {loading ? 'Calculando...' : 'Executar hipótese'}
            </button>
          </aside>

          <section className="min-w-0">
            {erro && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Não foi possível calcular a hipótese.</p>
                  <p className="mt-1 text-xs">{erro}</p>
                </div>
              </div>
            )}

            {!resultado && !erro && (
              <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-[#dbe6f7] text-sm text-[#8aa0c1]">
                Escolha as variáveis e clique em &ldquo;Executar hipótese&rdquo; para ver os resultados.
              </div>
            )}

            {resultado && (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="rounded-xl border border-[#dfe5ee] bg-white px-4 py-2 font-mono text-xs text-[#536987]">
                    {resultado.formula}
                  </p>
                  <button
                    onClick={baixarRelatorio}
                    disabled={gerandoPdf}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-[#dfe5ee] bg-white px-3.5 py-2 text-xs font-semibold text-[#536987] transition hover:border-[#7c3aed] hover:text-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="size-3.5" /> {gerandoPdf ? 'Gerando PDF...' : 'Baixar relatório PDF'}
                  </button>
                </div>
                {pdfErro && (
                  <p className="mb-4 text-xs text-[#b91c1c]">Falha ao gerar o PDF: {pdfErro}</p>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
                    <p className="text-[11px] text-[#8aa0c1]">R² — Poder explicativo</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{(resultado.model_metrics.r2 * 100).toFixed(1)}%</p>
                    <p className="mt-1 text-[10px] text-[#8aa0c1]">R² ajustado: {resultado.model_metrics.r2_adj.toFixed(4)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
                    <p className="text-[11px] text-[#8aa0c1]">Cursos analisados</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{resultado.model_metrics.n_obs.toLocaleString('pt-BR')}</p>
                    <p className="mt-1 text-[10px] text-[#8aa0c1]">Base agregada por curso (WLS)</p>
                  </div>
                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm">
                    <p className="text-[11px] text-[#8aa0c1]">Significância global (F)</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{formatP(resultado.model_metrics.f_pvalue)}</p>
                    <p className="mt-1 text-[10px] text-[#8aa0c1]">F = {resultado.model_metrics.f_stat.toFixed(2)}</p>
                  </div>
                </div>

                {resultado.model_metrics.n_obs < resultado.reprodutibilidade.n_cursos_base && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs text-[#b45309]">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    O modelo usou {resultado.model_metrics.n_obs.toLocaleString('pt-BR')} dos{' '}
                    {resultado.reprodutibilidade.n_cursos_base.toLocaleString('pt-BR')} cursos da base: os demais
                    têm valor ausente em alguma variável da hipótese.
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold">Efeito de cada fator</h3>
                  {Object.keys(resultado.medias_centragem).length > 0 && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#dbe6f7] bg-[#f6f9ff] px-3 py-2.5 text-[11px] leading-5 text-[#2d4263]">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-[#2962a8]" />
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
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[#8aa0c1]">
                          <th className="pb-2 pr-4 font-semibold">Fator</th>
                          <th className="pb-2 pr-4 font-semibold">β</th>
                          <th className="pb-2 pr-4 font-semibold">p-valor</th>
                          <th className="pb-2 pr-4 font-semibold" title={`Erro-padrão robusto a heterocedasticidade (${resultado.cov_type})`}>
                            EP robusto ({resultado.cov_type})
                          </th>
                          <th className="pb-2 pr-4 font-semibold" title={`p-valor com erro-padrão ${resultado.cov_type}`}>
                            p robusto ({resultado.cov_type})
                          </th>
                          <th className="pb-2 pr-4 font-semibold">IC 95%</th>
                          <th className="pb-2 font-semibold">Confiável?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.coef_table.map((row) => (
                          <tr key={row.variavel} className="border-t border-[#edf1f6]">
                            <td className="py-2 pr-4 font-medium text-[#2d4263]">{labelFor(row.variavel)}</td>
                            <td className="py-2 pr-4">{formatCoef(row.coeficiente)}</td>
                            <td className="py-2 pr-4">{formatP(row.p_valor)}</td>
                            <td className="py-2 pr-4">{row.erro_padrao_robusto?.toFixed(3).replace('.', ',') ?? '—'}</td>
                            <td className="py-2 pr-4">{formatP(row.p_valor_robusto)}</td>
                            <td className="py-2 pr-4 text-[#8aa0c1]">[{row.ic_inf_95.toFixed(2)} ; {row.ic_sup_95.toFixed(2)}]</td>
                            <td className="py-2">
                              {row.p_valor < 0.05 ? (
                                <span className="inline-flex items-center gap-1 text-[#009b67]"><CheckCircle2 className="size-3.5" /> Sim</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[#8aa0c1]"><XCircle className="size-3.5" /> Não</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TextoInterpretacao texto={resultado.interpretacao_modelo} className="mt-4 text-xs leading-6 text-[#536987]" />
                </div>

                <div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    <Scale className="size-4 text-[#7c3aed]" /> Sensibilidade à ponderação
                  </h3>
                  <p className="mt-1 text-xs text-[#8aa0c1]">
                    O mesmo modelo como WLS (principal, peso = alunos presentes) e como OLS sem pesos, cada um com
                    erro-padrão clássico e robusto ({resultado.cov_type}). Linhas em amarelo mudam de sinal ou de
                    significância (p &lt; 0,05) conforme o ajuste.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[#8aa0c1]">
                          <th className="pb-2 pr-4 font-semibold">Fator</th>
                          <th className="pb-2 pr-4 font-semibold">β WLS</th>
                          <th className="pb-2 pr-4 font-semibold">p WLS</th>
                          <th className="pb-2 pr-4 font-semibold">p WLS {resultado.cov_type}</th>
                          <th className="pb-2 pr-4 font-semibold">β OLS</th>
                          <th className="pb-2 pr-4 font-semibold">p OLS</th>
                          <th className="pb-2 pr-4 font-semibold">p OLS {resultado.cov_type}</th>
                          <th className="pb-2 font-semibold">Diverge?</th>
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
                                className={`border-t border-[#edf1f6] ${diverge ? 'bg-[#fffbeb]' : ''}`}
                              >
                                <td className="py-2 pr-4 font-medium text-[#2d4263]">{labelFor(row.variavel)}</td>
                                <td className="py-2 pr-4">{formatCoef(row.coef_wls)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_wls)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_wls_robust)}</td>
                                <td className="py-2 pr-4">{formatCoef(row.coef_ols)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_ols)}</td>
                                <td className="py-2 pr-4">{formatP(row.p_ols_robust)}</td>
                                <td className="py-2">
                                  {diverge ? (
                                    <span className="inline-flex items-center gap-1 text-[#b45309]">
                                      <AlertTriangle className="size-3.5" />
                                      {[row.sinal_diverge && 'sinal', row.signif_diverge && 'significância']
                                        .filter(Boolean)
                                        .join(' e ')}
                                    </span>
                                  ) : (
                                    <span className="text-[#8aa0c1]">Não</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                  <TextoInterpretacao texto={resultado.interpretacao_sensibilidade} className="mt-4 text-xs leading-6 text-[#536987]" />

                  <div className="mt-4 rounded-xl border border-[#edf1f6] bg-[#f9fafc] p-4">
                    <p className="text-xs font-semibold text-[#2d4263]">Por que ponderar? Diagnóstico do OLS sem pesos</p>
                    <div className="mt-3 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#536987]">Breusch-Pagan (OLS sem pesos)</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[#8aa0c1]">p {formatP(resultado.diagnostics_ols.bp_pvalue)}</span>
                          {resultado.diagnostics_ols.bp_homocedastic ? (
                            <span className="inline-flex items-center gap-1 text-[#009b67]"><CheckCircle2 className="size-3.5" /> Homocedástico</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#b45309]"><AlertTriangle className="size-3.5" /> Heterocedástico</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#536987]">Spearman |resíduo| × alunos presentes</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[#8aa0c1]">
                            ρ = {resultado.diagnostics_ols.spearman_rho.toFixed(3).replace('.', ',')} · p{' '}
                            {formatP(resultado.diagnostics_ols.spearman_pvalue)}
                          </span>
                          {resultado.diagnostics_ols.erro_cai_com_tamanho ? (
                            <span className="inline-flex items-center gap-1 text-[#b45309]"><AlertTriangle className="size-3.5" /> Cursos pequenos erram mais</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#009b67]"><CheckCircle2 className="size-3.5" /> Sem relação</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <TextoInterpretacao texto={resultado.interpretacao_ponderacao} className="mt-3 text-xs leading-6 text-[#536987]" />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold">Multicolinearidade (VIF)</h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {resultado.vif_table.map((row) => {
                        const badge = vifBadgeStyle(row.alerta)
                        return (
                          <div key={row.variavel} className="flex items-center justify-between text-xs">
                            <span className="text-[#536987]">{labelFor(row.variavel)}</span>
                            <span className="flex items-center gap-2">
                              <strong>{row.vif.toFixed(2)}</strong>
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ backgroundColor: badge.bg, color: badge.fg }}
                              >
                                {badge.label}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <TextoInterpretacao texto={resultado.interpretacao_vif} className="mt-4 text-xs leading-6 text-[#536987]" />
                    {resultado.vif_table.some((row) => row.alerta !== 'ok') && xSel.length > 1 && (
                      <button
                        onClick={removerVariavelProblematica}
                        disabled={loading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] py-2.5 text-xs font-semibold text-[#b45309] transition hover:bg-[#fef3c7] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Wand2 className="size-3.5" /> Remover variável de maior VIF e reexecutar
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold">Diagnóstico de resíduos</h3>
                    <div className="mt-3 flex flex-col gap-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#536987]">Normalidade (Shapiro-Wilk)</span>
                        {resultado.residuals_diag.shapiro_normal ? (
                          <span className="inline-flex items-center gap-1 text-[#009b67]"><CheckCircle2 className="size-3.5" /> Normal</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#b45309]"><AlertTriangle className="size-3.5" /> Não normal</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#536987]">Homocedasticidade (Breusch-Pagan)</span>
                        {resultado.residuals_diag.bp_homocedastic ? (
                          <span className="inline-flex items-center gap-1 text-[#009b67]"><CheckCircle2 className="size-3.5" /> Homocedástico</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#b45309]"><AlertTriangle className="size-3.5" /> Heterocedástico</span>
                        )}
                      </div>
                    </div>
                    <TextoInterpretacao texto={resultado.interpretacao_residuos} className="mt-4 text-xs leading-6 text-[#536987]" />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold">Resíduos vs. valores ajustados</h3>
                    <p className="mt-1 text-xs text-[#8aa0c1]">Sem padrão visível = homocedasticidade</p>
                    <ScatterChart width={380} height={220} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} className="mx-auto mt-2">
                      <CartesianGrid stroke="#edf1f6" />
                      <XAxis type="number" dataKey="fitted" name="Ajustado" tick={{ fontSize: 10, fill: '#8aa0c1' }} />
                      <YAxis type="number" dataKey="residual" name="Resíduo" tick={{ fontSize: 10, fill: '#8aa0c1' }} />
                      <ReferenceLine y={0} stroke="#cbd5e1" />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#dfe5ee' }}
                        formatter={formatTooltipValue}
                      />
                      <Scatter data={resultado.residuals_plot} fill="#7c3aed" fillOpacity={0.6} />
                    </ScatterChart>
                  </div>

                  <div className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold">QQ-plot (normalidade)</h3>
                    <p className="mt-1 text-xs text-[#8aa0c1]">Pontos sobre a reta = resíduos normais</p>
                    <ComposedChart width={380} height={220} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} className="mx-auto mt-2">
                      <CartesianGrid stroke="#edf1f6" />
                      <XAxis type="number" dataKey="theoretical" name="Quantil teórico" tick={{ fontSize: 10, fill: '#8aa0c1' }} />
                      <YAxis type="number" dataKey="sample" name="Quantil amostral" tick={{ fontSize: 10, fill: '#8aa0c1' }} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#dfe5ee' }}
                        formatter={formatTooltipValue}
                      />
                      <Line data={resultado.qqplot} dataKey="line_y" stroke="#cbd5e1" dot={false} strokeWidth={1.5} />
                      <Scatter data={resultado.qqplot} dataKey="sample" fill="#7c3aed" fillOpacity={0.6} />
                    </ComposedChart>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#e4d4fe] bg-[#f5f0ff] p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#5b21b6]">
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
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#5b21b6' }} />
                    <YAxis
                      type="category"
                      dataKey="variavel"
                      tickFormatter={(code: string) => labelFor(code)}
                      width={160}
                      tick={{ fontSize: 10, fill: '#5b21b6' }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: '#e4d4fe' }}
                      formatter={formatTooltipValue}
                      labelFormatter={(label) => labelFor(String(label ?? ''))}
                    />
                    <Bar dataKey="shap_mean_abs" radius={[0, 4, 4, 0]}>
                      {resultado.shap_summary.map((row) => (
                        <Cell key={row.variavel} fill="#7c3aed" />
                      ))}
                    </Bar>
                  </BarChart>
                  <TextoInterpretacao texto={resultado.interpretacao_shap} className="mt-3 text-xs leading-6 text-[#5b21b6]" />
                  <p className="mt-2 text-[10px] text-[#7c5fc2]">
                    Linha de base: média dos cursos ponderada pelo nº de alunos presentes (mesmo peso do WLS).
                  </p>
                </div>

                <details className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 text-xs shadow-sm">
                  <summary className="cursor-pointer text-sm font-bold">Reprodutibilidade desta execução</summary>
                  <dl className="mt-3 grid grid-cols-[180px_minmax(0,1fr)] gap-x-4 gap-y-2 text-[#536987]">
                    <dt className="font-semibold text-[#2d4263]">Base (SHA-256)</dt>
                    <dd className="break-all font-mono text-[11px]">{resultado.reprodutibilidade.hash_base_sha256}</dd>
                    <dt className="font-semibold text-[#2d4263]">Funil de cursos</dt>
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
                    <dt className="font-semibold text-[#2d4263]">Filtros</dt>
                    <dd>
                      grupos = {JSON.stringify(resultado.reprodutibilidade.filtros.grupos)} · IES ={' '}
                      {JSON.stringify(resultado.reprodutibilidade.filtros.ies_filter)} · mínimo de presentes ={' '}
                      {resultado.reprodutibilidade.filtros.min_alunos ?? 'sem corte'}
                    </dd>
                    <dt className="font-semibold text-[#2d4263]">Erro-padrão robusto</dt>
                    <dd>{resultado.reprodutibilidade.cov_type}</dd>
                    <dt className="font-semibold text-[#2d4263]">Aleatoriedade</dt>
                    <dd>{resultado.reprodutibilidade.aleatoriedade}</dd>
                    <dt className="font-semibold text-[#2d4263]">Versões</dt>
                    <dd>
                      {Object.entries(resultado.reprodutibilidade.versoes)
                        .map(([lib, v]) => `${lib} ${v}`)
                        .join(' · ')}
                    </dd>
                    <dt className="font-semibold text-[#2d4263]">Fonte</dt>
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
