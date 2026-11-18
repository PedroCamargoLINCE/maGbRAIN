# Perguntar à base do maGbRAIN (RAG gratuito)

`scripts/rag.py` busca nos textos do repositório e, se houver um modelo local, responde citando as fontes. Não usa nenhum serviço pago nem envia dados para fora da máquina.

## O que é indexado
Todos os `.md` (ideias, projetos, handoffs, docs) e as fichas em `contributions/`. Ficam de fora `.git`, pastas ocultas, `node_modules` e `dist`. O índice é refeito a cada pergunta, então ideias novas entram na hora.

## Três níveis de uso
1. **Só busca** (nenhuma instalação): `python scripts/rag.py search "ideias sobre gatos"`.
2. **Prompt pronto**: `python scripts/rag.py prompt "o que falta no RV-1A?"` imprime os trechos com a pergunta, para colar no assistente que cada pessoa já assina.
3. **Resposta local**, com [Ollama](https://ollama.com):
   ```sh
   docker compose --profile llm up -d ollama rag
   docker compose exec ollama ollama pull qwen2.5:3b
   ```
   Abra http://localhost:8081. Sem Docker: instale o Ollama, rode `ollama pull qwen2.5:3b` e use `OLLAMA_URL=http://localhost:11434 python scripts/rag.py ask "..."`.

Troque o modelo com `OLLAMA_MODEL` (por exemplo `qwen2.5:1.5b` em máquinas fracas). Se o Ollama estiver desligado, a página e o comando `ask` caem para o nível 2 em vez de falhar.

## Como funciona
Trechos por título de markdown (até ~1200 caracteres), BM25 sem acentos e com plural simples, no máximo 2 trechos por arquivo entre os 6 melhores. O prompt manda responder só com os trechos, citar `[n]` e não inventar autoria.

## Limites
- Busca por palavras, não por significado: sinônimos que não aparecem no texto podem não ser achados.
- A qualidade da resposta depende do modelo local; modelos pequenos erram mais.
- O servidor não tem autenticação. Use em casa ou na rede local, não exponha na internet.
