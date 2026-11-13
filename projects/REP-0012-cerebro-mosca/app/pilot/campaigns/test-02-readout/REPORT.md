# REP-0012 · Teste 2 — intervenções no readout ALLN

## Comparação

Os mesmos 12 cenários do piloto foram executados com limite de 1.200 passos, raio
de chegada `0,6` e os parâmetros originais. Cada condição reinicia o motor e
usa a matriz de calibração preservada em `app/pilot/evaluation.json`.

| Condição | Chegadas | Mediana de passos entre sucessos |
|---|---:|---:|
| Referência existente · neural | 11/12 | 414 |
| Leitura normal | 11/12 | 414 |
| Esquerda zerada | 0/12 | — |
| Direita zerada | 0/12 | — |
| Ambas zeradas | 2/12 | 698,5 |
| Leituras trocadas | 3/12 | 495 |
| Normal restaurada | 11/12 | 414 |

A matriz de calibração coincide com a referência. A leitura normal e a normal
restaurada coincidem com os 12 resultados neurais existentes, incluindo
chegadas, colisões, passos e distância final. O arquivo
`results.json` registra, por passo, potenciais originais, leituras efetivamente
usadas no decoder, comandos de giro, trajetória e chegada.

## Condições preservadas

- Nenhum parâmetro de `core.js` foi ajustado.
- O simulador neural original não foi alterado.
- `evaluation.json` foi somente lido e não foi sobrescrito.
- A intervenção ocorre apenas no readout das duas células ALLN:
  esquerda `100133` / root `720575940632403986` e direita `99987` /
  root `720575940623636701`.
- Não houve chamada de IA por ensaio; a execução foi local com Node.js.

## Proveniência

Os hashes completos dos arquivos estão em `results.json`, incluindo `core.js`,
`engine-access.js`, `neural-engine.cjs`, `sensory-map.json`,
`evaluation.json` e `connectome.bin.gz`.

## Execução

```powershell
Set-Location 'projects\REP-0012-cerebro-mosca\app\pilot\campaigns\test-02-readout'
node .\evaluate.cjs
```

O comando gera somente `results.json` dentro desta campanha.
