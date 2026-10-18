import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom não implementa matchMedia; os testes ligam o modo escuro com `definirSistemaEscuro(true)`.
let sistemaEscuro = false
export function definirSistemaEscuro(valor: boolean) {
  sistemaEscuro = valor
}

beforeEach(() => {
  sistemaEscuro = false
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark') ? sistemaEscuro : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
  try {
    window.localStorage.clear()
  } catch {}
  delete document.documentElement.dataset.theme
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

import * as axeMatchers from 'vitest-axe/matchers'
import { expect } from 'vitest'
expect.extend(axeMatchers)
