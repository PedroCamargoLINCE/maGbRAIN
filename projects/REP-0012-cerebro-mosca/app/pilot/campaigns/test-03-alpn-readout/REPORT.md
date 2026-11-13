# REP-0012 · Teste 3 — readout alternativo com ALPN 100555

## Protocolo

O candidato ALPN `100555` / root `720575940622726271`, identificado no atlas
mas ausente do Teste 2, foi avaliado em dois pares: `100555+99987` e
`100133+100555`. Cada par executa os mesmos 12 cenários em seis condições:
normal, esquerda zerada, direita zerada, ambas zeradas, leituras trocadas e
normal restaurada.

Os parâmetros do piloto foram preservados. Cada par recebe sua própria matriz
2x2 de calibração, obtida pelos mesmos dois estímulos unilaterais de corrente
`0,1`; isso evita reutilizar uma calibração específica das duas ALLN originais.
Potenciais originais, leituras utilizadas, comandos, trajetórias, chegadas e
hashes estão em `results.json`.

## Comparação

| Par de leitura | Condição | Chegadas |
|---|---|---:|
| 100555 + 99987 | Normal | 11/12 |
| 100555 + 99987 | Esquerda zerada | 0/12 |
| 100555 + 99987 | Direita zerada | 0/12 |
| 100555 + 99987 | Ambas zeradas | 2/12 |
| 100555 + 99987 | Leituras trocadas | 0/12 |
| 100555 + 99987 | Normal restaurada | 11/12 |
| 100133 + 100555 | Normal | 11/12 |
| 100133 + 100555 | Esquerda zerada | 0/12 |
| 100133 + 100555 | Direita zerada | 0/12 |
| 100133 + 100555 | Ambas zeradas | 2/12 |
| 100133 + 100555 | Leituras trocadas | 0/12 |
| 100133 + 100555 | Normal restaurada | 11/12 |

A mediana dos passos entre sucessos foi `416` nos modos normais e `698,5`
nas condições de ambas zeradas. Os modos de leitura trocada não chegaram em
nenhum dos 24 cenários.

## Execução

```powershell
Set-Location 'projects\REP-0012-cerebro-mosca\app\pilot\campaigns\test-03-alpn-readout'
node .\evaluate.cjs
```

Não houve chamadas de IA por ensaio, nem alteração do simulador neural
original ou de `evaluation.json`.
