// Testes próprios da Tela 1 (home) depois da migração. A caracterização fica em tests/preservacao/home.test.tsx.
import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import Home from '@/app/page'

describe('Tela 1 · home', () => {
  it('os quatro cards usam a mesma classe de destaque', () => {
    render(<Home />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(4)
    const classesDoCard = new Set(cards.map((c) => c.className))
    const classesDoLink = new Set(cards.map((c) => c.querySelector('a')!.className))
    const classesDoIcone = new Set(cards.map((c) => c.querySelector('svg')!.getAttribute('class')!.replace(/\blucide-[\w-]+/g, '').trim()))
    expect(classesDoCard.size).toBe(1)
    expect(classesDoLink.size).toBe(1)
    expect(classesDoIcone.size).toBe(1)
    expect([...classesDoLink][0]).toContain('text-accent')
  })

  it('sem violet, amber ou teal nas classes', () => {
    const fonte = readFileSync('app/page.tsx', 'utf8')
    expect(fonte).not.toMatch(/\b(?:bg|text|border)-(?:violet|amber|teal|blue)-\d+/)
  })

  it('a logo do kit no cabeçalho e a negativa no rodapé', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('header img')!.getAttribute('src')).toBe('/img/enadex-horizontal.svg')
    expect(container.querySelector('footer img')!.getAttribute('src')).toBe('/img/enadex-horizontal-negativo.svg')
    expect(container.querySelectorAll('[data-brand-logo]')).toHaveLength(2)
  })

  it('o círculo decorativo do cartão de status saiu e as barras usam seq-1..5', () => {
    const { container } = render(<Home />)
    expect(container.querySelector('.rounded-full.bg-blue-50')).toBeNull()
    const barras = [...container.querySelectorAll('[class*="bg-seq-"]')]
    expect(barras).toHaveLength(12)
    expect(new Set(barras.map((b) => b.className.match(/bg-seq-\d/)![0]))).toEqual(new Set(['bg-seq-1', 'bg-seq-2', 'bg-seq-3', 'bg-seq-4', 'bg-seq-5']))
  })

  it('vitest-axe sem violações', async () => {
    const { container } = render(<Home />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
