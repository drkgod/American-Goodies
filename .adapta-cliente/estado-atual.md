# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 4 (P6, liberada em 03/11/2026; fase 3 guardada em 05_entregas/fase-3; fase 5 sem tarefas)
- task_id: Separar no servidor os registros de teste e de demonstração dos reais (id pendente do portal)
- spec: 04_fase-atual/specs/spec-4-001-producao-gravando-no-servidor.md
- etapa: construcao
- executor: MCC (Claude Code)
- teste_humano: um ponto de aprovação, o dono escolhe uma das 3 propostas de visual (SPEC-4-002, CL-008); depois, a sessão de validação final com a equipe (SPEC-4-007), sem data marcada
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida
- bloqueios_localizados: chave do Omie bloqueada desde 22/10 (CL-PEND-006; não chamar o Omie até o aviso do dono); logo e cores (CL-PEND-015); usuário de teste (CL-PEND-016); origem das notas de entrada em revisão (CL-PEND-007)
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.197 (ref 32917f0), publicada 03/11
- pendente_github: não (patch de 03/11 no commit 8485139)
- ultima_acao: 03/11 — consultor liberou a fase 4 (7 SPECs, 21 tarefas)
- proxima_acao: SPEC-4-001, marca de demonstração no servidor e recusa no envio
- atualizado_em: 2026-11-03

Estado anterior preservado no histórico do git.
