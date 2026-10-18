// Testes próprios do EduCluster depois da migração visual. A caracterização fica em
// tests/preservacao/educluster.test.tsx; os arquivos de lógica (api, tipos, hooks, rótulos…) estão em congelados.json.
import { describe, expect, it } from 'vitest'
import * as chart from '@/lib/educluster/chart'
import * as ui from '@/lib/educluster/ui'
import { contraste, dados } from '@/lib/brand/tokens'
import { nomesDefinidos } from './css'
import { verificarClasses } from './guards'

describe('EduCluster · lib/educluster/ui.ts', () => {
  it('mesmas exportações de antes', () => {
    expect(Object.keys(ui).sort()).toEqual(
      ['btnPrimary', 'btnSecondary', 'campo', 'card', 'linkTexto', 'rotulo', 'tabela', 'tabelaHead', 'tabelaWrapper', 'td', 'tdNum', 'textoApoio', 'th', 'thNum', 'trLinha'].sort(),
    )
  })

  it.each(Object.entries(ui))('%s sem hex, paleta do Tailwind, peso acima de 500 ou caixa-alta', (_, classes) => {
    expect(verificarClasses(classes)).toEqual([])
  })
})

describe('EduCluster · lib/educluster/chart.ts', () => {
  const definidos = nomesDefinidos()
  const token = (cor: string) => cor.match(/^var\((--[\w-]+)\)$/)?.[1]

  it('mesmas exportações e chaves de antes', () => {
    expect(Object.keys(chart).sort()).toEqual(
      ['CORES_SERIE', 'EIXO', 'FORMAS_SERIE', 'GRID_COLOR', 'INK', 'TOOLTIP_STYLE', 'corDivergente', 'corSequencial', 'corSerie', 'fmtTooltip', 'formaSerie', 'tintaSobre'].sort(),
    )
    expect(Object.keys(chart.INK)).toEqual(['primaria', 'secundaria', 'muda', 'grade', 'eixo'])
    expect(Object.keys(chart.EIXO)).toEqual(['stroke', 'tick'])
    expect(Object.keys(chart.TOOLTIP_STYLE)).toEqual(['fontSize', 'borderRadius', 'borderColor'])
  })

  it('CORES_SERIE mantém 8 cores e FORMAS_SERIE fica igual', () => {
    expect(chart.CORES_SERIE).toHaveLength(8)
    expect(chart.FORMAS_SERIE).toEqual(['circle', 'triangle', 'square', 'diamond', 'star', 'cross', 'wye', 'circle'])
    expect(chart.CORES_SERIE.slice(0, 6)).toEqual([1, 2, 3, 4, 5, 6].map((n) => `var(--series-${n})`))
  })

  it.each([...chart.CORES_SERIE, chart.GRID_COLOR, chart.EIXO.stroke, chart.EIXO.tick.fill, chart.TOOLTIP_STYLE.borderColor])(
    '%s é var(--token) existente',
    (cor) => {
      expect(definidos.has(token(cor)!)).toBe(true)
    },
  )

  it('escalas de calor nos extremos da marca', () => {
    expect(chart.corSequencial(0, 10)).toBe(dados.claro['seq-1'])
    expect(chart.corSequencial(10, 10)).toBe(dados.claro['seq-5'])
    expect(chart.corDivergente(0.6, 0.6)).toBe('#0c3350')
    expect(chart.corDivergente(-0.6, 0.6)).toBe('#c23b33')
  })

  // Limitação anterior à migração: com a regra de tintaSobre (branco ou tinta escura, corte de luminância 0,55), as
  // células de tom médio ficam abaixo de 4,5:1 com qualquer das duas tintas. Corrigir pede mudar a regra (lógica do
  // autor), então o teste só garante que a marca não piorou o pior caso de cada escala do original.
  it('o pior contraste da tinta sobre as células de calor não fica abaixo do original', () => {
    const ts = Array.from({ length: 101 }, (_, i) => i / 100)
    const pior = (cor: (t: number) => string) => Math.min(...ts.map((t) => contraste(chart.tintaSobre(cor(t)), cor(t))))
    const ORIGINAL = { sequencial: 3.305, positivo: 3.272, negativo: 3.137 } // medidos sobre a master
    expect(pior((t) => chart.corSequencial(t, 1))).toBeGreaterThanOrEqual(ORIGINAL.sequencial)
    expect(pior((t) => chart.corDivergente(t, 1))).toBeGreaterThanOrEqual(ORIGINAL.positivo)
    expect(pior((t) => chart.corDivergente(-t, 1))).toBeGreaterThanOrEqual(ORIGINAL.negativo)
  })
})
