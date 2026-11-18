# Passagem de trabalho — revalidação e roteiro de teste real

- Data e participante: 2026-11-18; pedido de Maria pela conta GitHub PedroCamargoLINCE, a mesma já creditada na ficha `contributions/2026-11-04-rep-0009-short-pause.json`.
- Agente/ambiente: Claude Code, contêiner Linux na nuvem; Node 22.23.5, Python 3, Chromium 153.0.8010.12.
- Ideia e Issues: REP-0009, [#14](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/14) e [#16](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/16).
- Branch: `claude/project-thread-lo58s2`, a partir da `main` depois do merge do PR #15.
- Objetivo: confirmar que a `main` continua funcionando, deixar o teste real pronto para quem tem as contas e o aparelho, e corrigir o STATUS, que ainda dizia "sem merge".

## O que mudou

- Novo [TESTE-REAL.md](../TESTE-REAL.md): roteiro em português para Chrome/Edge no computador e Edge no Android, com tabela de resultados para colar nas Issues.
- STATUS atualizado: PR #15 integrado, próximo passo apontando para o roteiro.
- Nenhuma mudança de código na extensão. Nenhuma ficha nova de contribuição, porque esta é uma revalidação da mesma entrega.

## Verificações e evidências

- `npm ci` e `npm test`: 11 de 11 testes passaram.
- `BROWSER_PATH=/opt/pw-browsers/chromium npm run test:browser`: nove de nove cenários passaram com a extensão real carregada.
- O mesmo com `MOBILE=1` (viewport 320×640, toque, user agent do Edge Android): nove de nove passaram. Continua sendo emulação, não Android de verdade.
- `npm run build` e `scripts/package_crx.py`: ZIP e CRX3 gerados. A chave usada é descartável, então a identidade desse CRX não é estável.
- **Não executado:** acesso aos sites reais. A política de rede do ambiente recusou conexões a youtube.com, instagram.com, facebook.com e tiktok.com (HTTP 403 no proxy). Também não há aparelho Android.

## Pendências e bloqueios

- Uso real com conta logada no computador: depende de quem usa os sites.
- Instalação e uso no Edge Android: depende de um aparelho e de o canal do Edge expor a instalação por CRX.
- Chrome Android segue sem suporte a extensões; continua valendo o que está em [ANDROID.md](../ANDROID.md).

## Próxima ação concreta

Seguir [TESTE-REAL.md](../TESTE-REAL.md), colar a tabela preenchida na Issue #14 (computador) e na #16 (Android). Se tudo passar no computador, a #14 pode ser fechada. Se algum site falhar, abrir correção com a URL exata e o print.

## Estado da tarefa

Parcial: tudo que dá para verificar sem conta e sem aparelho está verificado; o teste real está pendente. Projeto continua `trying`.
