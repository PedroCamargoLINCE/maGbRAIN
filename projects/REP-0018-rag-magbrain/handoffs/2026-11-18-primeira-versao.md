# Passagem de trabalho

- Data e participante: 2026-11-18, autoria a confirmar
- Agente/ambiente (opcional): Claude Code, contêiner Linux com Docker
- Ideia e Issue: REP-0018, sem Issue
- Branch, commit e PR: claude/project-thread-zrl2nu, PR #49
- Objetivo desta contribuição: primeira versão do RAG gratuito e replicável

## O que mudou
`scripts/rag.py` (comandos search, prompt, ask, serve), serviço `rag` e perfil `llm` com Ollama no `docker-compose.yml`, `docs/RAG.md`, `tests/test_rag.py`.

## Verificações e evidências
- Buscas manuais no repositório: "gatos" traz Gatos sentinelas e RainCat; "piloto do cérebro de mosca" traz o relatório do piloto; "docker" traz REP-0017.
- Contêiner `rag`: `/api/search`, `/api/ask` e a página responderam; sem Ollama, `/api/ask` devolveu o prompt e o motivo.
- Ollama 0.6.5 real em contêiner: a chamada chegou e o erro de modelo ausente apareceu com a dica de `ollama pull`.
- Não testado: resposta de um modelo de verdade, porque o ambiente de teste não acessa o registro de modelos do Ollama.

## Pendências e bloqueios
Rodar `ollama pull qwen2.5:3b` numa máquina do grupo e conferir a qualidade das respostas em português.

## Próxima ação concreta
`docker compose --profile llm up -d ollama rag`, baixar o modelo e testar cinco perguntas reais; anotar acertos e erros aqui.

## Estado da tarefa
Parcial: funciona sem modelo; resposta com modelo local ainda não verificada.
