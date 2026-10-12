import { notFound } from 'next/navigation'

// Qualquer URL desconhecida dentro de /enade-time cai no not-found do módulo
// (sem isto, o Next mostraria o 404 genérico do site, fora da casca do ENADE-Time).
export default function RotaDesconhecida() {
  notFound()
}
