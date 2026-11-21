---
id: REP-0024
title: "DEEPCORE — jogo roguelike de automação (projeto externo)"
status: trying
owner: PedroCamargoLINCE
site: ""
repo: https://github.com/PedroCamargoLINCE/deepcore
---

# DEEPCORE

## Registro
Jogo de Pedro: um roguelike incremental de automação para navegador. Você comanda uma sonda de perfuração descendo rumo ao núcleo do planeta. Em cada estrato monta uma pequena fábrica automática (extratores nos veios de minério, esteiras, fundições, montadoras) para alimentar a broca com engrenagens e cargas até romper o piso. Quanto mais tempo no estrato, mais instável ele fica: tremores, desmoronamentos, magma. Uma corrida até o núcleo leva de 15 a 25 minutos; a morte é permanente, mas os núcleos de cada corrida compram melhorias permanentes na Fundição, e depois da vitória o Manto continua para baixo sem fim.

Tem três edições com a mesma jogabilidade e o mesmo progresso: **Bedrock** (`graphical.html`, totalmente em pixel art), **Engraved** (`index.html`, padrão, híbrida com retratos em ASCII) e **Classic** (o visual ASCII original). Roda abrindo o arquivo no navegador, sem servidor e sem instalação; `node tools/build.js` gera versões de arquivo único em `dist/`. É JavaScript puro em canvas, com testes rodando em `node` puro (`node test/headless.js`, `node test/integration.js`, `node test/balance.js` e outros). O desenho do jogo está em `SPEC.md`, `SPEC2.md` e `SPEC3.md`, e o estado atual e a passagem de trabalho em `docs/STATE.md`.

O código, as Issues e os PRs vivem no repositório de origem (campo `repo`); esta ficha guarda só o que é do grupo: a ideia, as decisões e o crédito.

## Relato original
> eh um jogo que criei. adoraria testadores para jogar, dar feedback, ou mudar o codigo ao seu interesse. adiciona no magbrains

## Origem e autoria
Vínculo pedido por Pedro (**PedroCamargoLINCE**), autor e responsável pelo jogo, numa sessão com Claude Code em 21/11/2026, com o endereço do repositório. A descrição acima foi escrita a partir do README e do `docs/STATE.md` do repositório nessa data. Ficha desta entrega em contributions/2026-11-21-deepcore.json.

## Próxima contribuição
Pedro quer ajuda de três jeitos, à escolha de cada pessoa:
- **Jogar e testar:** clonar ou baixar o repositório e abrir `graphical.html` (Bedrock) ou `index.html` no navegador. A tecla `H` abre o manual dentro do jogo. Os próprios testes do jogo avisam que bots não medem diversão, então partidas de gente de verdade são o que mais falta.
- **Dar feedback:** abrir uma Issue em https://github.com/PedroCamargoLINCE/deepcore/issues (hoje não há nenhuma aberta) contando o que travou, o que ficou chato, o que ficou bom e quanto tempo durou a corrida.
- **Mudar o código conforme o interesse:** ler `docs/STATE.md` e os SPECs, rodar os testes em `node` e mandar PR no repositório de lá. O repositório pede para ativar o hook de commits (`git config core.hooksPath .githooks`), que bloqueia linhas de coautoria de IA nos commits.

## Sugestões da IA (opcional)
Sugestões, não decisões de Pedro: o repositório ainda não tem licença, o que deixa juridicamente incerto quem muda e redistribui o código; escolher uma facilitaria contribuições. Publicar a edição Bedrock no GitHub Pages daria um link para jogar sem baixar nada, e ele iria no campo `site` desta ficha. A descrição curta do repositório no GitHub ainda fala em "terminal ASCII", embora a edição gráfica seja a principal.
