'use client'

import {
  ArrowUpRight,
  BarChart3,
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
  },
  {
    name: 'EduCluster',
    eyebrow: 'Perfis latentes',
    description: 'Agrupa trajetórias e perfis de estudantes para revelar padrões ocultos no ensino superior.',
    tags: ['K-Means', 'Clusterização'],
    icon: Network,
    accent: 'teal',
  },
  {
    name: 'ENADE-Time',
    eyebrow: 'Análise longitudinal',
    description: 'Acompanha mudanças e tendências no tempo com uma visão histórica das edições harmonizadas.',
    tags: ['Séries históricas', '2017–2021'],
    icon: LineChart,
    accent: 'amber',
  },
]

const kpis = [
  { label: 'Estudantes processados', value: '1,2M', detail: '+18,4% vs. 2020', icon: GraduationCap },
  { label: 'Cursos analisados', value: '8.436', detail: '27 áreas de avaliação', icon: BookOpen },
  { label: 'Edições harmonizadas', value: '05', detail: '2017 até 2021', icon: Layers3 },
]

export default function Home() {
  const [year, setYear] = useState('2021')

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <a href="#overview" className="flex items-center gap-3" aria-label="EnadeX, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1d4ed8] text-white shadow-sm shadow-blue-200">
              <BarChart3 className="size-5" strokeWidth={2.4} />
            </span>
            <span className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
              EnadeX
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700">v2021+</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-500 lg:flex" aria-label="Navegação principal">
            <a href="#overview" className="text-slate-900">Visão geral</a>
            <a href="#projects" className="transition-colors hover:text-slate-900">Subprojetos</a>
            <a href="#methodology" className="transition-colors hover:text-slate-900">Metodologia DSR</a>
            <a href="#documentation" className="transition-colors hover:text-slate-900">Documentação</a>
          </nav>

          <div className="flex items-center gap-3">
            <label className="relative hidden sm:block">
              <span className="sr-only">Selecionar edição</span>
              <select value={year} onChange={(event) => setYear(event.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>2021</option><option>2020</option><option>2019</option><option>2018</option><option>2017</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-slate-400" />
            </label>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700">
              <GitBranch className="size-3.5" /> Repositório
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <section id="overview" className="grid gap-12 border-b border-slate-200 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-600" /> Base ENADE {year}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[58px]">
              Mapeamento multidimensional e <span className="text-blue-700">explicável</span> dos microdados do ENADE.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Uma plataforma integrada baseada em Design Science Research para descobrir padrões socioeconômicos, institucionais e pedagógicos no ensino superior.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-800">Explorar subprojetos <ArrowUpRight className="size-4" /></a>
              <a href="#methodology" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">Como funciona <CircleHelp className="size-4 text-slate-400" /></a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
            <div className="absolute -right-10 -top-10 size-32 rounded-full bg-blue-50" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Status da plataforma</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Dados prontos para análise</p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="size-4" /></span>
            </div>
            <div className="mt-8 flex items-end gap-1.5">
              {[42, 58, 47, 66, 61, 78, 72, 88, 81, 94, 89, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-blue-100" style={{ height: `${height / 1.8}px`, opacity: 0.45 + index * 0.045 }} />)}
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-medium text-slate-400"><span>2017</span><span>2019</span><span>2021</span></div>
          </div>
        </section>

        <section className="grid gap-4 border-b border-slate-200 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ label, value, detail, icon: Icon }) => <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/20"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><Icon className="size-4" /></span><div><p className="text-[11px] font-medium text-slate-400">{label}</p><p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[10px] font-medium text-emerald-600">{detail}</p></div></div>)}
          <a href="https://github.com" target="_blank" rel="noreferrer" className="group flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-transparent p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"><GitBranch className="size-4" /></span><div><p className="text-[11px] font-medium text-slate-400">Repositório do projeto</p><p className="mt-0.5 text-sm font-semibold text-slate-900">Código aberto no GitHub</p><p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-blue-700">Ver projeto <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></p></div></a>
        </section>

        <section id="projects" className="py-16 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Ecossistema</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Subprojetos de pesquisa</h2></div><p className="hidden max-w-xs text-right text-sm leading-6 text-slate-500 sm:block">Quatro perspectivas complementares sobre os mesmos dados harmonizados.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(({ name, eyebrow, description, tags, icon: Icon, accent, href }) => <article key={name} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="flex items-start justify-between"><span className={`flex size-11 items-center justify-center rounded-xl ${accent === 'blue' ? 'bg-blue-50 text-blue-700' : accent === 'violet' ? 'bg-violet-50 text-violet-700' : accent === 'teal' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}><Icon className="size-5" /></span><span className="text-xs font-medium text-slate-400">01 / 04</span></div><p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{eyebrow}</p><h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{name}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">{description}</p><div className="mt-6 flex items-center justify-between gap-4"><div className="flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{tag}</span>)}</div><a href={href ?? '#'} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 transition-colors hover:text-blue-900">Acessar módulo <ArrowUpRight className="size-3.5" /></a></div></article>)}
          </div>
        </section>

        <section id="methodology" className="grid gap-6 border-t border-slate-200 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Método</p><h2 className="mt-2 max-w-sm text-3xl font-semibold tracking-tight text-slate-950">Ciência orientada a dados, com contexto.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">O EnadeX combina rigor metodológico, transparência e ferramentas abertas para tornar a pesquisa educacional mais reprodutível.</p></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5"><Database className="size-5 text-blue-700" /><p className="mt-8 text-sm font-semibold text-slate-900">Dados harmonizados</p><p className="mt-2 text-xs leading-5 text-slate-500">Variáveis organizadas para comparação entre edições.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><Waypoints className="size-5 text-blue-700" /><p className="mt-8 text-sm font-semibold text-slate-900">Análise integrada</p><p className="mt-2 text-xs leading-5 text-slate-500">Múltiplos métodos, uma visão conectada.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><ShieldCheck className="size-5 text-blue-700" /><p className="mt-8 text-sm font-semibold text-slate-900">Explicabilidade</p><p className="mt-2 text-xs leading-5 text-slate-500">Resultados claros, auditáveis e úteis.</p></div></div></section>

        <footer id="documentation" className="flex flex-col gap-4 border-t border-slate-200 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>EnadeX · Pesquisa aplicada ao ensino superior</p><div className="flex flex-wrap gap-5"><span>Licença aberta</span><span>Conformidade LGPD</span><span>Referências ABNT / INEP</span></div></footer>
      </div>
    </main>
  )
}
