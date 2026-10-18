export type Dimensao = 'ODP' | 'OPORT' | 'INFRA'

export type AlvoDesempenho = 'NT_FG' | 'NT_CE'

export type Quadrante =
  | 'coerente_alto'
  | 'coerente_baixo'
  | 'entrega_sem_reconhecimento'
  | 'reconhecimento_sem_entrega'

export type PerfilCalibracao =
  | 'confianca_excessiva'
  | 'confianca_confirmada'
  | 'dificuldade_reconhecida'
  | 'insegura_mas_capaz'

export type PerfilDiscursivo =
  | 'escreve_mas_nao_domina'
  | 'sabe_e_escreve'
  | 'dificuldade_ampla'
  | 'sabe_mas_nao_escreve'

export type SituacaoDiscursiva = 'em_branco' | 'resposta_nula' | 'divergente_do_tema' | 'valida'

export type FaixaTradicional = 'terco_inferior' | 'terco_medio' | 'terco_superior'

export interface Health {
  status: string
  modulo: string
  versao: string
  origem: string
  base_cursos_em_memoria: boolean
}

export interface Curso {
  CO_CURSO: number
  n_notas: number
  area: string
  NT_GER: number
  NT_FG: number
  NT_CE: number
  NT_OBJ_FG: number
  NT_DIS_FG: number
  NT_OBJ_CE: number
  NT_DIS_CE: number
  tx_presenca: number
  ODP: number
  OPORT: number
  INFRA: number
  n_qe: number
  Cluster_ID: number
  PCA_X: number
  PCA_Y: number
}

export type CursoDetalhe = Omit<Curso, 'CO_CURSO'>

export interface CursosResposta {
  total: number
  cursos: Curso[]
}

export interface PerfilClusterCurso {
  Cluster_ID: number
  NT_FG: number
  NT_CE: number
  tx_presenca: number
  ODP: number
  OPORT: number
  INFRA: number
  cursos: number
  estudantes: number
}

export interface MetricasModeloCursos {
  n_cursos: number
  n_estudantes: number
  k: number
  silhouette: number
  variancia_explicada_2d: number
  variancia_por_componente: number[]
  ari_contra_area: number
}

export interface MetricasReclusterizadas {
  k: number
  modo: 'reclusterizado_em_memoria'
}

export interface ClustersCursosResposta {
  perfis: PerfilClusterCurso[]
  metricas: MetricasModeloCursos | MetricasReclusterizadas
  dimensoes: Record<Dimensao, string>
}

export interface Estabilidade {
  k: number
  rodadas: number
  fracao_amostrada: number
  ari_medio: number
  ari_desvio: number
  ari_minimo: number
  ari_maximo: number
  interpretacao: string
}

export interface EstabilidadePorK {
  metodo: string
  por_k: Estabilidade[]
}

export interface Descricao {
  disponivel: boolean
  tipo?: string
  modelo?: string
  descricao?: string
  chave_cache?: string
  origem?: 'cache' | 'geracao'
  motivo?: string
}

export interface CursoDiscrepante extends Curso {
  NT_FG_z: number
  NT_CE_z: number
  ODP_z: number
  desempenho_relativo: number
  percepcao_relativa: number
  tensao: number
  quadrante: Quadrante
}

export interface DiscrepantesResposta {
  total: number
  limiar: number
  por_quadrante: Partial<Record<Quadrante, number>>
  cursos: CursoDiscrepante[]
}

export interface CorrelacaoGlobal {
  dimensao: Dimensao
  NT_FG: number
  NT_CE: number
}

export interface CorrelacaoArea {
  area: string
  cursos: number
  ODP: number
  OPORT: number
  INFRA: number
  dimensao_dominante: Dimensao
  correlacao_dominante: number
}

export interface DimensoesDesempenhoResposta {
  correlacao_global: CorrelacaoGlobal[]
  por_area: CorrelacaoArea[]
  ranking: {
    areas_avaliadas: number
    vitorias_por_dimensao: Partial<Record<Dimensao, number>>
    correlacao_media_entre_areas: Record<Dimensao, number>
    areas_com_correlacao_positiva: Record<Dimensao, number>
    rotulos: Record<Dimensao, string>
  }
  alvo: AlvoDesempenho
}

export interface LinhaTabelaCruzada {
  rotulo_tradicional: FaixaTradicional
  [cluster: string]: number | string
}

export interface PercepcaoPorFaixa {
  faixa: FaixaTradicional
  cursos: number
  clusters_distintos: number
  ODP_min: number
  ODP_max: number
  ODP_amplitude: number
  OPORT_min: number
  OPORT_max: number
  OPORT_amplitude: number
  INFRA_min: number
  INFRA_max: number
  INFRA_amplitude: number
}

export interface GemeosDivergentes {
  curso_a: number
  curso_b: number
  NT_GER_a: number
  NT_GER_b: number
  diferenca_nota: number
  cluster_a: number
  cluster_b: number
  ODP_a: number
  ODP_b: number
  diferenca_ODP: number
  tx_presenca_a: number
  tx_presenca_b: number
}

export interface ComparacaoTradicionalResposta {
  comparacao_de_particoes: {
    ari: number
    nmi: number
    concordancia_maxima: number
    tabela_cruzada: LinhaTabelaCruzada[]
  }
  informacao_perdida_pelo_ranking: {
    por_faixa: PercepcaoPorFaixa[]
    variancia_1o_componente: number
    componentes_para_90_porcento: number
    nota_explica_da_estrutura: number
  }
  gemeos_divergentes_amostra: GemeosDivergentes[]
  total_gemeos_divergentes: number
  tolerancia_nota: number
  sintese: {
    pergunta: string
    resposta: string
    analise_tradicional: string
    artefato: string
    componentes_para_90_porcento: number
  }
}

export interface AreaResumo {
  area: string
  cursos: number
  estudantes: number
  NT_FG: number
  NT_CE: number
  ODP: number
}

export interface AreasResposta {
  total: number
  areas: AreaResumo[]
}

export interface DimensaoCatalogo {
  rotulo: string
  itens: string[]
  quantidade: number
}

export type DimensoesResposta = Record<Dimensao, DimensaoCatalogo>

export interface PerfilClusterEstudante {
  Cluster_ID: number
  NT_OBJ_FG: number
  NT_DIS_FG: number
  NT_OBJ_CE: number
  NT_DIS_CE: number
  estudantes: number
}

export interface ClustersEstudantesResposta {
  perfis: PerfilClusterEstudante[]
  metricas: {
    espaco: string
    variaveis: string[]
    n_estudantes: number
    k: number
    silhouette: number
    silhouette_amostra: number
    variancia_explicada_2d: number
    variancia_por_componente: number[]
  }
}

export interface PontoEstudante {
  NT_OBJ_FG: number
  NT_DIS_FG: number
  NT_OBJ_CE: number
  NT_DIS_CE: number
  Cluster_ID: number
  PCA_X: number
  PCA_Y: number
}

export interface AmostraEstudantesResposta {
  populacao: number
  amostra: number
  random_state: number
  pontos: PontoEstudante[]
}

export interface PerfilCalibracaoResumo {
  calibracao: PerfilCalibracao
  estudantes: number
  dificuldade_percebida: number
  NT_GER: number
  NT_FG: number
  NT_CE: number
  desempenho_z: number
}

export interface CalibracaoResposta {
  perfis: PerfilCalibracaoResumo[]
  metricas: {
    n_estudantes: number
    correlacao_dificuldade_desempenho: number
    taxa_descalibrados: number
    itens_usados: Record<string, string>
    escala: string
    desempenho_padronizado_dentro_da_area: boolean
  }
  nota_por_dificuldade: { dificuldade_percebida: number; size: number; mean: number }[]
}

export interface PerfilDiscursivoResumo {
  perfil_discursivo: PerfilDiscursivo
  estudantes: number
  taxa_abandono: number
  NT_OBJ_CE: number
  NT_DIS_CE: number
  NT_OBJ_FG: number
  NT_DIS_FG: number
  NT_GER: number
}

export interface SituacaoPorQuestao {
  questao: string
  codigo: string
  situacao: SituacaoDiscursiva
  estudantes: number
  percentual: number
}

export interface DiscursivasResposta {
  perfis: PerfilDiscursivoResumo[]
  metricas: {
    n_estudantes: number
    taxa_abandono_media: number
    abandonaram_todas: number
    sabe_mas_nao_escreve: number
    codigos: Record<string, string>
    definicao_abandono: string
  }
  situacao_por_questao: SituacaoPorQuestao[]
}
