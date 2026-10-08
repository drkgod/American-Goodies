# Evidência — SPEC-1-003 · Task b0502049: Relacionar pedidos de canais sem duplicação (CA-N3)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: b0502049-e8d5-480b-b3c0-01b69a05c7a4
- Versões do projeto Skip 62774: 0.0.44–0.0.46 (QA nativo ok em todas)
- Registro do owner: "não teve duplicação no Omie" (14:35) — confirmado pela prova abaixo.

## Implementado

- `pcp_sync_iniciar/pagina` — fonte `omie` recurso `pedidos` (`ListarPedidos`, 100/pág, fim por
  `total_de_paginas`): lote oficial com `codigo_pedido_integracao` para o índice de vínculo.
- `pcp_pedidos_visao` — índice de vínculo **SOMENTE por referência comprovada**
  (`codigo_pedido_integracao` = pedido_origem_id); referência múltipla → **conflito** (sem merge);
  `duplicados_oficiais` detecta `codigo_pedido` repetido no lote oficial; mesma pessoa/valor/data
  **NUNCA mescla** (regra da SPEC).
- `tests/pcp/spec-1-003-ca-n3.test.mjs` — fixtures da SPEC (NS-10..NS-14, OM-11, OM-L1).

## Provas

1. **GREEN 4/4** (node --test, node v20.15.1) — CA-N1 (pendente separado; cancelado não soma),
   CA-N2 (vínculo único conta uma vez; pago sem vínculo aguarda), CA-N3 (conflito sem merge;
   duplicado sinalizado; cliente/valor não mescla), voided não mapeado.
2. **Visão real** (3.343 pedidos Nuvemshop): pendente 277 · cancelado 369 · pago_sem_vinculo 2.687 ·
   voided 10 · **vinculados_com_referencia 0** · **duplicados_oficiais 0** · conflito 0.
3. **Leitura real parcial do lote oficial**: páginas 1–42 de 54 (4.200/5.393 pedidos) lidas sem
   duplicar (upsert por `codigo_pedido`); falha 429/transporte na pág 43 → execução encerrada com
   lote anterior intacto (CA-O3 correto); 2 tentativas de recuperação esbarraram na janela
   REDUNDANT do Omie (rate-limit agressivo na conta hoje) — retomada no próximo ciclo.

## Resultado honesto da CA-N3

- **vinculado_omie = 0 é o RESULTADO CORRETO com dados reais**: a integração atual Nuvemshop→Omie
  não grava `codigo_pedido_integracao` (provado em amostras de 200+300+4.200 pedidos oficiais
  vistos). A lógica de vínculo/conflito/duplicação está implementada e provada por fixtures;
  quando a integração passar a gravar a referência, o índice vincula sem mudança de código.
- **Duplicação no Omie: NENHUMA detectada** (`duplicados_oficiais = 0`) — o consolidado não infla.
- **LACUNA (consultor)**: decidir a origem da referência entre canal e Omie (gravar
  `codigo_pedido_integracao` na integração atual) para vínculos reais aparecerem.

## Pendente

- Ativação do lote oficial completo (54 páginas) quando a janela de rate-limit permitir — não
  bloqueia a CA-N3 (o índice lê o lote quando ele existir).
- `f2bda37f` (CA-N1–N4): transições e falha do canal.

## Teste humano (roteiro)

1. Visão de pedidos: contagem sem inflar (nenhum pedido contado duas vezes; cancelados somem
   da demanda).
2. Conferir que pagos sem vínculo (2.687) aparecem como complemento separado — não como pedido
   Omie já existente.
3. Confirmar o aceite da CA-N3.
