# Mag Batas

Protótipo local de estampas procedurais para abadás. Abra `app/index.html` no navegador, sem instalação. Na publicação do mapa, o aplicativo fica em `mag-batas/`.

## Uso
1. Escolha algoritmo, seed, detalhe e paleta. Mesmos parâmetros reproduzem o padrão.
2. Carregue um PNG (até 15 MB e 24 MP). Ajuste tamanho e posição com os controles ou selecione Logo e arraste na prévia.
3. Digite um texto. Ajuste fonte, cor, tamanho e posição; escolha Texto para arrastá-lo.
4. Exporte estampa plana ou mockup frontal em PNG de 1200 × 1600 pixels. O exterior do mockup é transparente.
5. Salve/carregue configuração JSON para retomar. O logo não é incluído; recarregue seu PNG. Não há salvamento automático.

## Algoritmos
- Truchet: arcos conectados em ladrilhos com rotação definida pela seed.
- Efeito caleidoscópio: espelha qualquer algoritmo em 4–24 fatias pares, com centro, zoom e rotação ajustáveis.
- Julia: campo de escape de uma função quadrática complexa. Seed altera parâmetro, rotação e enquadramento; detalhe altera limite de iterações.
- Geometria: ladrilhos com triângulos e setores circulares; seed controla cores e rotações; detalhe controla densidade.
- Psicodélico: interferência de ondas em coordenadas deformadas, discretizada na paleta; detalhe controla frequência.

Sem dependências externas, backend ou consumo de API. A seed determina a paleta automática. A quantidade de cores se refere ao padrão, não a logo/texto e pixels de antialiasing. Fontes usam as disponíveis no sistema, podendo variar entre computadores.

## Limites
Até cinco camadas de estampas. Selecione uma para editar; a primeira fica por cima. Setas mudam a ordem e × remove. Opacidade 0 oculta a camada, 100 a deixa opaca. Cores se misturam sobre o fundo sólido escolhido. Logo e texto permanecem acima das estampas, com opacidade própria. Configuração JSON v2 inclui todas as camadas e aceita arquivos v1 antigos. Teste adicional: `node projects/REP-0014-mag-batas/test-layers.cjs`.
Uma face, um logo e uma linha de texto. Silhueta genérica ilustrativa, ainda sem molde fornecido pela confecção. Não é arte final de impressão: sem CMYK, sangria, escala física, garantia de rapport ou separação de cores. Não há autenticação ou edição colaborativa dentro do aplicativo. Arquivos ficam no navegador até exportação. Fractais são calculados na CPU e podem levar mais tempo em aparelhos antigos.

## Verificação
`node projects/REP-0014-mag-batas/test-patterns.cjs`

`python -X utf8 scripts/build_site.py`

Issue: https://github.com/PedroCamargoLINCE/maGbRAIN/issues/6

O logo Magnatas fornecido por Felipe é carregado ao iniciar e exibido no cabeçalho. Pode ser substituído ou removido; use Usar logo Magnatas para restaurá-lo. O original foi preservado sem edição de imagem.
