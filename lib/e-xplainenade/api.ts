// Cliente HTTP para a API do E-XplainENADE (FastAPI, modules/e_xplainenade_rotas.py).
// URL base configurável via NEXT_PUBLIC_EXPLAIN_API_URL — em dev, o backend roda
// standalone na porta 8003 (python e_xplainenade_rotas.py).

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${BASE_PATH}${path}`, {
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

export interface DatasetResumoResponse {
  n_cursos: number
  n_estudantes_representados: number | null
  media_nota_geral: number | null
  desvio_padrao_nota_geral: number | null
}

export interface DatasetResumoParams {
  grupos?: number[] | null
  ies?: number[] | null
}

export function getDatasetResumo(params?: DatasetResumoParams): Promise<DatasetResumoResponse> {
  const search = new URLSearchParams()
  params?.grupos?.forEach((g) => search.append('grupos', String(g)))
  params?.ies?.forEach((i) => search.append('ies', String(i)))
  const query = search.toString()
  return request<DatasetResumoResponse>(`/dataset/resumo${query ? `?${query}` : ''}`)
}

// ── POST /hipotese ───────────────────────────────────────────────────────────

export interface HipoteseRequest {
  y: string
  x_vars: string[]
  interactions?: [string, string][]
  grupos?: number[] | null
  ies_filter?: number[] | null
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
  vif_table: VifRow[]
  residuals_diag: ResidualsDiag
  shap_summary: ShapRow[]
  residuals_plot: ResidualPoint[]
  qqplot: QqPoint[]
  interpretacao_modelo: string
  interpretacao_vif: string
  interpretacao_residuos: string
  interpretacao_shap: string
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
  const response = await fetch(`${API_BASE}${BASE_PATH}/relatorio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new ExplainApiError(response.status, await extractErrorMessage(response))
  }
  const disposition = response.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="?([^";]+)"?/)
  const filename = match?.[1] ?? 'relatorio_e-xplainenade.pdf'
  return { blob: await response.blob(), filename }
}
