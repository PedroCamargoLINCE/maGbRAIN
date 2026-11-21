# Passagem de trabalho: projetos externos

## Problema e contribuição
Um amigo quer trazer para o maGbRAIN um projeto que já é um repositório grande. Copiar o código, usar submodule ou subtree seria ineficiente ou confuso. Fica registrada a regra de projeto externo: o repositório continua na origem e o maGbRAIN ganha só uma ficha.

- AGENTS.md e CONTRIBUTING.md (seção "Projetos externos") explicam quando e como usar, para a IA de quem quiser trazer um repositório descobrir a regra sozinha.
- Modelo novo: docs/templates/IDEA-EXTERNO.md, com o campo `repo` no cabeçalho.
- O mapa lê o campo `repo`: selo "↗ Projeto externo" no cartão e, no painel, quem cuida e os links para o repositório e as Issues de lá. O link do Me Debata (REP-0015), antes fixo no HTML, agora vem do campo `repo` da ficha.
- README e docs/PROMPTS.md apontam para o modelo; docs/MAPA.md documenta o campo.
- Correção: o build procurava a seção "Próxima contribuição" com o acento corrompido e nunca a encontrava, então o mapa mostrava "Ainda não definida." em todas as ideias. Agora as 23 ideias mostram a próxima contribuição.

## Verificações realizadas
- `python -m unittest discover -s tests`: 17 testes passam, incluindo o novo tests/test_build_site.py.
- `python scripts/build_site.py` e página aberta no Chromium: cartão do Me Debata com o selo, painel com os links, sem erros de JavaScript.

## Limitações e trabalho restante
- O bloco "Querem ajuda agora" continua lendo só as Issues do maGbRAIN; as de um projeto externo aparecem pelo link "Issues do projeto".
- O projeto do amigo ainda não foi registrado: falta o endereço do repositório e a confirmação dele.
