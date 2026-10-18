// Constantes que misturam cor e lógica: só os valores de cor podem mudar (plano, seção 0).
import { describe, expect, it } from 'vitest'
import * as chart from '@/lib/enade-time/chart'
import { CHART_COLORS, LIMIAR_AMOSTRA, PAGE_SIZE_OPTIONS } from '@/lib/enade-time/constants'
import * as ui from '@/lib/enade-time/ui'
import {
  CLUSTER_PALETTE,
  CORES_CATEGORIA,
  DEF_VARIAVEIS,
  DICIONARIO_TABELAS,
  MAX_LINHAS_TABELA,
  TOPICOS,
} from '@/lib/multienade/constants'

describe('lib/multienade/constants.ts', () => {
  it('constantes de lógica iguais às de hoje', () => {
    expect({ DEF_VARIAVEIS, DICIONARIO_TABELAS, TOPICOS, MAX_LINHAS_TABELA }).toMatchSnapshot()
  })

  it('CLUSTER_PALETTE mantém 6 cores', () => {
    expect(CLUSTER_PALETTE).toHaveLength(6)
  })

  it('CORES_CATEGORIA mantém as chaves', () => {
    // chaves da modelagem de out/2026 (preparar_dados_plotagem em EnadeX/multi_enade/modelos/mdl_regressao)
    expect(Object.fromEntries(Object.entries(CORES_CATEGORIA).map(([k, v]) => [k, Object.keys(v)]))).toEqual({
      professores: ['Concordância alta', 'Concordância baixa/média'],
      cotas: ['Menos cotistas', 'Mais cotistas (renda/múlt. critérios)'],
    })
  })
})

describe('lib/enade-time', () => {
  it('constantes de lógica iguais às de hoje', () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([10, 25, 50, 100, 250])
    expect(LIMIAR_AMOSTRA).toBe(30)
  })

  it('CHART_COLORS mantém as chaves', () => {
    expect(Object.keys(CHART_COLORS)).toEqual(['seq', 'paralelo', 'paralelo2', 'ideal', 'alert', 'warn', 'neutral'])
  })

  it('ui.ts e chart.ts mantêm as exportações', () => {
    expect(Object.keys(ui).sort()).toEqual(
      ['btnPrimary', 'btnSecondary', 'campo', 'card', 'linkTexto', 'rotulo', 'tabela', 'tabelaHead', 'tabelaWrapper', 'td', 'th', 'trLinha'].sort(),
    )
    expect(Object.keys(chart).sort()).toEqual(['EIXO', 'GRID_COLOR', 'TOOLTIP_STYLE', 'fmtTooltip'])
    expect(Object.keys(chart.EIXO)).toEqual(['stroke', 'tick'])
    expect(Object.keys(chart.EIXO.tick)).toEqual(['fontSize', 'fill'])
    expect(Object.keys(chart.TOOLTIP_STYLE)).toEqual(['fontSize', 'borderRadius', 'borderColor'])
  })

  it('fmtTooltip tem a mesma saída', () => {
    const f = chart.fmtTooltip((v) => `<${v.toFixed(2)}>`)
    expect([3.14159, 0, -2.5, '12', undefined, null, 'x'].map(f)).toEqual(['<3.14>', '<0.00>', '<-2.50>', '12', '', '', 'x'])
  })
})
