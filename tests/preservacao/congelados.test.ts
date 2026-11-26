// Arquivos de lógica dos subprojetos que a refatoração visual não pode alterar (plano, seção 0).
// Os hashes foram gravados no início da refatoração, sobre a `master`. Os de lib/multienade/ foram regravados em
// 18/10/2026, quando o autor refez a modelagem do MultiENADE (EnadeX/multi_enade/EXPLORACAO_MODELO_*.md).
// Os de lib/enade-time/{api,types}.ts e hooks/useAnalises.ts foram regravados em 25/11/2026: rota GET /analises/descritiva
// (estatística por curso-ano) e campos desvio_padrao_*_curso_ano. Os hashes são do conteúdo com fim de linha LF.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import congelados from './congelados.json'

describe('arquivos congelados', () => {
  it.each(Object.entries(congelados))('%s não mudou', (arquivo, hash) => {
    expect(createHash('sha256').update(readFileSync(arquivo)).digest('hex')).toBe(hash)
  })
})
