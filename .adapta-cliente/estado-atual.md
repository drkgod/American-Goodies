# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v2
- task_id: 0641975b-95f9-4c91-8a2d-c607f1a25c31 (task "Exibir pedidos pendentes da Nuvemshop", SPEC-1-003, CA-N1/N2) — implementada e provada com dados REAIS
- executor: MCC (ETHOS)
- owner_informativo: desconhecido
- spec: 04_fase-atual/specs/spec-1-003-pedidos-nuvemshop.md
- analise: .adapta-cliente/analises/spec-1-003-pedidos.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada — 2026-10-08 11:48 ("continue e nao pergunte mais"); CL-002 recebido 13:40 e retomado sem novo pedido
- teste_humano: pendente (SPEC-1-002 3 tasks + SPEC-1-003 task 1)
- verificacao_automatica: passou — contrato Nuvemshop provado na conta real (auth header, paginação 200, 3343 pedidos/17 páginas); lote real ativado; classificação na precedência da SPEC: 277 pendentes, 369 cancelados, 2687 pagos sem vínculo, 10 voided não mapeados, vínculo 0 sem suposição (codigo_pedido_integracao vazio em amostra de 200 pedidos Omie); autorização 403 sem área; Omie intacto; v0.0.42 QA ok
- aprendizado: sem_sinal:contratos já documentados na evidência
- ultima_acao: pedidos pendentes implementados e provados (evidencia-pedidos-pendentes.md)
- proxima_acao: teste humano; depois b0502049 (CA-N3 vínculo/crosswalk — depende de amostra com referência) e f2bda37f (transições/falha)
- atualizado_em: 2026-10-08T14:05:00-03:00
