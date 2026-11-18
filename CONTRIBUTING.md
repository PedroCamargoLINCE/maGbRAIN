# Como contribuir

## Capturar
Use docs/templates/IDEA.md. Não acrescente a ideia a nenhuma lista: o mapa é gerado de `ideas/`. Escolha ID ainda livre, verifique branches/PRs abertos e confira colisões antes do merge. Preserve IDs depois de integrados. Etiquetas temáticas são livres.

## Desenvolver e executar
Crie Issue com objetivo, entrega, critérios verificáveis, dependências, orçamento e limites. Quem assume se coloca como responsável (campo Assignee da Issue) e comenta escopo e previsão de retomada; ao parar sem concluir, sai do Assignee. Tarefa aberta para qualquer pessoa recebe a etiqueta `quero-ajuda` e aparece em destaque no mapa; tire a etiqueta quando a ajuda não for mais necessária. Issue sem Assignee está livre. Coordene antes de reassumir uma tarefa com Assignee aparentemente parado.
Crie branch por contribuição e PR vinculado à Issue. Outra pessoa revisa o resultado quando possível. Tarefas independentes podem andar em paralelo; interfaces precisam de acordo. Não abra todas as tarefas futuras antecipadamente.

## Estados da ideia/projeto
| Estado | Significado |
|---|---|
| inbox | Capturado, sem avaliação |
| exploring | Escopo em desenvolvimento |
| ready | Próxima entrega delimitada |
| building | Execução ativa |
| trying | Teste prático da entrega |
| done | Entrega acordada concluída; novas versões são possíveis |
| parked | Sem trabalho ativo |

Uma tarefa concluída não conclui automaticamente o projeto. O status inicial inbox dos registros importados indica triagem no maGbRAIN, não invalida histórico anterior.

## Projetos
Ao começar uma entrega, crie projects/<ID>-<nome>/ com README (objetivo e uso), STATUS (estado, tarefas vinculadas e próxima ação), DECISIONS (data, decisão e motivo) e handoffs/ (um arquivo por contribuição). A pessoa de referência recebe as entregas; não precisa executar tudo.

## Revisão
Confira atribuição, escopo, links e evidências. Para código, execute verificações proporcionais ao risco. Para pesquisa, separe hipótese de resultado e registre fontes. Para hardware, registre montagem e condições do teste. Registre falhas úteis. Não declare verificado o que não executou.



## Crédito das contribuições
Registre os participantes humanos, separadamente da ferramenta de IA, conforme [o protocolo](https://github.com/PedroCamargoLINCE/maGbRAIN/blob/main/docs/CONTRIBUTIONS.md). Identidade desconhecida fica como autoria a confirmar; não inferir pelo remetente técnico.
