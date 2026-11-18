# Passagem de trabalho

- Data e participante: 2026-11-18, autoria a confirmar
- Agente/ambiente (opcional): Claude Code, contêiner Linux com Docker
- Ideia e Issue: REP-0017, sem Issue
- Branch, commit e PR: claude/project-thread-zrl2nu, PR #49
- Objetivo desta contribuição: primeira versão em Docker e criação de caderno para outro grupo

## O que mudou
`Dockerfile`, `docker-compose.yml`, `.dockerignore`, `scripts/docker-entrypoint.sh`, `scripts/new_group.py`, `docs/DOCKER.md`, `tests/test_new_group.py`. `scripts/build_site.py` passou a ignorar páginas de projetos ausentes, para o caderno vazio construir.

## Verificações e evidências
- `docker build` e `docker run` no modo site: mapa e `/rv1a/` responderam 200.
- `docker run ... new-group` criou um caderno vazio; a imagem desse caderno passou em `test` (build com 0 ideias).
- `python -m unittest discover -s tests`: 14 testes passaram.
- Não testado: Docker Desktop no Windows/macOS e uma pessoa de fora seguindo o guia.

## Pendências e bloqueios
Nenhum bloqueio. A imagem base veio de um espelho por limite de taxa do Docker Hub no ambiente de teste; o Dockerfile usa `python:3.12-slim` normalmente.

## Próxima ação concreta
Pedir a alguém de fora do grupo que siga `docs/DOCKER.md` do zero e registrar onde travou.

## Estado da tarefa
Parcial: funciona, falta teste com um grupo real.
