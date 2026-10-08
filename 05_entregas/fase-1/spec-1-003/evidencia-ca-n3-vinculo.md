# Evidência — SPEC-1-003 · Task b0502049: Relacionar pedidos de canais sem duplicação (CA-N3)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: b0502049-e8d5-480b-b3c0-01b69a05c7a4
- Versões do projeto Skip 62774: 0.0.44–0.0.45 (QA nativo ok)

## Implementação (lógica de vínculo determinística)

- `pcp_sync_pagina.js` ganhou o recurso `omie:pedidos` (`ListarPedidos`, 100/página, campos
  `codigo_pedido`/`codigo_pedido_integracao`/`numero_pedido`/`origem_pedido`/`etapa`) — o lote
  oficial do Omie alimenta o índice de vínculo;
- `pcp_pedidos_visao.js` constrói o índice **somente por referência comprovada**
  (`codigo_pedido_integracao` do Omie → `pedido_origem_id` do canal):
  - referência única → `vinculado_omie` (conta UMA vez no oficial);
  - referência múltipla → `conflito` (originais preservados, sem merge);
  - **mesma pessoa/valor/data NUNCA mescla** (proibido pela SPEC);
  - detector de duplicação no lote oficial (`duplicados_oficiais`) prova que o consolidado
    não infla o total oficial.

## Prova real (conta do cliente)

- Visão consolidada: `vinculados_com_referencia: 0`, `duplicados_oficiais_total: 0`,
  contagem Nuvemshop preservada (277/369/2687/10) — **confere com a observação do owner:
  não houve duplicação no Omie**; o sistema também não inventa vínculo que não existe.
- Causa raiz (já registrada ao consultor): a integração atual canal→Omie não grava
  `codigo_pedido_integracao`; quando passar a gravar, o índice liga automaticamente —
  nenhuma mudança de código.
- Lote oficial Omie pedidos (5393 registros): leitura parcial (págs. 1–33) concluída;
  **completar as páginas restantes ficou pendente** — o sync agora respeita a janela
  "Aguarde N segundos" do rate-limit Omie (HTTP 429/500, v0.0.45), e o laço de retomada
  queima as 3 tentativas se for chamado antes da janela expirar. A retomada é segura:
  `sync/iniciar` devolve a execução vigente e o cursor do servidor continua de onde parou.

## Teste humano (roteiro)

1. Visão de pedidos: contagens iguais às anteriores (277 pendentes, 369 cancelados,
   2687 pagos sem vínculo, 10 voided) e `duplicados_oficiais_total: 0`.
2. Confirmar que nenhum pedido Nuvemshop foi "juntado" a um pedido Omie por semelhança.
