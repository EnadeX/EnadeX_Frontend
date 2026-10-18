'use client'

import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
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
import { useState } from 'react'
import { CabecalhoSite } from '@/components/brand/layout/CabecalhoSite'
import { RodapeSite } from '@/components/brand/layout/RodapeSite'
import { badge, botao, botaoPrimario, campo, card, kpiRotulo, kpiValor, link, navItem, navItemAtivo } from '@/lib/brand/classes'
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

const kpis = [
  { label: 'Estudantes processados', value: '1,2M', detail: '+18,4% vs. 2020', icon: GraduationCap },
  { label: 'Cursos analisados', value: '8.436', detail: '27 áreas de avaliação', icon: BookOpen },
  { label: 'Edições harmonizadas', value: '05', detail: '2017 até 2021', icon: Layers3 },
]

// Barras do cartão "Status da plataforma": escala sequencial da marca, da mais clara à mais escura.
const SEQ = ['bg-seq-1', 'bg-seq-2', 'bg-seq-3', 'bg-seq-4', 'bg-seq-5']

export default function Home() {
  const [year, setYear] = useState('2021')

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

        <label className="relative hidden sm:block">
          <span className="sr-only">Selecionar edição</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} className={cn(campo, 'w-auto cursor-pointer appearance-none pr-9 num')}>
            <option>2021</option><option>2020</option><option>2019</option><option>2018</option><option>2017</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-ink-muted" />
        </label>
        <a href="https://github.com" target="_blank" rel="noreferrer" className={cn(botao, 'px-3')}>
          <GitBranch className="size-4" /> Repositório
        </a>
      </CabecalhoSite>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section id="overview" className="grid gap-12 border-b border-border py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <div className={cn(badge.info, 'mb-6 gap-2 px-3 py-1 text-small')}>
              <span className="size-1.5 rounded-full bg-accent" /> Base ENADE {year}
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
            <div className="mt-8 flex items-end gap-1.5">
              {[42, 58, 47, 66, 61, 78, 72, 88, 81, 94, 89, 100].map((height, index) => <span key={index} className={cn('flex-1 rounded-t-sm', SEQ[Math.floor((index * SEQ.length) / 12)])} style={{ height: `${height / 1.8}px` }} />)}
            </div>
            <div className="mt-3 flex justify-between text-caption text-ink-muted num"><span>2017</span><span>2019</span><span>2021</span></div>
          </div>
        </section>

        <section className="grid gap-4 border-b border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ label, value, detail, icon: Icon }) => <div key={label} className={cn(card, 'flex items-start gap-3 p-4')}><Icon className="mt-0.5 size-4 shrink-0 text-ink-muted" /><div><p className={kpiRotulo}>{label}</p><p className={kpiValor}>{value}</p><p className="mt-1 text-caption text-ink-muted">{detail}</p></div></div>)}
          <a href="https://github.com" target="_blank" rel="noreferrer" className="group flex items-start gap-3 rounded-marca-md border border-dashed border-border-control p-4 transition-colors hover:bg-surface-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring"><GitBranch className="mt-0.5 size-4 shrink-0 text-ink-muted" /><div><p className={kpiRotulo}>Repositório do projeto</p><p className="mt-1 text-h3 text-ink">Código aberto no GitHub</p><p className="mt-1 flex items-center gap-1 text-small font-medium text-accent">Ver projeto <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p></div></a>
        </section>

        <section id="projects" className="py-16 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-small font-medium text-accent">Ecossistema</p><h2 className="mt-2 text-h1 text-ink">Subprojetos de pesquisa</h2></div><p className="hidden max-w-xs text-right text-body text-ink-muted sm:block">Quatro perspectivas complementares sobre os mesmos dados harmonizados.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(({ name, eyebrow, description, tags, icon: Icon, href }) => <article key={name} className={cn(card, 'flex flex-col transition-colors hover:border-border-control')}><div className="flex items-start justify-between"><Icon className="size-5 text-ink-muted" /><span className="text-caption text-ink-muted num">01 / 04</span></div><p className="mt-8 text-small text-ink-muted">{eyebrow}</p><h3 className="mt-1 text-h1 text-ink">{name}</h3><p className="mt-3 max-w-lg text-body text-ink-muted">{description}</p><div className="mt-auto flex items-center justify-between gap-4 pt-6"><div className="flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className={badge.neutro}>{tag}</span>)}</div><a href={href ?? '#'} className={cn(link, 'inline-flex shrink-0 items-center gap-1 text-small font-medium')}>Acessar módulo <ArrowUpRight className="size-3.5" /></a></div></article>)}
          </div>
        </section>

        <section id="methodology" className="grid gap-6 border-t border-border py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20"><div><p className="text-small font-medium text-accent">Método</p><h2 className="mt-2 max-w-sm text-h1 text-ink">Ciência orientada a dados, com contexto.</h2><p className="mt-4 max-w-sm text-body text-ink-muted">O EnadeX combina rigor metodológico, transparência e ferramentas abertas para tornar a pesquisa educacional mais reprodutível.</p></div><div className="grid gap-3 sm:grid-cols-3"><div className={cn(card, 'p-5')}><Database className="size-5 text-ink-muted" /><p className="mt-8 text-h3 text-ink">Dados harmonizados</p><p className="mt-2 text-small text-ink-muted">Variáveis organizadas para comparação entre edições.</p></div><div className={cn(card, 'p-5')}><Waypoints className="size-5 text-ink-muted" /><p className="mt-8 text-h3 text-ink">Análise integrada</p><p className="mt-2 text-small text-ink-muted">Múltiplos métodos, uma visão conectada.</p></div><div className={cn(card, 'p-5')}><ShieldCheck className="size-5 text-ink-muted" /><p className="mt-8 text-h3 text-ink">Explicabilidade</p><p className="mt-2 text-small text-ink-muted">Resultados claros, auditáveis e úteis.</p></div></div></section>
      </div>

      <RodapeSite id="documentation">
        <div className="flex flex-col gap-4 text-small text-ink-on-nav sm:flex-row sm:items-center sm:justify-between"><p>EnadeX · Pesquisa aplicada ao ensino superior</p><div className="flex flex-wrap gap-5"><span>Licença aberta</span><span>Conformidade LGPD</span><span>Referências ABNT / INEP</span></div></div>
      </RodapeSite>
    </main>
  )
}
