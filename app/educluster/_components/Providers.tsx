'use client'

import { QueryClient, QueryClientProvider, environmentManager } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { EduClusterApiError } from '@/lib/educluster/api'

function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (tentativas, erro) =>
          tentativas < 1 &&
          !(erro instanceof EduClusterApiError && erro.status >= 400 && erro.status < 500),
      },
    },
  })
}

let clienteNoNavegador: QueryClient | undefined

function obterQueryClient() {
  if (environmentManager.isServer()) return criarQueryClient()
  clienteNoNavegador ??= criarQueryClient()
  return clienteNoNavegador
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={obterQueryClient()}>{children}</QueryClientProvider>
}
