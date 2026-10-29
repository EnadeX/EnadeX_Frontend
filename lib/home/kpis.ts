// KPIs da página inicial: um número de cada subprojeto, lido das APIs que os próprios
// módulos já expõem (nenhum endpoint novo). Cada KPI carrega e falha sozinho, para que
// um backend fora do ar não apague os outros cards.

import { useEffect, useState } from 'react'
import { getDatasetResumo } from '@/lib/e-xplainenade/api'
import { fetchAreas } from '@/lib/educluster/api'
import { fetchResumoAnual } from '@/lib/enade-time/api'
import type { ResumoAnual } from '@/lib/enade-time/types'
import { getRelatorioAssociacao, getRelatorioCluster } from '@/lib/multienade/api'

export type EstadoKpi =
  | { status: 'carregando' }
  | { status: 'erro' }
  | { status: 'ok'; valor: string; detalhe: string }

export type EstadoSerie =
  | { status: 'carregando' }
  | { status: 'erro' }
  | { status: 'ok'; anos: ResumoAnual[] }

const inteiro = (n: number) => n.toLocaleString('pt-BR')
const decimal = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

async function kpiMultiEnade(): Promise<EstadoKpi> {
  const [clusters, regras] = await Promise.all([getRelatorioCluster(), getRelatorioAssociacao()])
  const perfis = new Set(clusters.map((c) => c.Cluster_ID)).size
  return {
    status: 'ok',
    valor: inteiro(regras.length),
    detalhe: `${inteiro(clusters.length)} cursos em ${perfis} perfis`,
  }
}

async function kpiExplain(signal: AbortSignal): Promise<EstadoKpi> {
  const resumo = await getDatasetResumo(undefined, signal)
  const media = resumo.media_nota_geral
  return {
    status: 'ok',
    valor: resumo.n_estudantes_representados === null ? '—' : inteiro(resumo.n_estudantes_representados),
    detalhe: `${inteiro(resumo.n_cursos)} cursos${media === null ? '' : ` · nota média ${decimal(media)}`}`,
  }
}

async function kpiEduCluster(signal: AbortSignal): Promise<EstadoKpi> {
  const { total, areas } = await fetchAreas(signal)
  const cursos = areas.reduce((soma, a) => soma + a.cursos, 0)
  return { status: 'ok', valor: inteiro(cursos), detalhe: `${total} áreas de avaliação` }
}

function kpiEnadeTime(anos: ResumoAnual[]): EstadoKpi {
  if (anos.length === 0) return { status: 'erro' }
  const inscricoes = anos.reduce((soma, a) => soma + a.total_registros, 0)
  return {
    status: 'ok',
    valor: String(anos.length).padStart(2, '0'),
    detalhe: `${anos[0].nu_ano} a ${anos[anos.length - 1].nu_ano} · ${inteiro(inscricoes)} inscrições`,
  }
}

export function useKpisHome() {
  const [multiEnade, setMultiEnade] = useState<EstadoKpi>({ status: 'carregando' })
  const [explain, setExplain] = useState<EstadoKpi>({ status: 'carregando' })
  const [eduCluster, setEduCluster] = useState<EstadoKpi>({ status: 'carregando' })
  const [serie, setSerie] = useState<EstadoSerie>({ status: 'carregando' })

  useEffect(() => {
    const controle = new AbortController()
    const vivo = () => !controle.signal.aborted
    const carregar = (busca: Promise<EstadoKpi>, definir: (e: EstadoKpi) => void) =>
      busca.then((e) => vivo() && definir(e)).catch(() => vivo() && definir({ status: 'erro' }))

    carregar(kpiMultiEnade(), setMultiEnade)
    carregar(kpiExplain(controle.signal), setExplain)
    carregar(kpiEduCluster(controle.signal), setEduCluster)
    fetchResumoAnual({}, controle.signal)
      .then((anos) => vivo() && setSerie({ status: 'ok', anos: [...anos].sort((a, b) => a.nu_ano - b.nu_ano) }))
      .catch(() => vivo() && setSerie({ status: 'erro' }))

    return () => controle.abort()
  }, [])

  const enadeTime: EstadoKpi = serie.status === 'ok' ? kpiEnadeTime(serie.anos) : serie

  return { multiEnade, explain, eduCluster, enadeTime, serie }
}
