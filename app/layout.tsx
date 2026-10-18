import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { ThemeScript } from '@/components/brand/ThemeScript'
import './globals.css'

// Poppins só em 400 e 500 (manual p. 11). Fica disponível como --font-poppins, usada por --font-brand.
const poppins = localFont({
  src: [
    { path: './fonts/Poppins-Regular.woff', weight: '400', style: 'normal' },
    { path: './fonts/Poppins-Medium.woff', weight: '500', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EnadeX',
  description: 'Plataforma integrada para análise multidimensional e explicável dos microdados do ENADE.',
  generator: 'EnadeX',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'EnadeX',
    images: [{ url: '/img/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#0C3350',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={poppins.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
