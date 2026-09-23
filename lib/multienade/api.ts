const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ---------- Tipos (espelham as colunas reais das tabelas no Supabase) ----------

export interface RegressaoRow {
  CO_CURSO: number
  NT_GER: number
  QT_ALUNOS: number
  QE_I63: number
  QE_I57: number
  QE_I15_A: number
  QE_I15_B: number
  QE_I15_C: number
  QE_I15_D: number
  QE_I15_E: number
  QE_I15_F: number
  QE_I23_ordinal: number
  NT_GER_PREVISTA: number
}

export interface ClusterRow {
  CO_CURSO: number
  NT_GER: number
  QE_I63_1: number
  QE_I63_2: number
  QE_I63_3: number
  QE_I63_4: number
  QE_I63_5: number
  QE_I63_6: number
  QE_I63_7: number
  QE_I63_8: number
  QE_I15_A: number
  QE_I15_B: number
  QE_I15_C: number
  QE_I15_D: number
  QE_I15_E: number
  QE_I15_F: number
  Cluster_ID: number
  PCA_X: number
  PCA_Y: number
}

export interface AssociacaoRow {
  antecedents: string
  consequents: string
  support: number
  confidence: number
  lift: number
}

interface ApiError {
  erro: string
}

function isApiError(data: unknown): data is ApiError {
  return typeof data === 'object' && data !== null && 'erro' in data
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)

  if (!res.ok) {
    throw new Error(`Falha na requisição (${res.status}) para ${path}`)
  }

  const data = await res.json()

  if (isApiError(data)) {
    // O backend retorna 200 com { erro: "..." } em vez de status HTTP de erro,
    // então precisamos checar esse formato explicitamente.
    throw new Error(data.erro)
  }

  return data as T
}

export function getRelatorioRegressao() {
  return fetchJson<RegressaoRow[]>('/api/multienade/relatorio-regressao')
}

export function getRelatorioCluster() {
  return fetchJson<ClusterRow[]>('/api/multienade/relatorio-cluster')
}

export function getRelatorioAssociacao() {
  return fetchJson<AssociacaoRow[]>('/api/multienade/relatorio-associacao')
}

export interface ShapRow {
  feature: string
  importancia_media: number
}

// Endpoint novo — só existe depois que o backend rodar a persistência de SHAP
// (ver instruções da conversa). Falha graciosamente se a tabela ainda não existir.
export function getRelatorioShap() {
  return fetchJson<ShapRow[]>('/api/multienade/relatorio-shap')
}

// Nomes legíveis para as colunas técnicas do modelo, na mesma ordem de importância do SHAP.
export const LABELS_FEATURE: Record<string, string> = {
  QE_I23_ordinal: 'Dedicação aos estudos (QE_I23)',
  QE_I15_A: 'Não cotista (QE_I15_A)',
  QE_I15_B: 'Cota étnico-racial (QE_I15_B)',
  QE_I15_C: 'Cota por renda (QE_I15_C)',
  QE_I15_D: 'Cota escola pública/bolsa (QE_I15_D)',
  QE_I15_E: 'Cota combinada (QE_I15_E)',
  QE_I15_F: 'Outro sistema de cotas (QE_I15_F)',
  QE_I57: 'Domínio docente (QE_I57)',
  QE_I63: 'Infraestrutura prática (QE_I63)',
}

// ---------- Métricas de regressão calculadas no cliente ----------
// Não existem colunas de R²/MAE/RMSE nas tabelas; calculamos a partir
// de NT_GER (real) vs NT_GER_PREVISTA (previsto pelo modelo).

export interface MetricasRegressao {
  r2: number
  mae: number
  rmse: number
  n: number
}

export function calcularMetricasRegressao(dados: RegressaoRow[]): MetricasRegressao {
  const n = dados.length
  if (n === 0) return { r2: 0, mae: 0, rmse: 0, n: 0 }

  const media = dados.reduce((soma, d) => soma + d.NT_GER, 0) / n

  let somaErroAbs = 0
  let somaErroQuad = 0
  let somaTotalQuad = 0

  for (const d of dados) {
    const erro = d.NT_GER - d.NT_GER_PREVISTA
    somaErroAbs += Math.abs(erro)
    somaErroQuad += erro ** 2
    somaTotalQuad += (d.NT_GER - media) ** 2
  }

  const mae = somaErroAbs / n
  const rmse = Math.sqrt(somaErroQuad / n)
  const r2 = somaTotalQuad === 0 ? 0 : 1 - somaErroQuad / somaTotalQuad

  return { r2, mae, rmse, n }
}