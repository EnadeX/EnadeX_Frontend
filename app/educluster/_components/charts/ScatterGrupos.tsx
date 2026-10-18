'use client'

import type { ReactNode } from 'react'
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import { EIXO, GRID_COLOR, corSerie, formaSerie } from '@/lib/educluster/chart'
import { formatDecimal } from '@/lib/educluster/format'

export interface PontoGrupo {
  x: number
  y: number
  grupo: number
  destacado?: boolean
}

interface ConteudoTooltip {
  active?: boolean
  payload?: readonly { payload?: unknown }[]
}

export function ScatterGrupos<T extends PontoGrupo>({
  pontos,
  grupos,
  rotuloX,
  rotuloY,
  altura = 420,
  tamanho = 26,
  tamanhoAtivos,
  diagonal = false,
  renderTooltip,
  onSelecionar,
}: {
  pontos: T[]
  grupos: number[]
  rotuloX: string
  rotuloY: string
  altura?: number
  tamanho?: number
  tamanhoAtivos?: number
  diagonal?: boolean
  renderTooltip: (ponto: T) => ReactNode
  onSelecionar?: (ponto: T) => void
}) {
  const algumDestaque = pontos.some((p) => p.destacado === false)
  const apagados = algumDestaque ? pontos.filter((p) => p.destacado === false) : []
  const ativos = algumDestaque ? pontos.filter((p) => p.destacado !== false) : pontos
  const extremo = diagonal ? Math.ceil(Math.max(1, ...pontos.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))))) : 0

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
        <CartesianGrid stroke={GRID_COLOR} />
        <XAxis
          type="number"
          dataKey="x"
          name={rotuloX}
          {...EIXO}
          tickFormatter={(v: number) => formatDecimal(v, 0)}
          label={{ value: rotuloX, position: 'insideBottom', offset: -14, fontSize: 11, fill: '#475569' }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={rotuloY}
          {...EIXO}
          width={44}
          tickFormatter={(v: number) => formatDecimal(v, 0)}
          label={{ value: rotuloY, angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#475569' }}
        />
        {diagonal && (
          <ReferenceLine
            segment={[
              { x: -extremo, y: -extremo },
              { x: extremo, y: extremo },
            ]}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            ifOverflow="hidden"
          />
        )}
        <ZAxis range={[tamanho, tamanho]} />
        <ZAxis zAxisId="ativos" range={[tamanhoAtivos ?? tamanho, tamanhoAtivos ?? tamanho]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
          content={(props: ConteudoTooltip) => {
            const ponto = props.active ? (props.payload?.[0]?.payload as T | undefined) : undefined
            if (!ponto) return null
            return (
              <div className="rounded-lg border border-[#dfe5ee] bg-white px-3 py-2 text-[11px] leading-5 text-[#334155] shadow-md">
                {renderTooltip(ponto)}
              </div>
            )
          }}
        />
        {apagados.length > 0 && (
          <Scatter data={apagados} fill="#cbd5e1" fillOpacity={0.5} shape="circle" isAnimationActive={false} />
        )}
        {grupos.map((grupo) => (
          <Scatter
            key={grupo}
            zAxisId="ativos"
            data={ativos.filter((p) => p.grupo === grupo)}
            fill={corSerie(grupo)}
            fillOpacity={0.78}
            stroke="#ffffff"
            strokeWidth={0.6}
            shape={formaSerie(grupo)}
            isAnimationActive={false}
            cursor={onSelecionar ? 'pointer' : undefined}
            onClick={(dado: { payload?: T }) => {
              if (onSelecionar && dado?.payload) onSelecionar(dado.payload)
            }}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
