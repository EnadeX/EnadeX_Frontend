import { redirect } from 'next/navigation'

import { ROTAS } from '@/lib/enade-time/rotas'

export default function SpdIndex() {
  redirect(ROTAS.spdComparativo)
}
