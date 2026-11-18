# Estado — REP-0009

**trying** — protótipo Short Pause para Chrome e Edge integrado à `main` pelo PR #15; aguardando uso prático em sites reais e teste em aparelho Android. Projeto não concluído.

- Issue: [#14](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/14).
- Branch: `feat/rep-0009-short-video-limits`.
- PR: [#15](https://github.com/PedroCamargoLINCE/maGbRAIN/pull/15), integrado à `main` (desktop e candidato Android juntos).
- Participação humana: PedroCamargoLINCE, confirmado explicitamente nesta sessão. Ferramenta: Codex.
- Entrega: extensão MV3, três limites diários, contagem de aba em foco, persistência, bloqueio/pausa, popup, pacote comum e instruções de instalação.
- Verificação: testes unitários e integração com Chrome/Edge em perfis temporários e páginas controladas. Evidências e versões no [handoff](handoffs/2026-11-04-short-pause.md).
- Próximo passo: carregar a extensão em um perfil cotidiano e seguir o [roteiro de teste real](TESTE-REAL.md) nos feeds logados. Publicação em lojas e monetização ficam fora desta entrega.

Limites conhecidos: apenas rotas dedicadas de Reels/Shorts; TikTok inteiro; orçamentos separados por navegador/perfil; limite voluntário ajustável; sem teste de apps móveis ou feeds embutidos em outras rotas.

## Continuação Android — 0.2.0

- Issue [#16](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/16). Todo o trabalho desktop e Android está consolidado no único [PR #15](https://github.com/PedroCamargoLINCE/maGbRAIN/pull/15), pronto para revisão, branch `feat/rep-0009-short-video-limits`.
- O PR separado #17 foi substituído pela consolidação solicitada pelo participante. Aceitação Android continua pendente; o PR único registra essas limitações sem ser rascunho.
- Entregue candidato Edge Android: worker sem dependência de windows API, layout touch, CRX3 e testes de compatibilidade/emulação. Chrome/Edge desktop continuam passando.
- **Objetivo completo bloqueado:** Chrome Android não executa extensões; execução real no Edge Android ainda não verificada. Não há app Android nativo nesta entrega.
- Próxima ação: [guia Android e aceitação em aparelho](ANDROID.md), depois definição do escopo de app separado se Chrome Android/apps nativos forem necessários. [Handoff](handoffs/2026-11-04-android-candidate.md).

## Revalidação — 2026-11-18

- A `main` com o PR #15 integrado foi revalidada: 11 testes unitários e os nove cenários de navegador passam no Chromium 153, tanto no modo desktop quanto na emulação móvel. ZIP e CRX3 gerados de novo sem erro. Detalhes no [handoff](handoffs/2026-11-18-revalidacao.md).
- Os sites reais continuam sem teste: o ambiente da sessão não tem acesso de rede ao Instagram, Facebook, YouTube e TikTok, e não há aparelho Android.
- Para fechar as Issues #14 e #16 falta só o uso real, descrito passo a passo em [TESTE-REAL.md](TESTE-REAL.md), com uma tabela para registrar o resultado na Issue.
