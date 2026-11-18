---
id: REP-0018
title: "RAG replicável sobre a base do maGbRAIN"
status: trying
owner: null
site: ""
---

# RAG replicável sobre a base do maGbRAIN

## Registro
Montar um RAG replicável sobre a "database" do maGbRAIN (ideias, projetos, handoffs e contribuições), sem gastar dinheiro.

## Origem e autoria
Proposta trazida ao mapa em 18/11/2026, numa sessão com Claude Code. Crédito da proposta: **PedroCamargoLINCE**, confirmado pela participante em 18/11/2026; ver contributions/2026-11-18-ideias-docker-rag.json.

## Sugestões da IA (opcional)
Sugestões, não decisões humanas: usar apenas ferramentas gratuitas e locais (embeddings e modelo de código aberto rodando na máquina, índice em arquivo) e indexar só o conteúdo público do repositório. Pode ser empacotado junto da REP-0017 para que cada grupo tenha o seu próprio RAG.

## Próxima contribuição (opcional)
Primeira versão em `scripts/rag.py`; ver [docs/RAG.md](../../docs/RAG.md) e [projects/REP-0018-rag-magbrain](../../projects/REP-0018-rag-magbrain/STATUS.md). Próximo passo: baixar um modelo no Ollama numa máquina do grupo e testar perguntas reais.
