# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 4 (P6, liberada em 03/11/2026; fase 3 guardada em 05_entregas/fase-3; fase 5 sem tarefas)
- task_id: nenhuma
- spec: 04_fase-atual/specs/spec-4-001-producao-gravando-no-servidor.md
- etapa: sem_task
- executor: MCC (Claude Code)
- teste_humano: um ponto de aprovação, o dono escolhe uma das 3 propostas de visual (SPEC-4-002, CL-008); depois, a sessão de validação final com a equipe (SPEC-4-007), sem data marcada
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida
- bloqueios_localizados: chave do Omie bloqueada desde 22/10 (CL-PEND-006; não chamar o Omie até o aviso do dono); logo e cores (CL-PEND-015); usuário de teste (CL-PEND-016); origem das notas de entrada em revisão (CL-PEND-007)
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.203 (ref dc69d76), publicada (conferida 06/11 11:24 UTC)
- pendente_github: não (patch de 03/11 no commit 8485139)
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-11-06-1124-verificacao-ao-vivo.md
- ultima_acao: 06/11 — recuperação: produção conferida em v0.0.203 (ref dc69d76); a 1ª tarefa da SPEC-4-001 está documentada como concluída no fase.md (v0.0.199)
- proxima_acao: SPEC-4-001, gravar a programação no servidor (CA-4-01 e CA-4-04)
- em_espera: nenhuma — remoção dos 2 hooks de diagnóstico confirmada na produção v0.0.203; resta a busca de segredo e a marcação da CA-4-35, que são da construção (fora desta recuperação)
- atualizado_em: 2026-11-06

Estado anterior preservado no histórico do git.
