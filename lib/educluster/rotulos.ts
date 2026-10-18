import type {
  Dimensao,
  FaixaTradicional,
  PerfilCalibracao,
  PerfilDiscursivo,
  Quadrante,
  SituacaoDiscursiva,
} from '@/lib/educluster/types'

export interface AreaInfo {
  nome: string
  grupo: number
}

export const AREAS: Record<string, AreaInfo> = {
  A01: { nome: 'História (Bacharelado)', grupo: 2401 },
  A02: { nome: 'Letras-Português e Espanhol (Licenciatura)', grupo: 906 },
  A03: { nome: 'Artes Visuais (Licenciatura)', grupo: 2501 },
  A04: { nome: 'Tecnologia em Redes de Computadores', grupo: 79 },
  A05: { nome: 'Tecnologia em Análise e Desenvolvimento de Sistemas', grupo: 72 },
  A06: { nome: 'Tecnologia em Gestão da Tecnologia da Informação', grupo: 6409 },
  A07: { nome: 'Pedagogia (Licenciatura)', grupo: 2001 },
  A08: { nome: 'Música (Licenciatura)', grupo: 4301 },
  A09: { nome: 'Letras-Português (Licenciatura)', grupo: 904 },
  A10: { nome: 'Química (Bacharelado)', grupo: 1501 },
  A11: { nome: 'Ciências Biológicas (Bacharelado)', grupo: 1601 },
  A12: { nome: 'Ciências Biológicas (Licenciatura)', grupo: 1602 },
  A13: { nome: 'Ciência da Computação (Licenciatura)', grupo: 4005 },
  A14: { nome: 'Ciência da Computação (Bacharelado)', grupo: 4004 },
  A15: { nome: 'Filosofia (Bacharelado)', grupo: 3201 },
  A16: { nome: 'Filosofia (Licenciatura)', grupo: 3202 },
  A17: { nome: 'Letras-Português e Inglês (Licenciatura)', grupo: 905 },
  A18: { nome: 'Letras-Inglês (Licenciatura)', grupo: 6407 },
  A19: { nome: 'Design', grupo: 26 },
  A20: { nome: 'História (Licenciatura)', grupo: 2402 },
  A21: { nome: 'Geografia (Licenciatura)', grupo: 3002 },
  A22: { nome: 'Geografia (Bacharelado)', grupo: 3001 },
  A23: { nome: 'Física (Licenciatura)', grupo: 1402 },
  A24: { nome: 'Matemática (Licenciatura)', grupo: 702 },
  A25: { nome: 'Sistemas de Informação', grupo: 4006 },
  A26: { nome: 'Ciências Sociais (Bacharelado)', grupo: 5401 },
  A27: { nome: 'Ciências Sociais (Licenciatura)', grupo: 5402 },
  A28: { nome: 'Química (Licenciatura)', grupo: 1502 },
  A29: { nome: 'Educação Física (Bacharelado)', grupo: 3501 },
  A30: { nome: 'Educação Física (Licenciatura)', grupo: 3502 },
}

export function nomeArea(area: string): string {
  return AREAS[area]?.nome ?? area
}

export const DIMENSOES: Dimensao[] = ['ODP', 'OPORT', 'INFRA']

export const ROTULO_DIMENSAO: Record<Dimensao, string> = {
  ODP: 'Organização didático-pedagógica',
  OPORT: 'Oportunidades de ampliação da formação',
  INFRA: 'Infraestrutura',
}

export const ROTULO_VARIAVEL: Record<string, string> = {
  NT_GER: 'Nota geral',
  NT_FG: 'Formação geral',
  NT_CE: 'Componente específico',
  NT_OBJ_FG: 'FG objetiva',
  NT_DIS_FG: 'FG discursiva',
  NT_OBJ_CE: 'CE objetiva',
  NT_DIS_CE: 'CE discursiva',
  tx_presenca: 'Taxa de presença',
  ODP: 'ODP',
  OPORT: 'OPORT',
  INFRA: 'INFRA',
}

export const ROTULO_QUADRANTE: Record<Quadrante, { titulo: string; leitura: string }> = {
  reconhecimento_sem_entrega: {
    titulo: 'Reconhecimento sem entrega',
    leitura: 'Bem avaliado pelos estudantes, desempenho abaixo dos pares da área.',
  },
  entrega_sem_reconhecimento: {
    titulo: 'Entrega sem reconhecimento',
    leitura: 'Desempenho acima dos pares, mas mal avaliado pelos estudantes.',
  },
  coerente_alto: {
    titulo: 'Coerente alto',
    leitura: 'Acima dos pares no desempenho e na percepção.',
  },
  coerente_baixo: {
    titulo: 'Coerente baixo',
    leitura: 'Abaixo dos pares no desempenho e na percepção.',
  },
}

export const QUADRANTES: Quadrante[] = [
  'reconhecimento_sem_entrega',
  'coerente_alto',
  'coerente_baixo',
  'entrega_sem_reconhecimento',
]

export const ROTULO_CALIBRACAO: Record<PerfilCalibracao, { titulo: string; leitura: string }> = {
  confianca_excessiva: {
    titulo: 'Confiança excessiva',
    leitura: 'Achou a prova fácil e foi mal.',
  },
  confianca_confirmada: {
    titulo: 'Confiança confirmada',
    leitura: 'Achou a prova fácil e foi bem.',
  },
  dificuldade_reconhecida: {
    titulo: 'Dificuldade reconhecida',
    leitura: 'Achou a prova difícil e foi mal.',
  },
  insegura_mas_capaz: {
    titulo: 'Insegura, mas capaz',
    leitura: 'Achou a prova difícil e foi bem.',
  },
}

export const ROTULO_DISCURSIVO: Record<PerfilDiscursivo, { titulo: string; leitura: string }> = {
  sabe_e_escreve: {
    titulo: 'Sabe e escreve',
    leitura: 'Domina o conteúdo objetivo e entrega as discursivas.',
  },
  sabe_mas_nao_escreve: {
    titulo: 'Sabe, mas não escreve',
    leitura: 'Domina o conteúdo objetivo, mas abandona parte das discursivas.',
  },
  escreve_mas_nao_domina: {
    titulo: 'Escreve, mas não domina',
    leitura: 'Entrega as discursivas, mas fica abaixo da área na parte objetiva.',
  },
  dificuldade_ampla: {
    titulo: 'Dificuldade ampla',
    leitura: 'Abaixo da área na parte objetiva e abandona parte das discursivas.',
  },
}

export const ROTULO_SITUACAO: Record<SituacaoDiscursiva, string> = {
  valida: 'Válida',
  em_branco: 'Em branco',
  resposta_nula: 'Resposta nula',
  divergente_do_tema: 'Divergente do tema',
}

export const SITUACOES: SituacaoDiscursiva[] = [
  'valida',
  'em_branco',
  'divergente_do_tema',
  'resposta_nula',
]

export const ROTULO_QUESTAO: Record<string, string> = {
  TP_SFG_D1: 'FG, discursiva 1',
  TP_SFG_D2: 'FG, discursiva 2',
  TP_SCE_D1: 'CE, discursiva 1',
  TP_SCE_D2: 'CE, discursiva 2',
  TP_SCE_D3: 'CE, discursiva 3',
}

export const QUESTOES = ['TP_SFG_D1', 'TP_SFG_D2', 'TP_SCE_D1', 'TP_SCE_D2', 'TP_SCE_D3']

export const ROTULO_FAIXA: Record<FaixaTradicional, string> = {
  terco_inferior: 'Terço inferior',
  terco_medio: 'Terço médio',
  terco_superior: 'Terço superior',
}

export const FAIXAS: FaixaTradicional[] = ['terco_inferior', 'terco_medio', 'terco_superior']

export const ROTULO_ESTABILIDADE: Record<string, string> = {
  'muito estavel': 'Muito estável',
  estavel: 'Estável',
  'moderadamente estavel': 'Moderadamente estável',
  instavel: 'Instável',
}
