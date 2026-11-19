# Sisotool na web

Objetivo: ferramentas interativas no navegador para estudar sistemas de controle. Ideia em [REP-0021](../../ideas/REP-0021-sisotool-web/IDEA.md).

## LGR interativo (primeiro produto)
Abra `app/index.html` no navegador, sem instalação. Na publicação do mapa, a página fica em `sisotool-web/`.

Digite o numerador e o denominador de G(s)H(s) sem o K (por exemplo `s+4` e `s(s+2)`), escolha o K máximo e clique em **Traçar**. O traçado considera realimentação negativa, 1 + K·G(s)H(s) = 0, com K ≥ 0. O controle de K move os polos de malha fechada sobre o lugar e diz se o sistema está estável. Os cartões mostram as regras de construção: polos e zeros, trechos do eixo real, assíntotas, pontos de saída e chegada e cruzamento com jω, com a faixa de K estável.

Os cálculos são numéricos (raízes por Durand-Kerner, cruzamentos por bisseção): confira sempre com as regras à mão. Única dependência externa: a fonte Source Sans 3 do Google Fonts; sem ela, a página usa a fonte do sistema.
