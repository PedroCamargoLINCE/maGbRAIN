# Como contribuir

## Capturar
Use docs/templates/IDEA.md. Não acrescente a ideia a nenhuma lista: o mapa é gerado de `ideas/`. Escolha ID ainda livre, verifique branches/PRs abertos e confira colisões antes do merge. Preserve IDs depois de integrados. Etiquetas temáticas são livres.

## Projetos externos
Quando alguém quer trazer um projeto que já é um repositório próprio, ele entra como **projeto externo**: o repositório continua onde está e o maGbRAIN ganha só uma ficha leve, como qualquer outra REP.
- Copie docs/templates/IDEA-EXTERNO.md para `ideas/<ID>-<nome>/IDEA.md` e preencha descrição, estado, quem cuida (`owner`), o que precisa de ajuda (Próxima contribuição) e o endereço do repositório no campo `repo`.
- Código, Issues e PRs do projeto vivem no repositório de origem. Aqui fica só o que é do grupo: a ideia, as decisões e o crédito (fichas em `contributions/`, com a própria IDEA.md como evidência).
- O mapa marca a ficha como "Projeto externo" e mostra os links para o repositório e as Issues de lá. Se o projeto tiver site publicado, ele vai no campo `site`, como nas outras ideias.
- Não copie o código para cá, não crie `projects/` para ele e não use submodule nem subtree: o submodule prende o maGbRAIN a um commit do outro repositório e exige comandos extras de quem clona; a subtree duplica o projeto inteiro. Só reconsidere se algum dia for preciso compilar o código do outro projeto junto com o maGbRAIN.

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
