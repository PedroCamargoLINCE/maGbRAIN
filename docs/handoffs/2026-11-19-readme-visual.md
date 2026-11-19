# Passagem de trabalho — README mais visual, com placar automático

- Data e participante: 2026-11-19; pedido de PedroCamargoLINCE, perfil `pedrocamargolince`.
- Agente/ambiente: Claude Code, contêiner Linux na nuvem; Python 3.
- Ideias: REP-0013 (o próprio maGbRAIN como estrutura de colaboração) e REP-0020 (cara da Magnatas; aqui só o logo no README). Sem Issue própria.
- Branch: `claude/project-thread-6ozhqj`.
- Objetivo: deixar o README mais visual e dinâmico, com uma contagem de contribuições que ninguém precise manter à mão.

## O que mudou

- `scripts/placar.py` (novo) e `scripts/build_site.py`: o build passa a escrever `dist/placar.svg` e `dist/placar.json`, com total de ideias, projetos, fichas de contribuição, pessoas com crédito, fichas por pessoa e ideias por estado. O README mostra a imagem direto do endereço publicado no GitHub Pages, então os números mudam a cada publicação da `main` sem commit no README.
- `README.md`: cabeçalho centralizado com o escudo da Magnatas, selos (testes, publicação do mapa, ideias, contribuições, querem ajuda, PRs abertos, último commit, licença), banner clicável, placar, diagrama do caminho de uma ideia pelos estados, tabela de organização, Docker recolhível e rodapé "Feito na Magnatas". O texto e os links que já existiam foram mantidos; a seção "Mapa de ideias", que repetia a seção "Ideias", foi fundida nela.
- `site/assets/magnatas/logo.png`: escudo enviado por PedroCamargoLINCE, recortado (o original tinha muita margem branca), com fundo transparente e contorno branco para aparecer bem no tema claro e no escuro.
- `scripts/new_group.py`: copia `placar.py` para cadernos novos e deixa de fora a pasta `magnatas/`, para o logo da casa não ir para outros grupos.
- `docs/MAPA.md` e `docs/VISUAL.md`: explicam o placar e registram o logo.

## Verificações e evidências

- `python -m unittest discover -s tests`: 16 testes passaram (2 novos em `tests/test_placar.py`).
- `python scripts/build_site.py`: 20 ideias e 8 relações; `placar.json` = 20 ideias, 8 projetos, 29 contribuições (contando a ficha desta entrega), 2 pessoas. O SVG foi aberto no Chromium sobre fundo claro e escuro.
- Links relativos do README conferidos por script.
- **Não verificado:** a aparência final no GitHub. O placar e os selos de ideias e contribuições só aparecem depois do merge, quando o workflow "Mapa de ideias" publicar `placar.svg` e `placar.json`; antes disso ficam como imagem quebrada na pré-visualização do PR. O endereço do Pages não era acessível do ambiente de trabalho.

## Pendências e bloqueios

- Cores, fonte e o lobo da Magnatas continuam com a REP-0020; o placar usa a paleta atual do mapa.
- O GitHub guarda imagens externas por alguns minutos, então o placar pode demorar um pouco para refletir uma publicação.

## Próxima ação concreta

Depois do merge, abrir o README no GitHub e conferir o placar, os selos e o diagrama nos temas claro e escuro.

## Estado da tarefa

Concluída, com a conferência pós-merge acima em aberto. O estado das ideias não muda.
