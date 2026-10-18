import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { metadata, viewport } from '@/app/layout'
import logosKit from './logos-kit.json'

vi.mock('next/font/local', () => ({ default: () => ({ variable: 'font-poppins', className: '' }) }))
vi.mock('@vercel/analytics/next', () => ({ Analytics: () => null }))

function urls(valor: unknown): string[] {
  if (typeof valor === 'string') return valor.startsWith('/') ? [valor] : []
  if (valor instanceof URL) return []
  if (Array.isArray(valor)) return valor.flatMap(urls)
  if (valor && typeof valor === 'object') return Object.values(valor).flatMap(urls)
  return []
}

describe('0.1 arquivos da marca', () => {
  it('todo arquivo citado em metadata existe em public/', () => {
    const citados = urls({ icons: metadata.icons, manifest: metadata.manifest, og: metadata.openGraph })
    expect(citados.length).toBeGreaterThanOrEqual(5)
    for (const url of citados) expect(existsSync(`public${url}`), url).toBe(true)
  })

  it('themeColor é o azul-marinho da marca', () => {
    expect(viewport.themeColor).toBe('#0C3350')
  })

  it('site.webmanifest: cores e ícones 192 e 512', () => {
    const m = JSON.parse(readFileSync('public/site.webmanifest', 'utf8'))
    expect(m.theme_color).toBe('#0C3350')
    expect(m.background_color).toBe('#F4FAFA')
    expect(m.icons.map((i: { sizes: string }) => i.sizes).sort()).toEqual(['192x192', '512x512'])
    for (const i of m.icons) expect(existsSync(`public/${i.src}`)).toBe(true)
  })

  it.each(Object.entries(logosKit))('logo %s idêntica à do kit', (arquivo, hash) => {
    expect(createHash('sha256').update(readFileSync(`public/img/${arquivo}`)).digest('hex')).toBe(hash)
  })

  it('og-image.png tem 1200 × 630', () => {
    const png = readFileSync('public/img/og-image.png')
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
  })

  it('fontes Poppins em app/fonts', () => {
    expect(existsSync('app/fonts/Poppins-Regular.woff')).toBe(true)
    expect(existsSync('app/fonts/Poppins-Medium.woff')).toBe(true)
  })
})
