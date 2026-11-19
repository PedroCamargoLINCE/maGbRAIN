---
id: REP-0020
title: "Dar ao site e ao repo a cara da Magnatas"
status: inbox
owner: null
site: ""
---

# Dar ao site e ao repo a cara da Magnatas

## Relato original
Deixar o repositório e o site com a cara da Magnatas, a nossa república. O mascote é um lobo. É uma repaginada só no visual: não muda funcionamento, estrutura de pastas nem conteúdo das ideias.

## Origem e autoria
Proposta trazida em 19/11/2026, numa sessão com Claude Code. Crédito da proposta: **PedroCamargoLINCE**.

## Sugestões da IA (opcional)
Sugestões, não decisões humanas. Levantamento feito em 19/11/2026:

- O visual do mapa está quase todo em `site/index.html`: as cores (hoje creme `#fff8e9`, azul-marinho `#172850`, amarelo `#ffe276` e tons pastel nos cartões), a fonte (`ui-rounded`, `Trebuchet MS`) e o título `maGbRAIN` no cabeçalho.
- Duas ilustrações em `site/assets/`: `lab-banner.webp` (banner do topo, cérebro e gato) e `small-progress.webp` (cérebro com carrinho, na lateral do mapa). O `README.md` usa o mesmo banner.
- Plano: trocar as cores pelas da casa, usar o logo da Magnatas no cabeçalho e o lobo no lugar das duas ilustrações, e atualizar o banner do README. Manter o resto como está.
- As páginas dos projetos (`projects/*/app/`) têm estilos próprios; ficam fora da primeira passada.
- Usar só logos e artes que venham da república; não gerar arte de lobo sem combinar.

## Próxima contribuição (opcional)
Reunir o material da casa (logo em PNG transparente ou SVG, versão só do lobo, cores em hex, fonte, alguma arte de referência) e colocar em `site/assets/magnatas/`. Com isso em mãos, aplicar o plano acima em um PR.
