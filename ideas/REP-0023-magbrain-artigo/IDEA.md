---
id: REP-0023
title: "maGbRAIN como artigo científico"
status: exploring
owner: null
site: ""
---

# maGbRAIN como artigo científico

## Registro
Usar o próprio maGbRAIN, a arquitetura montada neste repositório, como objeto de um artigo científico para conferência ou journal, numa área em que ele combine como está ou com mudanças mínimas. Já existe uma pesquisa prévia com a triagem de áreas e venues em [TRIAGEM.md](TRIAGEM.md). A leitura dela: o encaixe mais natural é um relato de experiência em Interação Humano-Computador/CSCW ou em aspectos humanos de Engenharia de Software (colaboração assíncrona de estudantes, cada um com a sua assinatura de IA, tendo o repositório como memória compartilhada e o crédito humano separado da IA); com um pouco de coleta de dados, também cabe em educação em engenharia.

## Relato original
> agora quero registrar uma ideia no magbrains: magbrains como artigo cientifico. usar a arquitetura que montamos para um paper de conferencia ou journal, em alguma area onde isso combine. podem ser tambem areas que precisariam de mudancas minimas para o paper ser adequado. faça uma pesquisa previa e uma triagem, e registre essa ideia

## Origem e autoria
Proposta trazida ao mapa em 21/11/2026, numa sessão com Claude Code. Crédito: **PedroCamargoLINCE**, mesma identidade confirmada em 18/11/2026 (ver contributions/2026-11-18-ideias-docker-rag.json); ficha desta entrega em contributions/2026-11-21-magbrain-artigo.json. O maGbRAIN em si é obra coletiva: um artigo sobre ele precisa combinar autoria com quem construiu e usou o caderno (por exemplo Felipe, proponente da REP-0013), o que ainda não foi conversado.

## O que seria o objeto do artigo
Resumo da arquitetura como ela está no repositório em 21/11/2026, para quem for escrever:
- **Protocolo em texto para pessoas e agentes** ([AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md)): a unidade de trabalho é uma contribuição pequena e verificável; nenhuma sessão precisa terminar uma ideia; o repositório é a memória e o chat não é dependência.
- **Ciclo de vida das ideias** (`inbox` → `exploring` → `ready` → `building` → `trying` → `done`, com `parked`) e separação entre `ideas/` (captura livre) e `projects/` (README, STATUS, DECISIONS, handoffs).
- **Passagem de trabalho** ([HANDOFF.md](../../docs/templates/HANDOFF.md)) para retomar entre pessoas e agentes diferentes.
- **Crédito humano separado da autoria técnica** ([CONTRIBUTIONS.md](../../docs/CONTRIBUTIONS.md)): fichas por entrega lógica, IA só em `tools`, autoria pendente em vez de inferida, validação na CI.
- **Mapa e placar gerados** do próprio repositório (site estático, sem listas manuais) e **busca local** (BM25, Ollama opcional, sem serviço pago).
- **Replicável** para outros grupos via Docker e `scripts/new_group.py` (REP-0017).

## Sugestões da IA (opcional)
Sugestões, não decisões humanas: começar por um relato de experiência em português (IHC ou COBENGE), que aceita o caderno como está, e só depois buscar um venue internacional. A principal lacuna em qualquer venue é evidência: hoje há um único grupo pequeno, com autores que também são participantes. A mudança mínima que mais abre portas é coletar dados leves: mineração do próprio repositório (commits, PRs, fichas, handoffs, tempo entre estados) e um questionário curto com quem usou. Detalhes e riscos em [TRIAGEM.md](TRIAGEM.md).

## Próxima contribuição (opcional)
Escolher o primeiro alvo (sugestão: relato de experiência no IHC 2027 ou no COBENGE 2027, conferindo as chamadas quando saírem) e combinar com os participantes do maGbRAIN quem assina e se topam responder a um questionário.
