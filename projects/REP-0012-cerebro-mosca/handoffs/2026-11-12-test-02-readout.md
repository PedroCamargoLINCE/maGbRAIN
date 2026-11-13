# Passagem de trabalho

- Data e participante: 2026-11-12, Felipe (fkumagae)
- Agente/ambiente: Copilot SDK em VS Code; Node.js local
- Ideia e Issue: REP-0012, Issue #45
- Branch, commit e PR: branch atual; commit e PR pendentes
- Objetivo desta contribuição: executar somente o Teste 2 de intervenções no readout ALLN.

## O que mudou

Criada `app/pilot/campaigns/test-02-readout/` com runner, resultados completos e
relatório. O runner preserva parâmetros, calibração e simulador; intervém
somente nas duas leituras ALLN.

## Verificações e evidências

`node .\evaluate.cjs` executou 72 percursos sem chamadas de IA por ensaio.
As condições normal e normal restaurada reproduziram 12/12 percursos da
referência. `evaluation.json` permaneceu inalterado; hashes e trajetórias estão
em `results.json`.

## Pendências e bloqueios

Nenhum bloqueio para este teste. A interpretação continua limitada ao
decodificador de engenharia; não demonstra identidade motora biológica.

## Próxima ação concreta

Revisar a atribuição e os resultados no PR antes de qualquer novo teste. Não
alterar parâmetros nem iniciar outros testes nesta entrega.

## Estado da tarefa

Concluída; o estado do projeto permanece independente.

## Crédito

Felipe conduziu e solicitou a entrega; a IA e Node.js são ferramentas, não
participantes humanos. Ficha: `contributions/2026-11-12-rep-0012-test-02-readout.json`.
