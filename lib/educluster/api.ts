import type {
  AlvoDesempenho,
  AmostraEstudantesResposta,
  AreasResposta,
  CalibracaoResposta,
  ClustersCursosResposta,
  ClustersEstudantesResposta,
  ComparacaoTradicionalResposta,
  CursoDetalhe,
  CursosResposta,
  Descricao,
  DimensoesDesempenhoResposta,
  DimensoesResposta,
  DiscrepantesResposta,
  DiscursivasResposta,
  Estabilidade,
  EstabilidadePorK,
  Health,
  Quadrante,
} from '@/lib/educluster/types'

export const API_BASE = (
  process.env.NEXT_PUBLIC_EDUCLUSTER_API_URL?.trim() || 'http://localhost:8001'
).replace(/\/+$/, '')

const BASE_PATH = '/api/educluster'

const TIMEOUT_PADRAO_MS = 180_000

const TIMEOUT_HEALTH_MS = 5_000

export class EduClusterApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'EduClusterApiError'
    this.status = status
  }
}

function mensagemOffline(): string {
  const comando = API_BASE.endsWith(':8001')
    ? ' Suba o backend na raiz do EnadeX: PYTHONPATH=. python3 -m educluster.educluster_endpoints'
    : ''
  return `API do EduCluster indisponível em ${API_BASE}.${comando}`
}

async function extrairMensagem(response: Response): Promise<string> {
  try {
    const corpo = await response.json()
    const detalhe = corpo?.detail
    if (typeof detalhe === 'string') return detalhe
    if (Array.isArray(detalhe)) {
      return detalhe.map((item: { msg?: string }) => item.msg ?? JSON.stringify(item)).join('; ')
    }
  } catch {
    return `Erro ${response.status} ao consultar a API do EduCluster.`
  }
  return `Erro ${response.status} ao consultar a API do EduCluster.`
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

function sinalComTimeout(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs)
  if (!signal) return timeout
  return typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : timeout
}

async function request<T>(
  path: string,
  params?: object,
  signal?: AbortSignal,
  timeoutMs: number = TIMEOUT_PADRAO_MS,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${BASE_PATH}${path}${montarQuery(params)}`, {
      signal: sinalComTimeout(timeoutMs, signal),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new EduClusterApiError(
        0,
        `A API do EduCluster não respondeu em ${Math.round(timeoutMs / 1000)} s (${API_BASE}).`,
      )
    }
    throw new EduClusterApiError(0, mensagemOffline())
  }
  if (!response.ok) {
    throw new EduClusterApiError(response.status, await extrairMensagem(response))
  }
  return response.json() as Promise<T>
}

export function fetchHealth(signal?: AbortSignal): Promise<Health> {
  return request<Health>('/health', undefined, signal, TIMEOUT_HEALTH_MS)
}

export function fetchCursos(
  params: { k?: number; area?: string; cluster?: number },
  signal?: AbortSignal,
): Promise<CursosResposta> {
  return request<CursosResposta>('/cursos', params, signal)
}

export function fetchClustersCursos(k?: number, signal?: AbortSignal): Promise<ClustersCursosResposta> {
  return request<ClustersCursosResposta>('/cursos/clusters', { k }, signal)
}

export function fetchEstabilidadePorK(
  rodadas: number,
  signal?: AbortSignal,
): Promise<EstabilidadePorK> {
  return request<EstabilidadePorK>('/cursos/clusters/estabilidade', { rodadas }, signal)
}

export function fetchEstabilidadeK(
  k: number,
  rodadas: number,
  signal?: AbortSignal,
): Promise<Estabilidade> {
  return request<Estabilidade>('/cursos/clusters/estabilidade', { k, rodadas }, signal)
}

export function fetchDescricaoCursos(
  k?: number,
  forcar?: boolean,
  signal?: AbortSignal,
): Promise<Descricao> {
  return request<Descricao>('/cursos/clusters/descricao', { k, forcar: forcar || undefined }, signal)
}

export function fetchDiscrepantes(
  params: { limiar: number; quadrante?: Quadrante; limite: number },
  signal?: AbortSignal,
): Promise<DiscrepantesResposta> {
  return request<DiscrepantesResposta>('/cursos/discrepantes', params, signal)
}

export function fetchDimensoesDesempenho(
  alvo: AlvoDesempenho,
  signal?: AbortSignal,
): Promise<DimensoesDesempenhoResposta> {
  return request<DimensoesDesempenhoResposta>('/cursos/dimensoes-desempenho', { alvo }, signal)
}

export function fetchComparacaoTradicional(
  tolerancia: number,
  signal?: AbortSignal,
): Promise<ComparacaoTradicionalResposta> {
  return request<ComparacaoTradicionalResposta>(
    '/cursos/comparacao-tradicional',
    { tolerancia },
    signal,
  )
}

export function fetchCurso(coCurso: number, signal?: AbortSignal): Promise<CursoDetalhe> {
  return request<CursoDetalhe>(`/cursos/${coCurso}`, undefined, signal)
}

export function fetchClustersEstudantes(signal?: AbortSignal): Promise<ClustersEstudantesResposta> {
  return request<ClustersEstudantesResposta>('/estudantes/clusters', undefined, signal)
}

export function fetchAmostraEstudantes(
  n: number,
  signal?: AbortSignal,
): Promise<AmostraEstudantesResposta> {
  return request<AmostraEstudantesResposta>('/estudantes/amostra', { n }, signal)
}

export function fetchDescricaoEstudantes(
  forcar?: boolean,
  signal?: AbortSignal,
): Promise<Descricao> {
  return request<Descricao>('/estudantes/clusters/descricao', { forcar: forcar || undefined }, signal)
}

export function fetchCalibracao(signal?: AbortSignal): Promise<CalibracaoResposta> {
  return request<CalibracaoResposta>('/estudantes/calibracao', undefined, signal)
}

export function fetchDiscursivas(signal?: AbortSignal): Promise<DiscursivasResposta> {
  return request<DiscursivasResposta>('/estudantes/discursivas', undefined, signal)
}

export function fetchAreas(signal?: AbortSignal): Promise<AreasResposta> {
  return request<AreasResposta>('/areas', undefined, signal)
}

export function fetchDimensoes(signal?: AbortSignal): Promise<DimensoesResposta> {
  return request<DimensoesResposta>('/dimensoes', undefined, signal)
}
