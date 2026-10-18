export type VariavelCor = 'professores' | 'cotas'
export type Topico = 'regressao' | 'clusters' | 'associacao'

export const TOPICOS: Topico[] = ['regressao', 'clusters', 'associacao']

export const CLUSTER_PALETTE = ['var(--cluster-1)', 'var(--cluster-2)', 'var(--cluster-3)', 'var(--cluster-4)', 'var(--cluster-5)', 'var(--cluster-6)']

// Mesmas categorias de preparar_dados_plotagem() em modelo_regressao.py.
export const CORES_CATEGORIA: Record<VariavelCor, Record<string, string>> = {
  professores: {
    'Concordância alta': 'var(--series-1)',
    'Concordância baixa/média': 'var(--series-4)',
  },
  cotas: {
    'Menos cotistas': 'var(--series-1)',
    'Mais cotistas (renda/múlt. critérios)': 'var(--series-4)',
  },
}

// Definições sucintas das variáveis do ENADE, para orientar quem não conhece os
// códigos QE_*. Baseado no glossário oficial do questionário do estudante.
export const DEF_VARIAVEIS: Record<string, { codigo: string; texto: string }> = {
  NT_GER: { codigo: 'NT_GER', texto: 'nota geral do curso (formação geral + específica), 0–100' },
  PCA_ECON: { codigo: 'PCA_ECON', texto: 'índice socioeconômico do curso: renda (QE_I08), situação financeira (QE_I09) e trabalho (QE_I10) condensados por PCA' },
  QE_I57: { codigo: 'QE_I57', texto: 'percepção sobre domínio de conteúdo dos professores, 1–6' },
  QE_I15: { codigo: 'QE_I15', texto: 'forma de ingresso por ação afirmativa/cotas' },
  QE_I13: { codigo: 'QE_I13', texto: 'bolsa acadêmica recebida (iniciação científica, monitoria…)' },
  QE_I24: { codigo: 'QE_I24', texto: 'aprendizado de idioma estrangeiro na instituição' },
  QE_I04: { codigo: 'QE_I04', texto: 'escolaridade do pai' },
  QE_I63: { codigo: 'QE_I63', texto: 'percepção sobre infraestrutura das aulas práticas' },
  QE_I11: { codigo: 'QE_I11', texto: 'bolsa ou financiamento do curso (A = curso gratuito)' },
  QE_I56: { codigo: 'QE_I56', texto: 'percepção sobre disponibilidade dos professores' },
  QE_I30: { codigo: 'QE_I30', texto: 'percepção sobre experiências de aprendizagem inovadoras' },
  QE_I34: { codigo: 'QE_I34', texto: 'percepção sobre o desenvolvimento do pensamento crítico' },
  QE_I44: { codigo: 'QE_I44', texto: 'percepção sobre oportunidades de iniciação científica' },
  QE_I61: { codigo: 'QE_I61', texto: 'percepção sobre as salas de aula' },
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
      { coluna: 'QT_ALUNOS', descricao: 'Quantidade de alunos considerados na média do curso (mínimo de 5); usado como peso no treino do modelo.' },
      { coluna: 'PCA_ECON_1 / PCA_ECON_2', descricao: 'Índice socioeconômico: renda (QE_I08), situação financeira (QE_I09) e trabalho (QE_I10) condensados por PCA. O 1º eixo explica 71% da variação das três.' },
      { coluna: 'QE_I13_A / B / D', descricao: 'Proporção de alunos sem bolsa acadêmica (A), com bolsa de iniciação científica (B) e com bolsa de monitoria/tutoria (D).' },
      { coluna: 'QE_I24_A', descricao: 'Proporção de alunos que aprenderam idioma estrangeiro na instituição, na modalidade presencial.' },
      { coluna: 'QE_I04_media', descricao: 'Escolaridade média do pai, em escala ordinal de 0 (nenhuma) a 5 (pós-graduação).' },
      { coluna: 'QE_I15_C / QE_I15_E', descricao: 'Proporção de alunos que ingressaram por cota de renda (C) e por sistema que combina dois ou mais critérios (E).' },
      { coluna: 'CO_TURNO_GRADUACAO_4', descricao: '1 se o curso é noturno, 0 caso contrário.' },
      { coluna: 'QE_I57', descricao: 'Percepção média sobre o domínio de conteúdo dos professores (escala 1–6; "não sei" e "não se aplica" excluídos).' },
      { coluna: 'QE_I19_B', descricao: 'Proporção de alunos que tiveram os pais como maior incentivo para cursar a graduação.' },
      { coluna: 'QE_I11_A', descricao: 'Proporção de alunos sem bolsa ou financiamento por o curso ser gratuito.' },
      { coluna: 'QE_I12_A', descricao: 'Proporção de alunos que não receberam auxílio permanência.' },
      { coluna: 'NT_GER_PREVISTA', descricao: 'Nota geral prevista pelo modelo Random Forest, para comparar com a nota real (NT_GER).' },
    ],
  },
  clusters: {
    titulo: 'Agrupamento de perfis',
    tabelaBanco: 'tbl_multi_enade_clusters',
    colunas: [
      { coluna: 'CO_CURSO', descricao: 'Código identificador do curso.' },
      { coluna: 'NT_GER', descricao: 'Nota geral média do curso, escala 0–100. Não entra no agrupamento: só serve para nomear os grupos depois de formados.' },
      { coluna: 'QE_I63_1 … QE_I63_6', descricao: 'Proporção de alunos em cada resposta (1 a 6) sobre a infraestrutura das aulas práticas — "não sei" (7) e "não se aplica" (8) são excluídos.' },
      { coluna: 'QE_I15_A … QE_I15_F', descricao: 'Proporção de alunos em cada forma de ingresso por cota (A = ampla concorrência).' },
      { coluna: 'QE_I11_A … QE_I11_K', descricao: 'Proporção de alunos em cada tipo de bolsa ou financiamento do curso (A = nenhum, curso gratuito; B = nenhum, curso pago).' },
      { coluna: 'Cluster_ID', descricao: 'Grupo atribuído pelo K-Means (3 grupos). O número é arbitrário e pode mudar entre retreinos.' },
      { coluna: 'Cluster_Nome', descricao: 'Nome do grupo pelo ranking de nota média: Desempenho Alto, Médio ou Baixo.' },
      { coluna: 'PCA_X / PCA_Y', descricao: 'Coordenadas da projeção 2D (PCA) usadas apenas para posicionar os pontos no gráfico de dispersão.' },
    ],
  },
  associacao: {
    titulo: 'Regras de associação',
    tabelaBanco: 'tbl_multi_enade_associacao',
    colunas: [
      { coluna: 'antecedents', descricao: 'Condição "se": resposta(s) que, quando presentes, precedem o padrão encontrado. Cada item é uma percepção com o nível da resposta (1–6) ou a banda de desempenho do curso.' },
      { coluna: 'consequents', descricao: 'Condição "então": resposta que tende a ocorrer junto com o antecedente.' },
      { coluna: 'support', descricao: 'Suporte: percentual de alunos em que essa combinação de respostas ocorre em toda a base (mínimo 3%).' },
      { coluna: 'confidence', descricao: 'Confiança: percentual de vezes que o consequente ocorre quando o antecedente já ocorreu (mínimo 50%).' },
      { coluna: 'lift', descricao: 'Lift: quantas vezes mais provável é o consequente ocorrer com o antecedente do que por acaso (>1 indica associação real, não coincidência).' },
      { coluna: 'id', descricao: 'Posição da regra no ranking por lift (1 = maior lift).' },
    ],
  },
}
