# Evidência — SPEC-1-003 · Task f2bda37f: Testar pagamento pendente e falha do canal (CA-N1–N4)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: f2bda37f-9ce6-4014-a8d7-152e7e313fba
- Versões do projeto Skip 62774: 0.0.44–0.0.46 (QA nativo ok)

## Prova com dados REAIS da conta (geração 1 → geração 2 do canal)

Ressincronização completa do Nuvemshop (17 páginas, 200/pág) no mesmo dia:

| classe | gen 1 | gen 2 | delta |
|---|---|---|---|
| pendente_pagamento | 277 | 273 | −4 |
| cancelado | 369 | 373 | +4 |
| pago_sem_vinculo | 2687 | 2688 | +1 |
| status_nao_mapeado (voided) | 10 | 10 | 0 |
| **total** | **3343** | **3344** | **+1** |

- 4 pedidos reais saíram de pendente → cancelado e 1 de pendente → pago ENTRE as gerações; o upsert idempotente (chave fonte+loja+pedido_origem_id) atualizou cada registro UMA vez — nenhuma duplicação (`duplicados_oficiais_total: 0`; total do lote = soma exata das classes).
- Falha do canal Omie (lote oficial de pedidos interrompido na pág. 29/54 por `falha_transporte`) NÃO ocultou nada: listas e lotes anteriores preservados (estoque 1055/gen 17 ok, Nuvemshop gen 2 ok), retomada garantida pelo cursor do servidor.
- CA-N4/segredos: nenhuma credencial em resposta ou log; tokens só nos secrets do projeto.

## Cobertura por critério

- **CA-N1**: pendente aparece como intenção separada; cancelado não aumenta demanda — prova real com as 4 transições para cancelado ✓
- **CA-N2**: paid sem referência fica aguardando vínculo (2688 registros reais); loja própria via Omie (OM-L1) provada em fixtures (GREEN 4/4 na task b0502049); na conta real ainda não há amostra identificável de loja própria — depende do lote oficial completo (limitação honesta registrada)
- **CA-N3**: vínculo só por `codigo_pedido_integracao`; conflito preserva originais — concluído na task anterior ✓
- **CA-N4**: transição atualiza o registro uma vez (geração 2 idempotente); falha de paginação não apaga lista Omie (falha pág. 29 provada) ✓

## Pendências honestas

- Lote oficial Omie pedidos: 29/54 páginas na última execução (transporte/rate-limit intermitente do Omie em conta com 5393 pedidos); retomada segura pelo cursor (`sync/iniciar` devolve a execução vigente).
- Loja própria real (OM-L1) aguarda o lote oficial completo para amostra na conta.

## Teste humano (roteiro)

1. Painel → Pedidos: conferir total 3344 e classes 273/373/2688/10.
2. Confirmar que nenhum pedido Nuvemshop aparece como pedido Omie (`vinculado_omie: 0` — a integração atual não grava referência).
3. Indisponibilidade: durante falha do Omie, o painel mantém último lote e mostra fonte/último sucesso.
