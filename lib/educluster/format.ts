const VAZIO = '-'

function valido(valor: number | null | undefined): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor)
}

export function formatInteiro(valor: number | null | undefined): string {
  if (!valido(valor)) return VAZIO
  return Math.round(valor).toLocaleString('pt-BR')
}

export function formatDecimal(valor: number | null | undefined, casas: number = 2): string {
  if (!valido(valor)) return VAZIO
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

export function formatPercentual(valor: number | null | undefined, casas: number = 1): string {
  if (!valido(valor)) return VAZIO
  return `${formatDecimal(valor * 100, casas)}%`
}

export function formatPercentualDireto(valor: number | null | undefined, casas: number = 1): string {
  if (!valido(valor)) return VAZIO
  return `${formatDecimal(valor, casas)}%`
}

export function formatSinal(valor: number | null | undefined, casas: number = 2): string {
  if (!valido(valor)) return VAZIO
  const texto = formatDecimal(Math.abs(valor), casas)
  if (valor > 0) return `+${texto}`
  if (valor < 0) return `-${texto}`
  return texto
}
