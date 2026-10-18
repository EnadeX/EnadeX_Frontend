import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { Badge } from '@/app/enade-time/_components/ui/Badge'

describe('ENADE-Time · Badge', () => {
  const TONS = ['neutral', 'success', 'warning', 'danger', 'info'] as const

  it('aceita os mesmos cinco tons; info passa a ser o accent', () => {
    const { container } = render(<>{TONS.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}</>)
    const classes = [...container.querySelectorAll('span')].map((s) => s.className)
    expect(classes).toHaveLength(5)
    expect(classes[4]).toContain('text-accent')
    // texto de status só sobre surface-card (em surface-sunken não passa de 4,5:1 no claro)
    expect(classes[1]).not.toContain('bg-surface-sunken')
    expect(classes[2]).not.toContain('bg-surface-sunken')
  })

  it('vitest-axe sem violações', async () => {
    const { container } = render(<main>{TONS.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}</main>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
