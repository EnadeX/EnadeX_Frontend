'use client'

import { Database, FlaskConical, Layers, ShieldAlert, ShieldCheck, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { PageSection } from '../_components/layout/PageSection'
import { Card } from '../_components/ui/Card'
import { API_BASE } from '@/lib/educluster/api'
import { useDimensoes } from '@/lib/educluster/hooks/useEduCluster'
import { DIMENSOES, ROTULO_DIMENSAO } from '@/lib/educluster/rotulos'

function Bloco({ icone: Icone, titulo, children }: { icone: LucideIcon; titulo: string; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-marca-sm border border-accent bg-surface-card text-accent">
          <Icone className="size-4" aria-hidden />
        </span>
        <h3 className="text-h3">{titulo}</h3>
      </div>
      <div className="mt-3 space-y-2 text-body text-ink">{children}</div>
    </Card>
  )
}

const CAMADAS = [
  ['Dados', 'Microdados do INEP carregados e conferidos célula por célula em tabelas próprias do EduCluster no Supabase.'],
  ['Preparo', 'Limpeza da escala do questionário, derivação da área pelo gabarito do CE e agregação por curso.'],
  ['Modelos', 'StandardScaler, K-Means e PCA treinados e salvos em joblib; regras e correlações para A3, A4 e A8.'],
  ['API', 'FastAPI com rotas por recurso (cursos, estudantes, catálogo). Entrega análise pronta, nunca o microdado.'],
  ['Painel', 'Este módulo: só desenha e pede novas análises (por exemplo outro k). Nenhuma estatística é calculada no navegador.'],
  ['Interpretação', 'Descrição dos perfis gerada por IA no backend, com cache: a chave fica fora do navegador e o texto é reproduzível.'],
]

export default function Sobre() {
  const dimensoes = useDimensoes()

  return (
    <PageSection
      title="Método e limitações"
      description="Como o EduCluster chega aos perfis, como eles são validados e o que a análise não permite concluir."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Bloco icone={Database} titulo="Dados e a restrição da LGPD">
          <p>
            Microdados do ENADE 2021 publicados pelo INEP na versão LGPD: 43 arquivos com os mesmos 489.866
            registros, sem identificador do estudante e com cada arquivo embaralhado de forma independente. A linha N
            de um arquivo não é o mesmo estudante da linha N de outro.
          </p>
          <p>
            Por isso o cruzamento entre desempenho (arq3) e percepção do curso (arq4) é feito agregando os dois por
            CO_CURSO. O curso vira a unidade de análise, e a área de avaliação é recuperada pelo gabarito do
            componente específico, que é único por área.
          </p>
        </Bloco>

        <Bloco icone={Layers} titulo="Variáveis da análise central">
          <p>
            Desempenho: notas médias de formação geral (NT_FG) e componente específico (NT_CE). A nota geral fica de
            fora porque é combinação exata das duas. Presença: proporção de inscritos presentes com resultado válido.
          </p>
          <p>Percepção: média por curso de três blocos de assertivas do questionário do estudante (escala de 1 a 6):</p>
          <ul className="list-disc space-y-1 pl-5 text-small">
            {DIMENSOES.map((d) => {
              const itens = dimensoes.data?.[d]?.itens
              return (
                <li key={d}>
                  <strong className="font-medium">{d}</strong>, {ROTULO_DIMENSAO[d]}
                  {itens && itens.length > 0 && `: ${itens.length} itens, ${itens[0]} a ${itens[itens.length - 1]}`}
                </li>
              )
            })}
          </ul>
          <p className="text-small text-ink-muted">
            Os códigos 7 (não sei responder) e 8 (não se aplica) viram nulo antes das médias; o 6 é resposta válida.
          </p>
        </Bloco>

        <Bloco icone={Workflow} titulo="Pipeline">
          <ol className="space-y-2">
            {CAMADAS.map(([nome, texto], i) => (
              <li key={nome} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-caption font-medium text-on-accent">
                  {i + 1}
                </span>
                <span>
                  <strong className="font-medium">{nome}.</strong> {texto}
                </span>
              </li>
            ))}
          </ol>
        </Bloco>

        <Bloco icone={ShieldCheck} titulo="Validação e reprodutibilidade">
          <ul className="list-disc space-y-1 pl-5">
            <li>Número de perfis escolhido pelo silhouette, com k de 2 a 8.</li>
            <li>Variância explicada pelo PCA e número de componentes para 90%.</li>
            <li>ARI contra a área, para conferir que os perfis não são só um espelho da área.</li>
            <li>Estabilidade por reamostragem de 80% da base, medida pelo ARI.</li>
            <li>Comparação com a análise tradicional, a divisão dos cursos em terços pela nota média.</li>
            <li>Semente 42 e n_init 10 em todo K-Means; modelos e resultados versionados lado a lado.</li>
          </ul>
        </Bloco>

        <Bloco icone={ShieldAlert} titulo="Limitações">
          <ul className="list-disc space-y-1 pl-5">
            <li>Clusterização descreve associações; não estabelece causalidade.</li>
            <li>O K-Means sempre devolve grupos, mesmo sem divisão real. Nenhum critério isolado valida o resultado.</li>
            <li>As respostas do questionário se concentram no topo da escala (efeito teto), o que reduz a variância da percepção.</li>
            <li>A área é um confundidor forte; comparações justas são dentro da área (aba Discrepantes).</li>
            <li>Pedagogia concentra quase metade dos estudantes da base e pesa nos agregados.</li>
            <li>A edição 2021 avaliou licenciaturas, ciências, computação e cursos de TI; não há Medicina, Direito ou Engenharias.</li>
            <li>Médias de curso não descrevem indivíduos: inferir sobre o estudante a partir delas seria falácia ecológica.</li>
          </ul>
        </Bloco>

        <Bloco icone={FlaskConical} titulo="Integração com o EnadeX">
          <p>
            O módulo consome a API do EduCluster em <code className="rounded-marca-sm bg-surface-sunken px-1 font-mono text-small">{API_BASE}</code>,
            definida pela variável NEXT_PUBLIC_EDUCLUSTER_API_URL. Em desenvolvimento o backend roda sozinho na
            porta 8001; no api_main.py do grupo basta incluir o router do EduCluster e apontar a variável para a
            porta 8000.
          </p>
          <p className="text-small text-ink-muted">
            A primeira consulta depois que a API sobe baixa a base do Supabase (cerca de 1 minuto); as seguintes
            saem do cache em memória.
          </p>
        </Bloco>
      </div>
    </PageSection>
  )
}
