import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

type Props = {
  id?: string
  /** Texto e links do rodapé, renderizados como vieram. */
  children?: React.ReactNode
  className?: string
}

/** Rodapé do site (manual p. 13): `surface-nav` com a logo negativa a 32px. */
export function RodapeSite({ id, children, className }: Props) {
  return (
    <footer id={id} className={cn('enx-on-dark bg-surface-nav text-ink-on-nav', className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <Logo altura={32} fundo="escuro" />
        {children}
      </div>
    </footer>
  )
}
