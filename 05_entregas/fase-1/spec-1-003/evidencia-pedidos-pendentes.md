# Evidência — SPEC-1-003 · Task 0641975b: Exibir pedidos pendentes da Nuvemshop (CA-N1/N2)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: 0641975b-95f9-4c91-8a2d-c607f1a25c31
- Versões do projeto Skip 62774: 0.0.39–0.0.42 (QA nativo ok em todas)
- CL-002: recebido do owner (13:40) e registrado como secrets `NUVEMSHOP_STORE_ID`/`NUVEMSHOP_TOKEN` — **somente no servidor**; nunca em repo, UI ou log

## Contrato real provado na conta (amostra antes do adapter)

`GET https://api.tiendanube.com/v1/{store_id}/orders?per_page=200&page=N`

| Item | Valor confirmado |
|---|---|
| Autenticação | header `Authentication: <token>` (UserAuthentication) + User-Agent obrigatório |
| Paginação | `page`/`per_page` (máx. 200); fim = página com menos de 200 |
| Campos | id, number, status, payment_status, created_at, updated_at, total, products[] (id/product_id/variant_id/quantity/price) |
| Rate-limit | 40 req/min (headers `x-rate-limit-*`) |
| Conta real | **3343 pedidos** (17 páginas: 16×200 + 143) | Amostra de 200 pedidos do Omie → `codigo_pedido_integracao` **vazio em todos** (integração atual não grava referência) → **vínculo = 0 sem suposição** (regra da SPEC; lacuna registrada ao consultor)

## Implementado

- `pcp_sync_iniciar.js` multi-fonte: `{fonte, recurso}`; allowlist `{omie: [estoque], nuvemshop: [pedidos]}`
- `pcp_sync_pagina.js`: ramo Nuvemshop (auth header, paginação 200, normalização pedido+itens, fim por `arr.length < 200`); Omie intacto
- `pcp_pedidos_visao.js`: classificação na **precedência da SPEC** a partir do lote ativo, sem escrever nos canais e sem inventar vínculo
- Migration 0011: área `pedidos` no fixture teste-PCP (sintético, não concessão real)
- `tests/pcp/spec-1-003.test.mjs`: suíte env-gated (sync real, classificação, autorização)

## Leitura real executada + classificação (CA-N1/N2)

17 páginas reais → lote `2krwwsxan00a08l` ativado com **3343 pedidos reais** (upsert por pedido_id):

| Estado operacional | Pedidos | Regra |
|---|---|---|
| pendente_pagamento | **277** | intenção separada (pending/authorized) — CA-N1 ✓ |
| cancelado | **369** | não aumenta demanda — CA-N1 ✓ |
| pago_sem_vinculo | **2687** | paid aguardando vínculo — CA-N2 ✓ |
| status_nao_mapeado | **10** | voided: estado bruto preservado, sem confirmação por suposição — CA-N2 ✓ |
| vinculado_omie | 0 | sem referência comprovada na conta (honesto) |
| conflito | 0 | — |

Amostras: pendente `1887368361`/nº1375 (open/pending); pago `1833589115`/nº878 (open/paid).
Aviso na resposta: **totais Nuvemshop NÃO são somados aos oficiais do Omie** (vínculo desconhecido).

## Autorização e isolamento

- PCP (área pedidos) → 200; Compras (sem pedidos) → **403** ✓
- Falha do canal preserva Omie (lotes separados por fonte); segredo nunca em resposta ✓
- Regressão: pcp/dados 200; health 200; QA nativo ok (0.0.39–0.0.42)

## Pendências (próximas tasks)

- `b0502049` (CA-N3): crosswalk/vínculo — exige amostra com `codigo_pedido_integracao` preenchido; a integração atual do canal não grava referência no Omie — **lacuna registrada ao consultor**
- `f2bda37f` (CA-N1–N4): transições e falha do canal
- UI do painel: SPEC-1-005

## Teste humano (roteiro)

1. Visão de pedidos: 3343 pedidos reais com contagem por estado (277 pendentes, 369 cancelados, 2687 pagos sem vínculo, 10 voided).
2. Conferir um pedido no admin da Nuvemshop (ex.: nº1375 pendente; nº878 pago).
3. Confirmar que pendentes aparecem como intenção separada e cancelados não somam demanda (CA-N1/N2).
