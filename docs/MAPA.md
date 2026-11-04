# Mapa de ideias

A página é estática e não usa APIs pagas, tokens de acesso nem dependências JavaScript externas. Inclui grafo, busca textual, filtro de status, cartões acessíveis e resumo com próxima contribuição.

## Atualizar
Edite o status e as seções Registro e Próxima contribuição no IDEA.md. O script lê essas seções automaticamente. As relações ficam em web/relations.json com source, target, label e kind (documented ou suggested). Relações sugeridas aparecem tracejadas. Não representar afinidade como dependência ou fusão de projetos.

## Publicar
1. Incorporar este PR na main.
2. No GitHub: Settings → Pages → Build and deployment → Source: GitHub Actions.
3. Executar o workflow Mapa de ideias ou fazer um novo push na main.
4. Conferir a URL retornada pelo job deploy. URL esperada: https://pedrocamargolince.github.io/maGbRAIN/ (não implica publicação concluída).

## Verificar localmente
Execute `python scripts/build_site.py` e abra dist/index.html. Dados ficam embutidos no HTML; funciona também sem servidor. Não edite dist: ele é gerado.

O mapa reflete a última publicação dos arquivos da main, não consulta automaticamente status de Issues. Atualize IDEA.md quando o estado da ideia mudar. Um projeto pode ter tarefas concluídas e ainda continuar em exploração.
