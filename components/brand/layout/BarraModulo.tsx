import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

type Props = {
  /** Nome do subprojeto, exatamente como a tela já escreve. */
  nome: React.ReactNode
  /** Destino da logo. Padrão: página inicial. */
  href?: string
  /** Navegação, status e ações do subprojeto, renderizados como vieram. */
  children?: React.ReactNode
  /** Segunda linha dentro do cabeçalho (ex.: navegação em abas no celular). */
  inferior?: React.ReactNode
  className?: string
}

/** Topbar de dashboard (manual p. 15): 56px em `surface-nav`, logo negativa a 28px com 16px de margem. */
export function BarraModulo({ nome, href = '/', children, inferior, className }: Props) {
  return (
    <header className={cn('enx-on-dark bg-surface-nav text-ink-on-nav', className)}>
      <div className="flex h-14 items-center gap-4 px-4">
        <Logo href={href} altura={28} fundo="escuro" />
        <span aria-hidden className="h-6 w-px bg-ink-on-nav/30" />
        <span className="text-h3 text-ink-on-nav">{nome}</span>
        {children ? <div className="ml-auto flex min-w-0 items-center gap-3">{children}</div> : null}
      </div>
      {inferior}
    </header>
  )
}
