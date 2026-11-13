# Passagem de trabalho

- Data e participante: 2026-11-13, Felipe (fkumagae)
- Agente/ambiente: Copilot SDK em VS Code; Node.js local
- Ideia e Issue: REP-0012, Issue #45
- Branch, commit e PR: `feat/rep-0012-multimodal-mapping`, PR draft #47
- Objetivo: testar grupos visuais, mecânicos e de perigo e procurar saída descendente.

## O que mudou

Criada `app/pilot/campaigns/test-05-sensory-motor-screen/` com 34 ensaios:
16 condições sensoriais/combinações e 18 ablações seletivas de seis candidatos.

## Verificações e evidências

`node sensory-lab/node/run.cjs` concluiu 34/34 ensaios sem chamadas de IA.
Nenhum ensaio produziu disparos em `GNG_DESC`; `VIS_LPTC` produziu 5 disparos
downstream e `VIS_ME` produziu 122. As 18 ablações não alteraram o sinal
GNG_DESC. O teste automatizado do executor passou com 13 verificações.

## Pendências e limitações

Não foi encontrado comando observável de andar, parar ou fuga. `DN_WALK` e
grupos motores legíveis permanecem vazios nos metadados; GNG_DESC é apenas uma
população descendente observável. Ausência de spikes não prova ausência de
circuito motor.

## Próxima ação concreta

Implementar análise temporal por neurônio e verificar outras populações
descendentes/candidatos com identidade anatômica antes de criar um controlador.

## Estado da tarefa

Concluída como triagem; controle corporal autônomo permanece pendente.

## Crédito

Felipe solicitou e autorizou a série; a IA e Node.js são ferramentas, não
participantes humanos. Ficha:
`contributions/2026-11-13-rep-0012-test-05-sensory-motor.json`.
