# Passagem de trabalho — responsável nas Issues, "quero ajuda" e fim do catálogo manual

- Data e participante: 2026-11-18; pedido de Maria pela conta GitHub PedroCamargoLINCE, perfil `pedrocamargolince`.
- Agente/ambiente: Claude Code, contêiner Linux na nuvem; Python 3, Node 22, Chromium (Playwright).
- Ideia: REP-0013 (o próprio maGbRAIN como estrutura de colaboração). Sem Issue.
- Objetivo: deixar visível quem está fazendo o quê, mostrar no site o que quer ajuda e acabar com a lista de ideias mantida à mão.

## O que mudou

- **Responsável:** quem assume uma tarefa se coloca no campo Assignee da Issue, em vez de só comentar. Issue sem Assignee está livre. Regra em CONTRIBUTING, AGENTS, README e no modelo de Issue.
- **Etiqueta `quero-ajuda`:** marca tarefas abertas para qualquer pessoa.
- **Site:** novo bloco "Querem ajuda agora" acima do mapa, botão "Só quem quer ajuda", selo nos cartões e lista na ficha da ideia. O navegador lê as Issues abertas com a etiqueta pela API pública do GitHub, sem token, e guarda o resultado por 10 minutos. A ideia vem do `REP-XXXX` no título da Issue. Se a consulta falhar, fica só o link para o GitHub. Detalhes em [MAPA.md](../MAPA.md).
- **Catálogo:** a lista manual de ideias saiu do README, que agora aponta para o mapa gerado de `ideas/`. AGENTS e CONTRIBUTING dizem para não manter listas manuais. O README criado por `scripts/new_group.py` segue a mesma linha.

## Verificações e evidências

- `python -m unittest discover -s tests`: 14 testes passaram. `python scripts/build_site.py`: 19 ideias e 8 relações.
- Site aberto no Chromium com a resposta do GitHub simulada em quatro casos: com tarefas (2 cartões, filtro reduz o mapa para 1 de 19 ideias, selo no cartão, lista na ficha), sem tarefas (mensagem e filtro escondido), consulta falhando (só o link) e largura de celular (sem rolagem horizontal). Nenhum erro de JavaScript.
- Links relativos dos `.md` conferidos por script: nenhum quebrado.
- **Não executado:** a consulta real à API do GitHub a partir do site publicado, que só dá para conferir depois do merge e da publicação.

## Pendências e bloqueios

- A consulta sem token tem limite de 60 leituras por hora por endereço IP. Para o uso de uma república deve sobrar, e o cache de 10 minutos ajuda; se estourar, aparece só o link.
- Só colaboradores com acesso de escrita conseguem se colocar como Assignee ou aplicar etiquetas.
- Ficaram de fora, por decisão desta rodada: formulário "Nova ideia", regras duplicadas de crédito e proteção da `main`.

## Próxima ação concreta

Depois do merge, abrir o mapa publicado e conferir que as Issues com `quero-ajuda` aparecem no bloco.

## Estado da tarefa

Concluída, com a conferência no site publicado pendente. O estado da REP-0013 não muda.
