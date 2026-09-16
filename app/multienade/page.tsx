'use client'

import {
  BarChart3,
  ChevronDown,
  Database,
  Download,
  Filter,
  Info,
  Network,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

const points = [
  [9, 73], [14, 67], [18, 71], [23, 79], [27, 76], [32, 84], [36, 80], [41, 88], [47, 86], [52, 91], [58, 89], [63, 94], [68, 92], [74, 97], [80, 95], [86, 98], [92, 96],
]

const features = [
  ['Horas de estudo (QE_I23)', '84%'],
  ['Infraestrutura (QE_I63)', '68%'],
  ['Tipo de escola', '53%'],
  ['Cotas (QE_I15)', '39%'],
]

export default function MultiEnadePage() {
  const [activeTab, setActiveTab] = useState('Supervisionada')
  const [year, setYear] = useState('2021')
  const [loaded, setLoaded] = useState(false)

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
      <header className="border-b border-[#dfe5ee] bg-white">
        <div className="flex h-[70px] items-center justify-between px-10">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Voltar para a Home" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#1d4ed8] text-white"><BarChart3 className="size-5" /></span>
              <span className="text-[17px] font-bold tracking-tight">EnadeX</span>
            </a>
            <span className="h-8 w-px bg-[#dfe5ee]" />
            <div className="leading-tight"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#91a4c3]">Subprojetos</p><p className="text-sm font-semibold">MultiENADE</p></div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[#607494] md:flex"><a className="font-medium text-[#111827]" href="#analysis">Análise</a><a href="#dataset">Dataset</a><a href="#methodology">Metodologia</a></nav>
          <div className="flex items-center gap-3"><span className="hidden rounded-full border border-[#a7efd0] bg-[#f0fdf8] px-3 py-1.5 text-xs font-semibold text-[#009b67] sm:inline-flex">● Conectado</span><button aria-label="Baixar relatório" className="flex size-9 items-center justify-center rounded-xl border border-[#dfe5ee] bg-white text-[#607494]"><Download className="size-4" /></button></div>
        </div>
      </header>

      <div className="px-10 py-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-[#8aa0c1]"><a href="/" className="hover:text-[#1d4ed8]">Home</a><span>/</span><span>Subprojetos</span><span>/</span><span className="text-[#2d4263]">MultiENADE</span></div>
        <section className="flex items-end justify-between border-b border-[#dfe5ee] pb-9"><div><div className="flex items-center gap-3"><h1 className="text-[29px] font-bold tracking-tight">MultiENADE</h1><span className="rounded-lg border border-[#cfe0ff] bg-[#eef5ff] px-2.5 py-1 text-[11px] font-semibold text-[#155eef]">Descoberta de padrões</span></div><p className="mt-2 text-sm text-[#607494]">Descoberta de padrões multidimensionais em microdados do ENADE com apoio de inteligência explicável.</p></div><div className="flex items-center gap-2 text-xs text-[#607494]"><Database className="size-4 text-[#89a1c5]" /> Dataset: <strong className="text-[#2d4263]">Curado 2021</strong><span className="text-emerald-500">•</span></div></section>

        <div className="mt-8 grid grid-cols-[280px_minmax(0,1fr)] gap-8">
          <aside className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold"><Filter className="size-4 text-[#155eef]" /> Filtros globais</h2><button className="text-[11px] text-[#8aa0c1]">Limpar</button></div><p className="mt-2 text-xs text-[#8aa0c1]">Defina o contexto da amostra</p><label className="mt-6 block text-xs font-semibold text-[#536987]">Ano<select value={year} onChange={(e) => setYear(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none focus:border-[#155eef]"><option>2021</option><option>2019</option><option>2018</option><option>2017</option></select></label><label className="mt-5 block text-xs font-semibold text-[#536987]">Curso<select className="mt-2 w-full rounded-xl border border-[#dfe5ee] bg-white px-3 py-3 text-sm font-normal outline-none"><option>Todos os cursos</option><option>Ciência da Computação</option><option>Sistemas de Informação</option></select></label><fieldset className="mt-5"><legend className="text-xs font-semibold text-[#536987]">Região / IES</legend><div className="mt-3 flex flex-col gap-3 text-xs text-[#536987]">{['Norte', 'Nordeste', 'Sul', 'Pública', 'Privada'].map((item, index) => <label key={item} className="flex items-center gap-2"><input type="checkbox" defaultChecked={index > 2} className="size-3.5 accent-[#155eef]" />{item}</label>)}</div></fieldset><button onClick={() => setLoaded(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#1742ba]"><Play className="size-3.5" /> Carregar base</button><div className="mt-5 flex justify-between border-t border-[#edf1f6] pt-5 text-[11px]"><span className="text-[#8aa0c1]">Amostra selecionada</span><strong className="text-[#00a56e]">{loaded ? '128.430 registros' : '—'}</strong></div><div className="mt-5 border-t border-[#edf1f6] pt-5"><h3 className="flex items-center gap-2 text-sm font-bold"><TrendingUp className="size-4 text-[#536987]" /> Parâmetros</h3><p className="mt-1 text-xs text-[#8aa0c1]">Ajustes dos algoritmos</p>{[['Árvores — Random Forest', '100'], ['Número de grupos — K-Means', 'k = 4'], ['Suporte mínimo — Apriori', '30%']].map(([label, value]) => <div key={label} className="mt-5"><div className="flex justify-between text-xs"><span className="text-[#607494]">{label}</span><strong>{value}</strong></div><input className="mt-2 w-full accent-[#155eef]" type="range" defaultValue="45" /></div>)}</div></aside>

          <section id="analysis" className="min-w-0"><div className="flex items-center gap-7 border-b border-[#dfe5ee]">{['Supervisionada', 'Clusters', 'Regras de associação', 'Evolução temporal'].map((tab, index) => <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 border-b-2 px-2 pb-3 text-xs font-semibold ${activeTab === tab ? 'border-[#155eef] text-[#155eef]' : 'border-transparent text-[#8aa0c1]'}`}>{index === 0 ? <Sparkles className="size-4" /> : index === 1 ? <Network className="size-4" /> : index === 2 ? <LayersIcon /> : <TrendingUp className="size-4" />}{tab}</button>)}</div><div className="flex items-start justify-between py-6"><div><h2 className="text-lg font-bold">Modelagem supervisionada & explicabilidade</h2><p className="mt-1 text-xs text-[#8aa0c1]">Regressão, métricas de desempenho e valores SHAP.</p></div><button className="flex items-center gap-2 rounded-xl border border-[#dfe5ee] bg-white px-3 py-2 text-xs font-semibold text-[#536987]"><RotateCcw className="size-3.5" /> Atualizar análise</button></div><div className="grid gap-3 md:grid-cols-3">{[['R²', 'Poder explicativo', '0,684', '+4,2% vs. baseline'], ['MAE', 'Erro absoluto', '6,42', 'escala 0–100'], ['RMSE', 'Raiz do erro', '8,17', 'escala 0–100']].map(([code, label, value, detail]) => <div key={code} className="rounded-2xl border border-[#dfe5ee] bg-white p-4 shadow-sm"><p className="text-[11px] text-[#8aa0c1]">{code} <span className="ml-1">— {label}</span></p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p><p className={`mt-1 text-[10px] ${detail.startsWith('+') ? 'text-[#00a56e]' : 'text-[#8aa0c1]'}`}>{detail}</p></div>)}</div><div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><h3 className="text-sm font-bold">Dedicação aos estudos × Nota geral</h3><p className="mt-1 text-xs text-[#8aa0c1]">Relação estimada por perfil de ingresso</p></div><button aria-label="Mais informações" className="flex size-8 items-center justify-center rounded-lg border border-[#dfe5ee] text-[#8aa0c1]"><Info className="size-4" /></button></div><div className="relative mt-4 h-[290px] border-b border-l border-[#dbe6f7] bg-[linear-gradient(to_top,#f7faff_1px,transparent_1px),linear-gradient(to_right,#f7faff_1px,transparent_1px)] bg-[size:100%_25%,10%_100%]"><div className="absolute bottom-[-26px] left-1/2 text-[10px] text-[#8aa0c1]">Média de horas de estudo por semana</div><div className="absolute left-[-31px] top-1/2 -rotate-90 text-[10px] text-[#8aa0c1]">Nota geral</div><div className="absolute bottom-[4%] left-[5%] h-px w-[90%] rotate-[-23deg] bg-[#a8c8ff]" />{points.map(([left, bottom], index) => <span key={index} className="absolute size-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-[#4d88f5] shadow-[0_0_0_1px_#c7dcff]" style={{ left: `${left}%`, bottom: `${bottom}%` }} />)}</div><div className="mt-9 flex justify-end gap-4 text-[10px] text-[#8aa0c1]"><span><i className="mr-1 inline-block size-2 rounded-full bg-[#155eef]" />Pública</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#cbd5e1]" />Privada</span></div></div><div className="mt-5 rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><h3 className="text-sm font-bold">Importância global (SHAP)</h3><p className="mt-1 text-xs text-[#8aa0c1]">Impacto médio na predição</p></div><Sparkles className="size-4 text-[#155eef]" /></div><div className="mt-5 flex flex-col gap-4">{features.map(([label, value]) => <div key={label}><div className="flex justify-between text-[11px] text-[#536987]"><span>{label}</span><strong>{value}</strong></div><div className="mt-2 h-1.5 rounded-full bg-[#edf2f8]"><div className="h-full rounded-full bg-[#2463eb]" style={{ width: value }} /></div></div>)}</div></div></section>
        </div>
      </div>
    </main>
  )
}

function LayersIcon() { return <span className="inline-flex size-4 items-center justify-center text-[12px]">▱</span> }
