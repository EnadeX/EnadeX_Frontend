import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { ALT_LINK, ARQUIVOS_LOGO, escolherLogo, Logo, type VersaoLogo } from '@/components/brand/Logo'

describe('0.5 logo: tamanhos mínimos (manual p. 6)', () => {
  it.each<[VersaoLogo, number, VersaoLogo]>([
    ['horizontal', 28, 'horizontal'],
    ['horizontal', 40, 'horizontal'],
    ['horizontal', 20, 'horizontal'],
    ['horizontal', 19, 'simbolo-flat'],
    ['simbolo', 32, 'simbolo'],
    ['simbolo', 31, 'simbolo-flat'],
    ['simbolo-flat', 16, 'simbolo-flat'],
    ['vertical', 188, 'vertical'], // 240px de largura
    ['vertical', 142, 'vertical'], // 181px
    ['vertical', 140, 'horizontal'], // 178px < 180px → horizontal com a mesma largura
    ['vertical', 20, 'simbolo-flat'], // vira horizontal de ~6px, abaixo de 20px → símbolo flat
  ])('%s a %ipx → %s', (versao, altura, esperada) => {
    expect(escolherLogo(versao, altura).versao).toBe(esperada)
  })

  it('vertical abaixo de 180px vira horizontal com a mesma largura', () => {
    const v = escolherLogo('vertical', 140)
    expect(v.largura).toBeGreaterThanOrEqual(176)
    expect(v.largura).toBeLessThanOrEqual(180)
  })
})

describe('0.5 logo: renderização', () => {
  it('width e height numéricos e proporcionais ao SVG', () => {
    const { container } = render(<Logo versao="horizontal" altura={28} />)
    for (const img of container.querySelectorAll('img')) {
      expect(img.getAttribute('width')).toBe('118')
      expect(img.getAttribute('height')).toBe('28')
    }
    const { largura, altura } = ARQUIVOS_LOGO.horizontal
    expect(Math.abs(118 / 28 - largura / altura)).toBeLessThan(0.02)
  })

  it('como link: positiva com alt "EnadeX, página inicial", negativa com alt=""', () => {
    const { container } = render(<Logo href="/" />)
    const [positiva, negativa] = container.querySelectorAll('img')
    expect(positiva).toHaveAttribute('alt', ALT_LINK)
    expect(positiva).toHaveClass('enx-logo-light')
    expect(positiva.getAttribute('src')).toBe('/img/enadex-horizontal.svg')
    expect(negativa).toHaveAttribute('alt', '')
    expect(negativa).toHaveClass('enx-logo-dark')
    expect(negativa.getAttribute('src')).toBe('/img/enadex-horizontal-negativo.svg')
    expect(container.querySelector('a')).toHaveAccessibleName(ALT_LINK)
  })

  it('decorativa: alt="" em tudo', () => {
    const { container } = render(<Logo decorativa />)
    for (const img of container.querySelectorAll('img')) expect(img).toHaveAttribute('alt', '')
  })

  it('fundo="escuro" deixa só a negativa', () => {
    const { container } = render(<Logo fundo="escuro" href="/" />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].getAttribute('src')).toBe('/img/enadex-horizontal-negativo.svg')
    expect(imgs[0]).toHaveAttribute('alt', ALT_LINK)
  })

  it('símbolo abaixo de 32px usa o arquivo flat', () => {
    const { container } = render(<Logo versao="simbolo" altura={24} />)
    expect(container.querySelector('img')!.getAttribute('src')).toBe('/img/enadex-simbolo-flat.svg')
  })

  it('reserva a área de proteção (x/2) no padding', () => {
    const { container } = render(<Logo href="/" altura={28} />)
    expect((container.firstElementChild as HTMLElement).style.padding).toBe('8px')
  })

  it.each([
    ['link', <Logo key="1" href="/" />],
    ['imagem', <Logo key="2" />],
    ['decorativa', <Logo key="3" decorativa />],
    ['escuro', <Logo key="4" fundo="escuro" />],
  ])('vitest-axe sem violações (%s)', async (_, el) => {
    const { container } = render(el)
    expect(await axe(container)).toHaveNoViolations()
  })
})
