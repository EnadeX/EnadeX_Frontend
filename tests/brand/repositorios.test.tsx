// Tela de repositórios (app/repositorios/page.tsx), aberta pelo botão "Repositório" da home.
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import Repositorios from '@/app/repositorios/page'

describe('Tela · repositórios', () => {
  it('um card por repositório, na ordem backend, frontend, documentação', () => {
    render(<Repositorios />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Backend', 'Frontend', 'Documentação'])
  })

  it('cada card abre o repositório no GitHub em nova aba', () => {
    const { container } = render(<Repositorios />)
    const externos = [...container.querySelectorAll('a[target="_blank"]')]
    expect(externos.map((a) => a.getAttribute('href'))).toEqual([
      'https://github.com/EnadeX/EnadeX_Backend',
      'https://github.com/Cintriano/EnadeX_Frontend',
      'https://github.com/EnadeX/EnadeX_Documentacao',
    ])
    for (const a of externos) expect(a).toHaveAttribute('rel', 'noreferrer')
  })

  it('o cabeçalho volta para a home', () => {
    render(<Repositorios />)
    expect(screen.getByRole('link', { name: /Voltar/ })).toHaveAttribute('href', '/')
  })

  it('vitest-axe sem violações', async () => {
    const { container } = render(<Repositorios />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
