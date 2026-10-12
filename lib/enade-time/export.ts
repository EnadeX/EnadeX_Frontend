import { rotuloAmostra, tamanhoAmostra } from '@/lib/enade-time/amostra'
import type { ResumoAnual } from '@/lib/enade-time/types'

// ---------------------------------------------------------------------------
// Tipos compartilhados da comparação longitudinal (Módulo 3)
// ---------------------------------------------------------------------------
export interface GrupoComparado {
  label: string
  serie: ResumoAnual[] // uma linha por ano (resumo-anual filtrado pelo grupo)
}

export interface DadosComparacao {
  dimensaoLabel: string
  metricaLabel: string // ex.: "Média NT GER"
  filtrosResumo: string // texto legível dos filtros aplicados
  limiarAmostra: number
  grupoA: GrupoComparado
  grupoB: GrupoComparado
}

// ---------------------------------------------------------------------------
// Download genérico (só pode ser chamado em handlers de evento: usa `document`)
// ---------------------------------------------------------------------------
export function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // libera o objeto URL no próximo tick
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function carimboArquivo(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`
}

function num(v: number | null | undefined): string {
  return v === null || v === undefined || Number.isNaN(v) ? '' : String(v)
}

// ---------------------------------------------------------------------------
// 1) Exportar a série temporal comparativa em CSV (formato longo)
//    Colunas: ano;grupo;media_nt_ger;n_registros
// ---------------------------------------------------------------------------
export function exportarSerieCSV(dados: DadosComparacao): void {
  const linhas: string[] = ['ano;grupo;media_nt_ger;n_registros;n_cursos']
  for (const g of [dados.grupoA, dados.grupoB]) {
    for (const ponto of g.serie) {
      linhas.push(
        [
          ponto.nu_ano,
          g.label,
          num(ponto.media_geral_ger),
          ponto.total_registros,
          num(ponto.total_cursos),
        ].join(';'),
      )
    }
  }
  // BOM para abrir corretamente no Excel pt-BR
  downloadBlob(
    '﻿' + linhas.join('\r\n') + '\r\n',
    `enade_comparacao_${carimboArquivo()}.csv`,
    'text/csv',
  )
}

// ---------------------------------------------------------------------------
// 2) Exportar o gráfico (SVG do Recharts) capturado de um container.
//    A legenda do Recharts 3 é HTML fora do <svg>, então não vai no arquivo.
// ---------------------------------------------------------------------------
export function exportarGraficoSVG(
  container: HTMLElement | null,
  filenameBase = 'enade_comparacao_grafico',
): boolean {
  const svgOriginal =
    container?.querySelector<SVGSVGElement>('.recharts-wrapper > svg.recharts-surface') ??
    container?.querySelector<SVGSVGElement>('svg.recharts-surface')
  if (!svgOriginal) return false

  const clone = svgOriginal.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

  const rect = svgOriginal.getBoundingClientRect()
  const w = Math.round(rect.width) || 800
  const h = Math.round(rect.height) || 360
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  if (!clone.getAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }

  // fundo branco (Recharts é transparente por padrão)
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('x', '0')
  bg.setAttribute('y', '0')
  bg.setAttribute('width', '100%')
  bg.setAttribute('height', '100%')
  bg.setAttribute('fill', '#ffffff')
  clone.insertBefore(bg, clone.firstChild)

  const xml =
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n' +
    new XMLSerializer().serializeToString(clone)
  downloadBlob(xml, `${filenameBase}_${carimboArquivo()}.svg`, 'image/svg+xml')
  return true
}

// ---------------------------------------------------------------------------
// 3) Relatório longitudinal automático em Markdown
// ---------------------------------------------------------------------------
function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function primeiroUltimoValido(serie: ResumoAnual[]): {
  primeiro: ResumoAnual | null
  ultimo: ResumoAnual | null
} {
  const validos = serie.filter((p) => p.media_geral_ger !== null)
  return {
    primeiro: validos[0] ?? null,
    ultimo: validos[validos.length - 1] ?? null,
  }
}

function narrativaGrupo(g: GrupoComparado): string {
  const { primeiro, ultimo } = primeiroUltimoValido(g.serie)
  if (!primeiro || !ultimo || primeiro === ultimo) {
    return `- **${g.label}**: dados insuficientes para descrever tendência.`
  }
  const delta = (ultimo.media_geral_ger ?? 0) - (primeiro.media_geral_ger ?? 0)
  const dir = delta > 0.5 ? 'alta' : delta < -0.5 ? 'queda' : 'estabilidade'
  return (
    `- **${g.label}**: de ${primeiro.nu_ano} (${fmt(primeiro.media_geral_ger)}) ` +
    `a ${ultimo.nu_ano} (${fmt(ultimo.media_geral_ger)}), variação de ` +
    `${delta >= 0 ? '+' : ''}${fmt(delta)} pontos — tendência de **${dir}**.`
  )
}

export function gerarRelatorioMarkdown(dados: DadosComparacao): string {
  const anos = Array.from(
    new Set([
      ...dados.grupoA.serie.map((p) => p.nu_ano),
      ...dados.grupoB.serie.map((p) => p.nu_ano),
    ]),
  ).sort((a, b) => a - b)

  const idxA = new Map(dados.grupoA.serie.map((p) => [p.nu_ano, p]))
  const idxB = new Map(dados.grupoB.serie.map((p) => [p.nu_ano, p]))

  const linhasTabela = anos.map((ano) => {
    const a = idxA.get(ano)
    const b = idxB.get(ano)
    return `| ${ano} | ${fmt(a?.media_geral_ger ?? null)} | ${a?.total_cursos ?? '—'} | ${a?.total_registros ?? '—'} | ${fmt(b?.media_geral_ger ?? null)} | ${b?.total_cursos ?? '—'} | ${b?.total_registros ?? '—'} |`
  })

  // alerta de amostra reduzida
  const alertas: string[] = []
  for (const g of [dados.grupoA, dados.grupoB]) {
    for (const p of g.serie) {
      const { n, unidade } = tamanhoAmostra(p)
      if (n < dados.limiarAmostra) {
        alertas.push(
          `- ⚠️ **${g.label} / ${p.nu_ano}**: ${rotuloAmostra(n, unidade)} (< ${dados.limiarAmostra}), ${p.total_registros} inscrições — estimativa estatisticamente frágil.`,
        )
      }
    }
  }

  const dataHora = new Date().toLocaleString('pt-BR')

  return [
    `# Relatório Longitudinal — ENADE-Time`,
    ``,
    `**Gerado em:** ${dataHora}`,
    `**Métrica principal:** ${dados.metricaLabel} (\`media_nt_ger\`)`,
    `**Dimensão comparada:** ${dados.dimensaoLabel}`,
    `**Grupos comparados:** ${dados.grupoA.label} × ${dados.grupoB.label}`,
    `**Filtros aplicados:** ${dados.filtrosResumo || 'nenhum (universo do recorte)'}`,
    ``,
    `## Série por ano e grupo`,
    ``,
    `| Ano | ${dados.grupoA.label} (GER) | cursos (${dados.grupoA.label}) | inscrições (${dados.grupoA.label}) | ${dados.grupoB.label} (GER) | cursos (${dados.grupoB.label}) | inscrições (${dados.grupoB.label}) |`,
    `|----:|---:|---:|---:|---:|---:|---:|`,
    ...linhasTabela,
    ``,
    `## Interpretação automática`,
    ``,
    narrativaGrupo(dados.grupoA),
    narrativaGrupo(dados.grupoB),
    ``,
    `## Alertas de amostra reduzida`,
    ``,
    alertas.length > 0
      ? alertas.join('\n')
      : `- Nenhum: todos os grupos/anos têm pelo menos ${dados.limiarAmostra} cursos.`,
    ``,
    `---`,
    `*Relatório automático gerado pelo dashboard ENADE-Time. Métrica: média da`,
    `Nota Geral (NT GER) por ano e grupo. A unidade de análise é o curso (n = cursos distintos`,
    `do grupo no ano); as inscrições entram como peso nas médias.*`,
    ``,
  ].join('\n')
}

export function exportarRelatorioMarkdown(dados: DadosComparacao): void {
  downloadBlob(
    gerarRelatorioMarkdown(dados),
    `enade_relatorio_longitudinal_${carimboArquivo()}.md`,
    'text/markdown',
  )
}
