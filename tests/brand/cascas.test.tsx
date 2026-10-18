import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { BarraModulo } from '@/components/brand/layout/BarraModulo'
import { CabecalhoSite } from '@/components/brand/layout/CabecalhoSite'
import { RodapeSite } from '@/components/brand/layout/RodapeSite'

const filhos = (
  <nav aria-label="Teste">
    <a href="/a">Item A</a> <a href="/b">Item B · 2005–2021</a>
  </nav>
)

const logos = (c: HTMLElement) => c.querySelectorAll('[data-brand-logo]')

describe('0.8 cascas visuais', () => {
  it('CabecalhoSite: uma logo a 28px (24px no celular), seletor de tema e filhos intactos', () => {
    const { container, getByRole } = render(<CabecalhoSite>{filhos}</CabecalhoSite>)
    expect(logos(container)).toHaveLength(1)
    const img = container.querySelector('img')!
    expect(img.getAttribute('height')).toBe('28')
    expect(img.style.getPropertyValue('--logo-h-sm')).toBe('24px')
    expect(getByRole('button', { name: /Tema/ })).toBeInTheDocument()
    expect(container.querySelector('nav')!.outerHTML).toBe(render(filhos).container.innerHTML)
  })

  it('RodapeSite: uma logo, negativa, a 32px; texto intacto', () => {
    const { container } = render(<RodapeSite id="doc"><p>EnadeX · Texto do rodapé</p></RodapeSite>)
    expect(logos(container)).toHaveLength(1)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].getAttribute('src')).toContain('negativo')
    expect(imgs[0].getAttribute('height')).toBe('32')
    expect(container.querySelector('footer')).toHaveAttribute('id', 'doc')
    expect(container.querySelector('p')!.textContent).toBe('EnadeX · Texto do rodapé')
  })

  it('BarraModulo: uma logo negativa a 28px, nome do subprojeto e filhos intactos', () => {
    const { container } = render(<BarraModulo nome="ENADE-Time">{filhos}</BarraModulo>)
    expect(logos(container)).toHaveLength(1)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].getAttribute('src')).toContain('negativo')
    expect(imgs[0].getAttribute('height')).toBe('28')
    expect(container.textContent).toContain('ENADE-Time')
    expect(container.querySelector('nav')!.textContent).toBe('Item A Item B · 2005–2021')
  })

  it('vitest-axe sem violações nas três cascas', async () => {
    const { container } = render(
      <>
        <CabecalhoSite>{filhos}</CabecalhoSite>
        <main><BarraModulo nome="MultiENADE" /></main>
        <RodapeSite><p>Rodapé</p></RodapeSite>
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
