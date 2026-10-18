// Caracterização da home (`app/page.tsx`), escrita sobre o código anterior à migração visual.
// Este teste NUNCA é atualizado para acompanhar a migração: se ele precisar mudar, a migração mexeu em
// texto, campo, link ou lógica.
//
// A única parte da tela que o plano permite trocar é a logo (o quadrado com BarChart3 e o nome "EnadeX"
// recriado em texto dão lugar ao arquivo do kit). Por isso o cabeçalho é conferido item a item, e o resto
// da página pelo texto inteiro.
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'

const normalizar = (texto: string | null | undefined) => (texto ?? '').replace(/\s+/g, ' ').trim()

function textoForaDoCabecalho(container: HTMLElement) {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelector('header')?.remove()
  return normalizar(clone.textContent)
}

describe('home: caracterização', () => {
  it('texto visível fora do cabeçalho', () => {
    const { container } = render(<Home />)
    expect(textoForaDoCabecalho(container)).toMatchSnapshot()
  })

  it('cabeçalho: link da marca, selo, navegação, seletor e repositório', () => {
    render(<Home />)
    const header = document.querySelector('header')!
    const marca = header.querySelector('a[href="#overview"]')!
    expect(marca).not.toBeNull()
    expect(marca.getAttribute('aria-label') ?? marca.querySelector('img')?.getAttribute('alt')).toMatch(/^EnadeX/)
    expect(normalizar(header.textContent)).toContain('v2021+')

    const nav = within(header).getByRole('navigation', { name: 'Navegação principal' })
    expect(within(nav).getAllByRole('link').map((a) => [normalizar(a.textContent), a.getAttribute('href')])).toEqual([
      ['Visão geral', '#overview'],
      ['Subprojetos', '#projects'],
      ['Metodologia DSR', '#methodology'],
      ['Documentação', '#documentation'],
    ])

    const repo = within(header).getByRole('link', { name: /Repositório/ })
    expect(repo).toHaveAttribute('href', 'https://github.com')
    expect(repo).toHaveAttribute('target', '_blank')
    expect(repo).toHaveAttribute('rel', 'noreferrer')
  })

  it('seletor de edição: rótulo, opções na ordem e valor padrão', () => {
    render(<Home />)
    const select = screen.getByLabelText('Selecionar edição') as HTMLSelectElement
    expect(select.tagName).toBe('SELECT')
    expect(select.name).toBe('')
    expect(select.disabled).toBe(false)
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['2021', '2020', '2019', '2018', '2017'])
    expect(select.value).toBe('2021')
  })

  it('trocar a edição atualiza o "Base ENADE {ano}"', () => {
    const { container } = render(<Home />)
    expect(normalizar(container.textContent)).toContain('Base ENADE 2021')
    fireEvent.change(screen.getByLabelText('Selecionar edição'), { target: { value: '2019' } })
    expect(normalizar(container.textContent)).toContain('Base ENADE 2019')
    expect(normalizar(container.textContent)).not.toContain('Base ENADE 2021')
  })

  it('os 4 cards dos subprojetos', () => {
    render(<Home />)
    const cards = screen.getAllByRole('article')
    expect(
      cards.map((card) => ({
        nome: normalizar(card.querySelector('h3')?.textContent),
        texto: normalizar(card.textContent),
        href: card.querySelector('a')?.getAttribute('href'),
      })),
    ).toMatchSnapshot()
    expect(cards).toHaveLength(4)
  })

  it('lista de hrefs da página', () => {
    const { container } = render(<Home />)
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'))
    expect(hrefs).toMatchSnapshot()
  })
})
