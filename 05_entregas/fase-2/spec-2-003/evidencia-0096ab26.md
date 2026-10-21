# Evidência — Task 0096ab26 (Retificar apontamentos sem duplicar eventos)

SPEC-2-003 CA-E2/E4 · 21/10/2026 · recorte do executor (contratos aceitos apontamento.ts/ponto.ts) · executor MCC (ETHOS)

## Oráculos provados (TDD 6/6 — RED 5/6 antes; a falha era do oráculo do teste, corrigida antes do código)
- **T2 replay/409**: duas submissões iguais → um evento (replay idempotente por UUID+hash); mesmo UUID com payload diferente → conflito_hash 409, nada sobrescrito.
- **T3 retificar 6→5,8**: evento NOVO (EV-002) com retifica=EV-001 e motivo; líquido eficaz 5,8 (retificação SUBSTITUI o valor do alvo, não soma por si); original permanece no histórico (append-only).
- **T4 timeout**: consulta por UUID encontra o registro; repetir a mesma retificação → replay (nenhum evento novo).
- **T5 anulação**: quantidade 0 COM motivo registra (anula o efeito); 0 sem motivo nega; durante envio/incerto → 409 estado_congelado (dados do POST não mudam).
- **E4**: OP ou versão incompatível nega (retificação anulada).
- **E1**: ponto fora da sessão nega sem pistas; OP cancelada nega.

## Entrega
- **Contrato** src/lib/pcp/retificacao.ts (hashRetificacao, buscarEventoPorUUID, retificarComGuardas).
- **Card visível** na tela /apontamentos com os oráculos em exibição.
- Skip v0.0.137, produção ref 1bd6731 provada (lastPublishedRef).

## Teste humano (pendente)
- Login na produção → Apontamentos → card "Retificações sem duplicar eventos — oráculos da SPEC-2-003 (0096ab26)": retificar 6→5,8 "registrado" com líquido eficaz 5,8; repetição "replay"; mesmo UUID/payload diferente "conflito_hash"; anulação 0 com motivo "registrado"; durante envio "409 estado_congelado"; OP/versão incompatível "negado"; consulta por UUID "encontrado".
