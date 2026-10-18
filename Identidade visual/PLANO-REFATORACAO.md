# Plano de refatoração da identidade visual do EnadeX

Base: `manual-enadex.pdf` (v1.0, outubro de 2026) e o kit `enadex-marca/` desta pasta.
Escopo: o frontend Next.js 16 + Tailwind 4 + shadcn deste repositório.

O plano é dividido **por tela**. Cada tela é um módulo independente, com entrega, critério de pronto e testes
automatizados próprios. O **Módulo 0 (fundação)** vem antes de todos: ele cria os tokens, o tema, a logo e os
componentes visuais que as telas passam a usar.

---

## 0. Regra principal: só a interface muda

MultiENADE, E-XplainENADE e ENADE-Time são subprojetos de outras pessoas. A refatoração **troca apenas a
aparência**. A lógica, os dados e os campos de cada subprojeto ficam **exatamente** como estão.

### Pode mudar

- Valores de `className` (cores, pesos, tamanhos, espaçamentos, raios, `uppercase`).
- Valores de cor em `style`, em props de cor do Recharts (`fill`, `stroke`, `color`) e em constantes de cor,
  **mantendo nome, chaves, tipo e quantidade de itens** da constante.
- A marcação **envolvente** de uma tela (cabeçalho, rodapé, logo), desde que os textos, links e componentes
  filhos sejam os mesmos.
- O visual interno de componentes de apresentação (`Card`, `Badge`, `LoadingSpinner`…), mantendo nome,
  exportação e props.
- `app/globals.css`, `app/layout.tsx` (ícones, fonte, tema) e arquivos novos em `lib/brand/`, `components/brand/`
  e `public/`.

### Não pode mudar

- Nada em `lib/multienade/`, `lib/e-xplainenade/` e `lib/enade-time/` além das cores e classes (ver lista de
  arquivos congelados abaixo).
- Estado, efeitos, handlers, chamadas à API, payloads, parâmetros de URL, rotas, ordenação, filtros, agregações,
  quantidade de itens exibidos, condições de exibição.
- **Campos**: cada `input`, `select`, checkbox, chip e filtro mantém nome, rótulo, opções, ordem das opções,
  valor padrão, validação e efeito.
- **Textos**: títulos, rótulos, descrições, mensagens de erro e de estado vazio, nomes de variáveis, unidades.
- Formatação de números e datas (as funções `format*` de cada subprojeto continuam sendo as usadas).
- Nomes, props e exportações de componentes e funções.

### Arquivos congelados

Estes arquivos não podem ser alterados em nenhum PR desta refatoração. Um teste confere o hash de cada um
(seção 2).

```
lib/multienade/api.ts            lib/multienade/utils.ts         lib/multienade/metodologia.ts
lib/e-xplainenade/api.ts
lib/enade-time/api.ts            lib/enade-time/amostra.ts       lib/enade-time/benchmark.ts
lib/enade-time/carga.ts          lib/enade-time/export.ts        lib/enade-time/format.ts
lib/enade-time/rotas.ts          lib/enade-time/types.ts         lib/enade-time/hooks/*.ts
```

Arquivos que misturam cor e lógica só têm as cores alteradas, e um teste confere que o resto é idêntico:

| Arquivo | Pode mudar | Fica igual |
|---|---|---|
| `lib/multienade/constants.ts` | valores de `CLUSTER_PALETTE` e `CORES_CATEGORIA` | chaves, quantidade de cores, `DEF_VARIAVEIS`, `DICIONARIO_TABELAS`, `TOPICOS`, `MAX_LINHAS_TABELA`, tipos |
| `lib/enade-time/constants.ts` | valores de `CHART_COLORS` | chaves de `CHART_COLORS`, `PAGE_SIZE_OPTIONS`, `LIMIAR_AMOSTRA` |
| `lib/enade-time/ui.ts` | o conteúdo das strings de classe | nomes das exportações |
| `lib/enade-time/chart.ts` | `GRID_COLOR`, cores e fonte de `EIXO` e `TOOLTIP_STYLE` | `fmtTooltip`, chaves dos objetos |

### O que o manual pede e fica fora do escopo

Algumas regras do manual só se cumprem mudando dados, lógica ou texto. Elas **não** entram na refatoração. Vão
como sugestões para os autores de cada subprojeto (seção 6), que decidem se adotam:

- Gráfico de contribuição com no máximo 10 variáveis + "Outras variáveis" (p. 16).
- Sinal de menos verdadeiro (−) e "em relação a" em vez de "vs." (p. 11, 16): dependem das funções de formatação.
- Fonte e ano no rodapé de todo gráfico, quando o texto não existe hoje (p. 3).
- Variáveis pelo nome que o usuário conhece, não pelo código da coluna (p. 3).
- Rodapé "Gerado pelo EnadeX em…" em CSV e PDF exportados (p. 17).
- Mensagens de estado vazio e de erro no formato do manual (p. 17).

---

## 1. Diagnóstico do estado atual (só interface)

| Problema | Onde | Regra do manual |
|---|---|---|
| Não existe paleta da marca: ~470 cores hex soltas (`#dfe5ee`, `#5f7393`, `#8aa0c1`…) e 104 classes da paleta padrão do Tailwind (`blue-700`, `slate-500`…) | todas as telas; 121 hex só em `e-xplainenade/page.tsx` | Cores da marca e da interface (p. 9) |
| Cada subprojeto tem uma cor de destaque própria: azul (MultiENADE), violeta (E-XplainENADE), âmbar (ENADE-Time), verde-azulado (EduCluster) | `app/page.tsx`, `lib/enade-time/ui.ts`, `ModuleShell.tsx` | O destaque da interface é um só: `accent` (p. 9) |
| A "logo" é um ícone `BarChart3` do Lucide num quadrado colorido, mais o texto "EnadeX" em `font-bold` | cabeçalho da home, MultiENADE, E-XplainENADE e ENADE-Time | Usar sempre os arquivos do kit; nunca recriar o nome em outra fonte (p. 8) |
| Os ícones de `app/layout.tsx` (`/icon-light-32x32.png`, `/icon.svg`, `/apple-icon.png`) não existem: o repositório não tem `public/` | `app/layout.tsx` | Favicons do kit (p. 12) |
| `themeColor` branco e preto | `app/layout.tsx` | `#0C3350` (p. 12) |
| Fonte do sistema e pesos 600/700 (`font-semibold` 80×, `font-bold` 44×) | todas as telas | Poppins só em 400 e 500 (p. 11) |
| Rótulos em caixa-alta com tracking (`uppercase tracking-[0.14em]`) | 12 ocorrências (eyebrows, cabeçalhos de tabela) | Rótulos e botões não vão em caixa-alta (p. 3) |
| Tema escuro do shadcn em `.dark` (tons neutros oklch), não usado pelas telas | `app/globals.css` | Temas claro e escuro com `data-theme` e `prefers-color-scheme` (p. 14) |
| Gráficos com cores avulsas (`CHART_COLORS`, `CLUSTER_PALETTE`, `CORES_CATEGORIA`) | `lib/*/constants.ts`, gráficos Recharts | Cores para dados (p. 10) |
| Ícones decorativos dentro de cards | `app/page.tsx` | Nada de símbolo, degradê ou ícone decorativo dentro dos cards (p. 16) |

### Contraste dos tokens (calculado, WCAG 2.1)

Todos os pares de texto do manual passam de 4,5:1 sobre `surface-page` e `surface-card`, nos dois temas. Duas
exceções que o plano respeita:

- No tema claro, `success` (4,34:1) e `warning` (4,29:1) **não** passam sobre `surface-sunken`. Texto de status
  só sobre `surface-card` ou `surface-page`.
- `contrib-positive` (4,00:1) e `contrib-negative` (3,89:1) no claro passam de 3:1 (forma gráfica), mas não de
  4,5:1. São cor de barra; texto ao lado da barra fica em `ink`.

---

## 2. Infraestrutura de testes (pré-requisito do Módulo 0)

O repositório não tem testes hoje. Ferramentas propostas:

| Camada | Ferramenta | Para quê |
|---|---|---|
| Unidade e componente | **Vitest** + **@testing-library/react** + **jsdom** | tokens, componentes, contrato das telas |
| Preservação | Vitest (hash de arquivos, snapshots de constantes, testes de caracterização) | provar que lógica e campos não mudaram |
| Guardas de marca | Vitest lendo o código-fonte (`fs` + regex) | proíbem hex solto, `font-bold`, `uppercase` nas classes |
| Acessibilidade | **vitest-axe** (componente) e **@axe-core/playwright** (página) | contraste, `alt`, foco |
| Ponta a ponta e visual | **Playwright** com `toHaveScreenshot()` | cada tela em claro, escuro e 375px |

```
vitest.config.ts               # environment: jsdom, alias @/, setupFiles
vitest.setup.ts                # jest-dom, matchMedia e localStorage simulados
playwright.config.ts           # webServer: pnpm dev; projetos: desktop-claro, desktop-escuro, celular
tests/brand/guards.ts          # regras de marca sobre os arquivos de uma tela
tests/preservacao/             # congelados, constantes e caracterização de cada tela
tests/e2e/<tela>.spec.ts       # um arquivo por tela
```

```jsonc
// package.json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:e2e:real": "E2E_BACKEND=real playwright test",
"test:e2e:gravar": "E2E_BACKEND=gravar playwright test --project=desktop-claro",
"test:marca": "vitest run tests/brand",
"test:preservacao": "vitest run tests/preservacao"
```

### Modos de dados nos testes E2E

O backend fica em execução durante os testes, então os E2E têm três modos, escolhidos por `E2E_BACKEND`:

| Modo | Dados | Quando usar |
|---|---|---|
| `simulado` (padrão) | respostas fixas em `tests/e2e/fixtures/*.json` via `page.route` | CI e screenshots estáveis |
| `gravar` | backend real; o Playwright grava as respostas em `tests/e2e/har/<tela>.har` | uma vez, na `master`, antes de migrar a tela |
| `real` | backend real ao vivo | conferência final de cada tela com os dados de verdade |

APIs usadas (as mesmas variáveis de ambiente do código, nada muda em `lib/`):

| Subprojeto | Variável | Padrão |
|---|---|---|
| MultiENADE | `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |
| ENADE-Time | `NEXT_PUBLIC_ENADE_TIME_API_URL` | `http://localhost:8002` |
| E-XplainENADE | `NEXT_PUBLIC_EXPLAIN_API_URL` | `http://localhost:8003` (`/api/e-xplainenade`) |

- No modo `real`, um `globalSetup` testa cada API antes de começar. Se uma estiver fora do ar, as telas dela
  são marcadas como `skip` com a mensagem "backend do <subprojeto> indisponível em <url>", sem falhar as outras.
- Com dados reais, o screenshot pode variar. Por isso o modo `real` compara **estrutura e texto**, não pixels:
  mesmos campos, mesmas colunas, mesmo número de séries e de pontos em cada gráfico, nenhum erro de console e
  nenhuma resposta 4xx/5xx nova.
- O E-XplainENADE faz `POST` (`/hipotese`, `/relatorio`). No modo `real`, o teste roda uma hipótese com o
  `DEFAULT_X` e confere a resposta; o relatório só é gerado se `E2E_GERAR_RELATORIO=1`, porque pode ser lento.

**Caracterização com dados reais (antes × depois).** O jeito mais forte de provar que a lógica não mudou:

1. Na `master`, com o backend no ar, rodar `pnpm test:e2e:gravar`. Para cada tela, o Playwright grava as
   respostas da API (HAR) e um "retrato" da tela: texto visível, campos com opções e valores, `href`s, e as
   requisições feitas com URL, método e corpo.
2. Na branch da tela, rodar os E2E com `routeFromHAR` sobre o mesmo HAR (dados reais, mas congelados) e comparar
   com o retrato gravado. Tudo tem que ser idêntico, inclusive as requisições.
3. Por fim, `pnpm test:e2e:real` com o backend ao vivo, para conferir a tela com dados atuais.

Os HARs não vão para o Git se tiverem dados sensíveis; ficam em `tests/e2e/har/`, que entra no `.gitignore`.

### 2.1 Testes de preservação (rodam em todo PR)

**a) Arquivos congelados** (`tests/preservacao/congelados.test.ts`)
O SHA-256 de cada arquivo da lista da seção 0 é gravado num JSON no primeiro commit da refatoração. O teste
falha se qualquer um mudar.

**b) Constantes mistas** (`tests/preservacao/constantes.test.ts`)
- `DEF_VARIAVEIS`, `DICIONARIO_TABELAS`, `TOPICOS`, `MAX_LINHAS_TABELA`, `PAGE_SIZE_OPTIONS`, `LIMIAR_AMOSTRA`
  iguais ao snapshot de hoje (`toEqual`).
- `CLUSTER_PALETTE` com o mesmo número de itens; `CORES_CATEGORIA` e `CHART_COLORS` com as mesmas chaves.
- `lib/enade-time/ui.ts` e `chart.ts` com as mesmas exportações; `fmtTooltip` com a mesma saída para uma
  bateria de valores.

**c) Caracterização de cada tela** (`tests/preservacao/<tela>.test.tsx`)
Escrito **antes** de mexer na tela, rodando sobre o código atual, com a API simulada (`vi.mock` do
`lib/*/api.ts`). Depois da migração, o mesmo teste tem que passar sem nenhuma alteração. Ele registra:

- **Texto visível**: `container.textContent` normalizado (espaços colapsados) em cada estado da tela
  (carregando, com dados, vazio, erro).
- **Campos**: para cada controle de formulário, rótulo acessível, `name`, tipo, opções na ordem, valor padrão e
  `disabled`.
- **Interação**: escolher valores nos campos e acionar os botões produz as **mesmas chamadas à API com os mesmos
  argumentos** (`expect(api.fn).toHaveBeenCalledWith(...)`) e os mesmos parâmetros de URL.
- **Links**: lista de `href` da tela.
- **Dados nos gráficos**: as props `data` passadas ao Recharts (capturadas com um mock fino de `recharts`) são
  iguais às de hoje, ou seja, nenhuma ordenação, corte ou agregação nova.

Um teste de caracterização **nunca** é atualizado para acompanhar a migração. Se ele precisa mudar, a migração
mudou lógica e está errada.

**d) Diff só de estilo nos componentes-folha** (`scripts/verificar-diff-estilo.mjs`)
Para gráficos, tabelas, cards e badges, o script usa o compilador do TypeScript para comparar o arquivo da
branch com o da `master` depois de remover atributos `className`, `style`, `fill`, `stroke`, `color` e as
strings de classe. Se sobrar diferença, o PR mexeu em algo além do visual. Roda no CI em cada PR de tela.

### 2.2 Guarda de marca

```ts
// tests/brand/guards.ts
export function verificarMarca(arquivos: string[]): Violacao[]
```

| Regra | O que procura | Observação |
|---|---|---|
| Sem cor hex solta | `#[0-9a-f]{3,8}\b` em classes e `style` | constantes de cor apontam para `var(--token)` |
| Sem paleta padrão do Tailwind | `(bg\|text\|border\|ring\|fill\|stroke)-(slate\|blue\|violet\|amber\|emerald\|…)-\d+` | |
| Peso máximo 500 | `font-(semibold\|bold\|extrabold\|black)` | |
| Sem caixa-alta | `\buppercase\b` | só a classe; o texto não é alterado |
| Logo do kit | `BarChart3` usado como logo | |

As regras olham só classes e estilos. Texto dos subprojetos não é verificado por regra de marca, porque não
pode ser alterado.

---

## Módulo 0 · Fundação compartilhada

Arquivos novos em `lib/brand/` (tokens e utilidades visuais) e `components/brand/` (React). Não toca em nenhum
subprojeto. Um PR por submódulo.

### 0.1 Arquivos da marca

**Entrega**
- Criar `public/` com o conteúdo do kit: favicons na raiz (`favicon.ico`, `favicon.svg`, `favicon-32.png`,
  `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest`), `img/` com as 6 logos SVG e
  `og-image.png`.
- Fontes em `app/fonts/Poppins-Regular.woff` e `Poppins-Medium.woff`.
- `app/layout.tsx`: `metadata.icons`, `manifest`, `openGraph.images` e `themeColor: '#0C3350'`, como no
  `head.html` do kit. O `title` e a `description` atuais ficam como estão até o grupo decidir (seção 5).

**Testes** (`tests/brand/assets.test.ts`)
- Todo arquivo citado em `metadata` existe em `public/`.
- `site.webmanifest` tem `theme_color` `#0C3350`, `background_color` `#F4FAFA` e ícones 192 e 512.
- Cada SVG de logo é idêntico ao do kit (hash).
- `og-image.png` tem 1200 × 630.

### 0.2 Tokens

**Entrega**
- `lib/brand/tokens.ts`: fonte única e tipada com `marca`, `interface.claro`, `interface.escuro` (os 15 tokens
  da p. 9), `dados` (contribuição, `series-1..4`, `seq-1..5`, `cluster-1..6`), espaço, raio e sombra.
- `cluster-1..6`: as 6 cores de cluster do MultiENADE, definidas pelo grupo como extensão do manual
  (tabela abaixo), nos temas claro e escuro. São as seis séries categóricas do manual (p. 10), na mesma ordem:
  no CSS, `--cluster-n: var(--series-n)`.

  | Token | Claro | Escuro |
  |---|---|---|
  | `cluster-1` | `#0C3350` (`series-1`) | `#E4F2F4` (`series-1`) |
  | `cluster-2` | `#206F6F` (`series-2`) | `#37BEB5` (`series-2`) |
  | `cluster-3` | `#2E96DC` (`series-3`) | `#467CB9` (`series-3`) |
  | `cluster-4` | `#CC6A28` (`series-4`) | `#F1AD6A` (`series-4`) |
  | `cluster-5` | `#7632C3` (`series-5`) | `#B899F5` (`series-5`) |
  | `cluster-6` | `#8A2B40` (`series-6`) | `#D34A61` (`series-6`) |
- `app/globals.css` reescrito:
  - tokens do kit como variáveis CSS em `:root`, no `@media (prefers-color-scheme: dark)` com
    `:root:not([data-theme="light"])` e em `:root[data-theme="dark"]`;
  - as variáveis do shadcn **apontando** para os tokens (`--background: var(--surface-page)`,
    `--primary: var(--accent)`, `--ring: var(--focus-ring)`, `--destructive: var(--danger)`,
    `--chart-1..4: var(--series-1..4)`…), para `components/ui/button.tsx` já nascer na marca;
  - `@theme inline` com utilitários da marca: `bg-surface-card`, `text-ink`, `text-ink-muted`,
    `border-border-control`, `bg-seq-3`…;
  - `@custom-variant dark` trocado para `[data-theme="dark"]` + preferência do sistema.

As cores do Recharts passam a ser strings `var(--series-1)` etc. O SVG aceita variáveis CSS em `fill` e
`stroke`, como nos gráficos do shadcn. Assim o gráfico troca de tema sem nenhuma mudança de lógica no
componente.

**Testes** (`lib/brand/tokens.test.ts`, `tests/brand/css-sync.test.ts`)
- Valores de `tokens.ts` iguais aos do manual (snapshot dos hex das p. 9 e 10).
- `globals.css` e `tokens.ts` sincronizados: o teste extrai cada `--token` por bloco de tema e compara.
- Contraste: todo par em `PARES_TEXTO` passa de 4,5:1 nos dois temas; `border-control` e `focus-ring` passam
  de 3:1; `success`/`warning` sobre `surface-sunken` no claro estão em `PARES_PROIBIDOS`, e o teste confirma que
  continuam abaixo do limite.
- `series-1` é a mais escura no claro e a mais clara no escuro.
- `cluster-1..6`: 6 cores distintas em cada tema; cada uma com pelo menos 3:1 sobre `surface-card` (são
  pontos e marcadores de legenda); diferença mínima entre quaisquer duas (ΔE2000 ≥ 13) também na simulação
  de daltonismo deuteranopia e protanopia (Machado 2009 e Viénot 1999), para os grupos continuarem
  distinguíveis. O limite era 15; o grupo adotou 13 para seguir as séries do manual, que no tema escuro com
  protanopia ficam entre 13,8 e 14,7 nos pares `series-3` × `series-5` e `series-1` × `series-2`.

### 0.3 Tema claro e escuro

**Entrega**
- `components/brand/ThemeScript.tsx`: script inline no `<head>` que lê `localStorage['enx-theme']` antes da
  pintura.
- `components/brand/ThemeToggle.tsx`: botão com `aria-pressed` e rótulo "Tema claro" / "Tema escuro" (porte do
  `theme.js`).
- `lib/brand/theme.ts`: `lerTema()`, `salvarTema()`, `temaEfetivo()`, com `try/catch` no `localStorage`.

**Testes**
- Sem escolha salva, `temaEfetivo()` segue `prefers-color-scheme`.
- O toggle alterna `data-theme`, grava `enx-theme` e atualiza `aria-pressed` e o rótulo.
- `localStorage` que lança exceção não quebra a página.
- E2E: recarregar no escuro não pinta o claro antes.

### 0.4 Tipografia

**Entrega**
- `next/font/local` com Poppins 400 e 500 como `--font-brand`; `--font-data` com a pilha do sistema.
- Utilitários `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-caption`, `text-kpi`,
  `text-table-num` (p. 11) e `.num` (`font-data` + `tabular-nums`).

Não há formatadores novos aplicados aos subprojetos: eles continuam usando as próprias funções `format*`.

**Testes**
- A fonte carregada declara só os pesos 400 e 500.
- Cada utilitário gera o tamanho e a entrelinha da escala do manual.

### 0.5 Logo

**Entrega**
- `components/brand/Logo.tsx`: `<Logo versao="horizontal|vertical|simbolo|simbolo-flat" altura={28} fundo="auto|escuro" href="/" />`.
  - Par positiva/negativa com as classes `enx-logo-light` / `enx-logo-dark` do kit, sempre com `width` e `height`.
  - `alt="EnadeX, página inicial"` quando é link; a negativa tem `alt=""`.
  - Padding de x/2 reservando a área de proteção.
  - Tamanhos mínimos: horizontal abaixo de 20px vira símbolo flat; símbolo de vidro abaixo de 32px vira flat;
    vertical abaixo de 180px de largura vira horizontal.
  - `fundo="escuro"` força a negativa.

**Testes**
- Cada combinação versão × altura escolhe o arquivo certo (casos da p. 6).
- `width` e `height` numéricos e proporcionais ao SVG.
- `alt` correto para link e para imagem decorativa.
- `fundo="escuro"` deixa só a negativa visível.
- `vitest-axe` sem violações.

### 0.6 Estilos de componentes

Os subprojetos já têm os próprios componentes (`Card`, `Badge`, `MetricCard`…) e eles continuam existindo.
O Módulo 0 entrega **receitas de classe** que esses componentes passam a usar por dentro:

**Entrega** (`lib/brand/classes.ts`)
- `botao`, `botaoPrimario` (40px, raio `sm`, peso 500), `chip` (estado por `aria-pressed`), `campo`, `rotulo`,
  `card`, `cardTitulo`, `badge.{neutro,success,warning,danger,info}`, `kpiRotulo`, `kpiValor`, `kpiVariacao`,
  `tabela.{wrapper,head,th,tr,td}`, `navItem`, `navItemAtivo`, `link`, `skeleton`.
- `lib/enade-time/ui.ts` passa a montar as mesmas exportações a partir dessas receitas (mesmos nomes).

**Testes**
- Nenhuma receita contém hex, paleta padrão do Tailwind, peso acima de 500 ou `uppercase`.
- `badge.success` e `badge.warning` não usam fundo `surface-sunken`.
- Controles com `focus-visible:outline-2` em `focus-ring`.
- `vitest-axe` num componente de teste montado com cada receita, nos dois temas.

### 0.7 Cores de gráfico

**Entrega** (`lib/brand/chart.ts`)
- `CORES_GRAFICO`: `grade`, `eixo`, `tooltipBorda`, `series1..4`, `contribPositiva`, `contribNegativa`,
  `seq1..5`, todas como `var(--token)`.
- `EIXO_MARCA` e `TOOLTIP_MARCA` (11px, `font-data`, `ink-muted`) para os valores de
  `lib/enade-time/chart.ts` e dos gráficos do MultiENADE e E-XplainENADE.

**Testes**
- Toda cor exportada é `var(--…)` de um token que existe em `globals.css`.
- E2E de um gráfico de teste: a cor computada da barra muda ao trocar `data-theme`.

### 0.8 Cascas visuais

**Entrega** (`components/brand/layout/`)
- `CabecalhoSite`: 64px, logo horizontal a 28px (24px no celular), `ThemeToggle`. Os itens de navegação são
  passados como `children` por quem usa.
- `RodapeSite`: `surface-nav`, logo negativa a 32px; o texto é passado por quem usa.
- `BarraModulo`: topbar de 56px em `surface-nav` com a logo negativa a 28px e 16px de margem. Recebe o nome do
  subprojeto e os filhos (navegação, status) como estão.

**Testes**
- Uma `Logo` por casca.
- Logo da topbar e do rodapé é a negativa.
- Os `children` são renderizados sem alteração (mesmo `textContent`).
- Em 375px a logo tem 24px (E2E).

### 0.9 Movimento

**Entrega**: regra global `prefers-reduced-motion` do kit em `globals.css`.

**Teste**: com `prefers-reduced-motion: reduce`, `transition-duration` e `animation` computados ficam zerados.

**Critério de pronto do Módulo 0:** `pnpm test`, `pnpm test:marca` e `pnpm test:preservacao` verdes. O
Módulo 0 não altera nenhuma tela; o teste de caracterização de todas as telas já passa sobre ele.

---

## Módulos por tela

Passos de cada módulo:

1. **Escrever o teste de caracterização da tela sobre o código atual** e fazer o commit antes de qualquer
   mudança visual. Com o backend no ar, gravar o HAR e o retrato da tela na `master` (`pnpm test:e2e:gravar`).
2. Trocar classes e cores pelos tokens e receitas do Módulo 0.
3. Trocar o cabeçalho (ícone `BarChart3`) pela `Logo` dentro de `BarraModulo` ou `CabecalhoSite`, mantendo
   textos, links e componentes filhos.
4. Rodar caracterização, diff de estilo, guarda de marca e E2E (simulado, HAR e `real`).

**Testes comuns a todos os módulos de tela** (não repetidos abaixo):
- Caracterização da tela sem alteração (2.1 c).
- Diff só de estilo nos componentes-folha da tela (2.1 d).
- `verificarMarca(arquivosDaTela)` sem violações.
- E2E: a tela abre sem erro de console; screenshots em desktop claro, desktop escuro e 375px; axe sem violações
  sérias; sem rolagem horizontal em 375px. API simulada com `page.route`.

---

### Tela 1 · Home (`/`)

Arquivo: `app/page.tsx`.

**Mudanças**
- Cabeçalho com `CabecalhoSite`: a logo do kit no lugar do quadrado azul com `BarChart3`; o selo "v2021+", a
  navegação, o seletor de edição e o botão do repositório continuam, com o visual da marca.
- Hero: título em `text-display` peso 500; "explicável" em `accent`; eyebrow sem `uppercase`. Texto igual.
- Cartão "Status da plataforma": barras em `seq-1..5`; o círculo decorativo sai (é só um `span` sem conteúdo).
- KPIs e cards dos subprojetos: classes da marca; todos os cards com o mesmo destaque `accent`. Os ícones dos
  cards ficam em `ink-muted`, sem fundo colorido. Remover os ícones é decisão do grupo (seção 5).
- Rodapé com `RodapeSite`, mesmo texto.

**Testes próprios**
- Caracterização: os 4 cards com nome, eyebrow, descrição, tags e `href` de hoje; o seletor com as opções
  2021–2017 e o valor padrão 2021; trocar a edição atualiza o "Base ENADE {ano}".
- Os quatro cards usam a mesma classe de destaque (não há mais `violet`, `amber`, `teal`).

### Tela 2 · MultiENADE (`/multienade`)

Arquivos: `app/multienade/page.tsx`, `_components/*.tsx`; cores de `lib/multienade/constants.ts`.

**Mudanças**
- Cabeçalho copiado da home → `BarraModulo` com "MultiENADE"; selo "Descoberta de padrões" com o mesmo texto,
  em `badge.info`.
- Abas, tabelas, cards e textos de apoio com as receitas da marca.
- Gráficos: grade, eixos e tooltip da marca. `CORES_CATEGORIA` → `series-1` e `series-4` nas mesmas chaves.
- `CLUSTER_PALETTE`: continua com **6** cores e o mesmo uso (`Cluster_ID % length`). Os valores passam a ser
  `var(--cluster-1)` … `var(--cluster-6)`, na mesma ordem, o que faz os clusters trocarem de tema sozinhos.

**Testes próprios**
- Caracterização das três abas (Supervisionada, Clusters, Associação) e do `DatasetSection`: textos, campos,
  chamadas à API e `data` de cada gráfico iguais; o SHAP continua mostrando todas as variáveis que mostra hoje,
  na mesma ordem.
- `CLUSTER_PALETTE.length === 6`, cada item é `var(--cluster-n)` na ordem, e o mesmo cluster recebe sempre o
  mesmo índice de cor.
- Modo `real`: o número de clusters e de pontos no gráfico de dispersão é igual ao retrato gravado na `master`.

### Tela 3 · E-XplainENADE (`/e-xplainenade`)

Arquivo: `app/e-xplainenade/page.tsx` (634 linhas, 121 cores hex). **O arquivo não é dividido nem
reorganizado**; as mudanças são substituições de classe e de cor no lugar.

**Mudanças**
- Cabeçalho → `BarraModulo` com "E-XplainENADE"; o violeta `#7c3aed` sai das classes.
- `vifBadgeStyle`: só os valores `bg` e `fg` mudam para tokens (`success`, `warning`, `danger`); `label` e as
  condições (`severo`, `moderado`) ficam iguais.
- Gráficos (barras de efeito, `ComposedChart`, dispersão de resíduos, QQ-plot): cores e eixos da marca; mesmas
  séries, mesmos dados, mesmas linhas de referência.
- Filtros (curso, IES, Y, X, interações), botões de rodar e de gerar relatório: receitas da marca.

**Testes próprios**
- Caracterização: opções de curso e IES, padrão `DEFAULT_X`, seleção de interações só entre X escolhidos;
  "rodar" chama `postHipotese` com o mesmo payload; "gerar relatório" chama `postRelatorio` com o mesmo payload;
  mesmos textos em sucesso, erro e carregamento.
- `vifBadgeStyle` devolve o mesmo `label` para cada faixa de hoje.
- `formatP` e `formatTooltipValue` com a mesma saída para uma bateria de valores (não mudaram).

### Tela 4 · ENADE-Time · visão geral (`/enade-time`)

Arquivos: `app/enade-time/layout.tsx`, `page.tsx`, `_components/layout/*`, `_components/cards/*`,
`_components/ui/*`; classes de `lib/enade-time/ui.ts`.

**Mudanças**
- `ModuleShell` continua sendo o componente da casca, com os mesmos textos (título, "Análise longitudinal",
  descrição, "Período: 2005–2021 · Computação N/NE", rodapé) e os mesmos filhos (`ModuleNav`, `StatusApi`,
  `Breadcrumb`). Por dentro, passa a usar `BarraModulo` e as classes da marca; o âmbar sai.
- `lib/enade-time/ui.ts`: mesmas exportações montadas com as receitas do 0.6.
- `Card`, `Badge`, `MetricCard`, `KpiGrid`: mesmas props, visual da marca. `Badge` mantém os tons `neutral`,
  `success`, `warning`, `danger`, `info`; `info` passa de âmbar para `accent`.
- `StatusApi`: mesmos textos e mesmos estados; cores `success`, `warning`, `danger`.
- `ModuleNav`, `SectionTabs`, `EnadeTabs`, `SpdTabs`: estilo `navItem`/`navItemAtivo`; mesmas rotas e mesma regra
  de item ativo.

**Testes próprios**
- Caracterização da casca: todos os textos e links de `ModuleShell`, `ModuleNav` e `Breadcrumb`.
- `StatusApi` nos três estados simulados (API conectada, 503, offline): mesmos textos de hoje.
- `Badge` aceita os mesmos cinco tons (teste de tipo).

### Tela 5 · ENADE-Time · sobre (`/enade-time/sobre`)

Arquivo: `app/enade-time/sobre/page.tsx` (24 cores hex, 8 `font-semibold`).

**Mudanças**: títulos, listas, cards e links com as classes da marca.

**Testes próprios**: caracterização do texto inteiro da página.

### Tela 6 · ENADE-Time · não encontrada (`/enade-time/*`)

Arquivos: `not-found.tsx` (o `[...slug]/page.tsx` não muda).

**Mudanças**: card e link com as classes da marca; mesmo texto.

**Testes próprios**: E2E em `/enade-time/qualquer-coisa` mostra a página dentro da casca, com o mesmo texto e
link.

### Tela 7 · ENADE · média anual (`/enade-time/enade/anual`)

Arquivos: `enade/(analises)/layout.tsx` (filtros e abas, compartilhados pelas telas 7 a 12), `anual/page.tsx`,
`LineMediaAnual`, `EnadeFiltros`, `FiltrosAnalise`, `LoadingSpinner`.

**Mudanças**
- Filtros com as receitas `campo`, `rotulo`, `chip` (feito uma vez no layout, vale para as telas 7–12).
- `LineMediaAnual`: cores e eixos da marca.
- `LoadingSpinner`: mesmo nome e props, visual da marca.

**Testes próprios**
- Caracterização de `FiltrosAnalise`: cada filtro com mesmo rótulo, opções, ordem e padrão; mudar um filtro
  grava os mesmos parâmetros de URL (`useFiltrosUrl`) e dispara as mesmas consultas.
- `data` do `LineMediaAnual` igual.

### Tela 8 · ENADE · comparar grupos (`/enade-time/enade/comparar`)

Arquivos: `comparar/page.tsx`, `LineComparativoGrupos`, `AlertaAmostra`, `ErrorState`.

**Mudanças**
- `LineComparativoGrupos`: grupo A em `series-1`, grupo B em `series-2`.
- `AlertaAmostra`: o laranja vira `warning` da marca. O comentário do arquivo explica que o laranja existia
  para se destacar do âmbar do módulo; com o âmbar fora, o `warning` cumpre esse papel. Mesmo texto, mesma regra
  de quando aparece.
- `ErrorState`: cor `danger`, mesmo texto e mesmo botão.

**Testes próprios**
- Caracterização: seleção dos grupos, `AlertaAmostra` aparecendo nos mesmos casos (abaixo de `LIMIAR_AMOSTRA`),
  exportação chamando `export.ts` com os mesmos dados.

### Tela 9 · ENADE · ranking de IES (`/enade-time/enade/ies`)

Arquivos: `ies/page.tsx`, `RankingIES`.

**Mudanças**: classes `tabela.*`; números com `.num` (`tabular-nums`, alinhado à direita). Mesmas colunas,
mesma ordem.

**Testes próprios**: caracterização das colunas e das linhas com dados simulados.

### Tela 10 · ENADE · por região (`/enade-time/enade/regional`)

Arquivos: `regional/page.tsx`, `BarMediaRegiao`.

**Mudanças**: cores e eixos da marca.

**Testes próprios**: `data` e quantidade de séries iguais às de hoje.

### Tela 11 · ENADE · por UF (`/enade-time/enade/uf`)

Arquivos: `uf/page.tsx`, `BarMediaUF`.

**Mudanças**: cores e eixos da marca.

**Testes próprios**: `data` igual, inclusive a ordem das UFs.

### Tela 12 · ENADE · registros (`/enade-time/enade/registros`)

Arquivos: `registros/page.tsx`, `RegistrosView`, `RegistrosTable`, `EmptyState`.

**Mudanças**: `tabela.*` (cabeçalho sem `uppercase`, em `surface-sunken`), botões de paginação com `botao`,
`EmptyState` com o visual da marca e o mesmo texto.

**Testes próprios**: caracterização da paginação (`PAGE_SIZE_OPTIONS`, botões, página atual), das colunas e do
estado vazio.

### Tela 13 · SPD · execuções (`/enade-time/spd/execucoes`)

Arquivos: `spd/layout.tsx` (abas do SPD, compartilhadas pelas telas 13–17), `execucoes/page.tsx`,
`ExecucoesTable`.

**Mudanças**: abas com `navItem`; `tabela.*`; status com `Badge`.

**Testes próprios**: caracterização das colunas, dos status e dos links para `/spd/etapas/<id>`.

### Tela 14 · SPD · etapas de uma execução (`/enade-time/spd/etapas/[execucaoId]`)

Arquivos: `etapas/[execucaoId]/page.tsx`, `EtapaDetalheView`, `EtapasTable`, `BarEtapasAno`.

**Mudanças**: `tabela.*`; cores de `BarEtapasAno` da marca, com o mesmo número de séries.

**Testes próprios**: caracterização com id válido e com id inexistente.

### Tela 15 · SPD · métricas (`/enade-time/spd/metricas`)

Arquivos: `metricas/page.tsx`, `MetricasTable`.

**Mudanças**: `tabela.*` com `.num`.

**Testes próprios**: caracterização das colunas e valores.

### Tela 16 · SPD · comparativo (`/enade-time/spd/comparativo`)

Arquivos: `comparativo/page.tsx`, `BarSpeedup`, `BarTempoExecucao`, `BarThroughput`, `LineEficiencia`; valores
de `CHART_COLORS`.

**Mudanças**
- `CHART_COLORS` mantém as chaves (`seq`, `paralelo`, `paralelo2`, `ideal`, `alert`, `warn`, `neutral`) e as
  regras de escolha de cor nos gráficos ficam iguais. Valores: `seq` → `var(--ink-muted)`, `paralelo` →
  `var(--series-2)`, `paralelo2` → `var(--series-3)`, `ideal` → `var(--success)`, `alert` → `var(--danger)`,
  `warn` → `var(--warning)`, `neutral` → `var(--ink-muted)`.
- Eixos, grade e tooltip da marca nos quatro gráficos.

**Testes próprios**
- Chaves de `CHART_COLORS` iguais; cada valor é `var(--token)` existente.
- `data` dos quatro gráficos igual.

### Tela 17 · SPD · custo de publicação (`/enade-time/spd/carga`)

Arquivos: `carga/page.tsx`, `BarCarga`.

**Mudanças**: cores de `BarCarga` da marca (local e nuvem em `series-1` e `series-2`); `Badge` da marca.

**Testes próprios**: caracterização dos textos, badges e `data` do gráfico.

> `/enade-time/enade` e `/enade-time/spd` só redirecionam para a primeira aba; não têm módulo próprio.
> EduCluster ainda não tem tela; quando tiver, já nasce com as receitas da marca.

---

## 3. Ordem de execução e dependências

```
Infra de testes + testes de preservação (congelados e constantes)
   └─ Módulo 0 (0.1 → 0.2 → 0.3/0.4 → 0.5 → 0.6/0.7 → 0.8 → 0.9)
         ├─ Tela 1  Home
         ├─ Tela 4  ENADE-Time visão geral  ─┬─ Telas 5, 6
         │                                    ├─ Telas 7–12 (layout de análises primeiro, na tela 7)
         │                                    └─ Telas 13–17 (layout do SPD primeiro, na tela 13)
         ├─ Tela 2  MultiENADE
         └─ Tela 3  E-XplainENADE
```

- Um PR por submódulo do Módulo 0 e um PR por tela. O PR de tela abre com o teste de caracterização em um
  commit separado, antes das mudanças visuais.
- Cada PR de subprojeto é revisado pelo autor daquele subprojeto.
- Enquanto uma tela não migra, ela continua funcionando: os tokens novos não removem nada.
- Depois da última tela, o bloco `.dark` antigo do shadcn sai de `globals.css` e `verificarMarca` passa a rodar
  sobre `app/` inteiro no CI. Nenhum arquivo de subprojeto é removido.

## 4. Critério de pronto de cada tela

- [ ] Teste de caracterização escrito antes e passando depois, sem alteração.
- [ ] Arquivos congelados com o mesmo hash.
- [ ] Diff só de estilo nos componentes-folha.
- [ ] `verificarMarca` sem violações nas classes da tela.
- [ ] Screenshots aprovados em claro, escuro e 375px.
- [ ] axe sem violações sérias.
- [ ] Retrato com dados reais (HAR gravado na `master`) idêntico, e `test:e2e:real` verde com o backend no ar.
- [ ] Uma logo por bloco, sempre um arquivo do kit.
- [ ] Revisão do autor do subprojeto.

## 5. Decisões em aberto

1. ~~Cores dos clusters do MultiENADE~~: resolvido. `cluster-1..6` são as séries categóricas `series-1..6` do
   manual (p. 10), com distinção mínima ΔE2000 ≥ 13 (seção 0.2).
2. **Ícones nos cards da home**: o manual proíbe ícone decorativo dentro de card. Mantê-los em `ink-muted` ou
   removê-los.
3. ~~Título do site~~: resolvido. O `title` é "EnadeX"; a descrição continua a atual.
4. **Tema escuro**: oferecer o `ThemeToggle` desde o início ou só seguir o sistema na primeira versão.

## 6. Sugestões aos autores dos subprojetos (fora do escopo)

Pontos em que o manual pede mudança de lógica, de dados ou de texto. Não são aplicados por esta refatoração;
cada autor decide.

| Subprojeto | Sugestão | Regra do manual |
|---|---|---|
| MultiENADE | Importância SHAP com no máximo 10 variáveis + "Outras variáveis", com frase de leitura acima | p. 16 |
| MultiENADE | Variáveis pelo nome legível; o código `QE_*` como detalhe | p. 3 |
| MultiENADE | Tabela do Dataset com `tabIndex={0}` e rótulo, para a rolagem funcionar pelo teclado (axe: `scrollable-region-focusable`) | acessibilidade |
| E-XplainENADE | Efeito de cada fator como gráfico de contribuição (azul/laranja, valor com sinal na ponta) | p. 10, 16 |
| E-XplainENADE | PDF com capa na logo vertical e rodapé "Gerado pelo EnadeX em…" | p. 17 |
| ENADE-Time | Sinal de menos verdadeiro (−) nas funções `format*` | p. 11 |
| ENADE-Time | Linha "Gerado pelo EnadeX em DD/MM/AAAA. Fonte: INEP, microdados ENADE AAAA." no CSV exportado | p. 17 |
| Todos | "em relação a" em vez de "vs."; fonte e ano no rodapé de cada gráfico | p. 3, 16 |
| Todos | Estado vazio dizendo o que fazer; erro dizendo como tentar de novo | p. 17 |
| Home | Numeração real dos cards ("01 / 04" a "04 / 04"); EduCluster como "Em breve" em vez de link para `#` | — |
