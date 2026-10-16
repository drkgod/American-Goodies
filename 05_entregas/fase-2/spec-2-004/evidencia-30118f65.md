# Evidência — Task 30118f65: Revisar divergências e invalidar aprovações antigas (SPEC-2-004, CA-C3/C4/T4, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (87e4af63 aprovada 11:18; "Continuar" 11:22)
- **Versões Skip**: 0.0.99 (contrato+testes, QA ok) → **0.0.100** (revisão do PCP na tela /conferencias, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.100, ref 14374c9** (14:26 UTC; status: lastPublishedRef = 14374c9 = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/revisao-consolidacao.ts`: aprovarConsolidacao (exige aprovar_consolidacao → 403; quantidade final finita ≥0; motivo obrigatório; fila revisável exigida — bloqueada nega; registra motivo/quantidade final/hashes de eventos e conferências; **igualdade 0=0 registra pendência quantidade_final_zero e NÃO libera transação no Omie**), invalidarPorNovaProjecao (conferência/retificação nova muda o hash → aprovação anterior INVALIDADA atomicamente; mesma hash → permanece válida; originais preservados), retificarAntesDaAquisicao (corrida: retificação ganha antes da aquisição → vale, zero POST da quantidade antiga; durante sincronizando → 409).
2. **Tela** `/conferencias` atualizada: card "Revisão do PCP (demonstração — oráculo T4)" com quantidade final, motivo, badge do estado da aprovação (ativa/invalidada), botões "Aprovar consolidação" (só com fila revisável) e "Simular nova conferência (invalida)".
3. **Testes TDD** `tests/pcp/spec-2-004-revisao.test.mjs`: 6 testes (T4 aprovação 96 com hashes; fila bloqueada nega; invalidação atômica por hash; 0=0 com pendência; 403/quantidade negativa/sem motivo; corrida antes da aquisição/durante sincronizando).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.100, ref 14374c9) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **6/6 pass** — T4: final 96 com motivo e hashes, autorizada; fila bloqueada → negada; C4: hash novo → INVALIDADA atômica, mesma hash → válida; 0=0 → pendência quantidade_final_zero; sem ação → 403, qtd negativa → negado, sem motivo → negado; corrida: retificação antes da aquisição vale (zero POST antigo), durante sincronizando → 409 |
| Correção em ciclo | anotações TS no .mjs local (conhecido) — removidas antes do run |
| Publicação | skip_project_publish → publishedRef **14374c9** (14:26:51Z); status confirma lastPublishedRef=14374c9=versionHash |
| Isolamento | fixtures sintéticas; nenhuma chamada de rede |

## Observação de escopo

Envio real da consolidação autorizada é o gate da SPEC-2-005 (caso real 6e38e5a3, com autorização específica). Aqui a aprovação, a invalidação e a corrida são provadas com fixture.

## Teste humano — roteiro (com a sua conta — área painel)

1. Menu **Conferências**: novo card "Revisão do PCP" entre a fila e a tabela de conferências.
2. Com a fila revisável (registrar conferências até coincidir: expedição 100 e câmara 100) → **Aprovar consolidação** com final 96 e motivo → badge "Aprovação ativa" + mensagem com hashes.
3. **Simular nova conferência (invalida)** → badge "Aprovação invalidada" + mensagem de invalidação atômica.
4. Aprovar com final **0** → mensagem com PENDÊNCIA quantidade_final_zero (não libera Omie).
5. Fila bloqueada (divergência) → botão Aprovar desabilitado.
6. Confirmar que as outras telas continuam funcionando.

Estado da task: no ar, aguardando teste.
