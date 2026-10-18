// Diferença de cor (CIEDE2000) e simulação de daltonismo, para os testes de distinção dos clusters.

type RGB = [number, number, number]
type Matriz = [RGB, RGB, RGB]

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

function rgbLinear(hex: string): RGB {
  return [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255)) as RGB
}

/** Matrizes em RGB linear: Machado et al. 2009 (severidade 1) e Viénot et al. 1999. */
export const SIMULACOES: Record<string, Matriz> = {
  'deuteranopia (Machado)': [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  'protanopia (Machado)': [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  'deuteranopia (Viénot)': [
    [0.29275, 0.70725, 0],
    [0.29275, 0.70725, 0],
    [-0.02234, 0.02234, 1],
  ],
  'protanopia (Viénot)': [
    [0.11238, 0.88762, 0],
    [0.11238, 0.88762, 0],
    [0.00401, -0.00401, 1],
  ],
}

function lab([r, g, b]: RGB): RGB {
  const [R, G, B] = [r, g, b].map((c) => Math.min(1, Math.max(0, c)))
  const x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
  const y = 0.2126 * R + 0.7152 * G + 0.0722 * B
  const z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

export function labDe(hex: string, simulacao?: Matriz): RGB {
  const c = rgbLinear(hex)
  if (!simulacao) return lab(c)
  return lab(simulacao.map((linha) => linha[0] * c[0] + linha[1] * c[1] + linha[2] * c[2]) as RGB)
}

const rad = (g: number) => (g * Math.PI) / 180
const graus = (r: number) => (((r * 180) / Math.PI) % 360 + 360) % 360

/** CIEDE2000 (Sharma, Wu e Dalal, 2005). */
export function deltaE2000([L1, a1, b1]: RGB, [L2, a2, b2]: RGB) {
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1p = Math.hypot(a1p, b1)
  const C2p = Math.hypot(a2p, b2)
  const h1 = graus(Math.atan2(b1, a1p))
  const h2 = graus(Math.atan2(b2, a2p))
  const dL = L2 - L1
  const dC = C2p - C1p
  let dh = h2 - h1
  if (C1p * C2p === 0) dh = 0
  else if (dh > 180) dh -= 360
  else if (dh < -180) dh += 360
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dh / 2))
  const Lb = (L1 + L2) / 2
  const Cbp = (C1p + C2p) / 2
  let hb = h1 + h2
  if (C1p * C2p !== 0) hb = Math.abs(h1 - h2) <= 180 ? hb / 2 : hb < 360 ? (hb + 360) / 2 : (hb - 360) / 2
  const T = 1 - 0.17 * Math.cos(rad(hb - 30)) + 0.24 * Math.cos(rad(2 * hb)) + 0.32 * Math.cos(rad(3 * hb + 6)) - 0.2 * Math.cos(rad(4 * hb - 63))
  const dTh = 30 * Math.exp(-(((hb - 275) / 25) ** 2))
  const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
  const SL = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2)
  const SC = 1 + 0.045 * Cbp
  const SH = 1 + 0.015 * Cbp * T
  const RT = -Math.sin(rad(2 * dTh)) * RC
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH))
}
