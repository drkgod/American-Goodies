# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 3 (última; fases 4 e 5 sem tarefas, AC-26-01)
- task_id: Ligar o envio da produção ao Omie com o envio desligado e provar no simulador (SPEC-3-002)
- spec: 04_fase-atual/specs/spec-3-002-conclusao-da-op-no-omie.md
- etapa: implementando
- executor: MCC (ETHOS)
- teste_humano: nenhum durante a construção. O único teste é a sessão de validação final com a equipe (SPEC-3-018), prevista para 03/12/2026
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida. Leitura real liberada
- bloqueios_localizados: chave do Omie bloqueada por excesso de consultas desde 23/10 (CL-PEND-006); origem das notas de entrada em revisão (CL-PEND-007)
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.173 (ref 94f5590), publicada 28/10
- pendente_github: sim:commits locais; enviar pelo GitHub Desktop (push pelo terminal sem login)
- ultima_acao: 28/10 — SPEC-3-001 construída até onde o Omie permite (catálogo, faltantes, conversão 90 dias); 5 tarefas em [/] aguardando chave do Omie
- proxima_acao: construir SPEC-3-002 (envio da produção ao Omie, chave desligada, simulador); retomar a SPEC-3-001 quando o Omie liberar
- atualizado_em: 2026-10-28

Estado anterior preservado no histórico do git (commit 056629c).
