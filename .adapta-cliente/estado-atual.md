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
- skip_versao: v0.0.226 (ref 14bb9e1), publicada (11/11); deploy provado em 11/11 22:22Z sem sessão (rota `GET /backend/v1/pcp/usuarios` no backend interno = 401 "requires valid record authorization token", e /admin: 404 = não publicado; bundle do app traz `administrar_usuarios`, `/usuarios` e `backend/v1/pcp/usuarios`) — versão do ar não reconferida por `skip_project_status` (MCP do Skip com Forbidden nesta rodada)
- pendente_github: nao (GitHub HEAD 5a20165f de 11/11 20:28Z carrega a v0.0.226 e os arquivos da tela de Usuários, conferido 11/11 22:20Z)
- aprendizado: capturado 11/11 22:14Z — AP-2026-11-11-2214-verificacao-com-mcp-fora-e-numeracao-de-migration.md (provar produção sem MCP pela distinção 404×401 no backend interno; numerar migration contra as já publicadas — a 0048 já era a marca de teste e a tela virou 0049)
- ultima_acao: 11/11 (sessão da noite) — SPEC-4-002 fechada no visual (proposta A, logo oficial, v0.0.218→v0.0.221); matriz de acesso v3 aprovada pelo dono (`06_notas/matriz-nominal-v3-2026-11-11.md`) e registrada em 5 commits; resposta do suporte do Omie registrada (CL-PEND-006, `06_notas/omie-resposta-suporte-limites-2026-11-11.md`); tela de Usuários no ar (Skip v0.0.226, migration 0049) com rota `/usuarios` **sem item no menu** (o menu tem exatamente 25 entradas pela SPEC-4-003); fase 4: 2 [x], 16 [/] e 4 [ ]
- proxima_acao: SPEC-4-007 (depende dos usuários de teste e do aviso do Omie)
- em_espera: (0) MCP do Skip respondeu `Forbidden` ("client is closing") nas duas tentativas desta rodada — `skip_project_status`, `skip_file_list` e o cofre não foram lidos; reconferir working tree e versão na próxima rodada antes de qualquer conclusão de construção; (0b) ninguém recebeu a ação `administrar_usuarios` (decisão do dono) — sem ela a tela de Usuários abre apenas para quem já tem, então o dono precisa escolher quem administra contas; a conta do Pedro Lima (matriz v3) também depende disso; (1) busca de segredo e marcação da CA-4-35 — construção, fora desta recuperação (os 3 hooks de diagnóstico seguem apagados na produção); (2) contradição documental na SPEC-4-002: `escolha-do-dono.md` diz que a marca no sistema é "versão provisória em SVG", mas `evidencia.md` e `src/lib/pcp/logoMrCheney.ts` provam o PNG oficial (548x364, embutido em 274x182) — corrigir o texto na construção; (3) versão definitiva do logo em SVG/PNG ≥ 512 px (CL-PEND-015) e usuário de teste (CL-PEND-016)
- atualizado_em: 2026-11-11T22:26:00Z

Estado anterior preservado no histórico do git.
