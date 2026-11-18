# maGbRAIN 🧠⚡

![Bancada de invenções da república: um cérebro inventor, um gato curioso e ideias improváveis.](site/assets/lab-banner.webp)

**Da ideia de madrugada ao “olha, funcionou!”**

Um cérebro coletivo. Várias mãos. Uma quantidade questionável de café.

[🗺️ Explorar o mapa](https://pedrocamargolince.github.io/maGbRAIN/) · [💡 Registrar uma ideia](docs/templates/IDEA.md) · [🛠️ Contribuir](CONTRIBUTING.md)

Laboratório coletivo de ideias da república: capturar, desenvolver e realizar, uma contribuição de cada vez.

**Uma sessão não precisa terminar uma ideia. O progresso pertence ao projeto, não ao chat.**

## Comece aqui
1. Conte sua ideia a um agente e peça que leia [AGENTS.md](AGENTS.md).
2. Registre em `ideas/<ID>-<nome>/IDEA.md`, usando o [modelo](docs/templates/IDEA.md). Duas frases bastam.
3. Para trabalhar, escolha uma tarefa pequena (as abertas a qualquer pessoa têm a etiqueta [`quero-ajuda`](https://github.com/PedroCamargoLINCE/maGbRAIN/issues?q=is%3Aissue+is%3Aopen+label%3Aquero-ajuda) e aparecem em destaque no mapa), coloque-se como responsável (Assignee) na Issue e use uma branch e PR.
4. Ao encerrar, deixe evidências e uma [passagem de trabalho](docs/templates/HANDOFF.md).

Agentes precisam de acesso autenticado ao GitHub ou a uma cópia do repositório para escrever. Sem acesso, devem entregar o texto ou patch para um participante incorporar. Contas e assinaturas continuam independentes.

## Ideias
O [mapa de ideias](https://pedrocamargolince.github.io/maGbRAIN/) lista todas as ideias, com busca, estado, créditos e as tarefas que querem ajuda. Ele é gerado sozinho a partir de [`ideas/`](ideas/) a cada mudança na `main`, então não existe lista manual para manter aqui.

## Organização
- `ideas/`: registros e origem; captura livre, sem obrigação de executar.
- `projects/`: entregas, estado e decisões, criados quando houver trabalho concreto.
- `contributions/`: fichas de crédito por entrega e a lista de pessoas (`contributors.json`).
- `docs/`: guias, modelos (`docs/templates/`) e passagens de trabalho gerais (`docs/handoffs/`).
- `site/`, `scripts/` e `tests/`: o mapa de ideias, as ferramentas que o geram e seus testes.
- Issues: tarefas; o campo Assignee diz quem está fazendo e a etiqueta `quero-ajuda` diz o que está livre. PRs: contribuições revisáveis.
- [CONTRIBUTING.md](CONTRIBUTING.md): protocolo e estados.
- [Prompts](docs/PROMPTS.md): captura e retomada com qualquer agente.
- [Importação](docs/handoffs/2026-11-04-importacao-inicial.md): cobertura e limites do ZIP.

Comecem com até dois projetos em execução e testem uma entrega na vida real. O repositório é público: todo conteúdo submetido fica acessível publicamente.


## Docker e perguntas à base
`docker compose up site rag` sobe o mapa em http://localhost:8080 e uma busca com respostas locais e gratuitas em http://localhost:8081. Para começar um caderno vazio para outro grupo: `python scripts/new_group.py ../nosso-caderno`. Veja [Docker](docs/DOCKER.md) e [RAG](docs/RAG.md).

## Mapa de ideias
Consulte [como ativar o GitHub Pages](docs/MAPA.md). A página reúne grafo, busca, estados e próximas contribuições.

## Licença
Este repositório é disponibilizado sob a [Apache License 2.0](LICENSE).


## O foguete pode esperar. O próximo passo, não.

<img src="site/assets/small-progress.webp" alt="Cérebro comemorando uma pequena contribuição enquanto o foguete ainda está em construção." width="320">

Uma conversa não precisa construir o foguete inteiro. Uma medição, um desenho, uma revisão ou um teste já ajudam. Deixe uma [passagem de trabalho](docs/templates/HANDOFF.md) e permita que outra pessoa continue.


## Crédito das contribuições
Registre os participantes humanos, separadamente da ferramenta de IA, conforme [o protocolo](https://github.com/PedroCamargoLINCE/maGbRAIN/blob/main/docs/CONTRIBUTIONS.md). Identidade desconhecida fica como autoria a confirmar; não inferir pelo remetente técnico.
