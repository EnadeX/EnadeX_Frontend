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
// gráfico final. Espelha exatamente a lógica dos scripts modelo_*.py.
export const METODOLOGIA: Record<Topico, MetodologiaTopico> = {
  regressao: {
    titulo: 'Modelagem supervisionada',
    resumo: 'Mede o peso de fatores socioeconômicos e acadêmicos sobre a nota do curso, usando um modelo preditivo (Random Forest) e explicando suas decisões com SHAP.',
    fontes: ['tbl_arq3_2021 (notas)', 'tbl_arq4_2021 (percepções)', 'tbl_arq21_2021 (cotas)', 'tbl_arq29_2021 (dedicação)'],
    passos: [
      {
        titulo: 'Limpeza por fonte',
        descricao: 'Cada uma das 4 tabelas brutas passa por um tratamento próprio: notas (NT_GER) são convertidas para número e valores nulos ou zerados são descartados; respostas de percepção (QE_I63, QE_I57) descartam os códigos 6, 7 e 8 (não sei / não se aplica / anulado), que quebrariam a escala; o campo de cota (QE_I15) é padronizado (maiúsculas, sem espaços) e transformado em colunas binárias (one-hot); a dedicação aos estudos (QE_I23) é convertida de letras (A–E) para uma escala numérica ordinal de 1 a 5.',
      },
      {
        titulo: 'Agregação por curso',
        descricao: 'As respostas individuais de cada tabela são resumidas pela média por curso (CO_CURSO). A quantidade de alunos que entrou em cada média (QT_ALUNOS) é guardada à parte, para ser usada como peso mais adiante.',
      },
      {
        titulo: 'Junção (inner join)',
        descricao: 'As 4 tabelas agregadas são unidas pelo código do curso. Só permanecem na base final os cursos que têm dado disponível nas 4 fontes ao mesmo tempo — por isso a base final (648 cursos) é menor que a soma das respostas brutas.',
      },
      {
        titulo: 'Treino do modelo (Random Forest)',
        descricao: 'Um Random Forest Regressor — um conjunto de 200 árvores de decisão que juntas votam numa previsão — é treinado para prever a nota geral (NT_GER) a partir das demais variáveis. Cursos com mais alunos pesam mais no treino (sample_weight = QT_ALUNOS), para que um curso de 5 alunos não tenha o mesmo peso que um de 500.',
      },
      {
        titulo: 'Geração da previsão',
        descricao: 'O modelo treinado é aplicado sobre a própria base, gerando a coluna NT_GER_PREVISTA — a nota que o modelo estimaria para aquele curso a partir dos seus fatores.',
      },
      {
        titulo: 'Explicabilidade (SHAP)',
        descricao: 'A técnica SHAP (SHapley Additive exPlanations) calcula, para cada curso e cada variável, o quanto aquela variável específica empurrou a previsão para cima ou para baixo. A média desses valores em módulo, por variável, gera o ranking mostrado no gráfico "Importância global".',
      },
      {
        titulo: 'Saída para o site',
        descricao: 'A tabela final (com NT_GER, NT_GER_PREVISTA e as variáveis de entrada) é gravada em tbl_multi_enade_regressao e alimenta o gráfico "Dedicação × Nota" e os cards de R²/MAE/RMSE.',
      },
    ],
  },
  clusters: {
    titulo: 'Agrupamento de perfis',
    resumo: 'Segmenta os cursos em grupos com perfil pedagógico semelhante, combinando desempenho acadêmico, infraestrutura e diversidade de ingresso — sem usar a nota como alvo, apenas como mais uma característica.',
    fontes: ['tbl_arq3_2021 (notas)', 'tbl_arq4_2021 (infraestrutura)', 'tbl_arq21_2021 (cotas)'],
    passos: [
      {
        titulo: 'Tratamento por fonte',
        descricao: 'A nota (NT_GER) é resumida pela média por curso. Já a infraestrutura (QE_I63) e o perfil de ingresso (QE_I15) são variáveis categóricas: cada categoria de resposta vira uma coluna própria (one-hot encoding) e, em seguida, calcula-se a proporção de alunos do curso em cada categoria.',
      },
      {
        titulo: 'Junção (inner join)',
        descricao: 'As três tabelas tratadas são unidas por curso (CO_CURSO), formando uma única linha por curso com todas as variáveis dos três pilares.',
      },
      {
        titulo: 'Padronização (StandardScaler)',
        descricao: 'Como as variáveis têm escalas diferentes (nota vai de 0 a 100, proporções vão de 0 a 1), todas são padronizadas para média 0 e desvio-padrão 1. Sem esse passo, a nota dominaria o agrupamento só por ter números maiores.',
      },
      {
        titulo: 'Agrupamento (K-Means)',
        descricao: 'O algoritmo K-Means agrupa os cursos em K grupos, minimizando a distância entre cursos do mesmo grupo. O valor de K é definido manualmente no treinamento (parâmetro num_clusters) — confirmar qual é o valor atualmente em uso, já que a documentação e a última execução mostraram números diferentes.',
      },
      {
        titulo: 'Redução para 2D (PCA)',
        descricao: 'Como os dados têm muitas dimensões (uma para cada categoria), o PCA projeta tudo em apenas 2 eixos (PCA_X, PCA_Y), só para tornar possível desenhar os cursos num gráfico de dispersão. Os eixos em si não têm um significado direto — o que importa é a distância relativa entre os pontos.',
      },
      {
        titulo: 'Saída para o site',
        descricao: 'A tabela com Cluster_ID, PCA_X e PCA_Y é gravada em tbl_multi_enade_clusters e alimenta o gráfico de dispersão da aba Clusters.',
      },
    ],
  },
  associacao: {
    titulo: 'Regras de associação',
    resumo: 'Encontra padrões de "se o aluno respondeu A, tende a responder B também" entre percepções sobre os professores e a inovação do curso, usando o algoritmo Apriori.',
    fontes: ['tbl_arq4_2021 (percepções QE_I57, QE_I56, QE_I30)'],
    passos: [
      {
        titulo: 'Seleção e limpeza',
        descricao: 'Apenas as respostas de domínio docente (QE_I57), disponibilidade dos professores (QE_I56) e inovação do curso (QE_I30) são usadas. Alunos com qualquer uma dessas respostas em branco são descartados.',
      },
      {
        titulo: 'Codificação binária',
        descricao: 'Cada uma das 3 perguntas tem 8 categorias de resposta possíveis (1 a 8). Com one-hot encoding, cada combinação pergunta+categoria vira uma coluna True/False — resultando em até 24 colunas binárias por aluno.',
      },
      {
        titulo: 'Itens frequentes (Apriori)',
        descricao: 'O algoritmo Apriori percorre as combinações de respostas e mantém apenas aquelas que aparecem juntas com uma frequência mínima na base (suporte mínimo configurado no treino, ex.: 25%).',
      },
      {
        titulo: 'Geração das regras',
        descricao: 'A partir dos itens frequentes, o algoritmo monta regras no formato "se A, então B", mantendo apenas as que atingem uma confiança mínima (ex.: 70% — ou seja, quando A ocorre, B ocorre pelo menos 70% das vezes).',
      },
      {
        titulo: 'Métricas e ordenação',
        descricao: 'Cada regra recebe 3 métricas: suporte (frequência da combinação na base toda), confiança (probabilidade condicional de B dado A) e lift (quantas vezes mais provável é essa combinação ocorrer do que se fosse pura coincidência). As regras são ordenadas por confiança e lift, do maior para o menor.',
      },
      {
        titulo: 'Saída para o site',
        descricao: 'A tabela de regras formatada é gravada em tbl_multi_enade_associacao e alimenta a tabela da aba "Regras de associação".',
      },
    ],
  },
}
