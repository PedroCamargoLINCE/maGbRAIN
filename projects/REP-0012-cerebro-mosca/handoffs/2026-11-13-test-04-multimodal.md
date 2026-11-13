# Passagem de trabalho

- Data e participante: 2026-11-13, Felipe (fkumagae)
- Agente/ambiente: Copilot SDK em VS Code; Node.js local
- Ideia e Issue: REP-0012, Issue #45
- Branch, commit e PR: branch atual; commit e PR pendentes
- Objetivo: mapear respostas neurais a odor, visão, contato e combinações.

## O que mudou

Criada `app/pilot/campaigns/test-04-multimodal-map/` com 20 casos, execução
bruta em `run/` e exportação `neuron-map.json` agrupada por modalidade.

## Verificações e evidências

`node sensory-lab/node/run.cjs` concluiu 20/20 ensaios sem chamadas de IA.
O exportador encontrou 264 candidatos únicos: 262 associados a odor, 261 a
visão e 263 a contato pelo critério inicial do executor. O teste automatizado
do executor passou com 13 casos.

## Pendências e limitações

O mapa é um pool inicial, não uma classificação seletiva. O executor agrega
picos durante o ensaio e o limiar `0,1` inclui muitos potenciais subthreshold;
combinações são atribuídas a todas as modalidades presentes. É necessária uma
segunda filtragem por janela ativa versus baseline e controles pareados antes
de usar esses neurônios no controle corporal.

## Próxima ação concreta

Implementar análise temporal por neurônio e selecionar candidatos multimodais
com evidência de especificidade, mantendo os arquivos brutos desta campanha.

## Estado da tarefa

Concluída como primeira etapa de mapeamento; integração ao corpo permanece
pendente.

## Crédito

Felipe solicitou e autorizou a campanha; a IA e Node.js são ferramentas, não
participantes humanos. Ficha:
`contributions/2026-11-13-rep-0012-test-04-multimodal.json`.
