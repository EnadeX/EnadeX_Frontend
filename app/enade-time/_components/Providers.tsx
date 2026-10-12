'use client'

import { QueryClient, QueryClientProvider, environmentManager } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { EnadeTimeApiError } from '@/lib/enade-time/api'

function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Uma nova tentativa, exceto para erros 4xx (parâmetro inválido, id inexistente).
        retry: (tentativas, erro) =>
          tentativas < 1 &&
          !(erro instanceof EnadeTimeApiError && erro.status >= 400 && erro.status < 500),
      },
    },
  })
}

let clienteNoNavegador: QueryClient | undefined

// No servidor cada requisição ganha um cliente novo (nada de cache compartilhado entre
// usuários); no navegador o cliente é um singleton, para não ser recriado em re-renders.
function obterQueryClient() {
  if (environmentManager.isServer()) return criarQueryClient()
  clienteNoNavegador ??= criarQueryClient()
  return clienteNoNavegador
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={obterQueryClient()}>{children}</QueryClientProvider>
}
