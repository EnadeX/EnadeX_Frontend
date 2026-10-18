import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { cn } from '@/lib/utils'

type Props = {
  /** Destino da logo. Padrão: página inicial. */
  href?: string
  /** Itens ao lado da logo (selo, por exemplo). */
  marca?: React.ReactNode
  /** Navegação e ações, renderizadas como vieram. */
  children?: React.ReactNode
  className?: string
}

/** Cabeçalho do site (manual p. 13): 64px, logo horizontal a 28px (24px no celular) e o seletor de tema. */
export function CabecalhoSite({ href = '/', marca, children, className }: Props) {
  return (
    <header className={cn('border-b border-border bg-surface-card', className)}>
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Logo href={href} altura={28} alturaCelular={24} />
          {marca}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
