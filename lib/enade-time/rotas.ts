// Caminhos do módulo ENADE-Time no frontend do EnadeX. Centralizados aqui para o
// prefixo /enade-time não ficar espalhado em strings (links, abas e checagens de pathname).

const BASE = '/enade-time'

export const ROTAS = {
  homeEnadex: '/',
  inicio: BASE,
  sobre: `${BASE}/sobre`,
  enade: `${BASE}/enade`,
  enadeAnual: `${BASE}/enade/anual`,
  enadeRegional: `${BASE}/enade/regional`,
  enadeUf: `${BASE}/enade/uf`,
  enadeIes: `${BASE}/enade/ies`,
  enadeComparar: `${BASE}/enade/comparar`,
  enadeRegistros: `${BASE}/enade/registros`,
  spd: `${BASE}/spd`,
  spdComparativo: `${BASE}/spd/comparativo`,
  spdExecucoes: `${BASE}/spd/execucoes`,
  spdMetricas: `${BASE}/spd/metricas`,
  spdCarga: `${BASE}/spd/carga`,
  spdEtapasPrefixo: `${BASE}/spd/etapas/`,
  spdEtapas: (execucaoId: number | string) => `${BASE}/spd/etapas/${execucaoId}`,
} as const
