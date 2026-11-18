---
id: REP-0019
title: "Acompanhador de notas do semestre"
status: trying
owner: null
site: ""
---

# Acompanhador de notas do semestre

## Registro
Um lugar para acompanhar as notas de cada matéria a partir da fórmula do plano de ensino: mostra quanto já foi somado com as avaliações que saíram e oferece um "playground" para perguntas como "quanto preciso tirar na P3 para ser aprovado, se já saíram P1, P2 e um dos trabalhos?".

## Relato original
> no inicio do semestre o professor sempre manda o plano de ensino, que tem a formula do computo da media da materia. toda vez que uma nova nota sai, tenho que ficar recalculando. queria um lugar onde vai mostrando o quanto eu ja somei de nota com as avaliações que ja sairam, mais um "playground", que de pra fazer umas coisas como: quanto preciso tirar na P3 pra ser aprovado, considerando que ja saiu nota da p1 e p2 alem de um dos trabalhinhos? esse tipo de coisa
>
> um exemplo simples de formula que temos eh 0,7*MP + 0,3*MT. MP eh media simples de provas, MT eh media simples de trabalhos
>
> (a fórmula foi corrigida pela proponente logo depois; a primeira versão dizia 0,8*MT)

Depois de testar o piloto, no mesmo dia:

> quero que o nosso mvp tenha a capacidade do usuario poder upar todos os planos de ensino do semestre, e o site extrair dos pdfs a formula de notas e montar o painel do aluno para cada materia. outra coisa que gostaria, e como a recuperação entra no meio d isso tudo e como o exame entra tambem. adicione um registro disso para desenvolvimento futuro.
>
> o usuario deveria poder imputar a formula das suas respectivas materias e acompanha las

## Origem e autoria
Proposta trazida ao mapa em 18/11/2026, numa sessão com Claude Code, com pedido de registro e de um piloto. Crédito: **PedroCamargoLINCE**, mesma identidade confirmada em 18/11/2026 (ver contributions/2026-11-18-ideias-docker-rag.json); ficha desta entrega em contributions/2026-11-18-notas-semestre-piloto.json.

## Sugestões da IA (opcional)
Sugestões, não decisões humanas: cada matéria guarda a própria fórmula, escrita como no plano (uma linha por média, a última é a final); os pesos não precisam somar 1; as notas ficam só no navegador de quem usa, porque o repositório é público. Possíveis próximos passos: notas com valor máximo diferente por avaliação e acompanhamento de frequência.

## Próxima contribuição (opcional)
Piloto em [projects/REP-0019-notas-semestre](../../projects/REP-0019-notas-semestre/README.md). Próximo passo: usar com as matérias reais deste semestre. Desenvolvimento futuro pedido pela proponente (ler os planos em PDF, recuperação e exame) registrado em [PROXIMOS-PASSOS.md](../../projects/REP-0019-notas-semestre/PROXIMOS-PASSOS.md). Endereço público ainda pendente: depois do merge na main, o mapa deve publicar em `notas-semestre/`; conferir e preencher `site`.
