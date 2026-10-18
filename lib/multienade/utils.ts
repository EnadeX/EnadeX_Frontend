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
// preparar_dados_plotagem() do modelo_regressao.py. Em "cotas", o corte é a mediana da soma
// QE_I15_C + QE_I15_E na base (essas proporções raramente passam de 0,2–0,3; um limiar fixo de 0,5 não separaria).
export function proporcaoCotas(d: RegressaoRow) {
  return d.QE_I15_C + d.QE_I15_E
}

export function mediana(valores: number[]) {
  if (valores.length === 0) return 0
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2
}

export function classificar(
  d: RegressaoRow,
  variavel: VariavelCor,
  medianaCotas: number,
): { categoria: string; cor: string } {
  if (variavel === 'professores') {
    const categoria = d.QE_I57 >= 5.0 ? 'Concordância alta' : 'Concordância baixa/média'
    return { categoria, cor: CORES_CATEGORIA.professores[categoria] }
  }
  const categoria = proporcaoCotas(d) >= medianaCotas ? 'Mais cotistas (renda/múlt. critérios)' : 'Menos cotistas'
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

// Itens das regras de associação vêm como "<item>_<nível>" (ex.: "oportunidades_ic_6") ou
// "desempenho_desempenho_<banda>" (prefixo duplicado pelo get_dummies do pandas).
const NOMES_ITENS_ASSOCIACAO: Record<string, string> = {
  professores_dominio: 'Domínio dos professores (QE_I57)',
  infra_salas: 'Salas de aula (QE_I61)',
  formacao_critica: 'Pensamento crítico (QE_I34)',
  oportunidades_ic: 'Oportunidades de iniciação científica (QE_I44)',
  metodologia_inovadora: 'Aprendizagem inovadora (QE_I30)',
  profs_disponibilidade: 'Disponibilidade dos professores (QE_I56)',
}

const BANDAS_DESEMPENHO: Record<string, string> = {
  desempenho_alto: 'Curso com desempenho alto',
  desempenho_medio: 'Curso com desempenho médio',
  desempenho_baixo: 'Curso com desempenho baixo',
}

/** Um item ("oportunidades_ic_6") em texto legível ("Oportunidades de iniciação científica (QE_I44): 6"). */
export function formatarItemAssociacao(item: string): string {
  const limpo = item.trim().replace(/^desempenho_(?=desempenho_)/, '')
  if (BANDAS_DESEMPENHO[limpo]) return BANDAS_DESEMPENHO[limpo]
  const m = limpo.match(/^(.*)_(\d+)$/)
  if (m && NOMES_ITENS_ASSOCIACAO[m[1]]) return `${NOMES_ITENS_ASSOCIACAO[m[1]]}: ${m[2]}`
  return limpo
}

/** Lista de itens separada por vírgula, como vem da API. */
export function itensAssociacao(texto: string): string[] {
  return texto.split(',').map(formatarItemAssociacao)
}

export function envolveDesempenho(regra: { antecedents: string; consequents: string }) {
  return /desempenho_/.test(regra.antecedents + regra.consequents)
}

export function formatarCelula(valor: unknown): string {
  if (typeof valor === 'number') {
    return Number.isInteger(valor) ? String(valor) : valor.toFixed(2)
  }
  return String(valor ?? '')
}
