const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ---------- Tipos (espelham as colunas reais das tabelas no Supabase) ----------

// A tabela também traz colunas de modelagens anteriores (QE_I63, QE_I15_A, QE_I23_ordinal, QE_I08_media…),
// hoje sempre nulas — por isso não entram nos tipos e a tabela do Dataset esconde colunas sem nenhum valor.
export interface RegressaoRow {
  CO_CURSO: number
  NT_GER: number
  QT_ALUNOS: number
  NT_GER_PREVISTA: number
  // as 14 variáveis do modelo (ver EnadeX/multi_enade/EXPLORACAO_MODELO_REGRESSAO.md, seção 4)
  QE_I57: number
  QE_I15_C: number
  QE_I15_E: number
  QE_I04_media: number
  CO_TURNO_GRADUACAO_4: number
  QE_I13_A: number
  QE_I13_B: number
  QE_I13_D: number
  QE_I24_A: number
  QE_I12_A: number
  QE_I11_A: number
  QE_I19_B: number
  PCA_ECON_1: number
  PCA_ECON_2: number
}

type Proporcoes<P extends string, S extends string> = { [K in `${P}${S}`]: number | null }

export type ClusterRow = {
  CO_CURSO: number
  NT_GER: number
  Cluster_ID: number
  /** Nome pelo ranking de NT_GER médio do grupo (Desempenho Alto/Médio/Baixo), calculado pelo endpoint. */
  Cluster_Nome: string
  PCA_X: number
  PCA_Y: number
} & Proporcoes<'QE_I63_', '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'> &
  Proporcoes<'QE_I15_', 'A' | 'B' | 'C' | 'D' | 'E' | 'F'> &
  Proporcoes<'QE_I11_', 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'>

export interface AssociacaoRow {
  id: number
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

// Nomes legíveis para as variáveis do modelo, na ordem em que aparecem no SHAP.
export const LABELS_FEATURE: Record<string, string> = {
  PCA_ECON_1: 'Índice socioeconômico (PCA_ECON_1)',
  PCA_ECON_2: 'Índice socioeconômico, 2º eixo (PCA_ECON_2)',
  QE_I13_A: 'Sem bolsa acadêmica (QE_I13_A)',
  QE_I13_B: 'Bolsa de iniciação científica (QE_I13_B)',
  QE_I13_D: 'Bolsa de monitoria/tutoria (QE_I13_D)',
  QE_I24_A: 'Idioma estrangeiro na instituição, presencial (QE_I24_A)',
  QE_I04_media: 'Escolaridade do pai (QE_I04)',
  QE_I15_C: 'Cota por renda (QE_I15_C)',
  QE_I15_E: 'Cota por múltiplos critérios (QE_I15_E)',
  CO_TURNO_GRADUACAO_4: 'Curso noturno (CO_TURNO_GRADUACAO)',
  QE_I57: 'Domínio docente (QE_I57)',
  QE_I19_B: 'Incentivo dos pais (QE_I19_B)',
  QE_I11_A: 'Curso gratuito, sem financiamento (QE_I11_A)',
  QE_I12_A: 'Sem auxílio permanência (QE_I12_A)',
}

// ---------- Métricas de regressão calculadas no cliente ----------
// Não existem colunas de R²/MAE/RMSE nas tabelas; calculamos a partir
// de NT_GER (real) vs NT_GER_PREVISTA (previsto pelo modelo). O modelo publicado foi reajustado com 100% dos
// cursos, então estas métricas incluem o treino e são otimistas; a avaliação honesta (teste 80/20) fica no
// backend (EXPLORACAO_MODELO_REGRESSAO.md, seção 4).

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