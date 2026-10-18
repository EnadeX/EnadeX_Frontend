import type { Topico } from './constants'

export interface PassoMetodologia {
  titulo: string
  descricao: string
}

export interface MetodologiaTopico {
  titulo: string
  resumo: string
  fontes: string[]
  passos: PassoMetodologia[]
}

// Descreve, passo a passo, como cada subprojeto sai do dado bruto do ENADE até o
// gráfico final. Espelha a lógica dos scripts modelo_*.py e as decisões registradas em
// EnadeX/multi_enade/EXPLORACAO_MODELO_*.md.
export const METODOLOGIA: Record<Topico, MetodologiaTopico> = {
  regressao: {
    titulo: 'Modelagem supervisionada',
    resumo: 'Mede o peso de fatores socioeconômicos e acadêmicos sobre a nota dos cursos de Computação do Norte e do Nordeste, usando um modelo preditivo (Random Forest) e explicando suas decisões com SHAP. No conjunto de teste, o modelo explica cerca de metade da variação da nota (R² = 0,498).',
    fontes: [
      'tbl_arq3_2021 (notas)',
      'tbl_arq4_2021 (percepções)',
      'tbl_arq21_2021 (cotas)',
      'tbl_arq2/10/14/15/16/17/18/19/25/30_2021 (perfil socioeconômico, bolsas e incentivos)',
    ],
    passos: [
      {
        titulo: 'Recorte e limpeza por fonte',
        descricao: 'Só entram cursos de Computação do Norte e do Nordeste. Notas (NT_GER) nulas ou zeradas são descartadas. Nas percepções (QE_I57), só "não sei" (7) e "não se aplica" (8) são excluídos — o 6 é "concordo totalmente", a resposta mais positiva. Respostas por letra (renda, escolaridade, trabalho) viram escalas ordinais; respostas de categoria (cotas, bolsas, auxílios) viram colunas binárias (one-hot).',
      },
      {
        titulo: 'Agregação por curso',
        descricao: 'As respostas de cada tabela são resumidas por curso (CO_CURSO): média nas escalas e proporção de alunos em cada categoria. Cursos com menos de 5 alunos saem da base, porque a média de poucos alunos é instável. Ficam 161 cursos.',
      },
      {
        titulo: 'Índice socioeconômico (PCA)',
        descricao: 'Renda familiar (QE_I08), situação financeira (QE_I09) e intensidade de trabalho (QE_I10) medem o mesmo fundo socioeconômico e já eram fortes isoladamente. Um PCA condensa as três em dois eixos, PCA_ECON_1 e PCA_ECON_2 (94,7% da variação). O 1º eixo sozinho explica 71%.',
      },
      {
        titulo: 'Seleção de variáveis',
        descricao: 'Mais de 90 variáveis candidatas foram testadas com validação cruzada. O melhor conjunto tem 14: o índice socioeconômico, bolsas acadêmicas (QE_I13), idioma estrangeiro (QE_I24), escolaridade do pai (QE_I04), cotas por renda e por múltiplos critérios (QE_I15), turno noturno, domínio docente (QE_I57), incentivo dos pais (QE_I19), curso gratuito (QE_I11) e auxílio permanência (QE_I12).',
      },
      {
        titulo: 'Treino e avaliação (Random Forest)',
        descricao: 'Um Random Forest de 200 árvores (profundidade máxima 5) prevê a nota geral. Cursos com mais alunos pesam mais (sample_weight = QT_ALUNOS). O modelo é avaliado em 20% dos cursos, nunca vistos no treino: R² = 0,498, MAE = 3,03 e RMSE = 3,82. Depois é reajustado com 100% dos cursos para publicar.',
      },
      {
        titulo: 'Explicabilidade (SHAP)',
        descricao: 'A técnica SHAP (SHapley Additive exPlanations) calcula, para cada curso e cada variável, o quanto aquela variável empurrou a previsão para cima ou para baixo. A média desses valores em módulo gera o ranking de "Importância global". Atenção: a bolsa de iniciação científica (QE_I13_B) tende a ir para quem já é bom aluno; é mais um marcador do que uma causa.',
      },
      {
        titulo: 'Saída para o site',
        descricao: 'A tabela final (NT_GER, NT_GER_PREVISTA e as 14 variáveis) é gravada em tbl_multi_enade_regressao e os valores SHAP em tbl_multi_enade_shap. Elas alimentam os cards de R²/MAE/RMSE, o gráfico "Índice socioeconômico × Nota" e a importância global.',
      },
    ],
  },
  clusters: {
    titulo: 'Agrupamento de perfis',
    resumo: 'Segmenta os cursos em 3 grupos com perfil semelhante de infraestrutura, ingresso por cotas e bolsa ou financiamento — sem usar a nota para formar os grupos, só para nomeá-los depois.',
    fontes: ['tbl_arq3_2021 (notas)', 'tbl_arq4_2021 (infraestrutura)', 'tbl_arq21_2021 (cotas)', 'tbl_arq17_2021 (bolsa/financiamento)'],
    passos: [
      {
        titulo: 'Tratamento por fonte',
        descricao: 'Infraestrutura das aulas práticas (QE_I63), forma de ingresso (QE_I15) e bolsa ou financiamento (QE_I11) são categóricas: cada resposta vira uma coluna (one-hot) e calcula-se a proporção de alunos do curso em cada uma. Em QE_I63, "não sei" (7) e "não se aplica" (8) são excluídos. Cursos com menos de 5 alunos saem.',
      },
      {
        titulo: 'Junção (inner join)',
        descricao: 'As tabelas tratadas são unidas por curso (CO_CURSO), formando uma linha por curso. Ficam 161 cursos.',
      },
      {
        titulo: 'Padronização (StandardScaler)',
        descricao: 'Todas as variáveis são padronizadas para média 0 e desvio-padrão 1, para nenhuma dominar o agrupamento só por ter números maiores.',
      },
      {
        titulo: 'Agrupamento (K-Means, 3 grupos)',
        descricao: 'O K-Means agrupa os cursos em 3 grupos, minimizando a distância entre cursos do mesmo grupo. A nota (NT_GER) fica fora: usá-la para formar os grupos e depois nomeá-los por ela seria circular. A bolsa ou financiamento (QE_I11) entrou porque separa cursos gratuitos de pagos e deixou os grupos mais coesos (silhouette de 0,142 para 0,211).',
      },
      {
        titulo: 'Nomeação pelos resultados',
        descricao: 'Depois de formados, os grupos são nomeados pelo ranking de nota média: Desempenho Alto (73 cursos, quase todos gratuitos), Médio (16) e Baixo (72). O número do cluster (Cluster_ID) é arbitrário e pode mudar entre retreinos; o nome não.',
      },
      {
        titulo: 'Redução para 2D (PCA)',
        descricao: 'O PCA projeta todas as variáveis em 2 eixos (PCA_X, PCA_Y), só para desenhar os cursos num gráfico de dispersão. Os eixos não têm significado direto — importa a distância relativa entre os pontos.',
      },
      {
        titulo: 'Saída para o site',
        descricao: 'A tabela com Cluster_ID, PCA_X e PCA_Y é gravada em tbl_multi_enade_clusters; o nome do grupo é calculado pelo endpoint. Ela alimenta o gráfico de dispersão da aba Clusters.',
      },
    ],
  },
  associacao: {
    titulo: 'Regras de associação',
    resumo: 'Encontra padrões de "se o aluno respondeu A, tende a responder B também" entre seis percepções de temas diferentes e a banda de desempenho do curso, usando o algoritmo Apriori.',
    fontes: ['tbl_arq4_2021 (percepções QE_I57, QE_I61, QE_I34, QE_I44, QE_I30, QE_I56)', 'tbl_arq3_2021 (notas, para a banda de desempenho)'],
    passos: [
      {
        titulo: 'Seleção e limpeza',
        descricao: 'Seis perguntas, uma por tema: domínio dos professores (QE_I57), salas de aula (QE_I61), pensamento crítico (QE_I34), iniciação científica (QE_I44), aprendizagem inovadora (QE_I30) e disponibilidade dos professores (QE_I56). "Não sei" (7) e "não se aplica" (8) são excluídos.',
      },
      {
        titulo: 'Banda de desempenho do curso',
        descricao: 'A cada aluno é anexada a banda do seu curso — alto, médio ou baixo, pelos tercis da nota média. É uma característica do curso, ligada por CO_CURSO; os arquivos do INEP não permitem ligar respostas do mesmo aluno entre arquivos.',
      },
      {
        titulo: 'Codificação binária',
        descricao: 'Cada combinação pergunta + nível de resposta (1 a 6) e cada banda de desempenho viram uma coluna verdadeiro/falso por aluno.',
      },
      {
        titulo: 'Itens frequentes e regras (Apriori)',
        descricao: 'O Apriori mantém as combinações que aparecem em pelo menos 3% dos alunos e monta regras "se A, então B" com confiança de pelo menos 50%. Esses limiares foram os únicos que permitem regras ligadas a desempenho e foram conferidos em duas metades independentes da base.',
      },
      {
        titulo: 'Filtro e ordenação',
        descricao: 'Regras com mais de 3 itens são descartadas por serem permutações do mesmo padrão. As restantes são ordenadas por lift e só as 50 primeiras são publicadas. A maioria liga percepções entre si (quem está satisfeito com um aspecto tende a estar com os outros); poucas envolvem desempenho.',
      },
      {
        titulo: 'Saída para o site',
        descricao: 'As regras são gravadas em tbl_multi_enade_associacao e alimentam a tabela da aba "Regras de associação".',
      },
    ],
  },
}
