# maGbRAIN em Docker

Uma imagem só, com Python da biblioteca padrão. Nada pago, nenhuma chave.

## Rodar este caderno
```sh
docker compose up site rag
```
- Mapa de ideias: http://localhost:8080 (reconstruído a cada partida a partir da pasta atual).
- Perguntas sobre a base (RAG): http://localhost:8081. Veja [RAG.md](RAG.md).

Sem Compose:
```sh
docker build -t magbrain .
docker run --rm -p 8080:8080 -v "$PWD:/magbrain" magbrain          # mapa
docker run --rm -p 8081:8081 -v "$PWD:/magbrain:ro" magbrain rag   # perguntas
docker run --rm magbrain test                                       # testes e build
```

## Começar um maGbRAIN para outro grupo
Cria uma pasta nova com o protocolo, modelos, site, RAG, Docker e CI, mas sem as ideias, projetos, pessoas e fichas deste grupo.
```sh
python scripts/new_group.py ../nosso-caderno --name "Caderno da Casa" --repo https://github.com/usuario/nosso-caderno
```
Ou pelo Docker, sem instalar Python:
```sh
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD/..:/out" magbrain new-group /out/nosso-caderno --name "Caderno da Casa"
```
Depois: `git init`, primeiro commit, criar o repositório no GitHub, enviar e ativar o Pages ([MAPA.md](MAPA.md)). `--repo` troca os links do site e da documentação para o repositório novo; sem ele ficam marcadores `SEU-USUARIO/SEU-REPOSITORIO`.

## Limites conhecidos
- O site servido localmente é o mesmo do GitHub Pages; os links "Abrir no GitHub" apontam para o repositório configurado.
- As páginas de projetos publicadas (Mag Batas, RV-1A, Cérebro de mosca) só entram no build quando suas pastas existem.
