// Cliente HTTP para a API do E-XplainENADE (FastAPI, e_xplainenade/e_xplainenade_rotas.py).
// URL base configurável via NEXT_PUBLIC_EXPLAIN_API_URL. O padrão (8003) é o backend rodando
// sozinho (`python e_xplainenade_rotas.py`, dentro de e_xplainenade/). Com a API central do
// grupo (`api_main.py`, porta 8000), defina NEXT_PUBLIC_EXPLAIN_API_URL=http://localhost:8000.

const API_BASE =
  process.env.NEXT_PUBLIC_EXPLAIN_API_URL ?? 'http://localhost:8003'

const BASE_PATH = '/api/e-xplainenade'

export class ExplainApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ExplainApiError'
    this.status = status
  }
}

// FastAPI devolve {"detail": "mensagem"} para erros de negócio (400/503) e
// {"detail": [{"msg": "...", ...}, ...]} para erros de validação do Pydantic (422).
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body?.detail === 'string') return body.detail
    if (Array.isArray(body?.detail)) {
      return body.detail.map((item: { msg?: string }) => item.msg ?? JSON.stringify(item)).join('; ')
    }
  } catch {
    // resposta não era JSON — cai no fallback abaixo
  }
  return `Erro ${response.status} ao consultar a API do E-XplainENADE.`
}

// Tempos-limite: a primeira chamada depois de o backend subir carrega as 13 tabelas do Supabase
// (~10-15 s); o PDF refaz todo o cálculo. Sem limite, uma API travada deixava o botão em
// "Calculando..." para sempre.
const TIMEOUT_MS = 120_000
const TIMEOUT_PDF_MS = 180_000

// `fetch` com tempo-limite e cancelamento externo (`signal`). Erros de rede e de tempo viram
// ExplainApiError com status 0 e mensagem em português; um cancelamento pedido pelo próprio
// chamador (AbortError) é repassado como está, para ele poder ignorá-lo.
async function fetchApi(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = TIMEOUT_MS, signal: externo, ...resto } = init
  const controller = new AbortController()
  let estourou = false
  const timer = setTimeout(() => {
    estourou = true
    controller.abort()
  }, timeoutMs)
  const aoCancelar = () => controller.abort()
  if (externo) {
    if (externo.aborted) controller.abort()
    else externo.addEventListener('abort', aoCancelar, { once: true })
  }
  try {
    return await fetch(`${API_BASE}${BASE_PATH}${path}`, { ...resto, signal: controller.signal })
  } catch (e) {
    if (estourou) {
      throw new ExplainApiError(0, `A API demorou mais de ${Math.round(timeoutMs / 1000)} s para responder. Tente novamente.`)
    }
    if (e instanceof DOMException && e.name === 'AbortError') throw e // cancelado pelo chamador
    throw new ExplainApiError(0, `Não foi possível conectar à API do E-XplainENADE (${API_BASE}). Confira se o backend está rodando.`)
  } finally {
    clearTimeout(timer)
    externo?.removeEventListener('abort', aoCancelar)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchApi(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!response.ok) {
    throw new ExplainApiError(response.status, await extractErrorMessage(response))
  }
  return response.json() as Promise<T>
}

// ── GET /opcoes ──────────────────────────────────────────────────────────────

export interface XCategoria {
  pill: string
  vars: string[]
}

export interface OpcoesResponse {
  y: Record<string, string>
  x: Record<string, string>
  x_categorias: Record<string, XCategoria>
  curso: Record<string, number[] | null>
  ies: Record<string, number[] | null>
}

export function getOpcoes(): Promise<OpcoesResponse> {
  return request<OpcoesResponse>('/opcoes')
}

// ── GET /dataset/resumo ──────────────────────────────────────────────────────

// Funil de cursos do ETL (modules/etl.py + loader.py): quantos cursos restam a
// cada etapa. As chaves cursos_apos_* só aparecem quando o filtro foi aplicado.
export interface FunilCursos {
  cursos_recorte?: number
  cursos_com_nota?: number
  cursos_excluidos_categad?: number
  motivo_exclusao_categad?: string
  cursos_final?: number
  cursos_apos_ies?: number
  cursos_apos_min_alunos?: number
  cursos_disponiveis?: number
}

export interface DatasetResumoResponse {
  n_cursos: number
  // Cursos retirados da base por CO_CATEGAD = 7 ("Especial", sem classificação
  // pública/privada no dicionário do INEP) e o motivo.
  n_cursos_excluidos: number
  motivo_exclusao: string | null
  funil_cursos: FunilCursos
  n_estudantes_representados: number | null
  media_nota_geral: number | null
  desvio_padrao_nota_geral: number | null
}

export interface DatasetResumoParams {
  grupos?: number[] | null
  ies?: number[] | null
  min_alunos?: number | null
}

export function getDatasetResumo(
  params?: DatasetResumoParams,
  signal?: AbortSignal,
): Promise<DatasetResumoResponse> {
  const search = new URLSearchParams()
  params?.grupos?.forEach((g) => search.append('grupos', String(g)))
  params?.ies?.forEach((i) => search.append('ies', String(i)))
  if (params?.min_alunos) search.append('min_alunos', String(params.min_alunos))
  const query = search.toString()
  return request<DatasetResumoResponse>(`/dataset/resumo${query ? `?${query}` : ''}`, { signal })
}

// ── POST /hipotese ───────────────────────────────────────────────────────────

export interface HipoteseRequest {
  y: string
  x_vars: string[]
  interactions?: [string, string][]
  grupos?: number[] | null
  ies_filter?: number[] | null
  // Corte opcional: só cursos com pelo menos N alunos presentes (QT_ALUNOS).
  min_alunos?: number | null
}

export interface ModelMetrics {
  r2: number
  r2_adj: number
  aic: number
  bic: number
  n_obs: number
  f_stat: number
  f_pvalue: number
}

export interface CoefRow {
  variavel: string
  coeficiente: number
  erro_padrao: number
  t_stat: number
  p_valor: number
  ic_inf_95: number
  ic_sup_95: number
  // Mesmo WLS com erros-padrão robustos (tipo em HipoteseResponse.cov_type).
  erro_padrao_robusto: number
  p_valor_robusto: number
}

// Uma linha por termo: o mesmo modelo ajustado como WLS e como OLS sem pesos,
// cada um com erro-padrão clássico e robusto.
export interface ComparisonRow {
  variavel: string
  coef_wls: number
  ep_wls: number
  p_wls: number
  coef_wls_robust: number
  ep_wls_robust: number
  p_wls_robust: number
  coef_ols: number
  ep_ols: number
  p_ols: number
  coef_ols_robust: number
  ep_ols_robust: number
  p_ols_robust: number
  sinal_diverge: boolean
  signif_diverge: boolean
}

// Diagnóstico do OLS sem pesos — o que justifica (ou não) ponderar por QT_ALUNOS.
export interface DiagnosticsOls {
  bp_stat: number
  bp_pvalue: number
  bp_homocedastic: boolean
  spearman_rho: number
  spearman_pvalue: number
  erro_cai_com_tamanho: boolean
}

export interface Reprodutibilidade {
  fonte_dados: string
  filtros: { grupos: number[] | null; ies_filter: number[] | null; min_alunos: number | null }
  funil_cursos: FunilCursos
  n_cursos_base: number
  n_obs_modelo: number
  hash_base_sha256: string
  cov_type: string
  medias_centragem: Record<string, number>
  aleatoriedade: string
  versoes: Record<string, string>
}

export interface VifRow {
  variavel: string
  vif: number
  alerta: 'ok' | 'moderado (VIF > 5)' | 'severo (VIF > 10)'
}

export interface ResidualsDiag {
  shapiro_stat: number
  shapiro_pvalue: number
  shapiro_normal: boolean
  shapiro_confiavel: boolean
  shapiro_n_usado: number
  bp_stat: number
  bp_pvalue: number
  bp_homocedastic: boolean
}

export interface ShapRow {
  variavel: string
  shap_mean_abs: number
}

export interface ResidualPoint {
  fitted: number
  residual: number
  residual_std: number
}

export interface QqPoint {
  theoretical: number
  sample: number
  line_y: number
}

export interface HipoteseResponse {
  formula: string
  y_label: string
  model_metrics: ModelMetrics
  coef_table: CoefRow[]
  comparison_table: ComparisonRow[]
  cov_type: string
  vif_table: VifRow[]
  residuals_diag: ResidualsDiag
  diagnostics_ols: DiagnosticsOls
  shap_summary: ShapRow[]
  residuals_plot: ResidualPoint[]
  qqplot: QqPoint[]
  // Médias usadas para centrar as variáveis das interações ({} sem interação).
  medias_centragem: Record<string, number>
  reprodutibilidade: Reprodutibilidade
  interpretacao_modelo: string
  interpretacao_vif: string
  interpretacao_residuos: string
  interpretacao_shap: string
  interpretacao_sensibilidade: string
  interpretacao_ponderacao: string
  // Avisos que NÃO bloqueiam o resultado: repetições removidas da hipótese e amostra pequena pela
  // regra de Green (1991). Lista vazia = nada a avisar.
  avisos: string[]
}

export function postHipotese(body: HipoteseRequest): Promise<HipoteseResponse> {
  return request<HipoteseResponse>('/hipotese', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ── POST /relatorio ──────────────────────────────────────────────────────────
// Devolve um PDF (não JSON) — request<T>() não serve aqui, então essa função
// trata a resposta HTTP diretamente, mas reaproveita a mesma extração de erro.

export interface RelatorioResult {
  blob: Blob
  filename: string
}

export async function postRelatorio(body: HipoteseRequest): Promise<RelatorioResult> {
  const response = await fetchApi('/relatorio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeoutMs: TIMEOUT_PDF_MS,
  })
  if (!response.ok) {
    throw new ExplainApiError(response.status, await extractErrorMessage(response))
  }
  const disposition = response.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="?([^";]+)"?/)
  const filename = match?.[1] ?? 'relatorio_e-xplainenade.pdf'
  return { blob: await response.blob(), filename }
}
