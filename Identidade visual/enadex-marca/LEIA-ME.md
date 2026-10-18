# EnadeX — kit da marca

ENADE eXplainability Framework. Versão 1.0, outubro de 2026.

## O que tem aqui

- `manual/` — o manual da marca em PDF (para ler e imprimir) e em HTML (abre em qualquer navegador).
- `logos/svg/` — as 8 versões da logo em SVG, com o texto convertido em curvas e sem margem. Use estas em sites e sistemas.
- `logos/png/` — as mesmas versões em PNG com fundo transparente, em dois tamanhos, para slides, documentos e e-mail.
- `web/` — tudo para aplicar a marca num site:
  - `enadex.css`: cores dos temas claro e escuro, fontes, troca automática da logo e componentes (botão, card, KPI, gráfico de contribuição, escala de conceito).
  - `head.html`: as tags de favicon, manifest e compartilhamento para colar no `<head>`.
  - `theme.js` e `contrib.js`: alternância de tema e desenho do gráfico de contribuição.
  - `exemplo-site.html`, `exemplo-dashboard.html`, `exemplo-login.html`: três páginas prontas, abra no navegador.
  - `img/`, `favicons/`, `fonts/`: logos para o site, ícones de navegador e celular, e a fonte Poppins.

## Para começar

1. Abra `manual/manual-enadex.pdf`.
2. Abra `web/exemplo-site.html` e `web/exemplo-dashboard.html` no navegador e alterne o tema claro e escuro.
3. Para usar num projeto, copie a pasta `web/` e cole o conteúdo de `web/head.html` no `<head>` das páginas.

Os números dos gráficos nas páginas de exemplo são ilustrativos.
