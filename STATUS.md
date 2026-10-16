# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (16/10/2026):** 11/29 concluídas — 51356fad (matriz v1.2), 49327a88 (21 contas reais), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3), e57df8ff (visão de qualidade), a6bf06fb (adendos D5 — SPEC-2-001 100% no recorte do executor), 3cd404e5 (calendário e OP digital), be180fc1 (tela de apontamentos), 556da315 (duas telas de conferência) e **0baec76e (sugestões com memória de cálculo)**. Produção: v0.0.91 (ref e7bfa2f, 16/10 12:23). Demais 18 tasks abertas; ciclo contínuo ativo (plugin 0.8.0).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.91 (ref e7bfa2f, publicado 16/10 12:23).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente, bloqueia conexão real) e pontos da Keoma na matriz (2c4a9b7e).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

Gates localizados: matriz/ações (RESOLVIDO); duplicatas (RESOLVIDO — CA-A4 3/3); visão de qualidade (RESOLVIDO — e57df8ff); adendos D5 (RESOLVIDO — a6bf06fb); planejamento sintético (RESOLVIDO — 3cd404e5); apontamentos sintéticos (RESOLVIDO — be180fc1); telas de conferência sintéticas (RESOLVIDO — 556da315); sugestões sintéticas (RESOLVIDO — 0baec76e); cadastro/unidade/ficha para cálculo real (4e0fcf1c do cliente); histórico/recebimentos para sugestões reais; autorização transacional específica para cada OP/efeito no Omie. Provas negativas de revogação/reinício/concorrência/timeout antes do primeiro POST real.

**Próxima ação:** ciclo contínuo segue para as próximas tasks elegíveis (c44c11da — fila de envio com simulação, recorte mock; subtasks de parâmetros/publicação/reprogramação quando os dados reais chegarem).

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
