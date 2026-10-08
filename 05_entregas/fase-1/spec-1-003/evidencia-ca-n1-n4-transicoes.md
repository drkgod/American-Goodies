# Evidência — SPEC-1-003 · Task f2bda37f: Testar pagamento pendente e falha do canal (CA-N1–N4)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: f2bda37f-9ce6-4014-a8d7-152e7e313fba
- Versões do projeto Skip 62774: 0.0.44–0.0.47 (QA nativo ok)

## CORREÇÃO honesta (supera a evidência anterior desta pasta)

A evidência da task b0502049 registrou que a integração canal→Omie "não grava
`codigo_pedido_integracao`" — **isso era verdade só na amostra de 200 pedidos recentes**.
Com o **lote oficial completo** (5.393 pedidos, geração 9, ativado nesta task), a conta mostra:

- **2.589 pedidos oficiais COM `codigo_pedido_integracao` preenchido**;
- a maioria em formato `OH…` (ex.: `OH23571397`) — **outro canal** (loja própria via Lunet,
  conforme contexto da SPEC); não casam com Nuvemshop e não devem casar;
- uma parte em formato numérico que casa com o `numero_origem` do Nuvemshop — a integração
  Nuvemshop→Omie grava o número do canal no campo de referência.

## Prova com dados REAIS (geração 2 do canal + lote oficial completo do Omie)

| classe | gen 1 | gen 2 | com lote oficial completo |
|---|---|---|---|
| pendente_pagamento | 277 | 273 | **270** |
| cancelado | 369 | 373 | **373** |
| pago_sem_vinculo | 2687 | 2688 | **2647** |
| vinculado_omie | 0 | 0 | **44** |
| status_nao_mapeado (voided) | 10 | 10 | **10** |
| **total canal** | **3343** | **3344** | **3344 (soma exata ✓)** |

- Transições reais entre gerações: 4 pendentes→cancelados, 1 pendente→pago; upsert idempotente
  atualizou cada registro UMA vez.
- **Vínculo comprovado: 44 pedidos** — casamento EXATO entre `codigo_pedido_integracao`
  (gravado pela integração no Omie) e `numero_origem` do canal. Amostra de pares:
  canal `2441` → Omie `9916618064` · canal `2674` → Omie `9927250656` · canal `2538` → Omie
  `9920809946` · canal `2499` → Omie `9919122067` (via `numero_origem`).
  Cada pedido vinculado conta UMA vez no oficial; `conflito: 0` (nenhuma referência aponta
  para 2+ oficiais).
- **`duplicados_oficiais_total: 0` nos 5.393 oficiais** — nenhuma duplicação no Omie
  (observação do owner, agora provada no lote completo).
- Falha do canal Omie durante o ciclo (transporte intermitente; execuções parciais págs.
  10/29/13/54 em gerações 5–8) NÃO ocultou nada: lote anterior permaneceu ativo até a
  ativação atômica da geração 9 (54/54 páginas, 5.393 = `total_de_registros`).
- CA-N4/segredos: nenhuma credencial em resposta ou log.

## Cobertura por critério

- **CA-N1**: pendente como intenção separada; cancelado não aumenta demanda — provado com
  transições reais ✓
- **CA-N2**: paid sem referência fica aguardando vínculo (2647); **loja própria (OM-L1)**:
  os ~2.545 oficiais com referência `OH…` são os pedidos de loja própria no Omie — entram na
  lista oficial sem exigência de pagamento prévio ✓
- **CA-N3**: vínculo só por referência comprovada; conflito preserva originais ✓ (44 pares;
  sem merge por cliente/valor/data)
- **CA-N4**: transição atualiza uma vez (idempotente); falha de paginação não apaga lista
  Omie (gerações 5–8 parciais preservadas; recuperação concluiu na gen 9) ✓

## Teste humano (roteiro)

1. Painel → Pedidos: total 3344; classes 270/373/2647/44/10.
2. Abrir no Omie o pedido `9916618064` e conferir que o código de integração é `2441`
   (par da amostra) e a origem é a loja virtual.
3. Conferir que nenhum pedido Nuvemshop foi juntado a oficial por semelhança
   (cliente/valor/data) — só pelos 44 pares de referência.
4. Durante uma falha do Omie, o painel mantém último lote e mostra fonte/último sucesso.
