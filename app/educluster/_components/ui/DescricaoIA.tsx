'use client'

import type { UseQueryResult } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'

import type { Descricao } from '@/lib/educluster/types'
import { btnPrimary } from '@/lib/educluster/ui'

import { ErrorState } from '../feedback/ErrorState'
import { LoadingSpinner } from '../feedback/LoadingSpinner'
import { Card, CardHeader } from './Card'
import { TextoIA } from './TextoIA'

export function DescricaoIA({
  titulo,
  query,
  solicitado,
  onSolicitar,
}: {
  titulo: string
  query: UseQueryResult<Descricao>
  solicitado: boolean
  onSolicitar: () => void
}) {
  const dados = query.data

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden />
            {titulo}
          </span>
        }
        description="Texto gerado no backend a partir dos perfis e das métricas já calculados. A IA não altera nenhum número: só descreve. A resposta fica em cache, então a mesma configuração devolve sempre o mesmo texto."
        action={
          !solicitado ? (
            <button type="button" onClick={onSolicitar} className={btnPrimary}>
              <Sparkles className="size-4" aria-hidden />
              Gerar descrição
            </button>
          ) : undefined
        }
      />
      {solicitado && query.isPending && (
        <LoadingSpinner label="Gerando descrição…" detalhe="Na primeira vez a chamada ao modelo leva alguns segundos." />
      )}
      {query.isError && (
        <ErrorState
          message={query.error instanceof Error ? query.error.message : 'Erro desconhecido'}
          onRetry={() => query.refetch()}
        />
      )}
      {dados && !dados.disponivel && (
        <p className="rounded-marca-md border border-warning bg-surface-card p-3 text-small text-warning">
          Descrição indisponível: {dados.motivo ?? 'motivo não informado pelo backend'}.
        </p>
      )}
      {dados?.disponivel && dados.descricao && (
        <div className="space-y-4">
          <TextoIA texto={dados.descricao} />
          <p className="border-t border-border pt-3 text-caption text-ink-muted">
            Modelo {dados.modelo} · {dados.origem === 'cache' ? 'servido do cache' : 'gerado agora'}
            {dados.chave_cache ? ` · chave ${dados.chave_cache}` : ''}
          </p>
        </div>
      )}
    </Card>
  )
}
