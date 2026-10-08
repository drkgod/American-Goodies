# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v2
- task_id: f2bda37f-9ce6-4014-a8d7-152e7e313fba (task "Testar pagamento pendente e falha do canal", SPEC-1-003, CA-N1–N4) — implementada e provada com dados reais; aguardando teste humano
- task_anterior_pendente_teste: b0502049-e8d5-480b-b3c0-01b69a05c7a4 (CA-N3) — implementada e provada; o mesmo teste humano cobre as duas
- executor: MCC (ETHOS)
- owner_informativo: Mr Cheney (owner autorizou continuidade: "pode seguir", 15:59)
- spec: 04_fase-atual/specs/spec-1-003-pedidos-nuvemshop.md
- etapa: aguardando_teste_humano
- teste_humano: pendente (CA-N3 + CA-N1–N4)
- verificacao_automatica: passou — lote oficial omie:pedidos COMPLETO (5393/5393, geração 9, ativação atômica após falhas parciais nas gerações 5–8); visão consolidada v0.0.47: 44 vínculos comprovados por numero_origem = codigo_pedido_integracao (amostra de pares registrada), conflito 0, duplicados_oficiais 0 nos 5393, total canal 3344 preservado (soma exata)
- correcao_registrada: evidência anterior dizia "integração não grava codigo_pedido_integracao" — verdadeiro só na amostra de 200 recentes; lote completo mostra 2589 referências (maioria OH… = outro canal/loja própria; parte numérica = Nuvemshop numero)
- aprendizado: capturado (AP-2026-10-08-1520) + novo: referência de integração varia por canal — amostra pequena pode induzir conclusão errada sobre o formato da referência; sempre completar o lote antes de declarar lacuna
- ultima_acao: lote oficial completo + visão v0.0.47 com vínculos provados
- proxima_acao: teste humano (2 evidências SPEC-1-003); depois SPEC-1-004 (aguarda cadastro no ERP)
- atualizado_em: 2026-10-08T16:40:00-03:00
