# Próximos passos: planos em PDF, recuperação e exame

Registro para desenvolvimento futuro. Nada daqui está implementado ainda.

**Decisão da proponente (18/11/2026):** recuperação e exame não serão implementados por enquanto, porque mudam muito de matéria para matéria. Ficam apenas registrados aqui.

## Pedido
> quero que o nosso mvp tenha a capacidade do usuario poder upar todos os planos de ensino do semestre, e o site extrair dos pdfs a formula de notas e montar o painel do aluno para cada materia. outra coisa que gostaria, e como a recuperação entra no meio d isso tudo e como o exame entra tambem. adicione um registro disso para desenvolvimento futuro.

Pedido feito em 18/11/2026 pela proponente da REP-0019, com quatro planos de ensino da UNESP como exemplo. Os PDFs não foram adicionados ao repositório.

## O que os quatro planos mostram
Todos seguem o mesmo modelo de documento: a seção **Critérios de Avaliação da Aprendizagem** fica entre "Bibliografia" e "Ementa", e o texto é selecionável (não é imagem). O "Ementa" é um bom marcador de fim.

| Disciplina | Média do semestre (sintaxe do piloto) | Recuperação | Exame |
|---|---|---|---|
| Cálculo | `MT = media(T1, T2)` · `N1 = 0,9*P1 + 0,1*MT` · `N2 = 0,9*P2 + 0,1*MT` · `MF = (N1 + N2)/2` | Prova no fim do semestre que substitui N1 ou N2, só se for vantajoso: `MF = max(N1 + N2; max(N1, N2) + REC)/2` | `MFA = (MF + NE)/2 ≥ 5` e `NE ≥ 5` |
| Controle de processos | `MF = 0,4*P1 + 0,4*P2 + 0,2*P3` (cada P é média de atividades) | Quem tirou menos de 5 em uma P refaz as atividades dela; a nova P fica limitada a 5 | `MFA = (MF + NE)/2`; o texto pede `NE ≥ 5` |
| Laboratório de eletrônica | `MR = media(R1, ..., Rn)` · `MF = 0,3*Projeto + 0,7*MR` | A fórmula inteira muda: `MF = 0,2*Projeto + 0,4*MR + 0,4*REC` | `MFA = (MF + NE)/2` |
| Circuitos elétricos | `MP = (P1 + P2)/2` · `MT = (T1 + T2)/2` · `MF = 0,9*MP + 0,1*MT` | Prova de recuperação por prova: `Pn* = (Pn + Pr)/2`, limitada a 5, substitui Pn | `MFA = (MF + NE)/2 ≥ 5` |

As médias do semestre das quatro cabem na sintaxe atual (ver `test-formula.cjs`). A recuperação também pode ser escrita com `max` e `min`, mas o aluno não deveria precisar fazer isso à mão.

Regra comum, que vem da Resolução UNESP 106/12 (alterada pela 75/2016): aprovação com MF ≥ 5 e frequência ≥ 70%. Quem fica abaixo de 5 com frequência suficiente pode fazer exame, e a nota final é a média simples entre MF e a nota do exame. Para o painel, a pergunta do exame vira `NE ≥ 10 − MF` (e `NE ≥ 5` quando o plano exige). Com MF = 3,5, por exemplo, o aluno precisa de 6,5 no exame.

## Como a recuperação e o exame entram (proposta)
Cada matéria passa a ter três fases, mostradas em ordem no painel:

1. **Semestre**: a fórmula atual e as notas lançadas.
2. **Recuperação** (opcional, durante o semestre): um dos quatro tipos vistos nos planos, cada um com campos próprios em vez de fórmula livre:
   - *substitui a menor nota se for vantajoso* (Cálculo);
   - *refaz uma avaliação com teto* (Controle: nova nota limitada a 5);
   - *média com a prova de recuperação e teto* (Circuitos: `(Pn + Pr)/2`, limitada a 5);
   - *fórmula alternativa* (Laboratório: outra fórmula com REC).
   Sobra sempre a opção de escrever a fórmula à mão.
3. **Exame** (depois do semestre): ligado por padrão com a regra UNESP `MFA = (MF + NE)/2 ≥ 5`, com a opção "exige NE ≥ 5". O painel mostra "Você precisa de X no exame" quando MF < 5, e "Não precisa de exame" quando MF ≥ 5.

No "E se…?", REC, Pr e NE viram avaliações como as outras: dá para perguntar "quanto preciso na recuperação" ou "quanto preciso no exame".

## Ler os planos em PDF

**Feito em 18/11/2026** (passos 1 a 4 abaixo, em `app/syllabus.js`): testado com os quatro planos, que viraram as quatro fórmulas da tabela acima sem edição. O passo 5 (copiar prompt) continua pendente.

Tudo no navegador, sem servidor e sem custo, para que as notas e os PDFs não saiam do computador do aluno.

1. Enviar vários PDFs de uma vez. Ler o texto com pdf.js.
2. Pegar o nome da disciplina (linha depois de "Disciplina", tirando o código) e recortar o trecho entre "Critérios de Avaliação" e "Ementa".
3. Traduzir o trecho para a sintaxe do piloto com regras simples para os padrões vistos: `0,9xMP` → `0,9*MP`; `(P1+P2)/2` → `media(P1, P2)`; `[(R1+...+Rn)/n]` → `media(R1, R2, R3)` com a quantidade a confirmar; nomes em texto ("média dos trabalhos") viram uma variável a revisar.
4. Mostrar o trecho original ao lado da fórmula proposta e pedir confirmação antes de criar a matéria. Nada vira painel sem o aluno conferir, porque cada professor escreve de um jeito.
5. Quando as regras não entenderem, oferecer "copiar prompt": o aluno cola o trecho num assistente que já usa e cola de volta a fórmula. É o mesmo caminho da REP-0018 para não pagar API.

## Entregas sugeridas, em ordem
1. ~~Upload de PDFs com extração do trecho e do nome da disciplina, com edição manual da fórmula.~~ Feito.
2. ~~Tradução automática do trecho para a fórmula.~~ Feito para os padrões dos quatro planos; testar com outros planos que o grupo juntar.
3. "Copiar prompt" para quando a leitura automática não entender o plano.
4. Exame e recuperação, só quando a proponente decidir retomar (ver decisão acima).

## Perguntas em aberto
- Laboratório: a fórmula com REC vale para todos ou só para quem faz recuperação? Se a nota da recuperação for pior, a média cai?
- Circuitos: `Pn*` substitui Pn mesmo quando fica menor que a nota original?
- ~~Quantidade de trabalhos e relatórios (T, R1...Rn) muitas vezes não está no plano. O painel deve deixar o aluno adicionar avaliações durante o semestre.~~ Feito em 19/11/2026: botões − e + em cada média simples.
- Arredondamento da Unesp: hoje só a média final é arredondada. Confirmar se MP, MT e as notas parciais também são.
- Frequência mínima de 70% reprova independentemente da nota. Vale acompanhar faltas também?
