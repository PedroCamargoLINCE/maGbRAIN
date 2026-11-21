# Triagem: onde o maGbRAIN cabe como artigo

Pesquisa prévia feita em 21/11/2026 numa sessão com Claude Code, a pedido de PedroCamargoLINCE. É uma triagem para decidir por onde começar, não uma revisão de literatura completa. Hipóteses e opiniões da IA estão marcadas como tal; datas de chamadas mudam a cada edição e precisam ser conferidas antes de escrever.

## Em uma frase
O que o maGbRAIN tem de publicável não é o código (um site estático e uma busca BM25 não são novidade), e sim o **arranjo sociotécnico**: um grupo de estudantes que colabora de forma assíncrona, cada pessoa com a sua própria assinatura de IA, usando o repositório como memória compartilhada, um protocolo em texto lido por pessoas e agentes (AGENTS.md), passagens de trabalho entre sessões e um registro de crédito humano separado da autoria técnica.

## Matéria-prima disponível hoje
Retrato do repositório em 21/11/2026 (conferido com `git log` e listagem das pastas):
- 22 ideias registradas (REP-0001 a REP-0022), 9 pastas em `projects/`, 31 fichas de crédito em `contributions/` (antes da ficha desta triagem).
- 102 commits e cerca de 60 PRs entre 04/11/2026 e 21/11/2026, de pelo menos duas pessoas que conduzem trabalho com agentes de IA diferentes (Claude Code, Copilot SDK no VS Code).
- Handoffs por entrega, decisões registradas, um produto testado na vida real (REP-0009) e campanhas de experimento (REP-0012).

Isso basta para um relato de experiência. Não basta, sozinho, para um artigo de pesquisa completo: falta avaliação.

## Trabalhos relacionados encontrados
- Chatlatanagulchai et al., *Agent READMEs: An Empirical Study of Context Files for Agentic Coding*, arXiv:2511.12884 (nov/2025). Estudo de 2.303 arquivos de contexto (AGENTS.md, CLAUDE.md etc.). Eles são quase sempre sobre build e código. **Contraste útil:** aqui o AGENTS.md é um protocolo de colaboração e de crédito para um grupo, não instruções de build.
- Mohsenimofidi, Galster, Treude, Baltes, *Context Engineering for AI Agents in Open-Source Software*, arXiv:2510.21413. AGENTS.md em 466 projetos; ainda não há estrutura estabelecida.
- Kraishan, *The AI Attribution Paradox: Transparency as Social Strategy in Open-Source Software Development*, arXiv:2512.00867 (dez/2025). Em 14.300 commits, só 29,5% atribuem explicitamente o uso de IA. **Contraste útil:** o maGbRAIN inverte o problema e registra o crédito humano à parte, com a IA só como ferramenta.
- Gao et al., *Making Agent-Mediated Contributions Governable: A Project-Level Governance Manifest for Open-Source AI Collaboration*, arXiv:2607.15769 (jul/2026). Propõe um manifesto de governança no repositório para contribuições mediadas por agentes, com estudo com revisores. **É o trabalho mais próximo**: precisa ser citado e diferenciado (eles focam em revisão de código em OSS; aqui o foco é um grupo de estudantes e ideias, não só código).
- Davis et al., *Cheap Code, Costly Judgment: A Case Study on Governable Agentic Software Engineering*, arXiv:2607.01087 (2026). Estudo de caso em primeira pessoa com agentes de código e notas de campo. **Mostra que um estudo de caso de um único grupo, bem documentado, é aceito como formato.**
- Zha et al., *How GenAI Mentor Configurations Shape Early Collaborative Dynamics*, arXiv:2603.12600 (mar/2026). IA compartilhada versus uma IA por estudante em grupos. Relacionado ao eixo "cada um com a sua assinatura".

Lacuna que o maGbRAIN pode ocupar (hipótese da IA): quase todo trabalho sobre AGENTS.md e atribuição de IA olha para código em projetos de software livre. Há pouco sobre um grupo pequeno e informal que usa esse mesmo aparato para capturar e tocar ideias variadas (jogos, hardware, extensões, experimentos), com agentes heterogêneos e crédito humano explícito.

## Triagem por área

| Área | Encaixe | O que mudaria no maGbRAIN ou no texto | Venues de exemplo |
|---|---|---|---|
| IHC / CSCW (colaboração humano-IA) | **Como está**, em formato de relato de experiência | Nada no repositório; escrever o relato e uma seção de considerações éticas | IHC (trilha Relatos de Experiência; aceita português), CHI (Case Studies / Late-Breaking Work), CSCW (PACM HCI, envio contínuo) |
| Engenharia de Software, aspectos humanos | **Como está**, como ideia/visão ou relato; artigo completo pede dados | Para artigo completo: mineração do repositório e entrevistas | CHASE (com o ICSE), ICSE SEIS, FSE Ideas/Visions, SBES (trilha de ideias e resultados emergentes, CBSoft) |
| Ferramentas de SE | **Mudança mínima** | Destacar a parte reutilizável (validador de fichas, `new_group.py`, mapa) e ter alguém de fora usando (o próximo passo da REP-0017) | Trilhas de ferramentas do CBSoft, SoftwareX (exige impacto em pesquisa, encaixe fraco hoje) |
| Educação em engenharia | **Mudança mínima** | Enquadrar como ambiente de aprendizagem e extensão de estudantes; coletar percepções dos participantes com um questionário | COBENGE (eixos "programas especiais", "educação mediada por tecnologia"), IEEE FIE, IEEE EDUCON |
| Gestão do conhecimento / gestão de ideias | Possível, mas fora do foco do grupo | Revisar a literatura de *idea management systems* | ECKM e periódicos de gestão do conhecimento |
| Controle e automação | **Não combina sem forçar** | O caderno em si não é um problema de controle; descrevê-lo como malha de realimentação seria forçado | Só por outra porta: o sisotool na web (REP-0021) é candidato natural a IFAC ACE ou à sessão de ensino do CBA, mas é outro artigo |

## O que dá para dizer das chamadas (conferido em 21/11/2026)
- **IHC 2026** teve submissão em 28/05/2026, evento de 19 a 23/10/2026, três trilhas de artigo completo (Ideias Inovadoras e Resultados Emergentes, Pesquisa, Relatos de Experiência), 15 a 20 páginas sugeridas, português ou inglês, revisão duplo-cega e seção obrigatória de considerações éticas. Se o calendário se repetir, a janela do IHC 2027 seria por volta de maio de 2027. [chamada 2026](https://ihc.sbc.org.br/2026/?p=492)
- **COBENGE 2026** teve submissão até 26/04/2026. Se repetir, a janela de 2027 seria por volta de abril de 2027. [edital 2026](https://cobenge26.abenge.org.br/arquivos/EDITAL-SESSOES-TECNICAS-E-SESSOES-POSTERES-260730.pdf)
- **CHASE 2027** (com o ICSE 2027, Dublin, 26 e 27/04/2027): a submissão já fechou em outubro de 2026. Aceita artigo completo (10 + 2 páginas) e resumo estendido (5 páginas). Alvo realista seria a edição de 2028. [chamada 2027](https://conf.researchr.org/track/chase-2027/chase-2027-papers)
- **CSCW**: artigos entram pelo PACM HCI em ciclos contínuos e são apresentados numa edição seguinte. [rolling](https://cscw.acm.org/rolling.html)
- **IFAC ACE** (educação em controle) é trienal; a última foi em 2025 em Budapeste. Só faz sentido para a REP-0021.

## Recomendação (sugestão da IA, não decisão)
1. **Primeiro alvo: relato de experiência em português**, no IHC 2027 ou no COBENGE 2027. Cabe com o maGbRAIN como está, e o prazo provável (abril ou maio de 2027) dá tempo de coletar dados leves.
2. **Mudança mínima que mais abre portas:** um script de mineração do próprio repositório (commits, PRs, fichas, handoffs, tempo entre estados, uso de cada ferramenta de IA) e um questionário curto com os participantes.
3. **Depois, internacional:** com esses dados, uma versão em inglês para CHASE 2028 ou um artigo no PACM HCI (CSCW).

## Riscos e cuidados
- **Amostra pequena e um grupo só**; quem escreve também participa. Dizer isso como limitação e tratar como estudo de caso.
- **Ética e privacidade:** o repositório é público, mas pesquisar o comportamento dos colegas pede consentimento. Venues como o IHC exigem seção de considerações éticas; se houver questionário, verificar com a universidade se precisa de comitê de ética (CEP).
- **Autoria do artigo:** o maGbRAIN foi construído por mais de uma pessoa; combinar antes quem assina.
- **Uso de IA na escrita:** IHC e CHASE pedem declaração de uso de IA generativa.
- **Datas de 2027** acima são inferidas das edições de 2026 e precisam ser conferidas quando as chamadas saírem.
