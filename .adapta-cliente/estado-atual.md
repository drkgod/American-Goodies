# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 3 (última; fases 4 e 5 sem tarefas, AC-26-01)
- task_id: SPEC-3-014
- spec: 04_fase-atual/specs/spec-3-014-relatorios-comparativos.md
- etapa: implementando
- executor: MCC (ETHOS)
- teste_humano: nenhum durante a construção. O único teste é a sessão de validação final com a equipe (SPEC-3-018), prevista para 03/12/2026
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida. Leitura real liberada
- bloqueios_localizados: chave do Omie bloqueada por excesso de consultas desde 23/10 (CL-PEND-006); origem das notas de entrada em revisão (CL-PEND-007)
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.190 (ref 18bb1cd), publicada 28/10
- pendente_github: sim:commits locais; enviar pelo GitHub Desktop
- ultima_acao: 29/10 — SPEC-3-013 construída: LOOP-01 (v0.0.190); 149/149 testes
- proxima_acao: construir a SPEC-3-014
- atualizado_em: 2026-10-28

Estado anterior preservado no histórico do git (commit 056629c).
