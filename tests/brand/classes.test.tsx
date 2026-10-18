import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import * as classes from '@/lib/brand/classes'
import { verificarClasses } from './guards'

const receitas: [string, string][] = Object.entries(classes).flatMap(([nome, valor]): [string, string][] =>
  typeof valor === 'string' ? [[nome, valor]] : Object.entries(valor as Record<string, string>).map(([k, v]) => [`${nome}.${k}`, v]),
)

describe('0.6 receitas de classe', () => {
  it.each(receitas)('%s: sem hex, paleta do Tailwind, peso acima de 500 ou caixa-alta', (_, valor) => {
    expect(verificarClasses(valor)).toEqual([])
  })

  it('badge.success e badge.warning não usam fundo surface-sunken', () => {
    expect(classes.badge.success).not.toContain('bg-surface-sunken')
    expect(classes.badge.warning).not.toContain('bg-surface-sunken')
  })

  it.each(['botao', 'botaoPrimario', 'chip', 'campo', 'navItem', 'navItemAtivo', 'link'] as const)(
    '%s tem foco visível de 2px em focus-ring',
    (nome) => {
      expect(classes[nome]).toContain('focus-visible:outline-2')
      expect(classes[nome]).toContain('focus-visible:outline-focus-ring')
    },
  )

  it('botaoPrimario: 40px, raio sm, peso 500', () => {
    for (const c of ['h-10', 'rounded-marca-sm', 'font-medium', 'bg-accent', 'text-on-accent']) expect(classes.botaoPrimario).toContain(c)
  })

  it('chip muda de estado pelo aria-pressed', () => {
    expect(classes.chip).toContain('aria-pressed:bg-accent')
  })

  it.each(['light', 'dark'])('vitest-axe num componente com todas as receitas (tema %s)', async (tema) => {
    document.documentElement.dataset.theme = tema
    const { container } = render(
      <main>
        <a href="#x" className={classes.link}>Link</a>
        <button type="button" className={classes.botao}>Botão</button>
        <button type="button" className={classes.botaoPrimario}>Primário</button>
        <button type="button" aria-pressed="true" className={classes.chip}>Chip</button>
        <label className={classes.rotulo}>Campo<input className={classes.campo} /></label>
        <section className={classes.card}>
          <h2 className={classes.cardTitulo}>Card</h2>
          {Object.entries(classes.badge).map(([k, v]) => <span key={k} className={v}>{k}</span>)}
          <p className={classes.kpiRotulo}>Rótulo</p><p className={classes.kpiValor}>3,82</p><p className={classes.kpiVariacao}>+0,41</p>
        </section>
        <nav aria-label="Teste"><a href="#a" className={classes.navItemAtivo}>A</a><a href="#b" className={classes.navItem}>B</a></nav>
        <div className={classes.tabela.wrapper}>
          <table><thead className={classes.tabela.head}><tr><th className={classes.tabela.th}>Col</th></tr></thead>
            <tbody><tr className={classes.tabela.tr}><td className={classes.tabela.td}>1</td></tr></tbody></table>
        </div>
        <div className={classes.skeleton} aria-hidden />
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
