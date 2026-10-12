'use client'

import { RegistrosView } from '@/app/enade-time/_components/views/RegistrosView'
import { useFiltrosUrl } from '@/lib/enade-time/hooks/useFiltrosUrl'

export default function EnadeRegistros() {
  // `chave` muda quando um filtro muda: a view é remontada e volta para a página 1.
  const { chave } = useFiltrosUrl()
  return <RegistrosView key={chave} />
}
