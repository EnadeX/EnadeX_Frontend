// Respostas simuladas da API do EduCluster, no formato de lib/educluster/types.ts. Determinísticas e fictícias:
// servem à caracterização das telas e aos E2E, não são dados reais.
import type {
  AmostraEstudantesResposta,
  AreasResposta,
  CalibracaoResposta,
  ClustersCursosResposta,
  ClustersEstudantesResposta,
  ComparacaoTradicionalResposta,
  Curso,
  CursoDetalhe,
  CursoDiscrepante,
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

let semente = 11
const r = () => (semente = (semente * 16807) % 2147483647) / 2147483647
const f = (x: number, casas = 3) => Number(x.toFixed(casas))

const AREAS_CODIGOS = ['A07', 'A14', 'A05', 'A10']

function gerarCursos(n: number): Curso[] {
  semente = 11
  return Array.from({ length: n }, (_, i) => {
    const grupo = i % 3
    const fg = 40 + grupo * 6 + r() * 8
    const ce = 35 + grupo * 7 + r() * 8
    return {
      CO_CURSO: 1000 + i,
      n_notas: 20 + Math.floor(r() * 200),
      area: AREAS_CODIGOS[i % AREAS_CODIGOS.length],
      NT_GER: f(0.25 * fg + 0.75 * ce, 2),
      NT_FG: f(fg, 2),
      NT_CE: f(ce, 2),
      NT_OBJ_FG: f(fg + 3, 2),
      NT_DIS_FG: f(fg - 4, 2),
      NT_OBJ_CE: f(ce + 2, 2),
      NT_DIS_CE: f(ce - 6, 2),
      tx_presenca: f(0.7 + r() * 0.25),
      ODP: f(4.4 + r() * 1.2),
      OPORT: f(4.1 + r() * 1.3),
      INFRA: f(4.2 + r() * 1.3),
      n_qe: 20 + Math.floor(r() * 150),
      Cluster_ID: grupo,
      PCA_X: f((grupo - 1) * 2 + (r() - 0.5) * 1.6),
      PCA_Y: f((grupo === 1 ? 1.5 : -0.5) + (r() - 0.5) * 1.6),
    }
  })
}

export const CURSOS = gerarCursos(30)

export const health: Health = { status: 'ok', modulo: 'educluster', versao: '1.0.0', origem: 'supabase', base_cursos_em_memoria: true }

export const cursos: CursosResposta = { total: CURSOS.length, cursos: CURSOS }

export const clustersCursos: ClustersCursosResposta = {
  perfis: [0, 1, 2].map((id) => ({
    Cluster_ID: id,
    NT_FG: 42 + id * 6,
    NT_CE: 38 + id * 7,
    tx_presenca: 0.78 + id * 0.04,
    ODP: [4.6, 5.2, 4.9][id],
    OPORT: [4.3, 5.0, 4.6][id],
    INFRA: [4.4, 5.1, 4.7][id],
    cursos: 10,
    estudantes: 1200 + id * 300,
  })),
  metricas: {
    n_cursos: 30,
    n_estudantes: 4500,
    k: 3,
    silhouette: 0.2734,
    variancia_explicada_2d: 0.712,
    variancia_por_componente: [0.452, 0.26, 0.11],
    ari_contra_area: 0.0412,
  },
  dimensoes: { ODP: 'Organização didático-pedagógica', OPORT: 'Oportunidades de ampliação da formação', INFRA: 'Infraestrutura' },
}

const estab = (k: number): Estabilidade => ({
  k,
  rodadas: 20,
  fracao_amostrada: 0.8,
  ari_medio: f(0.95 - Math.abs(k - 3) * 0.08),
  ari_desvio: 0.031,
  ari_minimo: f(0.88 - Math.abs(k - 3) * 0.08),
  ari_maximo: 0.99,
  interpretacao: 'muito estável',
})

export const estabilidadePorK: EstabilidadePorK = { metodo: 'reamostragem 80%', por_k: [2, 3, 4, 5, 6, 7, 8].map(estab) }
export const estabilidadeK = (k: number) => estab(k)

export const descricao: Descricao = {
  disponivel: true,
  tipo: 'cursos',
  modelo: 'modelo-teste',
  descricao: '## Perfis\nO **cluster 1** reúne cursos com notas altas.\n- Cluster 0: percepção baixa\n- Cluster 2: intermediário',
  chave_cache: 'abc123',
  origem: 'cache',
}

const QUADS: Quadrante[] = ['coerente_alto', 'coerente_baixo', 'entrega_sem_reconhecimento', 'reconhecimento_sem_entrega']

export const discrepantes: DiscrepantesResposta = {
  total: 8,
  limiar: 1,
  por_quadrante: { coerente_alto: 2, coerente_baixo: 2, entrega_sem_reconhecimento: 3, reconhecimento_sem_entrega: 1 },
  cursos: CURSOS.slice(0, 8).map<CursoDiscrepante>((c, i) => {
    const desempenho = f((i % 2 ? 1 : -1) * (0.6 + i * 0.2))
    const percepcao = f((i % 3 ? -1 : 1) * (0.5 + i * 0.15))
    return {
      ...c,
      NT_FG_z: desempenho,
      NT_CE_z: desempenho,
      ODP_z: percepcao,
      desempenho_relativo: desempenho,
      percepcao_relativa: percepcao,
      tensao: f(percepcao - desempenho),
      quadrante: QUADS[[0, 1, 2, 2, 3, 0, 1, 2][i]],
    }
  }),
}

export const dimensoesDesempenho = (alvo: 'NT_FG' | 'NT_CE'): DimensoesDesempenhoResposta => ({
  correlacao_global: [
    { dimensao: 'ODP', NT_FG: 0.082, NT_CE: 0.121 },
    { dimensao: 'OPORT', NT_FG: -0.034, NT_CE: 0.051 },
    { dimensao: 'INFRA', NT_FG: 0.012, NT_CE: -0.067 },
  ],
  por_area: AREAS_CODIGOS.map((area, i) => ({
    area,
    cursos: 30 + i * 12,
    ODP: f(0.3 - i * 0.15),
    OPORT: f(-0.1 + i * 0.12),
    INFRA: f(0.05 * i),
    dimensao_dominante: (['ODP', 'ODP', 'OPORT', 'OPORT'] as const)[i],
    correlacao_dominante: f([0.3, 0.15, 0.14, 0.26][i]),
  })),
  ranking: {
    areas_avaliadas: 4,
    vitorias_por_dimensao: { ODP: 2, OPORT: 2 },
    correlacao_media_entre_areas: { ODP: 0.075, OPORT: 0.08, INFRA: 0.075 },
    areas_com_correlacao_positiva: { ODP: 2, OPORT: 2, INFRA: 3 },
    rotulos: { ODP: 'ODP', OPORT: 'OPORT', INFRA: 'INFRA' },
  },
  alvo,
})

export const comparacao = (tolerancia: number): ComparacaoTradicionalResposta => ({
  comparacao_de_particoes: {
    ari: 0.1834,
    nmi: 0.2211,
    concordancia_maxima: 0.512,
    tabela_cruzada: [
      { rotulo_tradicional: 'terco_inferior', '0': 7, '1': 1, '2': 2 },
      { rotulo_tradicional: 'terco_medio', '0': 2, '1': 3, '2': 5 },
      { rotulo_tradicional: 'terco_superior', '0': 1, '1': 6, '2': 3 },
    ],
  },
  informacao_perdida_pelo_ranking: {
    por_faixa: (['terco_inferior', 'terco_medio', 'terco_superior'] as const).map((faixa, i) => ({
      faixa,
      cursos: 10,
      clusters_distintos: 3,
      ODP_min: 4.1 + i * 0.1,
      ODP_max: 5.6,
      ODP_amplitude: f(1.5 - i * 0.1),
      OPORT_min: 3.9,
      OPORT_max: 5.5,
      OPORT_amplitude: 1.6,
      INFRA_min: 4,
      INFRA_max: 5.7,
      INFRA_amplitude: 1.7,
    })),
    variancia_1o_componente: 0.452,
    componentes_para_90_porcento: 4,
    nota_explica_da_estrutura: 0.26,
  },
  gemeos_divergentes_amostra: [
    { curso_a: 1003, curso_b: 1007, NT_GER_a: 45.12, NT_GER_b: 45.14, diferenca_nota: 0.02, cluster_a: 0, cluster_b: 1, ODP_a: 4.5, ODP_b: 5.4, diferenca_ODP: 0.9, tx_presenca_a: 0.8, tx_presenca_b: 0.9 },
    { curso_a: 1010, curso_b: 1012, NT_GER_a: 50.3, NT_GER_b: 50.6, diferenca_nota: 0.3, cluster_a: 2, cluster_b: 1, ODP_a: 4.7, ODP_b: 5.2, diferenca_ODP: 0.5, tx_presenca_a: 0.75, tx_presenca_b: 0.85 },
  ],
  total_gemeos_divergentes: 14,
  tolerancia_nota: tolerancia,
  sintese: { pergunta: 'p', resposta: 'r', analise_tradicional: 'a', artefato: 'x', componentes_para_90_porcento: 4 },
})

export const curso = (coCurso: number): CursoDetalhe => {
  const { CO_CURSO: _, ...resto } = CURSOS.find((c) => c.CO_CURSO === coCurso) ?? CURSOS[0]
  return resto
}

export const clustersEstudantes: ClustersEstudantesResposta = {
  perfis: [0, 1, 2].map((id) => ({
    Cluster_ID: id,
    NT_OBJ_FG: 40 + id * 12,
    NT_DIS_FG: 30 + id * 14,
    NT_OBJ_CE: 35 + id * 11,
    NT_DIS_CE: 20 + id * 15,
    estudantes: 50000 - id * 9000,
  })),
  metricas: {
    espaco: 'notas objetivas e discursivas',
    variaveis: ['NT_OBJ_FG', 'NT_DIS_FG', 'NT_OBJ_CE', 'NT_DIS_CE'],
    n_estudantes: 123000,
    k: 3,
    silhouette: 0.3121,
    silhouette_amostra: 10000,
    variancia_explicada_2d: 0.84,
    variancia_por_componente: [0.61, 0.23],
  },
}

export const amostraEstudantes = (n: number): AmostraEstudantesResposta => {
  semente = 23
  return {
    populacao: 123000,
    amostra: n,
    random_state: 42,
    pontos: Array.from({ length: 24 }, (_, i) => ({
      NT_OBJ_FG: f(30 + r() * 50, 1),
      NT_DIS_FG: f(20 + r() * 60, 1),
      NT_OBJ_CE: f(25 + r() * 50, 1),
      NT_DIS_CE: f(10 + r() * 60, 1),
      Cluster_ID: i % 3,
      PCA_X: f((i % 3) * 1.8 - 1.8 + (r() - 0.5)),
      PCA_Y: f((r() - 0.5) * 2),
    })),
  }
}

export const calibracao: CalibracaoResposta = {
  perfis: [
    { calibracao: 'confianca_excessiva', estudantes: 21000, dificuldade_percebida: 2.4, NT_GER: 35.2, NT_FG: 40.1, NT_CE: 33.6, desempenho_z: -0.71 },
    { calibracao: 'confianca_confirmada', estudantes: 30000, dificuldade_percebida: 2.3, NT_GER: 52.8, NT_FG: 55.0, NT_CE: 52.1, desempenho_z: 0.82 },
    { calibracao: 'dificuldade_reconhecida', estudantes: 40000, dificuldade_percebida: 3.9, NT_GER: 33.1, NT_FG: 37.4, NT_CE: 31.7, desempenho_z: -0.83 },
    { calibracao: 'insegura_mas_capaz', estudantes: 22000, dificuldade_percebida: 3.7, NT_GER: 50.4, NT_FG: 53.2, NT_CE: 49.5, desempenho_z: 0.66 },
  ],
  metricas: {
    n_estudantes: 113000,
    correlacao_dificuldade_desempenho: -0.1934,
    taxa_descalibrados: 0.38,
    itens_usados: { CO_RS_I1: 'formação geral', CO_RS_I2: 'componente específico' },
    escala: '1 a 5',
    desempenho_padronizado_dentro_da_area: true,
  },
  nota_por_dificuldade: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((d, i) => ({ dificuldade_percebida: d, size: [300, 900, 8000, 21000, 35000, 28000, 15000, 4000, 900][i], mean: [38.2, 44.1, 46.5, 45.3, 43.0, 40.2, 37.8, 35.1, 33.9][i] })),
}

export const discursivas: DiscursivasResposta = {
  perfis: [
    { perfil_discursivo: 'sabe_e_escreve', estudantes: 38000, taxa_abandono: 0.02, NT_OBJ_CE: 58.1, NT_DIS_CE: 49.3, NT_OBJ_FG: 61.2, NT_DIS_FG: 55.4, NT_GER: 55.0 },
    { perfil_discursivo: 'sabe_mas_nao_escreve', estudantes: 9000, taxa_abandono: 0.48, NT_OBJ_CE: 54.6, NT_DIS_CE: 21.7, NT_OBJ_FG: 57.0, NT_DIS_FG: 30.2, NT_GER: 42.3 },
    { perfil_discursivo: 'escreve_mas_nao_domina', estudantes: 41000, taxa_abandono: 0.03, NT_OBJ_CE: 33.2, NT_DIS_CE: 31.0, NT_OBJ_FG: 41.5, NT_DIS_FG: 40.1, NT_GER: 35.2 },
    { perfil_discursivo: 'dificuldade_ampla', estudantes: 25000, taxa_abandono: 0.55, NT_OBJ_CE: 29.4, NT_DIS_CE: 9.8, NT_OBJ_FG: 35.3, NT_DIS_FG: 15.6, NT_GER: 23.4 },
  ],
  metricas: {
    n_estudantes: 113000,
    taxa_abandono_media: 0.151,
    abandonaram_todas: 0.062,
    sabe_mas_nao_escreve: 0.08,
    codigos: { '222': 'em branco', '333': 'nula', '444': 'divergente' },
    definicao_abandono: 'em branco, nula ou divergente do tema',
  },
  situacao_por_questao: ['TP_SFG_D1', 'TP_SFG_D2', 'TP_SCE_D1', 'TP_SCE_D2', 'TP_SCE_D3'].flatMap((questao, i) =>
    (['em_branco', 'resposta_nula', 'divergente_do_tema', 'valida'] as const).map((situacao, j) => ({
      questao,
      codigo: String(j),
      situacao,
      estudantes: 1000 * (j + 1),
      percentual: [4 + i, 1.2, 2.5 + i * 0.3, 92 - i][j],
    })),
  ),
}

export const areas: AreasResposta = {
  total: AREAS_CODIGOS.length,
  areas: AREAS_CODIGOS.map((area, i) => ({ area, cursos: 30 + i * 12, estudantes: 9000 + i * 1000, NT_FG: 45 + i, NT_CE: 41 + i, ODP: 4.8 + i * 0.05 })),
}

export const dimensoes: DimensoesResposta = {
  ODP: { rotulo: 'Organização didático-pedagógica', itens: ['QE_I27', 'QE_I28', 'QE_I29'], quantidade: 3 },
  OPORT: { rotulo: 'Oportunidades de ampliação da formação', itens: ['QE_I43', 'QE_I44'], quantidade: 2 },
  INFRA: { rotulo: 'Infraestrutura', itens: ['QE_I59', 'QE_I60', 'QE_I61'], quantidade: 3 },
}

/** Corpo da resposta por caminho da API (`/api/educluster/...`), para os E2E com `page.route`. */
export function respostaPorCaminho(caminho: string, params: URLSearchParams): unknown {
  const numero = (chave: string, padrao: number) => Number(params.get(chave) ?? padrao)
  if (caminho.endsWith('/health')) return health
  if (caminho.endsWith('/areas')) return areas
  if (caminho.endsWith('/dimensoes')) return dimensoes
  if (caminho.endsWith('/cursos/clusters/estabilidade')) return params.has('k') ? estabilidadeK(numero('k', 3)) : estabilidadePorK
  if (caminho.endsWith('/cursos/clusters/descricao') || caminho.endsWith('/estudantes/clusters/descricao')) return descricao
  if (caminho.endsWith('/cursos/clusters')) return clustersCursos
  if (caminho.endsWith('/cursos/discrepantes')) return discrepantes
  if (caminho.endsWith('/cursos/dimensoes-desempenho')) return dimensoesDesempenho(params.get('alvo') === 'NT_FG' ? 'NT_FG' : 'NT_CE')
  if (caminho.endsWith('/cursos/comparacao-tradicional')) return comparacao(numero('tolerancia', 0.5))
  if (caminho.endsWith('/cursos')) return cursos
  const m = caminho.match(/\/cursos\/(\d+)$/)
  if (m) return curso(Number(m[1]))
  if (caminho.endsWith('/estudantes/clusters')) return clustersEstudantes
  if (caminho.endsWith('/estudantes/amostra')) return amostraEstudantes(numero('n', 3000))
  if (caminho.endsWith('/estudantes/calibracao')) return calibracao
  if (caminho.endsWith('/estudantes/discursivas')) return discursivas
  return undefined
}
