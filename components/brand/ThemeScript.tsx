import { SCRIPT_TEMA } from '@/lib/brand/theme'

/** Vai no <head>: lê `enx-theme` do localStorage antes da pintura. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
}
