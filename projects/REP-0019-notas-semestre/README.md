# Notas do semestre

Objetivo: parar de recalcular a média à mão a cada nota nova. Cada matéria guarda a fórmula do plano de ensino; a página mostra quanto já está garantido e quanto falta tirar nas avaliações que ainda não saíram.

## Uso
Abra `app/index.html` no navegador, sem instalação. Na publicação do mapa, a página fica em `notas-semestre/`.

**Atalho com os planos de ensino em PDF:** em **Enviar planos de ensino**, escolha (ou arraste) um ou vários PDFs. A página lê o texto no próprio navegador, acha o nome da disciplina, a média de aprovação e as equações da seção "Critérios de Avaliação" (parando antes de recuperação e exame) e propõe a fórmula. Confira com o trecho original e clique em **Criar matéria** ou **Criar todas**. O leitor de PDF (pdf.js 3.11.174) é baixado do cdnjs na primeira vez; PDFs escaneados, sem texto, não funcionam.

Para escrever a fórmula à mão:

1. Crie a matéria em **Nova matéria** e, em **Editar fórmula**, escreva a fórmula, uma linha por média:
   ```
   MP = media(P1, P2, P3)
   MT = media(T1, T2, T3)
   MF = 0,7*MP + 0,3*MT
   ```
   A última linha é a média final. Todo nome não definido (P1, T1, Lista2…) vira uma avaliação. MP, MT e as outras médias são calculadas pela página: você lança só P1, P2, T1… Se uma média ficar como nota (por exemplo `MF = 0,7*MP + 0,3*MT` sem definir MP), a página oferece calculá-la a partir das provas. Funções: `media`, `soma`, `min`, `max`, `melhores(n; ...)` (média das n maiores). Pesos como `0,7`, `0.7` ou `70%`, sem obrigação de somar 1. Maiúsculas e minúsculas não importam.
2. Em **Notas**, lance cada nota na ficha dela quando sair; as fichas aparecem agrupadas pela média em que entram. O número pequeno em cada ficha mostra quanto um ponto ali soma na média final. Em médias simples (`MP = media(P1, P2)`), os botões **−** e **+** mudam quantas provas ou trabalhos entram, para quando o plano não diz a quantidade.
3. **Até agora** mostra o garantido (o que falta conta 0), o máximo possível e a projeção mantendo sua média. A média final é arredondada como na Unesp: uma casa decimal, subindo a partir de 5 na segunda casa (4,96 vira 5,0; 9,14 vira 9,1). As médias parciais (MP, MT) não são arredondadas. Dá para desligar em **Editar fórmula**.
4. **E se…?** calcula a menor nota, igual em todas as avaliações marcadas "descobrir", para fechar com a meta (aprovação ou outra). Em "supor nota" você fixa um valor hipotético. A escada mostra a média final para cada nota de 0 ao máximo.
5. Use "+ Matéria" para cada disciplina. "Copiar backup" e "Restaurar backup" levam os dados para outro navegador.

As notas ficam só no `localStorage` do navegador. Nada é enviado e nada vai para o repositório.

## Limites
O cálculo supõe que tirar mais nunca diminui a média (pesos positivos). Uma única nota máxima por matéria. Sem exame/recuperação ou frequência; planejados em [PROXIMOS-PASSOS.md](PROXIMOS-PASSOS.md).

## Verificação
`node projects/REP-0019-notas-semestre/test-formula.cjs`

`node projects/REP-0019-notas-semestre/test-syllabus.cjs`

`python scripts/build_site.py`
