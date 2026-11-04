# Contribuições humanas por ideia

O painel conta entregas registradas e incorporadas à main. Não usa linhas de código, tokens, número de commits, autor técnico do PR ou conta conectada como medida de participação humana. Não é percentual de autoria nem avaliação de qualidade.

## Registrar uma entrega
1. Confirme quem participou e em quê. A pessoa pode fornecer nome público/apelido e, opcionalmente, usuário GitHub. Não pedir e-mail nem nome civil.
2. Reutilize o ID estável em `contributors.json`. Para pessoa nova, adicione um objeto como `{ "id": "apelido-estavel", "name": "Nome público", "github": "usuario-opcional" }`; omita github quando não informado. Nunca atribua automaticamente ao proprietário do repositório, remetente técnico, bot ou modelo.
3. Copie `templates/CONTRIBUTION.json` para `contributions/<id-unico>.json`. Preencha ideias, tipos, participantes, data real, resumo e evidências em arquivos existentes no repositório. Uma ficha por entrega lógica, não por commit ou rodada de IA.
4. Em `attribution_source`, resuma como a participação foi confirmada, sem publicar conversa privada. `tools` registra a IA como ferramenta, nunca como pessoa.
5. Inclua a ficha no mesmo PR da entrega. Após merge, a próxima publicação exibe o registro. Rode `python scripts/build_site.py`; a CI também valida as fichas nos PRs.

## Sem identidade informada
Pergunte: “Qual nome público ou @GitHub deve receber o crédito e quem mais participou?”. Continue o trabalho independente. Sem resposta, use `participants: []` e `attribution: "pending"`. O site mostra **autoria a confirmar**, sem creditar pessoa alguma. Quando confirmado, cadastre o perfil e atualize a mesma ficha, sem duplicar a contribuição.

## Contagem
- Cada ficha vale uma contribuição em cada ideia relacionada.
- Cada participante confirmado recebe uma participação na entrega. Uma entrega conjunta continua sendo uma única entrega no total; a soma das participações pode superar o total.
- Tipos: ideation (ideação), research (pesquisa), code (código), design, test (testes), documentation (documentação), physical (execução física).
- Vários tipos não multiplicam a contagem. Correções da mesma entrega atualizam a mesma ficha. Entregas novas reais recebem IDs novos.
- Ideação e execução são diferentes. Solicitar uma ideia não atribui automaticamente toda execução posterior ao solicitante.
- Trabalho em andamento permanece nas Issues e PRs. Não registrar promessas como entregas.

## Evidências e revisão
Evidências apontam para arquivos existentes: código, relatório, foto ou handoff. A linha do tempo inclui links para evidências e histórico Git da ficha. A revisão do PR confirma participação e escopo. A validação verifica estrutura e referências; não pode comprovar a veracidade de uma declaração de autoria.

## Histórico anterior
Ausência de fichas significa **sem histórico registrado**, não ausência de trabalho. Recupere entregas anteriores somente com confirmação dos envolvidos e evidências. A implementação deste painel está inicialmente com atribuição pendente.

O site permanece estático, sem token no navegador. Avatares do GitHub aparecem somente quando o usuário foi informado; caso contrário aparecem iniciais. O catálogo é atualizado a cada publicação da main.
