# Evidência — Task 87e4af63: Reprogramar sem perder os apontamentos (SPEC-2-002, CA-P4/T4, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (4e9a1d0e aprovada 10:46; "continue" 10:47)
- **Versões Skip**: 0.0.97 (contrato+testes, QA ok) → **0.0.98** (reprogramação na tela /planejamento, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.98, ref b216eee** (13:51 UTC; status: lastPublishedRef = b216eee = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/reprogramacao.ts`: reprogramarSaldo (exige editar_programacao → 403; motivo obrigatório; versão esperada divergente → 409 sem transferência parcial; OP sincronizando/resultado_incerto/sincronizada → negado; saldo 0 → nada a transferir; capacidade do destino validada ANTES do commit — insuficiente → NENHUMA transferência/reserva parcial; replay idempotente antes do guard de saldo — 1ª rodada 7/8 expôs replay bloqueado por saldo 0, ordem corrigida; destino novo com vínculo origem→destino e quantidade transferida; origem conserva realizado, saldo executável 0 e referência histórica), demandaExecutavel (referência histórica da origem NÃO soma demanda; saldo conta só no destino).
2. **Tela** `/planejamento` atualizada: card "Reprogramação parcial (demonstração — oráculo T4)" com OP 100/realizado 40/saldo 60, badge de demanda executável, data de destino, motivo obrigatório, botão "Transferir saldo" e tabela de vínculos.
3. **Testes TDD** `tests/pcp/spec-2-002-reprogramacao.test.mjs`: 8 testes (T4a conservação, T4b demanda, T4c replay, T4d corrida 409, capacidade insuficiente, 403, estados congelados, motivo/saldo).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.98, ref b216eee) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **8/8 pass** — T4a: OP100/realizado40 → transfere 60 uma vez; origem conserva realizado40/saldo 0/histórico 100; destino 60 com vínculo e nova data; T4b: demanda executável 60 só no destino; T4c: replay idempotente sem duplicar; T4d: corrida → 409 sem transferência parcial; capacidade 50 < 60 → negado; conta de consulta → 403; sincronizando/incerto/sincronizada → negado; sem motivo → negado; saldo 0 → nada a transferir |
| Correção em ciclo | 1ª rodada 7/8: T4c expôs replay bloqueado pelo guard de saldo 0 — corrigida a ordem (replay verificado antes); re-run 8/8 |
| Publicação | skip_project_publish → publishedRef **b216eee** (13:51:23Z); status confirma lastPublishedRef=b216eee=versionHash |
| Isolamento | fixtures sintéticas; nenhuma chamada de rede |

## Observação de escopo

Publicação real da nova versão por área (16b8a592) exige publicar_programacao e parâmetros reais (d2a44349) — fora deste recorte. Aqui a transferência e a conservação são provadas com fixture.

## Teste humano — roteiro (com a sua conta — área painel)

1. Menu **Planejamento**: novo card "Reprogramação parcial" no fim da página, com OP 100 / realizado 40 / saldo 60 e badge "Demanda executável: 60".
2. Escolher data de destino e digitar um motivo → **Transferir saldo (60 UN)** → mensagem "Transferido 60 UN para OP-S-2-002-R2 ...; origem conserva realizado 40, saldo executável 0 e referência histórica 100" + badge "Demanda executável: 0" + vínculo na tabela.
3. Clicar de novo → "Replay: transferência já existente — nada duplicado" (botão desabilita com saldo 0).
4. Sem motivo (campo vazio usa motivo de demonstração; para ver o bloqueio, use a tela de rascunho normalmente).
5. Confirmar que rascunho/publicação e as outras telas continuam funcionando.

Estado da task: no ar, aguardando teste.
