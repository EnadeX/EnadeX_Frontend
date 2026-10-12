import { BookOpen, Cpu, Database, FileText, GitBranch } from 'lucide-react'

import { PageSection } from '../_components/layout/PageSection'
import { Card, CardHeader } from '../_components/ui/Card'

export default function EnadeTimeSobre() {
  return (
    <PageSection
      title="Sobre o projeto"
      description="ENADE-Time Distribuído — Sistema Paralelo de Análise Longitudinal dos Microdados do ENADE. Projeto acadêmico de Sistemas Paralelos e Distribuídos."
    >
      <Card>
        <CardHeader
          title="Escopo"
          description="Recorte definido para tornar o experimento tratável"
        />
        <ul className="list-disc space-y-1 pl-5 text-xs leading-6 text-[#536987]">
          <li>
            <strong>Cursos:</strong> Computação (CO_GRUPO ∈ {'{40, 4004}'}). São dois códigos para o{' '}
            <em>mesmo</em> curso: o INEP usou 40 nas edições de 2005 e 2008 e passou a 4004 a partir
            de 2011.
          </li>
          <li>
            <strong>Regiões:</strong> Norte e Nordeste (CO_REGIAO_CURSO ∈ {'{1, 2}'}).
          </li>
          <li>
            <strong>Edições do ENADE:</strong> 2005, 2008, 2011, 2014, 2017, 2021 (ciclos trienais;
            2021 é reaplicação pós-pandemia).
          </li>
          <li>
            <strong>Total processado:</strong> 24.967 inscrições consolidadas na tabela fato —{' '}
            <strong>582 cursos-ano</strong>, que é a unidade analítica (as linhas replicadas
            funcionam como peso por matrícula nas médias).
          </li>
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Arquitetura"
          description="Camadas independentes, integradas via PostgreSQL"
        />
        <div className="grid grid-cols-1 gap-4 text-xs leading-6 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Database className="mt-0.5 size-4 shrink-0 text-[#5f7393]" aria-hidden />
            <div>
              <div className="font-semibold text-[#111827]">Banco de dados</div>
              <div className="text-[#5f7393]">
                PostgreSQL 16 (Docker) local, o instrumento de medição do experimento: schema
                dimensional (fato + dimensões) e views agregadas. A publicação dos resultados no
                Supabase do ecossistema é uma etapa separada.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Cpu className="mt-0.5 size-4 shrink-0 text-[#5f7393]" aria-hidden />
            <div>
              <div className="font-semibold text-[#111827]">ETL paralelo</div>
              <div className="text-[#5f7393]">
                Python (pandas + ProcessPoolExecutor). Workers puros processando ano-a-ano; a{' '}
                <em>ordem de submissão</em> (crescente ou LPT) é uma variável do experimento, porque
                o executor entrega cada ano ao primeiro worker livre.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 size-4 shrink-0 text-[#5f7393]" aria-hidden />
            <div>
              <div className="font-semibold text-[#111827]">API read-only</div>
              <div className="text-[#5f7393]">
                FastAPI + psycopg2 (<code>enade_time/</code> no EnadeX, rotas em{' '}
                <code>/api/enade-time</code>), pool de conexões preguiçoso, sem ORM. Quando o banco
                está fora, responde 503 em vez de derrubar a API. CORS restrito ao frontend em{' '}
                <code>localhost:3000</code>.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-[#5f7393]" aria-hidden />
            <div>
              <div className="font-semibold text-[#111827]">Dashboard</div>
              <div className="text-[#5f7393]">
                Next.js 16 (App Router) no frontend do EnadeX, com TanStack Query e Recharts,
                consumindo a API HTTP do ENADE-Time. A SPA original em Vite fica preservada como
                artefato do TCC.
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Metodologia do benchmark (campanha v2)"
          description="Métricas-padrão de paralelismo, pareadas por suíte"
        />
        <p className="text-xs leading-6 text-[#536987]">
          Uma <strong>campanha</strong> tem várias suítes; cada suíte roda um sequencial e, em
          seguida, as configurações paralelas (2, 3, 4 e 6 workers, em duas ordens de submissão).
          Cada paralela é comparada com o sequencial da <em>própria</em> suíte — definição única, em
          SQL (<code>v_benchmark_metricas</code>); o dashboard mostra a mediana por configuração com
          mínimo e máximo entre suítes. As métricas são:
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-xs leading-6 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[#111827]">Speedup</dt>
            <dd className="text-[#5f7393]">
              S(p) = T(1) / T(p) — quantas vezes mais rápido que o sequencial.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#111827]">Eficiência</dt>
            <dd className="text-[#5f7393]">E(p) = S(p) / p — fração do speedup ideal alcançada.</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#111827]">Throughput</dt>
            <dd className="text-[#5f7393]">Linhas processadas por segundo de processamento.</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#111827]">Condições declaradas</dt>
            <dd className="text-[#5f7393]">
              Máquina com núcleos físicos e lógicos registrados, passada de aquecimento descartada
              (cache quente declarado), CPU ociosa medida antes de começar, CPU média e bytes lidos
              do disco por execução; sempre fora do OneDrive.
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Fases do projeto" description="Estado atual e roadmap" />
        <ul className="list-decimal space-y-1 pl-5 text-xs leading-6 text-[#536987]">
          <li>
            <strong>Fase 1 (concluída):</strong> ETL inicial e schema PostgreSQL.
          </li>
          <li>
            <strong>Fase 2 (concluída):</strong> Benchmark sequencial vs. paralelo (primeiras
            rodadas com 2 e 4 workers).
          </li>
          <li>
            <strong>Fase 3 (concluída):</strong> API FastAPI read-only para consumo pelo dashboard.
          </li>
          <li>
            <strong>Fase 4 (concluída):</strong> Dashboard React/Vite, agora portado para o Next.js
            do EnadeX.
          </li>
          <li>
            <strong>Fase 5 (concluída):</strong> Empacotamento e documentação — Dockerfile da API e
            serviço opcional no docker-compose.
          </li>
          <li>
            <strong>Fase 6 (atual):</strong> Benchmark v2 — correção do baseline do comparativo
            (pareamento por suíte), ordem de submissão como variável, campanha oficial com
            repetições e instrumentação — e migração para o ecossistema EnadeX (
            <code>enade_time/</code>).
          </li>
        </ul>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#5f7393]">
          <GitBranch className="size-3.5" aria-hidden />
          Projeto acadêmico — sem fins comerciais.
        </div>
      </Card>
    </PageSection>
  )
}
