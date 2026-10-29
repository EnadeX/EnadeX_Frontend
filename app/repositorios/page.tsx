import { ArrowLeft, ArrowUpRight, BookOpen, Monitor, Server } from 'lucide-react'
import Link from 'next/link'
import { CabecalhoSite } from '@/components/brand/layout/CabecalhoSite'
import { RodapeSite } from '@/components/brand/layout/RodapeSite'
import { badge, botao, card, kpiRotulo } from '@/lib/brand/classes'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Repositórios · EnadeX' }

const repositorios = [
  {
    nome: 'Backend',
    repo: 'EnadeX/EnadeX_Backend',
    href: 'https://github.com/EnadeX/EnadeX_Backend',
    descricao: 'API central em FastAPI, pipelines de ETL e os modelos de cada subprojeto.',
    tags: ['Python', 'FastAPI', 'Supabase'],
    icon: Server,
  },
  {
    nome: 'Frontend',
    repo: 'Cintriano/EnadeX_Frontend',
    href: 'https://github.com/Cintriano/EnadeX_Frontend',
    descricao: 'Este site: a página inicial e os painéis interativos dos quatro subprojetos.',
    tags: ['Next.js', 'React', 'Tailwind'],
    icon: Monitor,
  },
  {
    nome: 'Documentação',
    repo: 'EnadeX/EnadeX_Documentacao',
    href: 'https://github.com/EnadeX/EnadeX_Documentacao',
    descricao: 'Fases do projeto, entregáveis e a documentação de cada subprojeto.',
    tags: ['Markdown', 'Obsidian'],
    icon: BookOpen,
  },
]

export default function Repositorios() {
  return (
    <main className="min-h-screen bg-surface-page font-marca text-body text-ink">
      <CabecalhoSite>
        <Link href="/" className={cn(botao, 'px-3')}>
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </CabecalhoSite>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-small font-medium text-accent">Código aberto</p>
        <h1 className="mt-2 text-h1 text-ink">Repositórios do projeto</h1>
        <p className="mt-4 max-w-2xl text-body text-ink-muted">
          O EnadeX é dividido em três repositórios no GitHub: o backend com as análises, o frontend com a interface e a documentação do projeto.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {repositorios.map(({ nome, repo, href, descricao, tags, icon: Icon }) => (
            <a
              key={nome}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={cn(card, 'group flex flex-col transition-colors hover:border-border-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring')}
            >
              <Icon className="size-5 text-ink-muted" />
              <p className={cn(kpiRotulo, 'mt-8')}>{repo}</p>
              <h2 className="mt-1 text-h2 text-ink">{nome}</h2>
              <p className="mt-3 text-body text-ink-muted">{descricao}</p>
              <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                <div className="flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className={badge.neutro}>{tag}</span>)}</div>
                <span className="flex shrink-0 items-center gap-1 text-small font-medium text-accent">
                  Abrir no GitHub <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <RodapeSite>
        <p className="text-small text-ink-on-nav">EnadeX · Pesquisa aplicada ao ensino superior</p>
      </RodapeSite>
    </main>
  )
}
