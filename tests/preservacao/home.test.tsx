// Caracterização da home (`app/page.tsx`), escrita sobre o código anterior à migração visual.
// Este teste NUNCA é atualizado para acompanhar a migração: se ele precisar mudar, a migração mexeu em
// texto, campo, link ou lógica.
//
// Exceção (2026-10-28, pedido do dono da home): os KPIs passaram a vir das APIs de cada subprojeto, o card
// "Repositório do projeto" e o seletor de edição saíram, e o botão "Repositório" leva à tela /repositorios.
// Depois entraram as seções de metodologia DSR e de documentação, com textos de EnadeX_Documentacao.
// Os snapshots foram regravados com os KPIs simulados abaixo; o resto da tela continua congelado.
//
// A única parte da tela que o plano permite trocar é a logo (o quadrado com BarChart3 e o nome "EnadeX"
// recriado em texto dão lugar ao arquivo do kit). Por isso o cabeçalho é conferido item a item, e o resto
// da página pelo texto inteiro.
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from '@/app/page'
import { resumoAnualHome } from '../fixtures/home'

vi.mock('@/lib/home/kpis', () => ({
  useKpisHome: () => ({
    multiEnade: { status: 'ok', valor: '50', detalhe: '161 cursos em 3 perfis' },
    explain: { status: 'ok', valor: '18.543', detalhe: '705 cursos · nota média 36,8' },
    eduCluster: { status: 'ok', valor: '3.832', detalhe: '30 áreas de avaliação' },
    enadeTime: { status: 'ok', valor: '06', detalhe: '2005 a 2021 · 24.967 inscrições' },
    serie: { status: 'ok', anos: resumoAnualHome },
  }),
}))

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
    expect(repo).toHaveAttribute('href', '/repositorios')
    expect(repo).not.toHaveAttribute('target')
    expect(within(header).queryByRole('combobox')).toBeNull()
  })

  it('o selo "Base ENADE 2021" é fixo', () => {
    const { container } = render(<Home />)
    expect(normalizar(container.textContent)).toContain('Base ENADE 2021')
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
