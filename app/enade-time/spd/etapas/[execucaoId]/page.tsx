import { notFound } from 'next/navigation'

import { EtapaDetalheView } from '../../../_components/views/EtapaDetalheView'

// notFound() só funciona em componente de servidor; por isso o id é validado aqui e a
// parte interativa fica em EtapaDetalheView ('use client').
export default async function EtapaDetalhePage({
  params,
}: {
  params: Promise<{ execucaoId: string }>
}) {
  const { execucaoId } = await params
  if (!/^\d+$/.test(execucaoId)) notFound()
  return <EtapaDetalheView id={Number(execucaoId)} />
}
