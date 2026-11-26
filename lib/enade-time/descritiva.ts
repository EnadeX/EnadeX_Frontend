// Estatística descritiva por edição (unidade curso-ano): rótulos das notas, formatação brasileira e o texto
// de apoio da tabela. As medidas vêm de GET /analises/descritiva, calculadas sobre as médias de curso (uma
// observação por curso-ano), nunca sobre as linhas de inscrição.
import type { DescritivaAnual, NotaChave } from '@/lib/enade-time/types'

export const NOTAS: readonly { chave: NotaChave; rotulo: string }[] = [
  { chave: 'nt_ger', rotulo: 'NT GER' },
  { chave: 'nt_fg', rotulo: 'NT FG' },
  { chave: 'nt_ce', rotulo: 'NT CE' },
]

export const NOTA_PADRAO: NotaChave = 'nt_ger'

export function rotuloNota(chave: NotaChave): string {
  return NOTAS.find((n) => n.chave === chave)?.rotulo ?? chave
}

const decimal1Fmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Uma casa decimal, vírgula decimal (usada no coeficiente de variação, em %). */
export function formatDecimal1(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return decimal1Fmt.format(value)
}

export const TITULO_TABELA = 'Estatística descritiva por edição (unidade curso-ano)'

export const NOTA_DA_TABELA =
  'Medidas calculadas sobre as médias de curso (uma observação por curso-ano). ' +
  'As edições não são diretamente comparáveis; 2005 e 2008 incluem ingressantes.'

// Nota das tabelas por região e UF: as médias seguem ponderadas por inscrição (como o gráfico); os
// desvios-padrão saem das médias de curso (campos `desvio_padrao_*_curso_ano` da API).
export const NOTA_DESVIO =
  'Médias por inscrição (cada curso pesa pelo número de inscritos). Desvios-padrão calculados entre as ' +
  'médias de curso (uma observação por curso-ano); sem filtro de ano, reúnem edições que não são ' +
  'diretamente comparáveis.'

/** Curso-ano do recorte que não têm a nota escolhida (n conta só os que têm). */
export function cursoAnoSemNota(rows: DescritivaAnual[], nota: NotaChave): number {
  return rows.reduce((acc, r) => acc + (r.cursos - r[nota].n), 0)
}
