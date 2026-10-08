# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v2
- task_id: f2bda37f-9ce6-4014-a8d7-152e7e313fba (task "Testar pagamento pendente e falha do canal", SPEC-1-003, CA-N1–N4) — implementada e provada com dados reais; aguardando teste humano
- task_anterior_pendente_teste: b0502049-e8d5-480b-b3c0-01b69a05c7a4 (CA-N3) — implementada e provada; o mesmo teste humano cobre as duas
- executor: MCC (ETHOS)
- owner_informativo: Mr Cheney (owner autorizou continuidade: "pode seguir", 14:56)
- spec: 04_fase-atual/specs/spec-1-003-pedidos-nuvemshop.md
- etapa: aguardando_teste_humano
- teste_humano: pendente (CA-N3 + CA-N1–N4)
- verificacao_automatica: passou — resync Nuvemshop geração 2 (3344 pedidos): 4 pendentes→cancelados, 1 pendente→pago, upsert idempotente (registro atualizado uma vez), duplicados_oficiais=0; falha do Omie (pág. 29/54) preservou listas e lotes anteriores; nenhum segredo em resposta/log
- pendencia_tecnica: lote oficial omie:pedidos 29/54 páginas (transporte/rate-limit intermitente do Omie); retomada segura pelo cursor (sync/iniciar devolve a execução vigente)
- aprendizado: candidato: conta grande (5393 pedidos) exige retomada por cursor em múltiplos ciclos; lote parcial nunca é tratado como falha final
- ultima_acao: CA-N1–N4 provadas com dados reais (evidencia-ca-n1-n4-transicoes.md)
- proxima_acao: teste humano (2 evidências SPEC-1-003); concluir lote oficial omie:pedidos (págs. 30–54); depois SPEC-1-004 (aguarda cadastro no ERP)
- atualizado_em: 2026-10-08T15:20:00-03:00
