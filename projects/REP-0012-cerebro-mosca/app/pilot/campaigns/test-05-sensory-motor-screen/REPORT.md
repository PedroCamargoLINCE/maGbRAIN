# REP-0012 · Teste 5 — triagem sensorial e saída descendente

A campanha concluiu 34 ensaios locais. O grupo observado como saída descendente foi GNG_DESC (índice 35).

| Classe | Ensaios com disparos GNG_DESC | Total |
|---|---:|---:|
| visual | 0 | 14 |
| contact | 0 | 10 |
| danger | 0 | 8 |
| other | 0 | 2 |

Ablações seletivas: 18 ensaios em 6 candidatos.
Os detalhes por caso, potenciais e candidatos estão em `run/`; o resumo exportável está em `sensor-motor-screening.json`.

Resultado observado: `VIS_LPTC` produziu 5 disparos downstream e `VIS_ME`
produziu 122, mas nenhum dos 34 ensaios produziu disparos em `GNG_DESC`.
As 18 ablações não alteraram esse sinal descendente. Portanto, esta bateria
encontrou transmissão visual para outras populações, mas não um comando
observável de fuga, andar ou parar.

Este teste procura evidência de transmissão sensorial para uma população descendente.
Não transforma GNG_DESC em comando de andar, parar ou fugir: uma resposta zero
não descarta circuito motor, e uma resposta positiva não prova a função.
