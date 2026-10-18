import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '@/components/brand/ThemeToggle'
import { CHAVE_TEMA, lerTema, salvarTema, SCRIPT_TEMA, temaEfetivo } from '@/lib/brand/theme'
import { definirSistemaEscuro } from '../../vitest.setup'

const raiz = document.documentElement

describe('0.3 tema', () => {
  it('sem escolha salva, temaEfetivo() segue prefers-color-scheme', () => {
    expect(temaEfetivo()).toBe('light')
    definirSistemaEscuro(true)
    expect(temaEfetivo()).toBe('dark')
  })

  it('a escolha salva vence o sistema', () => {
    definirSistemaEscuro(true)
    salvarTema('light')
    expect(raiz.dataset.theme).toBe('light')
    expect(localStorage.getItem(CHAVE_TEMA)).toBe('light')
    expect(temaEfetivo()).toBe('light')
  })

  it('o script do <head> aplica o tema salvo antes da pintura', () => {
    localStorage.setItem(CHAVE_TEMA, 'dark')
    new Function(SCRIPT_TEMA)()
    expect(raiz.dataset.theme).toBe('dark')
  })

  it('o script ignora valor inválido', () => {
    localStorage.setItem(CHAVE_TEMA, 'roxo')
    new Function(SCRIPT_TEMA)()
    expect(raiz.dataset.theme).toBeUndefined()
  })

  it('o toggle alterna data-theme, grava enx-theme e atualiza aria-pressed e rótulo', () => {
    render(<ThemeToggle />)
    const botao = screen.getByRole('button')
    expect(botao).toHaveAttribute('aria-pressed', 'false')
    expect(botao).toHaveTextContent('Tema escuro')

    fireEvent.click(botao)
    expect(raiz.dataset.theme).toBe('dark')
    expect(localStorage.getItem(CHAVE_TEMA)).toBe('dark')
    expect(botao).toHaveAttribute('aria-pressed', 'true')
    expect(botao).toHaveTextContent('Tema claro')

    fireEvent.click(botao)
    expect(raiz.dataset.theme).toBe('light')
    expect(botao).toHaveAttribute('aria-pressed', 'false')
  })

  it('localStorage que lança exceção não quebra a página', () => {
    const erro = () => {
      throw new Error('bloqueado')
    }
    const spies = [
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(erro),
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(erro),
    ]
    expect(lerTema()).toBeNull()
    expect(() => new Function(SCRIPT_TEMA)()).not.toThrow()
    render(<ThemeToggle />)
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
    expect(raiz.dataset.theme).toBe('dark')
    spies.forEach((s) => s.mockRestore())
  })
})
