import { formatInt, formatSeconds } from '@/lib/enade-time/format'
import type { CargaResposta, ResumoCarga } from '@/lib/enade-time/types'

// Eixo de carga (D17): custo de PUBLICAR a base num destino. Não é speedup nem ganho de paralelismo.

export const ROTULO_ESTRATEGIA: Record<string, string> = {
  copy_local: 'COPY no Postgres local',
  copy_pooler: 'COPY pelo Session Pooler (Supabase)',
  upsert_postgrest: 'Upsert em lotes pelo PostgREST (Supabase)',
  controle_local_sem_estrutura: 'Controle: COPY local, sem índices nem FKs',
  controle_pooler_sem_estrutura: 'Controle: COPY pelo pooler, sem índices nem FKs',
  controle_local_so_indices: 'Controle: COPY local, só PK e índices',
  controle_local_so_fks: 'Controle: COPY local, só PK e FKs',
}

export const ROTULO_CURTO: Record<string, string> = {
  copy_local: 'COPY local',
  copy_pooler: 'COPY pooler',
  upsert_postgrest: 'Upsert PostgREST',
  controle_local_sem_estrutura: 'Local sem estrutura',
  controle_pooler_sem_estrutura: 'Pooler sem estrutura',
  controle_local_so_indices: 'Local só índices',
  controle_local_so_fks: 'Local só FKs',
}

const ORDEM = Object.keys(ROTULO_ESTRATEGIA)

export const ehControle = (estrategia: string) => estrategia.startsWith('controle_')

export function ordenarResumo(resumo: ResumoCarga[]): ResumoCarga[] {
  return [...resumo].sort((a, b) => ORDEM.indexOf(a.estrategia) - ORDEM.indexOf(b.estrategia))
}

// Parágrafos calculados dos dados, na mesma lógica de docs/geradores/dados_benchmark.py
// (leitura_carga), para a tela e o documento do TCC dizerem a mesma coisa.
const decimal1Fmt = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function leituraCarga(c: CargaResposta): string[] {
  const r = Object.fromEntries(c.resumo.map((x) => [x.estrategia, x])) as Record<
    string,
    ResumoCarga | undefined
  >
  const ref = c.resumo[0]
  if (!ref) return []
  const s = (v: number) => formatSeconds(v)
  const ms = (v: number | null | undefined) => (v == null ? '—' : decimal1Fmt.format(v))
  const anterior = c.anterior ?? {}
  const paragrafos = [
    `Cada repetição carrega as ${formatInt(ref.linhas_destino)} linhas numa tabela vazia e dedicada ` +
      `(${formatInt(ref.bytes_payload)} bytes), com o TRUNCATE por conexão direta fora do tempo medido e o md5 do ` +
      `destino conferido contra a tabela fato; ${ref.n} repetições por estratégia, intercaladas, com a rede em ` +
      `${ref.rede ?? 'condição não registrada'}. É custo de publicação, não ganho de paralelismo, e vale para estas ` +
      `condições (rede, RTT e host): uma medição situada, não uma propriedade do Supabase.`,
  ]
  const lo = r.copy_local
  const po = r.copy_pooler
  if (lo && po) {
    const razao =
      lo.rtt_mediana_ms && po.rtt_mediana_ms
        ? Math.round(po.rtt_mediana_ms / lo.rtt_mediana_ms)
        : null
    let texto =
      `A mediana do COPY no Postgres local foi ${s(lo.tempo_mediana)} e a do COPY pelo Session Pooler do ` +
      `Supabase, ${s(po.tempo_mediana)}, com RTT mediano de ${ms(lo.rtt_mediana_ms)} ms e ` +
      `${ms(po.rtt_mediana_ms)} ms${razao ? ` (cerca de ${razao} vezes maior na nuvem)` : ''}. ` +
      `O IQR foi de ${s(lo.tempo_iqr)} no local e de ${s(po.tempo_iqr)} na nuvem.`
    if (anterior.copy_local != null && anterior.copy_pooler != null) {
      texto +=
        ` Em outra rodada, feita antes com o mesmo protocolo, as medianas foram ${s(anterior.copy_local)} e ` +
        `${s(anterior.copy_pooler)}: a distância entre o local e a nuvem varia de uma rodada para a outra com a ` +
        `rede, e é por isso que o resultado vale como medição situada.`
    }
    paragrafos.push(texto)
    const doPooler = c.repeticoes.filter((x) => x.estrategia === 'copy_pooler')
    const maisLentas = [...doPooler].sort((a, b) => b.tempo_seg - a.tempo_seg)
    const maioresRtt = [...doPooler].sort((a, b) => (b.rtt_ms ?? 0) - (a.rtt_ms ?? 0))
    if (maisLentas.length >= 2 && maisLentas[0].tempo_seg > 1.5 * po.tempo_mediana) {
      const lentas = new Set(maisLentas.slice(0, 2).map((x) => x.repeticao))
      const rtts = new Set(maioresRtt.slice(0, 2).map((x) => x.repeticao))
      const mesmas = lentas.size === rtts.size && [...lentas].every((x) => rtts.has(x))
      paragrafos.push(
        mesmas
          ? `A cauda da nuvem vem da rede: as duas repetições mais lentas (${s(maisLentas[0].tempo_seg)} e ` +
              `${s(maisLentas[1].tempo_seg)}) foram também as de maior RTT (${ms(maisLentas[0].rtt_ms)} ms e ` +
              `${ms(maisLentas[1].rtt_ms)} ms).`
          : `A cauda da nuvem (a repetição mais lenta levou ${s(maisLentas[0].tempo_seg)}) não acompanhou o RTT ` +
              `medido antes de cada carga: o RTT não a explica. Pode ser a vazão do enlace durante o envio, que ` +
              `não foi medida.`,
      )
    }
  }
  const cl = r.controle_local_sem_estrutura
  const cp = r.controle_pooler_sem_estrutura
  const ci = r.controle_local_so_indices
  const cf = r.controle_local_so_fks
  if (cl && lo) {
    let texto =
      `Os controles localizam o custo. No Postgres local, sem índices nem chaves estrangeiras o mesmo COPY ` +
      `leva ${s(cl.tempo_mediana)}`
    texto +=
      ci && cf
        ? `; só com a PK e os índices secundários, ${s(ci.tempo_mediana)}; só com a PK e as FKs, ` +
          `${s(cf.tempo_mediana)}; com tudo, como na tabela fato, ${s(lo.tempo_mediana)}. ` +
          `Quase todo o tempo é manutenção de estrutura, e dentro dela as chaves estrangeiras pesam ` +
          `muito mais do que os índices.`
        : `; com tudo, como na tabela fato, ${s(lo.tempo_mediana)}.`
    if (cp && po) {
      texto +=
        ` Pelo Session Pooler, mesmo sem estrutura a carga leva ${s(cp.tempo_mediana)}: esse é o ` +
        `custo de transporte (conexão, TLS e envio do payload) nas condições da medição, e responde por ` +
        `boa parte dos ${s(po.tempo_mediana)} da carga completa na nuvem.`
    }
    texto +=
      ' Hipótese a testar, não medida aqui: carregar sem as chaves estrangeiras e criá-las depois (a ' +
      'validação em bloco evita um gatilho por linha) reduziria o custo de uma republicação.'
    paragrafos.push(texto)
  }
  if (!r.upsert_postgrest) {
    paragrafos.push(
      'O upsert em lotes pelo PostgREST (util_db do grupo) não foi medido nesta rodada: exige SUPABASE_URL e ' +
        'SUPABASE_KEY públicas na máquina da medição.',
    )
  }
  return paragrafos
}
