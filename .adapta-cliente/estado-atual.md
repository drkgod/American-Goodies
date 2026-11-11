# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 4 (P6, liberada em 03/11/2026; fase 3 guardada em 05_entregas/fase-3; fase 5 sem tarefas)
- task_id: nenhuma
- spec: nenhuma
- etapa: sem_task
- executor: MCC (Claude Code)
- teste_humano: o dono escolheu a proposta A em 11/11 (SPEC-4-002, CL-008, `05_entregas/fase-4/spec-4-002/escolha-do-dono.md`); falta a sessão de validação final com a equipe (SPEC-4-007), sem data marcada
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida
- bloqueios_localizados: chave do Omie bloqueada desde 22/10 (CL-PEND-006; não chamar o Omie até o aviso do dono); usuário de teste (CL-PEND-016); origem das notas de entrada em revisão (CL-PEND-007). Logo e cores (CL-PEND-015) atendidos em 11/11 — logo entregue e proposta A escolhida; resta só a versão definitiva em SVG/PNG de pelo menos 512 px
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.226 (ref 14bb9e1), publicada (11/11)
- pendente_github: nao (GitHub HEAD 9546e908 carrega as versões até a v0.0.221, conferido 11/11 18:10Z)
- aprendizado: sem_sinal:bloco-11-11-acabamento-visual (triagem 11/11 18:12Z registrada em 06_notas/aprendizado-continuo/controle.md; último capturado: AP-2026-11-06-1124-verificacao-ao-vivo.md)
- ultima_acao: 11/11 — SPEC-4-002: 3 propostas de visual enviadas ao dono, proposta A escolhida e aplicada (Skip v0.0.218), logo oficial na marca (v0.0.219) e logo sem fundo (v0.0.221, ref abdf3da, publicada); 2 [x], 15 [/] e 5 [ ] na fase 4; as tarefas seguem em andamento até as capturas e a medição (usuário de teste)
- proxima_acao: SPEC-4-007 (depende dos usuários de teste e do aviso do Omie)
- em_espera: (1) busca de segredo e marcação da CA-4-35 — construção, fora desta recuperação (os 3 hooks de diagnóstico seguem apagados na produção); (2) contradição documental na SPEC-4-002: `escolha-do-dono.md` diz que a marca no sistema é "versão provisória em SVG", mas `evidencia.md` e `src/lib/pcp/logoMrCheney.ts` provam o PNG oficial (548x364, embutido em 274x182) — corrigir o texto na construção; (3) versão definitiva do logo em SVG/PNG ≥ 512 px (CL-PEND-015) e usuário de teste (CL-PEND-016)
- atualizado_em: 2026-11-11T18:12:00Z

Estado anterior preservado no histórico do git.
