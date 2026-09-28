import type { ClusterRow, RegressaoRow, ShapRow } from './api'
import { CORES_CATEGORIA, type VariavelCor } from './constants'

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function escala(valor: number, min: number, max: number) {
  if (max === min) return 50
  return ((valor - min) / (max - min)) * 100
}

// Classifica cada curso em uma das duas categorias, replicando a lógica de
// preparar_dados_plotagem() do modelo_regressao.py.
export function classificar(d: RegressaoRow, variavel: VariavelCor): { categoria: string; cor: string } {
  if (variavel === 'infraestrutura') {
    const categoria = d.QE_I63 >= 4.0 ? 'Adequada/Excelente' : 'Regular/Insuficiente'
    return { categoria, cor: CORES_CATEGORIA.infraestrutura[categoria] }
  }
  const categoria = d.QE_I15_A >= 0.5 ? 'Maioria Ampla Concorr.' : 'Maioria Cotistas'
  return { categoria, cor: CORES_CATEGORIA.cotas[categoria] }
}

// Regressão linear simples (mínimos quadrados), equivalente ao sns.regplot do Python.
export function regressaoLinear(pontos: { x: number; y: number }[]): { a: number; b: number } {
  const n = pontos.length
  if (n === 0) return { a: 0, b: 0 }
  const mediaX = pontos.reduce((s, p) => s + p.x, 0) / n
  const mediaY = pontos.reduce((s, p) => s + p.y, 0) / n
  let num = 0
  let den = 0
  for (const p of pontos) {
    num += (p.x - mediaX) * (p.y - mediaY)
    den += (p.x - mediaX) ** 2
  }
  const b = den === 0 ? 0 : num / den
  const a = mediaY - b * mediaX
  return { a, b }
}

// Se a tabela de SHAP tiver linhas duplicadas por falta de PK no banco, mantém
// apenas a primeira ocorrência de cada feature — evita erro de key duplicada no React.
export function deduplicarPorFeature(dados: ShapRow[]): ShapRow[] {
  const vistos = new Set<string>()
  const resultado: ShapRow[] = []
  for (const d of dados) {
    if (!vistos.has(d.feature)) {
      vistos.add(d.feature)
      resultado.push(d)
    }
  }
  return resultado
}

// Reduz um array grande para no máximo `n` itens, distribuídos uniformemente,
// para não desenhar milhares de elementos no DOM.
export function amostrar<T>(dados: T[], n: number): T[] {
  if (dados.length <= n) return dados
  const passo = dados.length / n
  const resultado: T[] = []
  for (let i = 0; i < n; i++) {
    resultado.push(dados[Math.floor(i * passo)])
  }
  return resultado
}

export function scalePca<K extends 'PCA_X' | 'PCA_Y'>(valor: number, dados: ClusterRow[], campo: K): number {
  const valores = dados.map((d) => d[campo])
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  if (max === min) return 50
  return clamp(((valor - min) / (max - min)) * 100, 2, 98)
}

export function formatarCelula(valor: unknown): string {
  if (typeof valor === 'number') {
    return Number.isInteger(valor) ? String(valor) : valor.toFixed(2)
  }
  return String(valor ?? '')
}
