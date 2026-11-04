# Passagem de trabalho — candidato Android

- Data/participante: 2026-11-04, PedroCamargoLINCE, identidade confirmada nesta conversa; ferramenta Codex.
- Ideia/Issue: REP-0009, [#16](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/16); continuação do PR #15.
- Branch: `feat/rep-0009-android-support`, baseada em `feat/rep-0009-short-video-limits`. PR/commit registrados na entrega remota abaixo.
- Objetivo: acrescentar Android preservando Chrome e Edge desktop.

## O que mudou

Versão 0.2.0: worker não depende de `chrome.windows` no Android; listeners de janela opcionais e elegibilidade móvel por aba ativa/visibilidade/foco. Layout responsivo e touch, blocker adaptado a retrato/paisagem. Script de CRX3 real com chave privada fora do repositório, artefatos ZIP/CRX em CI, matriz de suporte em ANDROID.md e limites de privacidade explícitos.

## Verificações e evidências

- `npm test`: 11 testes, incluindo worker Android sem namespace windows, stubs não suportados, página escondida/sem foco, aba inativa, retomada após suspensão e preservação das checagens desktop.
- Browser suite com extensão real: Chrome 157.0.8103.38 e Edge 156.0.4314.58, Linux headless, fixtures HTTPS. Mantidos os nove cenários de regressão da entrega anterior.
- `MOBILE=1` em Edge desktop: simulação de viewport/touch Android, popup 320px sem overflow horizontal, alvos de toque, blocker 320×640/640×320 e saída por toque. Não é execução em Edge Android.
- Empacotador real do Chromium produziu CRX3; cabeçalho e manifest conferidos. Chave de desenvolvimento em `/tmp`, fora do repositório e dos artefatos.
- `python scripts/build_site.py`, testes existentes do catálogo/atribuição e `git diff --check`.
- Screenshots locais em `test-results/`; pacotes em `dist/`, ambos ignorados pelo Git. CI produz artefatos para revisão.

## Pendências e bloqueios

**Meta completa bloqueada:** Chrome Android não oferece runtime de extensão. A solução atual não controla apps nativos. App Android separado exige delimitar a cobertura e suas permissões; a pergunta de escopo foi enviada e não deve ser tratada como aprovação automática de uma alternativa.

Não há aparelho Android/ADB nem aceleração de emulador neste ambiente. Não foi comprovada instalação ou execução do CRX em Edge Android. O fluxo de sideload depende de canal/versão e não equivale a publicação no catálogo móvel.

## Próxima ação concreta

Seguir a aceitação por aparelho em ANDROID.md, registrando modelo/Android/Edge e resultados. Resolver o escopo para Chrome Android e apps nativos antes de iniciar app separado. Se a instalação CRX estiver indisponível no canal do aparelho, registrar a restrição, sem alegar que a extensão funciona ali. Revisar primeiro o PR desktop #15 e depois esta continuação; sem merge automático.

## Estado da tarefa

Correções de compatibilidade e pacote candidato entregues; objetivo Android completo **parcial/bloqueado**. Projeto continua `trying`.

## Entrega remota

Implementação enviada no commit `d6c5e96b185885e0e3923fad603ac7a60b7596a1`, branch remota `feat/rep-0009-android-support`. [PR #17](https://github.com/PedroCamargoLINCE/maGbRAIN/pull/17) aberto em rascunho sobre #15, sem merge. Este complemento documental integra a mesma contribuição.
