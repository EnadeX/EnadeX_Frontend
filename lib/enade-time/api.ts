// Cliente HTTP para a API do ENADE-Time (FastAPI, enade_time/enade_time_rotas.py,
// branch enade-time/migracao do repositório EnadeX). Em dev o backend roda standalone
// na porta 8002; com o router no api_main central, defina
// NEXT_PUBLIC_ENADE_TIME_API_URL=http://localhost:8000 (a variável é embutida no build:
// mudar o valor exige novo build). O ENADE-Time só usa GET.

import type {
  Ano,
  BenchmarkComparativo,
  BenchmarkEtapa,
  BenchmarkExecucao,
  BenchmarkMetrica,
  CargaResposta,
  CategoriaAdm,
  FiltrosAnalise,
  Grupo,
  HealthStatus,
  Modalidade,
  OrganizacaoAcademica,
  PaginatedResponse,
  Regiao,
  Registro,
  ResumoAnual,
  ResumoIES,
  ResumoRegiao,
  ResumoUF,
  UF,
} from '@/lib/enade-time/types'

const API_BASE = (
  process.env.NEXT_PUBLIC_ENADE_TIME_API_URL?.trim() || 'http://localhost:8002'
).replace(/\/+$/, '')

const BASE_PATH = '/api/enade-time'

const TIMEOUT_MS = 15_000

export class EnadeTimeApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'EnadeTimeApiError'
    this.status = status
  }
}

function mensagemOffline(): string {
  const comando = API_BASE.endsWith(':8002')
    ? ' Suba o backend (branch enade-time/migracao do EnadeX): PYTHONPATH=. python enade_time/enade_time_rotas.py'
    : ''
  return `API do ENADE-Time indisponível em ${API_BASE}.${comando}`
}

// FastAPI devolve {"detail": "mensagem"} para erros de negócio, {"detail": [{"msg": ...}]}
// para validação (422) e {"detail": {"status": "degraded", ...}} no /health sem banco.
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    const detail = body?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((item: { msg?: string }) => item.msg ?? JSON.stringify(item)).join('; ')
    }
    if (detail?.database === 'unreachable') return 'Banco do ENADE-Time indisponível'
  } catch {
    // resposta não era JSON — cai no fallback abaixo
  }
  return `Erro ${response.status} ao consultar a API do ENADE-Time.`
}

function montarQuery(params?: object): string {
  if (!params) return ''
  const query = new URLSearchParams()
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== '') query.set(chave, String(valor))
  }
  const texto = query.toString()
  return texto ? `?${texto}` : ''
}

// Combina o cancelamento do TanStack Query com o timeout; navegadores sem
// AbortSignal.any ficam só com o timeout.
function sinalComTimeout(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  if (!signal) return timeout
  return typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : timeout
}

async function request<T>(path: string, params?: object, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    // GET sem Content-Type: evita o preflight de CORS.
    response = await fetch(`${API_BASE}${BASE_PATH}${path}${montarQuery(params)}`, {
      signal: sinalComTimeout(signal),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new EnadeTimeApiError(
        0,
        `A API do ENADE-Time não respondeu em ${TIMEOUT_MS / 1000} s (${API_BASE}).`,
      )
    }
    throw new EnadeTimeApiError(0, mensagemOffline())
  }
  if (!response.ok) {
    throw new EnadeTimeApiError(response.status, await extractErrorMessage(response))
  }
  return response.json() as Promise<T>
}

// ── GET /health ──────────────────────────────────────────────────────────────

export function fetchHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return request<HealthStatus>('/health', undefined, signal)
}

// ── GET /dim/* ───────────────────────────────────────────────────────────────

export function fetchRegioes(signal?: AbortSignal): Promise<Regiao[]> {
  return request<Regiao[]>('/dim/regioes', undefined, signal)
}

export function fetchUFs(co_regiao?: number, signal?: AbortSignal): Promise<UF[]> {
  return request<UF[]>('/dim/ufs', { co_regiao }, signal)
}

export function fetchAnos(signal?: AbortSignal): Promise<Ano[]> {
  return request<Ano[]>('/dim/anos', undefined, signal)
}

export function fetchGrupos(signal?: AbortSignal): Promise<Grupo[]> {
  return request<Grupo[]>('/dim/grupos', undefined, signal)
}

export function fetchModalidades(signal?: AbortSignal): Promise<Modalidade[]> {
  return request<Modalidade[]>('/dim/modalidades', undefined, signal)
}

export function fetchCategoriasAdm(signal?: AbortSignal): Promise<CategoriaAdm[]> {
  return request<CategoriaAdm[]>('/dim/categorias-adm', undefined, signal)
}

export function fetchOrganizacoesAcademicas(signal?: AbortSignal): Promise<OrganizacaoAcademica[]> {
  return request<OrganizacaoAcademica[]>('/dim/organizacoes-academicas', undefined, signal)
}

// ── GET /analises/* ──────────────────────────────────────────────────────────

export function fetchResumoAnual(
  filtros: FiltrosAnalise,
  signal?: AbortSignal,
): Promise<ResumoAnual[]> {
  return request<ResumoAnual[]>('/analises/resumo-anual', filtros, signal)
}

export function fetchResumoRegiao(
  filtros: FiltrosAnalise,
  signal?: AbortSignal,
): Promise<ResumoRegiao[]> {
  return request<ResumoRegiao[]>('/analises/resumo-regiao', filtros, signal)
}

export function fetchResumoUF(filtros: FiltrosAnalise, signal?: AbortSignal): Promise<ResumoUF[]> {
  return request<ResumoUF[]>('/analises/resumo-uf', filtros, signal)
}

export function fetchResumoIES(
  filtros: FiltrosAnalise,
  limit: number = 20,
  minCursos: number = 1,
  signal?: AbortSignal,
): Promise<ResumoIES[]> {
  return request<ResumoIES[]>(
    '/analises/resumo-ies',
    { ...filtros, limit, min_cursos: minCursos },
    signal,
  )
}

export function fetchRegistros(
  filtros: FiltrosAnalise,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Registro>> {
  return request<PaginatedResponse<Registro>>(
    '/analises/registros',
    { ...filtros, page, page_size: pageSize },
    signal,
  )
}

// ── GET /benchmark/* ─────────────────────────────────────────────────────────

export function fetchExecucoes(
  apenasValidas: boolean = true,
  signal?: AbortSignal,
): Promise<BenchmarkExecucao[]> {
  return request<BenchmarkExecucao[]>(
    '/benchmark/execucoes',
    { apenas_validas: apenasValidas },
    signal,
  )
}

export function fetchExecucao(
  id: number,
  apenasValidas: boolean = true,
  signal?: AbortSignal,
): Promise<BenchmarkExecucao> {
  return request<BenchmarkExecucao>(
    `/benchmark/execucoes/${id}`,
    { apenas_validas: apenasValidas },
    signal,
  )
}

export function fetchEtapas(
  execucaoId: number,
  apenasValidas: boolean = true,
  signal?: AbortSignal,
): Promise<BenchmarkEtapa[]> {
  return request<BenchmarkEtapa[]>(
    `/benchmark/etapas/${execucaoId}`,
    { apenas_validas: apenasValidas },
    signal,
  )
}

export function fetchMetricas(
  apenasValidas: boolean = true,
  signal?: AbortSignal,
): Promise<BenchmarkMetrica[]> {
  return request<BenchmarkMetrica[]>(
    '/benchmark/metricas',
    { apenas_validas: apenasValidas },
    signal,
  )
}

export function fetchComparativo(
  apenasValidas: boolean = true,
  signal?: AbortSignal,
): Promise<BenchmarkComparativo> {
  return request<BenchmarkComparativo>(
    '/benchmark/comparativo',
    { apenas_validas: apenasValidas },
    signal,
  )
}

export function fetchCarga(signal?: AbortSignal): Promise<CargaResposta> {
  return request<CargaResposta>('/benchmark/carga', undefined, signal)
}
