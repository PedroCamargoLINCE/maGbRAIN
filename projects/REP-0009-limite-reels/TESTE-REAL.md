# Roteiro de teste real — Short Pause

Este roteiro cobre o que os testes automáticos não alcançam: os sites de verdade, com conta logada, e um aparelho Android. Leva uns 20 minutos no computador e uns 20 no celular. Anote os resultados na tabela do fim e cole no comentário da [Issue #14](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/14) (computador) ou da [Issue #16](https://github.com/PedroCamargoLINCE/maGbRAIN/issues/16) (Android).

Os testes automáticos usam páginas falsas nos endereços dos sites. Eles provam que a extensão reage às rotas, ao foco e ao relógio, mas não provam que o Instagram, o YouTube, o Facebook e o TikTok de hoje se comportam como as páginas falsas.

## Parte 1 — Chrome ou Edge no computador

Instalação: siga o [README](README.md#install-in-chrome-or-edge) (modo de desenvolvedor, "Carregar sem compactação", pasta `extension/` ou o ZIP extraído).

1. No ícone da extensão, ponha **0** nas três categorias e salve.
2. Abra, já logada:
   - `https://www.instagram.com/reels/`
   - `https://www.facebook.com/reel/`
   - `https://www.youtube.com/shorts/`
   - `https://www.tiktok.com/`

   Em cada uma, a tela "Make room for something else." deve cobrir o feed e nenhum vídeo deve continuar tocando, nem com som.
3. Confirme que estas páginas **continuam livres**: o início do YouTube e um vídeo comum (`/watch?v=…`), as mensagens do Instagram (`/direct/`) e o início do Facebook.
4. Entre no YouTube pelo início e clique num Short pela barra lateral (sem recarregar). O bloqueio deve aparecer em até uns 2 segundos. Volte para um vídeo comum e o bloqueio deve sumir.
5. Ponha **1 minuto** em Shorts e salve. Fique no feed de Shorts rolando. Depois de cerca de 1 minuto, deve bloquear.
6. Ponha **2 minutos** em Reels. Abra Reels numa aba, troque para outra aba qualquer por 2 minutos e volte. O tempo na outra aba não deve ter contado (o popup mostra o uso).
7. Feche o navegador inteiro e abra de novo. Limites e uso do dia devem continuar iguais.
8. No dia seguinte, confira se o uso voltou a zero.

## Parte 2 — Edge no Android

O Chrome do Android não roda extensões, então este teste só vale para o Edge (de preferência o Edge Canary). O guia completo está em [ANDROID.md](ANDROID.md).

1. Pegue o arquivo `short-pause-0.2.0-edge-android.crx`. Se ele vier dentro de um ZIP, extraia no celular. Não renomeie ZIP para CRX.
2. No Edge Canary: Configurações → Sobre o Microsoft Edge → toque 5 vezes no número da versão. Volte e procure **Opções do desenvolvedor → Extension install by crx**. Se essa opção não existir, anote isso na tabela e pare aqui: é um resultado útil.
3. Instale o CRX, abra a Short Pause pelo menu de extensões, ponha **0** nas três categorias e salve.
4. Repita os passos 2 e 3 da Parte 1 no celular (`m.youtube.com/shorts`, `www.instagram.com/reels/`, `m.facebook.com/reel/`, `www.tiktok.com`).
5. Ponha **1 minuto** em Shorts e confirme que bloqueia rolando o feed.
6. Com Reels em 2 minutos: abra Reels, aperte o botão Início do Android e deixe a tela bloqueada por 2 minutos. Ao voltar, o uso não deve ter subido esses 2 minutos.
7. Gire a tela com o bloqueio aberto. O botão "Leave the feed" deve continuar visível e funcionando.
8. Feche o Edge pela lista de apps recentes e abra de novo. Limites e uso devem continuar iguais.

## Tabela de resultados

Copie, preencha e cole na Issue.

```text
Data:
Aparelho / sistema:            (ex.: Windows 11, Galaxy A54 Android 14)
Navegador e versão:            (ex.: Edge 142.0.x, Edge Canary 144.0.x)
Instalação funcionou?          sim / não — detalhe:
Bloqueio com 0 — Instagram:    ok / falhou — detalhe:
Bloqueio com 0 — Facebook:     ok / falhou — detalhe:
Bloqueio com 0 — Shorts:       ok / falhou — detalhe:
Bloqueio com 0 — TikTok:       ok / falhou — detalhe:
Páginas comuns livres?         ok / falhou — detalhe:
Navegação sem recarregar:      ok / falhou — detalhe:
Limite de 1 min bloqueia:      ok / falhou — detalhe:
Outra aba / tela bloqueada não conta: ok / falhou — detalhe:
Reiniciar mantém uso:          ok / falhou — detalhe:
Virada do dia zera:            ok / falhou / não testado
Observações:
```

Qualquer "falhou" vale um print e a URL exata onde aconteceu.
