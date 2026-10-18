import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Ensina ao tailwind-merge os utilitários da marca (app/globals.css): sem isso, `text-body` (tamanho) e
// `text-ink` (cor) seriam tratados como a mesma classe e um apagaria o outro.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'h1', 'h2', 'h3', 'body', 'small', 'caption', 'kpi', 'table-num', 'axis'],
      radius: ['marca-sm', 'marca-md', 'marca-lg'],
      shadow: ['marca', 'marca-overlay'],
      font: ['marca', 'dados'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
