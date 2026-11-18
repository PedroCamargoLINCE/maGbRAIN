# Notas do semestre

Objetivo: parar de recalcular a média à mão a cada nota nova. Cada matéria guarda a fórmula do plano de ensino; a página mostra quanto já está garantido e quanto falta tirar nas avaliações que ainda não saíram.

## Uso
Abra `app/index.html` no navegador, sem instalação. Na publicação do mapa, a página fica em `notas-semestre/`.

1. Em **Plano de ensino**, escreva a fórmula, uma linha por média:
   ```
   MP = media(P1, P2, P3)
   MT = media(T1, T2, T3)
   MF = 0,7*MP + 0,3*MT
   ```
   A última linha é a média final. Todo nome não definido (P1, T1, Lista2…) vira uma avaliação. Funções: `media`, `soma`, `min`, `max`, `melhores(n; ...)` (média das n maiores). Pesos como `0,7`, `0.7` ou `70%`, sem obrigação de somar 1. Maiúsculas e minúsculas não importam.
2. Em **Notas**, lance cada nota quando sair. "Cada ponto vale" mostra quanto um ponto naquela avaliação soma na média final.
3. **Até agora** mostra o garantido (o que falta conta 0), o máximo possível e a projeção mantendo sua média.
4. **E se…?** calcula a menor nota, igual em todas as avaliações marcadas "descobrir", para fechar com a meta (aprovação ou outra). Em "supor nota" você fixa um valor hipotético. A escada mostra a média final para cada nota de 0 ao máximo.
5. Use "+ Matéria" para cada disciplina. "Copiar backup" e "Restaurar backup" levam os dados para outro navegador.

As notas ficam só no `localStorage` do navegador. Nada é enviado e nada vai para o repositório.

## Limites
O cálculo supõe que tirar mais nunca diminui a média (pesos positivos). Uma única nota máxima por matéria. Sem exame/recuperação, arredondamento oficial ou frequência; planejados em [PROXIMOS-PASSOS.md](PROXIMOS-PASSOS.md).

## Verificação
`node projects/REP-0019-notas-semestre/test-formula.cjs`

`python scripts/build_site.py`
