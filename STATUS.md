# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (16/10/2026):** 12/29 concluídas — 51356fad (matriz v1.2), 49327a88 (21 contas reais), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3), e57df8ff (visão de qualidade), a6bf06fb (adendos D5 — SPEC-2-001 100% no recorte do executor), 3cd404e5 (calendário e OP digital), be180fc1 (tela de apontamentos), 556da315 (duas telas de conferência), 0baec76e (sugestões com memória de cálculo) e **c44c11da (fila de envio com simulação)**. Produção: v0.0.93 (ref ac980b6, 16/10 12:54). Demais 17 tasks abertas; ciclo contínuo ativo (plugin 0.8.0).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.93 (ref ac980b6, publicado 16/10 12:54).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente, bloqueia conexão real) e pontos da Keoma na matriz (2c4a9b7e).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

Gates localizados: matriz/ações (RESOLVIDO); duplicatas (RESOLVIDO — CA-A4 3/3); visão de qualidade (RESOLVIDO — e57df8ff); adendos D5 (RESOLVIDO — a6bf06fb); planejamento sintético (RESOLVIDO — 3cd404e5); apontamentos sintéticos (RESOLVIDO — be180fc1); telas de conferência sintéticas (RESOLVIDO — 556da315); fila de envio mock (RESOLVIDO — c44c11da); sugestões sintéticas (RESOLVIDO — 0baec76e). **Todas as tasks de construção das SPECs 004–006 estão fechadas.** Restantes: subtasks de dados reais (4e0fcf1c cadastro Omie do cliente; 5d8793fb/9318a299/e6aa4afa conexão real; d2a44349 parâmetros CL-006; 2c4a9b7e pontos Keoma), subtasks de uso real (d77447ab/30118f65 conferências reais; 64ac4f85/0096ab26 apontamentos reais; 16b8a592/87e4af63 publicação/reprogramação), contrato Omie (a2a4ccf1), provas de recuperação (4e9a1d0e), caso real autorizado (6e38e5a3), rascunho de sugestão (8bb4ef77) e validação integrada (0d876150).

**Próxima ação:** a2a4ccf1 (comprovar o contrato de produção no Omie — documentação/acesso autorizados) e 8bb4ef77 (levar a sugestão somente para rascunho — recorte sintético) são as próximas elegíveis no ciclo contínuo; demais tasks dependem de dados reais/autorização.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
