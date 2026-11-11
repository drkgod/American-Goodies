# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 4 (P6, liberada em 03/11/2026; fase 3 guardada em 05_entregas/fase-3; fase 5 sem tarefas)
- task_id: nenhuma
- spec: nenhuma
- etapa: sem_task
- executor: MCC (Claude Code)
- teste_humano: um ponto de aprovação, o dono escolhe uma das 3 propostas de visual (SPEC-4-002, CL-008); depois, a sessão de validação final com a equipe (SPEC-4-007), sem data marcada
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida
- bloqueios_localizados: chave do Omie bloqueada desde 22/10 (CL-PEND-006; não chamar o Omie até o aviso do dono); logo e cores (CL-PEND-015); usuário de teste (CL-PEND-016); origem das notas de entrada em revisão (CL-PEND-007)
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.219 (ref 04fe21b), publicada (11/11)
- pendente_github: nao (GitHub HEAD 0384181b = Skip v0.0.216, conferido 10/11 01:25Z)
- aprendizado: capturado:06_notas/aprendizado-continuo/AP-2026-11-06-1124-verificacao-ao-vivo.md
- ultima_acao: 09/11 — sessão de construção da fase 4 até a v0.0.216: SPEC-4-005 em 4 etapas (tabelas, avisos, selos, formato e paginação), SPEC-4-006 no celular e no tablet (284 de 284), SPEC-4-002 na parte sem logo (título, idioma, login, fonte); tarefas em andamento até as capturas
- proxima_acao: SPEC-4-007 (depende dos usuários de teste e do aviso do Omie)
- em_espera: nenhuma — remoção dos 2 hooks de diagnóstico confirmada na produção v0.0.203; resta a busca de segredo e a marcação da CA-4-35, que são da construção (fora desta recuperação); e a evidência da SPEC-4-002 (parte sem logo, v0.0.216) ainda não está em 05_entregas/fase-4/spec-4-002 — pendência da construção
- atualizado_em: 2026-11-10T01:25:00Z

Estado anterior preservado no histórico do git.
