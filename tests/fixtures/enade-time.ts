// Respostas da API do ENADE-Time para a caracterização das telas e os E2E.
// - Dimensões e análises: gravadas da API real (base local do enade_time, 24.967 linhas, filtros padrão).
//   São agregados públicos dos microdados do INEP.
// - Benchmark (telas SPD): simulado no formato de lib/enade-time/types.ts, porque as tabelas de benchmark só
//   se enchem rodando os scripts 08–10 e 15 do backend sobre os microdados brutos.
import type {
  BenchmarkComparativo,
  BenchmarkEtapa,
  BenchmarkExecucao,
  BenchmarkMetrica,
  CargaResposta,
  HealthStatus,
  ResumoConfiguracao,
} from '@/lib/enade-time/types'

import anos from './enade-time/dim-anos.json'
import categoriasAdm from './enade-time/dim-categorias-adm.json'
import grupos from './enade-time/dim-grupos.json'
import modalidades from './enade-time/dim-modalidades.json'
import organizacoes from './enade-time/dim-organizacoes-academicas.json'
import regioes from './enade-time/dim-regioes.json'
import ufs from './enade-time/dim-ufs.json'
import healthReal from './enade-time/health.json'
import registros from './enade-time/registros.json'
import resumoAnual from './enade-time/resumo-anual.json'
import resumoIes from './enade-time/resumo-ies.json'
import resumoRegiao from './enade-time/resumo-regiao.json'
import resumoUf from './enade-time/resumo-uf.json'

export const health = healthReal as HealthStatus
export const dim = { anos, categoriasAdm, grupos, modalidades, organizacoes, regioes, ufs }
export { registros, resumoAnual, resumoIes, resumoRegiao, resumoUf }

// ---------- benchmark simulado ----------
const MAQUINA = { cpu_count_maquina: 8, cpu_modelo: 'CPU de teste 8 núcleos', cpu_fisicos: 4, cpu_logicos: 8, cache_quente: true }
const SUITE = 'suite-teste'
const CAMPANHA = 'campanha-teste'
const LINHAS = 24967
const TEMPO_SEQ = 48.0

type Config = { id: number; modo: 'sequencial' | 'paralelo'; workers: number; ordem: 'crescente' | 'lpt' | null; tempo: number }
const CONFIGS: Config[] = [
  { id: 1, modo: 'sequencial', workers: 1, ordem: null, tempo: TEMPO_SEQ },
  { id: 2, modo: 'paralelo', workers: 2, ordem: 'crescente', tempo: 26.4 },
  { id: 3, modo: 'paralelo', workers: 4, ordem: 'crescente', tempo: 15.2 },
  { id: 4, modo: 'paralelo', workers: 8, ordem: 'crescente', tempo: 11.8 },
  { id: 5, modo: 'paralelo', workers: 2, ordem: 'lpt', tempo: 25.1 },
  { id: 6, modo: 'paralelo', workers: 4, ordem: 'lpt', tempo: 13.9 },
  { id: 7, modo: 'paralelo', workers: 8, ordem: 'lpt', tempo: 10.6 },
]
const inicio = (i: number) => `2026-10-10T14:${String(10 + i).padStart(2, '0')}:00`

export const execucoes: BenchmarkExecucao[] = CONFIGS.map((c, i) => ({
  id: c.id,
  timestamp_inicio: inicio(i),
  modo: c.modo,
  num_workers: c.workers,
  tempo_total_seg: c.tempo,
  linhas_processadas: LINHAS,
  throughput_lps: Number((LINHAS / c.tempo).toFixed(1)),
  cpu_count_maquina: MAQUINA.cpu_count_maquina,
  cpu_modelo: MAQUINA.cpu_modelo,
  memoria_pico_mb: 310 + c.workers * 42,
  observacoes: null,
  campanha_id: CAMPANHA,
  suite_id: SUITE,
  oficial: true,
  ordem_submissao: c.ordem,
  cpu_fisicos: MAQUINA.cpu_fisicos,
  cpu_logicos: MAQUINA.cpu_logicos,
  cpu_percent_medio: c.modo === 'sequencial' ? 12.5 : Math.min(95, 12 * c.workers),
  disco_bytes_lidos: 512_000_000,
  cache_quente: true,
  aquecimento: false,
}))

const ANOS = [2005, 2008, 2011, 2014, 2017, 2021]
const PESO = [0.12, 0.14, 0.16, 0.17, 0.19, 0.22]

export const etapas = (execucaoId: number): BenchmarkEtapa[] => {
  const c = CONFIGS.find((x) => x.id === execucaoId)
  if (!c) return []
  return ANOS.map((ano, i) => ({
    id: execucaoId * 100 + i,
    execucao_id: execucaoId,
    ano,
    tempo_seg: Number((TEMPO_SEQ * PESO[i] * (c.modo === 'sequencial' ? 1 : 1.08)).toFixed(2)),
    linhas_arq3: Math.round(LINHAS * PESO[i]),
    worker_pid: c.modo === 'sequencial' ? 4100 : 4100 + (i % c.workers),
    timestamp_inicio: inicio(execucaoId),
    timestamp_fim: inicio(execucaoId + 1),
  }))
}

export const execucao = (id: number) => execucoes.find((e) => e.id === id)

export const metricas: BenchmarkMetrica[] = CONFIGS.filter((c) => c.modo === 'paralelo').map((c, i) => ({
  execucao_id: c.id,
  timestamp_inicio: inicio(i + 1),
  num_workers: c.workers,
  tempo_sequencial: TEMPO_SEQ,
  tempo_paralelo: c.tempo,
  speedup: Number((TEMPO_SEQ / c.tempo).toFixed(3)),
  eficiencia: Number((TEMPO_SEQ / c.tempo / c.workers).toFixed(3)),
  throughput_sequencial: Number((LINHAS / TEMPO_SEQ).toFixed(1)),
  throughput_paralelo: Number((LINHAS / c.tempo).toFixed(1)),
  cpu_count_maquina: MAQUINA.cpu_count_maquina,
  ordem_submissao: c.ordem,
  suite_id: SUITE,
  campanha_id: CAMPANHA,
  oficial: true,
  baseline_execucao_id: 1,
  pareamento: 'suite',
}))

const resumo: ResumoConfiguracao[] = CONFIGS.map((c) => {
  const sp = c.modo === 'sequencial' ? null : TEMPO_SEQ / c.tempo
  return {
    modo: c.modo,
    num_workers: c.workers,
    ordem_submissao: c.ordem,
    n: 5,
    tempo_mediana: c.tempo,
    tempo_min: Number((c.tempo * 0.96).toFixed(2)),
    tempo_max: Number((c.tempo * 1.05).toFixed(2)),
    tempo_iqr: Number((c.tempo * 0.03).toFixed(2)),
    throughput_mediana: Number((LINHAS / c.tempo).toFixed(1)),
    speedup_mediana: sp && Number(sp.toFixed(3)),
    speedup_min: sp && Number((sp * 0.95).toFixed(3)),
    speedup_max: sp && Number((sp * 1.04).toFixed(3)),
    eficiencia_mediana: sp && Number((sp / c.workers).toFixed(3)),
    eficiencia_min: sp && Number(((sp * 0.95) / c.workers).toFixed(3)),
    eficiencia_max: sp && Number(((sp * 1.04) / c.workers).toFixed(3)),
    oficial: true,
    cpu_fisicos: MAQUINA.cpu_fisicos,
    cpu_logicos: MAQUINA.cpu_logicos,
    cache_quente: true,
  }
})

export const comparativo: BenchmarkComparativo = {
  baseline_sequencial_id: 1,
  tempo_baseline_seg: TEMPO_SEQ,
  throughput_baseline_lps: Number((LINHAS / TEMPO_SEQ).toFixed(1)),
  cpu_count_maquina: MAQUINA.cpu_count_maquina,
  campanha_id: CAMPANHA,
  suite_id: SUITE,
  n_suites: 5,
  maquina: { cpu_fisicos: MAQUINA.cpu_fisicos, cpu_logicos: MAQUINA.cpu_logicos, cpu_modelo: MAQUINA.cpu_modelo, cache_quente: true },
  itens: CONFIGS.map((c) => ({
    execucao_id: c.id,
    modo: c.modo,
    num_workers: c.workers,
    tempo_total_seg: c.tempo,
    throughput_lps: Number((LINHAS / c.tempo).toFixed(1)),
    speedup: c.modo === 'sequencial' ? null : Number((TEMPO_SEQ / c.tempo).toFixed(3)),
    eficiencia: c.modo === 'sequencial' ? null : Number((TEMPO_SEQ / c.tempo / c.workers).toFixed(3)),
    suite_id: SUITE,
    campanha_id: CAMPANHA,
    ordem_submissao: c.ordem,
    oficial: true,
    baseline_execucao_id: c.modo === 'sequencial' ? null : 1,
    pareamento: c.modo === 'sequencial' ? null : 'suite',
  })),
  resumo,
}

const ESTRATEGIAS: [string, number, number | null][] = [
  ['copy_local', 1.82, 0.4],
  ['copy_pooler', 9.6, 38.5],
  ['upsert_postgrest', 31.2, 41.0],
  ['controle_local_sem_estrutura', 0.95, 0.4],
]

export const carga: CargaResposta = {
  carga_id: 'carga-teste',
  resumo: ESTRATEGIAS.map(([estrategia, t, rtt]) => ({
    estrategia,
    n: 5,
    tempo_mediana: t,
    tempo_min: Number((t * 0.9).toFixed(2)),
    tempo_max: Number((t * 1.8).toFixed(2)),
    tempo_iqr: Number((t * 0.12).toFixed(2)),
    throughput_mediana: Number((LINHAS / t).toFixed(1)),
    rtt_mediana_ms: rtt,
    bytes_payload: 3_400_000,
    linhas_destino: LINHAS,
    md5_confere: true,
    host_destino: estrategia.includes('local') ? 'localhost' : 'aws-0-sa-east-1.pooler.supabase.com',
    rede: 'Wi-Fi doméstico',
    inicio: '2026-10-12T09:00:00',
    fim: '2026-10-12T09:20:00',
  })),
  repeticoes: ESTRATEGIAS.flatMap(([estrategia, t, rtt]) =>
    [1, 2, 3, 4, 5].map((repeticao) => ({
      estrategia,
      repeticao,
      tempo_seg: Number((t * (repeticao === 4 ? 1.8 : 0.95 + repeticao * 0.02)).toFixed(2)),
      rtt_ms: rtt == null ? null : Number((rtt * (repeticao === 4 ? 1.6 : 1)).toFixed(1)),
    })),
  ),
  anteriores: [{ copy_local: 2.05, copy_pooler: 11.3 }],
}

/** Corpo da resposta por caminho da API (`/api/enade-time/...`), para os E2E com `page.route`. */
export function respostaPorCaminho(caminho: string): unknown {
  const c = caminho.replace(/^.*\/api\/enade-time/, '')
  const mapa: Record<string, unknown> = {
    '/health': health,
    '/dim/regioes': dim.regioes,
    '/dim/ufs': dim.ufs,
    '/dim/anos': dim.anos,
    '/dim/grupos': dim.grupos,
    '/dim/modalidades': dim.modalidades,
    '/dim/categorias-adm': dim.categoriasAdm,
    '/dim/organizacoes-academicas': dim.organizacoes,
    '/analises/resumo-anual': resumoAnual,
    '/analises/resumo-regiao': resumoRegiao,
    '/analises/resumo-uf': resumoUf,
    '/analises/resumo-ies': resumoIes,
    '/analises/registros': registros,
    '/benchmark/execucoes': execucoes,
    '/benchmark/metricas': metricas,
    '/benchmark/comparativo': comparativo,
    '/benchmark/carga': carga,
  }
  if (c in mapa) return mapa[c]
  const ex = c.match(/^\/benchmark\/execucoes\/(\d+)$/)
  if (ex) return execucao(Number(ex[1]))
  const et = c.match(/^\/benchmark\/etapas\/(\d+)$/)
  if (et) return etapas(Number(et[1]))
  return undefined
}
