'use client'

import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  CircleHelp,
  Database,
  GitBranch,
  GraduationCap,
  Layers3,
  LineChart,
  Network,
  ShieldCheck,
  Sparkles,
  Table2,
  Waypoints,
} from 'lucide-react'
import Link from 'next/link'
import { CabecalhoSite } from '@/components/brand/layout/CabecalhoSite'
import { RodapeSite } from '@/components/brand/layout/RodapeSite'
import { badge, botao, botaoPrimario, card, kpiRotulo, kpiValor, link, navItem, navItemAtivo, skeleton } from '@/lib/brand/classes'
import { useKpisHome } from '@/lib/home/kpis'
import { cn } from '@/lib/utils'

const projects = [
  {
    name: 'MultiENADE',
    eyebrow: 'Descoberta de padrões',
    description: 'Explora relações multidimensionais entre perfis socioeconômicos, instituições e desempenho acadêmico.',
    tags: ['Machine Learning', 'SHAP'],
    icon: BrainCircuit,
    accent: 'blue',
    href: '/multienade',
  },
  {
    name: 'E-XplainENADE',
    eyebrow: 'Modelagem estatística',
    description: 'Transforma modelos preditivos em evidências interpretáveis para apoiar decisões educacionais.',
    tags: ['Regressão', 'VIF'],
    icon: Sparkles,
    accent: 'violet',
    href: '/e-xplainenade',
  },
  {
    name: 'EduCluster',
    eyebrow: 'Perfis latentes',
    description: 'Agrupa cursos e estudantes em perfis latentes, cruzando o desempenho na prova com a qualidade do curso percebida pelos estudantes.',
    tags: ['K-Means', 'Clusterização'],
    icon: Network,
    accent: 'teal',
    href: '/educluster',
  },
  {
    name: 'ENADE-Time',
    eyebrow: 'Análise longitudinal',
    description: 'Acompanha mudanças e tendências no tempo com uma visão histórica das edições harmonizadas.',
    tags: ['Séries históricas', '2005–2021'],
    icon: LineChart,
    accent: 'amber',
    href: '/enade-time',
  },
]

// Um KPI por subprojeto; os valores vêm das APIs de cada módulo (lib/home/kpis.ts).
const kpis = [
  { chave: 'multiEnade', projeto: 'MultiENADE', label: 'Regras de associação', icon: Waypoints },
  { chave: 'explain', projeto: 'E-XplainENADE', label: 'Estudantes representados', icon: GraduationCap },
  { chave: 'eduCluster', projeto: 'EduCluster', label: 'Cursos agrupados', icon: BookOpen },
  { chave: 'enadeTime', projeto: 'ENADE-Time', label: 'Edições harmonizadas', icon: Layers3 },
] as const

// Metodologia e documentação: textos de EnadeX_Documentacao (README geral e "Fases do projeto ENADEX.pdf").
const DSR_PROPOSTA = [
  'Identificar problemas concretos na exploração dos microdados.',
  'Construir artefatos analíticos justificáveis e reprodutíveis.',
  'Avaliar empiricamente estabilidade, utilidade e interpretabilidade.',
  'Produzir contribuição científica teórica e prática para Ciência de Dados e Sistemas Analíticos na educação.',
]

const FASES_DSR = [
  'Identificação do problema',
  'Definição dos objetivos da solução',
  'Revisão sistemática ou mapeamento',
  'Definição do artefato',
  'Construção do artefato',
  'Avaliação',
  'Contribuição científica',
  'Generalização e limitações',
]

const PROTOCOLO = [
  'Mesma lógica de avaliação: tradicional vs artefato.',
  'Mesma estratégia de validação por especialistas.',
  'Mesma preocupação com interpretabilidade e utilidade.',
]

const INFRAESTRUTURA = [
  'Ingestão e versionamento',
  'ETL padronizado',
  'Harmonização longitudinal',
  'Dataset curado consolidado',
  'Feature Store / views analíticas',
  'Orquestração e reprodutibilidade',
  'Camada de serviços analíticos (API)',
]

const DOCS_REPO = 'https://github.com/EnadeX/EnadeX_Documentacao'

const documentos = [
  { pasta: '00_EnadeX_Geral', titulo: 'Visão geral do ecossistema', descricao: 'Proposta, fases DSR de cada subprojeto, entregáveis, marca, referências e microdados do INEP.', icon: Layers3 },
  { pasta: '01_MultiENADE', titulo: 'MultiENADE', descricao: 'Mapeamento Multidimensional de Fatores Associados ao Desempenho no ENADE.', autor: 'Danilo Fernandes Araujo Gama', icon: BrainCircuit },
  { pasta: '02_E-XplainENADE', titulo: 'E-XplainENADE', descricao: 'Uma Arquitetura Computacional para Modelagem Explicável de Fatores Associados ao Desempenho Acadêmico.', autor: 'João Pedro Ribeiro Batista Araujo', icon: Sparkles },
  { pasta: '03_EduCluster', titulo: 'EduCluster', descricao: 'Painel Interativo para Descoberta de Perfis Acadêmicos Latentes no ENADE.', autor: 'Paulo Gosik Mascarenhas Moita', icon: Network },
  { pasta: '04_ENADE-Time', titulo: 'ENADE-Time', descricao: 'Análise Temporal Interativa de Indicadores Acadêmicos com Base em Microdados do ENADE.', autor: 'Lucas Eduardo Tavares Costa', icon: LineChart },
]

// Barras do cartão "Status da plataforma": escala sequencial da marca, da mais clara à mais escura.
const SEQ = ['bg-seq-1', 'bg-seq-2', 'bg-seq-3', 'bg-seq-4', 'bg-seq-5']

export default function Home() {
  const indicadores = useKpisHome()
  const { serie } = indicadores
  const maiorAno = serie.status === 'ok' ? Math.max(...serie.anos.map((a) => a.total_registros)) : 0

  return (
    <main className="min-h-screen bg-surface-page font-marca text-body text-ink">
      <CabecalhoSite
        href="#overview"
        marca={<span className={badge.info}>v2021+</span>}
      >
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          <a href="#overview" className={navItemAtivo}>Visão geral</a>
          <a href="#projects" className={navItem}>Subprojetos</a>
          <a href="#methodology" className={navItem}>Metodologia DSR</a>
          <a href="#documentation" className={navItem}>Documentação</a>
        </nav>

        <Link href="/repositorios" className={cn(botao, 'px-3')}>
          <GitBranch className="size-4" /> Repositório
        </Link>
      </CabecalhoSite>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section id="overview" className="grid gap-12 border-b border-border py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <div className={cn(badge.info, 'mb-6 gap-2 px-3 py-1 text-small')}>
              <span className="size-1.5 rounded-full bg-accent" /> Base ENADE 2021
            </div>
            <h1 className="max-w-3xl text-display text-ink">
              Mapeamento multidimensional e <span className="text-accent">explicável</span> dos microdados do ENADE.
            </h1>
            <p className="mt-6 max-w-2xl text-h3 font-normal text-ink-muted">
              Uma plataforma integrada baseada em Design Science Research para descobrir padrões socioeconômicos, institucionais e pedagógicos no ensino superior.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className={botaoPrimario}>Explorar subprojetos <ArrowUpRight className="size-4" /></a>
              <a href="#methodology" className={botao}>Como funciona <CircleHelp className="size-4 text-ink-muted" /></a>
            </div>
          </div>
          <div className={card}>
            <div className="flex items-start justify-between">
              <div>
                <p className={kpiRotulo}>Status da plataforma</p>
                <p className="mt-2 text-h2 text-ink">Dados prontos para análise</p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-full border border-success text-success"><Check className="size-4" /></span>
            </div>
            {/* Inscrições por edição na série histórica do ENADE-Time. */}
            <div className="mt-8 flex h-14 items-end gap-1.5">
              {serie.status === 'ok'
                ? serie.anos.map((a, index) => <span key={a.nu_ano} title={`${a.nu_ano}: ${a.total_registros.toLocaleString('pt-BR')} inscrições`} className={cn('flex-1 rounded-t-sm', SEQ[Math.floor((index * SEQ.length) / serie.anos.length)])} style={{ height: `${Math.max(8, (a.total_registros / maiorAno) * 100)}%` }} />)
                : <span className={cn(skeleton, 'h-full flex-1', serie.status === 'erro' && 'animate-none')} />}
            </div>
            <div className="mt-3 flex justify-between text-caption text-ink-muted num">
              {serie.status === 'ok' ? serie.anos.map((a) => <span key={a.nu_ano} className="flex-1 text-center">{a.nu_ano}</span>) : <span>{serie.status === 'erro' ? 'Série histórica indisponível' : 'Carregando série histórica…'}</span>}
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-b border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ chave, projeto, label, icon: Icon }) => {
            const kpi = indicadores[chave]
            return (
              <div key={chave} className={cn(card, 'flex items-start gap-3 p-4')} aria-busy={kpi.status === 'carregando'}>
                <Icon className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1">
                  <p className={kpiRotulo}>{label}</p>
                  {kpi.status === 'carregando' ? <span className={cn(skeleton, 'mt-2 block h-8 w-24')} /> : <p className={cn(kpiValor, 'num')}>{kpi.status === 'ok' ? kpi.valor : '—'}</p>}
                  <p className="mt-1 text-caption text-ink-muted">{kpi.status === 'ok' ? kpi.detalhe : kpi.status === 'erro' ? 'Dados indisponíveis' : '\u00a0'}</p>
                  <p className="mt-2 text-caption font-medium text-accent">{projeto}</p>
                </div>
              </div>
            )
          })}
        </section>

        <section id="projects" className="py-16 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-small font-medium text-accent">Ecossistema</p><h2 className="mt-2 text-h1 text-ink">Subprojetos de pesquisa</h2></div><p className="hidden max-w-xs text-right text-body text-ink-muted sm:block">Quatro perspectivas complementares sobre os mesmos dados harmonizados.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(({ name, eyebrow, description, tags, icon: Icon, href }) => <article key={name} className={cn(card, 'flex flex-col transition-colors hover:border-border-control')}><div className="flex items-start justify-between"><Icon className="size-5 text-ink-muted" /><span className="text-caption text-ink-muted num">01 / 04</span></div><p className="mt-8 text-small text-ink-muted">{eyebrow}</p><h3 className="mt-1 text-h1 text-ink">{name}</h3><p className="mt-3 max-w-lg text-body text-ink-muted">{description}</p><div className="mt-auto flex items-center justify-between gap-4 pt-6"><div className="flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className={badge.neutro}>{tag}</span>)}</div><a href={href ?? '#'} className={cn(link, 'inline-flex shrink-0 items-center gap-1 text-small font-medium')}>Acessar módulo <ArrowUpRight className="size-3.5" /></a></div></article>)}
          </div>
        </section>

        <section id="methodology" className="border-t border-border py-16 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-small font-medium text-accent">Método</p>
              <h2 className="mt-2 max-w-sm text-h1 text-ink">Ciência orientada a dados, com contexto.</h2>
              <p className="mt-4 max-w-sm text-body text-ink-muted">O EnadeX combina rigor metodológico, transparência e ferramentas abertas para tornar a pesquisa educacional mais reprodutível.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3"><div className={cn(card, 'p-5')}><Database className="size-5 text-ink-muted" /><p className="mt-8 text-h3 text-ink">Dados harmonizados</p><p className="mt-2 text-small text-ink-muted">Variáveis organizadas para comparação entre edições.</p></div><div className={cn(card, 'p-5')}><Waypoints className="size-5 text-ink-muted" /><p className="mt-8 text-h3 text-ink">Análise integrada</p><p className="mt-2 text-small text-ink-muted">Múltiplos métodos, uma visão conectada.</p></div><div className={cn(card, 'p-5')}><ShieldCheck className="size-5 text-ink-muted" /><p className="mt-8 text-h3 text-ink">Explicabilidade</p><p className="mt-2 text-small text-ink-muted">Resultados claros, auditáveis e úteis.</p></div></div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h3 className="text-h2 text-ink">Design Science Research</h3>
              <p className="mt-3 max-w-sm text-body text-ink-muted">A DSR orienta a construção de conhecimento científico por meio da criação, implementação e avaliação de artefatos que resolvem problemas reais e relevantes. Em vez de apenas aplicar técnicas existentes, o projeto propõe:</p>
              <ul className="mt-4 flex max-w-sm flex-col gap-2">
                {DSR_PROPOSTA.map((item) => <li key={item} className="flex gap-2 text-small text-ink"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{item}</li>)}
              </ul>
            </div>
            <div>
              <p className={kpiRotulo}>Cada subprojeto percorre as oito fases com o seu próprio artefato</p>
              <ol className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {FASES_DSR.map((fase, index) => (
                  <li key={fase} className={cn(card, 'p-4')}>
                    <span className="text-caption text-ink-muted num">Fase {String(index + 1).padStart(2, '0')}</span>
                    <p className="mt-2 text-h3 text-ink">{fase}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <div className={cn(card, 'p-5')}>
              <ShieldCheck className="size-5 text-ink-muted" />
              <h3 className="mt-6 text-h3 text-ink">Protocolo metodológico compartilhado</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {PROTOCOLO.map((item) => <li key={item} className="flex gap-2 text-small text-ink-muted"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{item}</li>)}
              </ul>
            </div>
            <div className={cn(card, 'p-5')}>
              <Database className="size-5 text-ink-muted" />
              <h3 className="mt-6 text-h3 text-ink">Infraestrutura compartilhada</h3>
              <p className="mt-2 text-small text-ink-muted">Uma camada comum padroniza ingestão, harmonização, versionamento e disponibilização dos microdados para todos os módulos.</p>
              <ol className="mt-4 flex flex-wrap gap-2">
                {INFRAESTRUTURA.map((bloco, index) => <li key={bloco} className={badge.neutro}><span className="num text-ink-muted">{index + 1}.</span>&nbsp;{bloco}</li>)}
              </ol>
            </div>
          </div>
        </section>

        <section id="documentation" className="border-t border-border py-16 lg:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-small font-medium text-accent">Documentação</p>
              <h2 className="mt-2 text-h1 text-ink">Material de cada subprojeto</h2>
              <p className="mt-3 max-w-2xl text-body text-ink-muted">O repositório de documentação reúne o material comum a todos e uma pasta para cada um dos quatro subprojetos (TCCs).</p>
            </div>
            <a href={DOCS_REPO} target="_blank" rel="noreferrer" className={botao}><BookOpen className="size-4" /> Documentação completa <ArrowUpRight className="size-4" /></a>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentos.map(({ pasta, titulo, descricao, autor, icon: Icon }) => (
              <a key={pasta} href={`${DOCS_REPO}/tree/main/${pasta}`} target="_blank" rel="noreferrer" className={cn(card, 'group flex flex-col transition-colors hover:border-border-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring')}>
                <Icon className="size-5 text-ink-muted" />
                <p className={cn(kpiRotulo, 'mt-6 num')}>{pasta}</p>
                <h3 className="mt-1 text-h2 text-ink">{titulo}</h3>
                <p className="mt-2 text-small text-ink-muted">{descricao}</p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                  <span className="text-caption text-ink-muted">{autor ?? 'Todos os subprojetos'}</span>
                  <span className="flex shrink-0 items-center gap-1 text-small font-medium text-accent">Abrir <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <RodapeSite>
        <div className="flex flex-col gap-4 text-small text-ink-on-nav sm:flex-row sm:items-center sm:justify-between"><p>EnadeX · Pesquisa aplicada ao ensino superior</p><div className="flex flex-wrap gap-5"><span>Licença aberta</span><span>Conformidade LGPD</span><span>Referências ABNT / INEP</span></div></div>
      </RodapeSite>
    </main>
  )
}
