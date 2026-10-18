// Guarda de marca sobre o que já foi migrado. Cada tela migrada entra nesta lista.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { verificarMarca } from './guards'

const arquivosDe = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivosDe(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []))

const MIGRADOS = [
  ...arquivosDe('components/brand'),
  'lib/brand/classes.ts',
  'lib/brand/chart.ts',
  'lib/brand/theme.ts',
  // Tela 1
  'app/page.tsx',
  // Tela 2
  ...arquivosDe('app/multienade'),
  // EduCluster
  ...arquivosDe('app/educluster'),
  'lib/educluster/ui.ts',
]

describe('guarda de marca', () => {
  it.each(MIGRADOS)('%s sem violações', (arquivo) => {
    expect(verificarMarca([arquivo])).toEqual([])
  })

  it('a guarda acha as violações (controle)', () => {
    const v = verificarMarca(['tests/brand/fixtures/violacoes.tsx.txt'])
    expect(v.map((x) => [x.linha, x.regra])).toEqual([
      [2, 'cor hex solta'],
      [3, 'paleta padrão do Tailwind'],
      [4, 'peso acima de 500'],
      [5, 'caixa-alta'],
      [6, 'BarChart3 como logo'],
    ])
  })
})
