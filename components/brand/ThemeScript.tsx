'use client'

import { SCRIPT_TEMA } from '@/lib/brand/theme'

/**
 * Vai no <head> do layout raiz: lê `enx-theme` do localStorage antes da pintura, para a página não piscar no
 * claro. Padrão do guia "Preventing flash before hydration" do Next: no servidor o script é `text/javascript` e
 * roda durante o parse do HTML; no cliente vira `text/plain`, para o React não acusar <script> renderizado
 * (o que acontece, por exemplo, quando o not-found é renderizado no cliente).
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }}
    />
  )
}
