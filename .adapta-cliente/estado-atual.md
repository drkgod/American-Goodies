# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v3
- fase: 3 (última; fases 4 e 5 sem tarefas, AC-26-01)
- task_id: Trazer o catálogo real do Omie produto a produto, sem estourar o limite de consultas (id a receber do portal)
- spec: 04_fase-atual/specs/spec-3-001-dados-reais-da-fase-2.md
- etapa: implementando
- executor: MCC (ETHOS)
- teste_humano: nenhum durante a construção. O único teste é a sessão de validação final com a equipe (SPEC-3-018), prevista para 03/12/2026
- chaves: todas as gravações no Omie desligadas (omie_op_escrita, omie_pedido_compra_escrita, omie_pedido_venda_escrita; omie_recebimento_escrita em revisão). Ligam só com a autorização do dono, uma por vez, com a condição do checklist cumprida. Leitura real liberada
- bloqueios_localizados: chave do Omie bloqueada por excesso de consultas desde 23/10 (CL-PEND-006); origem das notas de entrada em revisão (CL-PEND-007)
- sistema: pcp
- skip_projeto: 62774
- skip_versao: v0.0.170 (ref b2387dd), publicada 28/10
- pendente_github: nao
- ultima_acao: 28/10 — catálogo produto a produto (contrato + endpoint) no ar na v0.0.170; QA verde; leitura real pendente do Omie (CL-PEND-006)
- proxima_acao: construir "Mostrar ao PCP a lista do que falta cadastrar" (SPEC-3-001 CA-3-02); retomar a leitura real do catálogo quando o Omie liberar
- atualizado_em: 2026-10-28

Estado anterior preservado no histórico do git (commit 056629c).
