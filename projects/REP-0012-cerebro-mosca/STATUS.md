# Estado · 2026-11-12

Exploring. Atlas inicial e executor implementados na Issue #37, branch feat/flybrain-atlas-runner. 471 candidatos identificados após conferir 139.255 neurônios e 2.698.236 conexões; bateria de 16 condições/1.600 passos registrada. Piloto neural ainda não implementado. Próximas fases em PLAN.md; evidências no ATLAS-REPORT.md do aplicativo. Felipe (fkumagae) definiu objetivos e autorizou a execução; Codex implementou e verificou.


Issue #39: MagLab aceita campanhas JSON via CLI/API Node local, preserva ensaios completos na retomada e importa report.json. Primeira bateria offline executada e testada. Limite: entradas são correntes em populações; percepção espacial e piloto continuam pendentes.


Raiz corrigida na Issue #41: toda a implementação fica em REP-0012/app e os acessos canônicos em cerebro-mosca/. REP-0001 preserva somente a proposta de integração ao jogo de Pedro.


Issue #43: arquivos completos das baterias locais (99 e 13 ensaios) publicados em app/sensory-lab/node/results/, incluindo configurações, relatórios e dados por passo. Conferidos hashes e sequência. Ver índice README.md nessa pasta.

## Piloto experimental · Issue #45 · 2026-11-12

Primeiro giro guiado por potenciais neurais implementado em app/pilot/, separado da demo do jogo. Análise dos 99 ensaios e 48 percursos arquivados: neural 11/12 chegadas, rede desligada e sem leitura 2/12, regras 12/12. Avanço fixo, bordas e parada continuam regras; não há circuito motor biológico validado. Leia app/pilot/REPORT.md. O estado anterior de piloto pendente foi superado apenas para este escopo experimental; autonomia geral permanece pendente.

## Teste 2 de intervenções no readout · 2026-11-12

A campanha `app/pilot/campaigns/test-02-readout/` executou 72 percursos
determinísticos: os 12 cenários em leitura normal, esquerda zerada, direita
zerada, ambas zeradas, leituras trocadas e normal restaurada. A referência
normal foi reproduzida 12/12; os resultados completos, trajetórias, comandos,
potenciais originais, leituras utilizadas e hashes estão no `results.json`.
Este resultado não altera parâmetros, calibração, simulador neural ou
`evaluation.json`. A validação seletiva continua experimental e não comprova
função motora biológica.

## Teste 3 de readout alternativo · 2026-11-13

O candidato ALPN `100555` foi avaliado em dois pares (`100555+99987` e
`100133+100555`), com 144 percursos nas seis condições de intervenção. Ambos
os pares tiveram 11/12 chegadas na leitura normal, 0/12 com leituras trocadas
e 2/12 com ambas zeradas. Evidências em
`app/pilot/campaigns/test-03-alpn-readout/`; outros candidatos do atlas seguem
pendentes.

## Teste 4 multimodal · 2026-11-13

Campanha inicial de mapeamento com 20 ensaios de odor, visão, contato,
combinações e sequências temporais. O exportador encontrou 264 candidatos
únicos no critério amplo de potencial/disparo; `neuron-map.json` é um pool
exportável, não uma classificação seletiva. Antes do controle corporal, falta
filtrar respostas por janela ativa versus baseline e validar especificidade
com controles pareados.
