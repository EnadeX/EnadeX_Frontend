export type VariavelCor = 'infraestrutura' | 'cotas'
export type Topico = 'regressao' | 'clusters' | 'associacao'

export const TOPICOS: Topico[] = ['regressao', 'clusters', 'associacao']

export const CLUSTER_PALETTE = ['#155eef', '#00a56e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6']

export const CORES_CATEGORIA: Record<VariavelCor, Record<string, string>> = {
  infraestrutura: {
    'Adequada/Excelente': '#023e8a',
    'Regular/Insuficiente': '#f77f00',
  },
  cotas: {
    'Maioria Ampla Concorr.': '#2a9d8f',
    'Maioria Cotistas': '#e76f51',
  },
}

// Definições sucintas das variáveis do ENADE, para orientar quem não conhece os
// códigos QE_*. Baseado no glossário oficial do questionário do estudante.
export const DEF_VARIAVEIS: Record<string, { codigo: string; texto: string }> = {
  NT_GER: { codigo: 'NT_GER', texto: 'nota geral do curso (formação geral + específica), 0–100' },
  QE_I23: { codigo: 'QE_I23', texto: 'horas semanais dedicadas aos estudos, além da aula' },
  QE_I63: { codigo: 'QE_I63', texto: 'percepção sobre infraestrutura das aulas práticas' },
  QE_I15: { codigo: 'QE_I15', texto: 'forma de ingresso por ação afirmativa/cotas' },
  QE_I57: { codigo: 'QE_I57', texto: 'percepção sobre domínio de conteúdo dos professores' },
  QE_I56: { codigo: 'QE_I56', texto: 'percepção sobre disponibilidade dos professores' },
  QE_I30: { codigo: 'QE_I30', texto: 'percepção sobre experiências de aprendizagem inovadoras' },
}

export interface ColunaInfo {
  coluna: string
  descricao: string
}

export const MAX_LINHAS_TABELA = 30

export const DICIONARIO_TABELAS: Record<Topico, { titulo: string; tabelaBanco: string; colunas: ColunaInfo[] }> = {
  regressao: {
    titulo: 'Modelagem supervisionada',
    tabelaBanco: 'tbl_multi_enade_regressao',
    colunas: [
      { coluna: 'CO_CURSO', descricao: 'Código identificador do curso avaliado.' },
      { coluna: 'NT_GER', descricao: 'Nota geral média do curso — formação geral (25%) + componente específico (75%), escala 0–100.' },
      { coluna: 'QT_ALUNOS', descricao: 'Quantidade de alunos considerados na média do curso; usado como peso no treino do modelo.' },
      { coluna: 'QE_I63', descricao: 'Percepção média sobre a infraestrutura das aulas práticas (escala 1–6, de discordo totalmente a concordo totalmente).' },
      { coluna: 'QE_I57', descricao: 'Percepção média sobre o domínio de conteúdo dos professores (mesma escala 1–6).' },
      { coluna: 'QE_I15_A', descricao: 'Proporção de alunos do curso que ingressaram sem cota (ampla concorrência).' },
      { coluna: 'QE_I15_B', descricao: 'Proporção de alunos que ingressaram por cota étnico-racial.' },
      { coluna: 'QE_I15_C', descricao: 'Proporção de alunos que ingressaram por cota de renda.' },
      { coluna: 'QE_I15_D', descricao: 'Proporção de alunos que ingressaram por cota de escola pública ou bolsa de estudos.' },
      { coluna: 'QE_I15_E', descricao: 'Proporção de alunos que ingressaram por sistema que combina dois ou mais critérios de cota.' },
      { coluna: 'QE_I15_F', descricao: 'Proporção de alunos que ingressaram por outro sistema de cotas.' },
      { coluna: 'QE_I23_ordinal', descricao: 'Dedicação semanal média aos estudos, mapeada de A–E para escala ordinal 1 (nenhuma) a 5 (mais de 12h/semana).' },
      { coluna: 'NT_GER_PREVISTA', descricao: 'Nota geral prevista pelo modelo Random Forest treinado, para comparar com a nota real (NT_GER).' },
    ],
  },
  clusters: {
    titulo: 'Agrupamento de perfis',
    tabelaBanco: 'tbl_multi_enade_clusters',
    colunas: [
      { coluna: 'CO_CURSO', descricao: 'Código identificador do curso.' },
      { coluna: 'NT_GER', descricao: 'Nota geral média do curso, escala 0–100 — um dos três pilares do agrupamento.' },
      { coluna: 'QE_I63_1 … QE_I63_8', descricao: 'Proporção de alunos em cada categoria de resposta (1 a 8) sobre infraestrutura das aulas práticas — segundo pilar.' },
      { coluna: 'QE_I15_A … QE_I15_F', descricao: 'Proporção de alunos em cada categoria de ingresso por cota (A a F) — terceiro pilar (diversidade).' },
      { coluna: 'Cluster_ID', descricao: 'Grupo pedagógico atribuído pelo K-Means, combinando os três pilares acima.' },
      { coluna: 'PCA_X / PCA_Y', descricao: 'Coordenadas da projeção 2D (PCA) usadas apenas para posicionar os pontos no gráfico de dispersão.' },
    ],
  },
  associacao: {
    titulo: 'Regras de associação',
    tabelaBanco: 'tbl_multi_enade_associacao',
    colunas: [
      { coluna: 'antecedents', descricao: 'Condição "se": resposta(s) que, quando presentes, precedem o padrão encontrado.' },
      { coluna: 'consequents', descricao: 'Condição "então": resposta que tende a ocorrer junto com o antecedente.' },
      { coluna: 'support', descricao: 'Suporte: percentual de alunos em que essa combinação de respostas ocorre em toda a base.' },
      { coluna: 'confidence', descricao: 'Confiança: percentual de vezes que o consequente ocorre quando o antecedente já ocorreu.' },
      { coluna: 'lift', descricao: 'Lift: quantas vezes mais provável é o consequente ocorrer com o antecedente do que por acaso (>1 indica associação real, não coincidência).' },
    ],
  },
}
