# Mapa de ideias

A página é estática e não usa APIs pagas, tokens de acesso nem dependências JavaScript externas. Inclui grafo, busca textual, filtro de status, cartões acessíveis e resumo com próxima contribuição.

## Querem ajuda
O bloco "Querem ajuda agora" lista as Issues abertas com a etiqueta `quero-ajuda`, direto da leitura pública do GitHub no navegador de quem visita (sem token; o resultado fica guardado por 10 minutos). A ideia é reconhecida pelo `REP-XXXX` no título da Issue. Para uma tarefa aparecer ou sumir, basta pôr ou tirar a etiqueta; não precisa de PR nem de nova publicação. Sem internet ou se a consulta falhar, o bloco mostra só o link para a lista no GitHub.

## Atualizar
Edite o status e as seções Registro e Próxima contribuição no IDEA.md. O script lê essas seções automaticamente. As relações ficam em site/relations.json com source, target, label e kind (documented ou suggested). Relações sugeridas aparecem tracejadas. Não representar afinidade como dependência ou fusão de projetos.

## Publicar
1. Incorporar este PR na main.
2. No GitHub: Settings → Pages → Build and deployment → Source: GitHub Actions.
3. Executar o workflow Mapa de ideias ou fazer um novo push na main.
4. Conferir a URL retornada pelo job deploy. URL esperada: https://pedrocamargolince.github.io/maGbRAIN/ (não implica publicação concluída).

## Verificar localmente
Execute `python scripts/build_site.py` e abra dist/index.html. Dados ficam embutidos no HTML; funciona também sem servidor. Não edite dist: ele é gerado.

Fora o bloco "Querem ajuda", o mapa reflete a última publicação dos arquivos da main e não consulta status de Issues. Atualize IDEA.md quando o estado da ideia mudar. Um projeto pode ter tarefas concluídas e ainda continuar em exploração.
