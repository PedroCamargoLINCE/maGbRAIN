# Passagem de trabalho — reorganização das pastas da raiz

- Data e participante: 2026-11-18; pedido de Maria pela conta GitHub PedroCamargoLINCE, perfil `pedrocamargolince`.
- Agente/ambiente: Claude Code, contêiner Linux na nuvem; Python 3.
- Ideia: REP-0013 (o próprio maGbRAIN como estrutura de colaboração). Sem Issue.
- Branch: `claude/project-thread-4chedn`.
- Objetivo: deixar a raiz mais legível sem mudar o funcionamento nem os endereços do site.

## O que mudou

| Antes | Depois |
|---|---|
| `web/` | `site/` |
| `assets/` | `site/assets/` |
| `templates/` | `docs/templates/` |
| `contributors.json` | `contributions/contributors.json` |
| `docs/HANDOFF-atalhos-sites.md` | `docs/handoffs/2026-11-04-atalhos-sites.md` |
| `docs/HANDOFF-autoria-minha-mente.md` | `docs/handoffs/2026-11-05-autoria-minha-mente.md` |
| `docs/IMPORT.md` | `docs/handoffs/2026-11-04-importacao-inicial.md` |

`ideas/`, `projects/`, `scripts/`, `tests/` e as fichas em `contributions/` não mudaram de lugar. Caminhos ajustados em `scripts/build_site.py`, `scripts/contributions.py`, `scripts/rag.py`, `scripts/new_group.py`, nos testes, no README, AGENTS, CONTRIBUTING e nos guias em `docs/`. Duas fichas tiveram só o caminho da evidência atualizado. Textos de handoffs antigos continuam citando os caminhos da época.

`contributions.py` e `rag.py` agora ignoram `contributors.json` ao ler as fichas, porque ele passou a morar na mesma pasta.

## Verificações e evidências

- `python -m unittest discover -s tests`: 14 testes passaram.
- `python scripts/build_site.py`: 19 ideias e 8 relações. O `dist/` gerado foi comparado arquivo a arquivo com o da `main`: mesma lista de arquivos e mesmo conteúdo, exceto os dois caminhos de evidência movidos dentro do `index.html`.
- Links relativos de todos os `.md` conferidos por script: nenhum quebrado.
- `python scripts/rag.py search` continua retornando ideias e fichas.
- **Não executado:** `docker compose up` (sem Docker no ambiente). O Dockerfile e o compose não citam as pastas movidas.

## Pendências e bloqueios

- Quem tiver branch aberta mexendo em `web/`, `assets/`, `templates/` ou `contributors.json` precisa atualizar a base. Os PRs #48 e #51 não tocam nesses caminhos.
- Lacunas de colaboração (acesso, labels, formulário de ideia, catálogo manual do README, regras duplicadas) ficam para um PR separado.

## Próxima ação concreta

Revisar o PR e, depois do merge, conferir que o workflow "Mapa de ideias" publicou normalmente.

## Estado da tarefa

Concluída para a mudança de pastas. O estado da REP-0013 não muda.
