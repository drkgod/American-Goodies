# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (16/10/2026):** 6/29 concluídas — 51356fad (matriz nominal v1.2), 49327a88 (21 contas reais ativas), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3) e e57df8ff (visão de qualidade dos dados). **3 tasks no ar aguardando teste do bloco** (ciclo contínuo, plugin 0.8.0): a6bf06fb (adendos D5, documental), 3cd404e5 (calendário e OP digital, recorte sintético) e be180fc1 (tela de apontamentos, recorte sintético) — todas implementadas, publicadas e provadas. Produção: v0.0.85 (ref fe6114f, 16/10 11:48). Demais 20 tasks abertas.

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.85 (ref fe6114f, publicado 16/10 11:48).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente) e pontos da Keoma na matriz (2c4a9b7e).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

Gates localizados: matriz/ações (RESOLVIDO); duplicatas (RESOLVIDO — CA-A4 3/3); visão de qualidade (RESOLVIDO — e57df8ff); cadastro/unidade/ficha para cálculo real (4e0fcf1c do cliente); histórico/recebimentos para sugestões; autorização transacional específica para cada OP/efeito no Omie. Provas negativas de revogação/reinício/concorrência/timeout antes do primeiro POST real.

**Próxima ação:** teste humano do bloco no ar (roteiro nas evidências de spec-2-002/003 e no registro de reconciliação a6bf06fb); depois o ciclo contínuo segue para as próximas tasks elegíveis.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
