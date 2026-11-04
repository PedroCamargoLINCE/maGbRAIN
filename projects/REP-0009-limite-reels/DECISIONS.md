# Decisões — 2026-11-04

Escolhas técnicas desta implementação, não consenso presumido do grupo:

- O pedido desta sessão autoriza implementar a ideia no Chrome e Edge, acrescentando YouTube Shorts. Mantido o relato importado intacto; a execução fica registrada separadamente.
- Manifest V3, JavaScript local e um pacote comum aos dois navegadores. Sem servidor e sem dependências de runtime.
- Limite por tempo diário de permanência em feed focado; três orçamentos, com Instagram/Facebook compartilhando Reels. Padrão de 15 minutos editável e zero para bloqueio imediato. A proposta original de propaganda/gemas não entra neste protótipo de redução de uso.
- Detecção por URL e heartbeat de um segundo para navegação SPA. Evita seletores privados instáveis; não cobre Reels embutidos fora das rotas dedicadas. TikTok é limitado por site inteiro, incluindo perfil/busca.
- Service worker serializa operações; estado persistente local e amostra em storage.session evitam perda de configurações e contagem duplicada entre abas. Amostras antigas expiram e a virada do dia usa o relógio local.
- Overlay com Shadow DOM, foco de teclado e pausa de mídia; recuperação após remoção pelo site no heartbeat seguinte. Acesso volta ao sair da rota, aumentar o orçamento ou virar o dia.
- Ferramenta voluntária, sem proteção contra alteração de configuração ou desinstalação. Publicação nas lojas e contas reais não são requisitos desta entrega.
- Testes em perfis temporários Chrome/Edge com fixtures HTTP controladas, sem conta ou dados privados. CI usa Chromium. Validação em sites reais logados fica explicitamente pendente.
