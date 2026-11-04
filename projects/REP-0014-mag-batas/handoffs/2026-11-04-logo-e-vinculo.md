# Passagem de trabalho

- Participante: fkumagae com assistência de IA; 2026-11-04.
- Branch: feat/logo-magnatas. Continuidade REP-0014 / Issue #6 e captura REP-0015 por pedido direto do usuário.
- Objetivo: logo padrão e selo no gerador; referência ao Me-Debata no mapa.

## Alterações
Logo PNG original fornecido por Felipe incorporado sem alteração dos pixels, via data URL em default-logo.js para preservar funcionamento local e exportação Canvas. Logo inicial pode ser removido, trocado, reposicionado e redimensionado; botão restaura o original. Selo no cabeçalho do gerador.

REP-0015 adiciona referência ao repositório público https://github.com/fkumagae/Me-Debata, confirmado pelo usuário. Não importa seu conteúdo. Link direto disponível nos detalhes do nó e no catálogo README.

## Verificação
Prévia no navegador: logo inicial e selo visíveis, remoção e restauração funcionando. Sintaxe JS e build conferidos. PNG original tem aproximadamente 9,8 MB; incorporado em base64 ocupa aproximadamente 13 MB, podendo tornar a primeira carga mais lenta. Otimização da imagem fica para contribuição posterior.

## Estado e próxima ação
Pronto para revisão por PR; sem merge automático. Após integração, verificar publicação e testar no celular. Projeto Mag Batas continua em desenvolvimento; Me Debata apenas vinculado.
