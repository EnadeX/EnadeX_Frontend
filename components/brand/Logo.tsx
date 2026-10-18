import { foco } from '@/lib/brand/classes'
import { cn } from '@/lib/utils'

// Logo do kit (manual p. 4–8, 13). Nunca recriar o nome em texto: sempre um destes arquivos.

export type VersaoLogo = 'horizontal' | 'vertical' | 'simbolo' | 'simbolo-flat'

type Arquivo = { positiva: string; negativa?: string; largura: number; altura: number }

/** viewBox de cada SVG do kit, para `width`/`height` proporcionais. */
export const ARQUIVOS_LOGO: Record<VersaoLogo, Arquivo> = {
  horizontal: {
    positiva: '/img/enadex-horizontal.svg',
    negativa: '/img/enadex-horizontal-negativo.svg',
    largura: 1060.8,
    altura: 251.6,
  },
  vertical: {
    positiva: '/img/enadex-vertical.svg',
    negativa: '/img/enadex-vertical-negativo.svg',
    largura: 766.8,
    altura: 602.16,
  },
  // os símbolos funcionam em fundo claro e escuro, sem versão negativa
  simbolo: { positiva: '/img/enadex-simbolo.svg', largura: 354.41, altura: 358 },
  'simbolo-flat': { positiva: '/img/enadex-simbolo-flat.svg', largura: 354.41, altura: 358 },
}

/** Tamanhos mínimos em tela (manual p. 6). */
export const MINIMOS = { horizontalAltura: 20, simboloAltura: 32, verticalLargura: 180 } as const

export const ALT_LINK = 'EnadeX, página inicial'

/**
 * Abaixo do tamanho mínimo, troca pela versão indicada no manual:
 * vertical abaixo de 180px de largura → horizontal (mesma largura); horizontal abaixo de 20px de altura →
 * símbolo flat; símbolo de vidro abaixo de 32px → símbolo flat.
 */
export function escolherLogo(versao: VersaoLogo, altura: number): { versao: VersaoLogo; largura: number; altura: number } {
  const proporcao = (v: VersaoLogo) => ARQUIVOS_LOGO[v].largura / ARQUIVOS_LOGO[v].altura
  const medida = (v: VersaoLogo, a: number) => ({ versao: v, altura: a, largura: Math.round(a * proporcao(v)) })

  if (versao === 'vertical') {
    const largura = altura * proporcao('vertical')
    if (largura >= MINIMOS.verticalLargura) return medida('vertical', altura)
    return escolherLogo('horizontal', Math.round(largura / proporcao('horizontal')))
  }
  if (versao === 'horizontal' && altura < MINIMOS.horizontalAltura) return medida('simbolo-flat', altura)
  if (versao === 'simbolo' && altura < MINIMOS.simboloAltura) return medida('simbolo-flat', altura)
  return medida(versao, altura)
}

/** Área de proteção: x/2, com x a altura do E (manual p. 6). */
function protecao(versao: VersaoLogo, largura: number, altura: number) {
  if (versao === 'horizontal') return Math.round((altura * 2) / 7) // 28px → 8px, 40px → 11px
  if (versao === 'vertical') return Math.round(largura / 10) // 240px → 24px
  return Math.round(largura / 4) // símbolo: ¼ da largura
}

export type LogoProps = {
  versao?: VersaoLogo
  /** Altura em px. */
  altura?: number
  /** Altura em px abaixo de 640px de largura de tela (ex.: 24 no cabeçalho do site). */
  alturaCelular?: number
  /** `escuro` força a negativa (rodapé, barra navy). `auto` segue o tema. */
  fundo?: 'auto' | 'escuro'
  href?: string
  /** Imagem decorativa (o nome já está escrito ao lado): `alt=""`. */
  decorativa?: boolean
  className?: string
}

export function Logo({
  versao = 'horizontal',
  altura = 28,
  alturaCelular,
  fundo = 'auto',
  href,
  decorativa = false,
  className,
}: LogoProps) {
  const escolhida = escolherLogo(versao, altura)
  const arquivo = ARQUIVOS_LOGO[escolhida.versao]
  const alt = decorativa ? '' : href ? ALT_LINK : 'EnadeX'
  const p = protecao(escolhida.versao, escolhida.largura, escolhida.altura)

  const estiloImg = alturaCelular
    ? ({ '--logo-h': `${escolhida.altura}px`, '--logo-h-sm': `${alturaCelular}px` } as React.CSSProperties)
    : undefined
  const classeImg = cn('block max-w-none', alturaCelular ? 'h-(--logo-h-sm) w-auto sm:h-(--logo-h)' : undefined)

  const img = (src: string, altImg: string, classe?: string) => (
    <img
      src={src}
      alt={altImg}
      width={escolhida.largura}
      height={escolhida.altura}
      className={cn(classeImg, classe)}
      style={estiloImg}
      data-logo-versao={escolhida.versao}
    />
  )

  let imagens: React.ReactNode
  if (!arquivo.negativa) imagens = img(arquivo.positiva, alt)
  else if (fundo === 'escuro') imagens = img(arquivo.negativa, alt)
  else
    imagens = (
      <>
        {img(arquivo.positiva, alt, 'enx-logo-light')}
        {img(arquivo.negativa, '', 'enx-logo-dark')}
      </>
    )

  const classe = cn('inline-flex shrink-0 items-center rounded-marca-sm leading-[0]', className)
  const estilo = { padding: p, margin: -p }
  // Com o par positiva/negativa, a imagem visível muda com o tema; o nome acessível fica no contêiner.
  const par = Boolean(arquivo.negativa) && fundo !== 'escuro'
  const nome = par && alt ? alt : undefined

  if (href)
    return (
      <a href={href} aria-label={nome} className={cn(classe, foco)} style={estilo} data-brand-logo="">
        {imagens}
      </a>
    )
  return (
    <span role={nome ? 'img' : undefined} aria-label={nome} className={classe} style={estilo} data-brand-logo="">
      {imagens}
    </span>
  )
}
