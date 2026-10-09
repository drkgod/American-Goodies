# Contrato Nuvemshop — leitura (SPEC-1-003, reconciliado com a conta real)

Atualizado em 2026-10-08 · Credenciais: secrets do projeto (nunca aqui).

## Recursos liberados (allowlist de CONSULTA — nada mutante)

| Recurso | Endpoint | Método | Paginação confirmada |
|---|---|---|---|
| pedidos | `https://api.tiendanube.com/v1/{store_id}/orders` | GET | `page`/`per_page` (máx. 200); fim = página com menos de 200 |

## Chamada

- Header `Authentication: <token>` (UserAuthentication) + `User-Agent` obrigatório (identificação do app)
- Rate-limit: 40 req/min (headers `x-rate-limit-limit`/`x-rate-limit-remaining`)

## Campos usados (normalização)

- Pedido: id, number, status, payment_status, created_at, updated_at, total
- Itens: products[] com id, product_id, variant_id, quantity, price (IDs como texto; variantes repetidas NÃO colapsadas)
- Dados de cliente: NÃO importados (limite da SPEC — só identificação operacional se necessário)

## Estados operacionais (precedência da SPEC)

1. status=cancelled → cancelado
2. referência múltipla/incompatível → conflito
3. vínculo único comprovado (Omie `codigo_pedido_integracao`) → vinculado_omie
4. payment_status=paid sem vínculo → pago_sem_vinculo
5. pending/authorized sem vínculo → pendente_pagamento
6. voided/refunded/partially_paid/desconhecido → status_nao_mapeado (estado bruto preservado)

## Erros observados na conta real

| Sinal | Tratamento |
|---|---|
| HTTP 401/403 | autenticacao_recusada — sem retry |
| HTTP 429/5xx | transitório — retry em etapas separadas (2s/5s, máx. 3) |
| Página vazia/truncada | fim da fonte pela metadatagem (arr.length < per_page) |

## Limitações honestas

- Vínculo com Omie: `codigo_pedido_integracao` VAZIO em amostra de 200 pedidos do Omie — integração atual não grava referência; vínculo fica 0 até haver referência (lacuna ao consultor)
- Totais Nuvemshop são complementares e NÃO somados aos oficiais do Omie
- Janela: todas as páginas da conta (3343 pedidos)
