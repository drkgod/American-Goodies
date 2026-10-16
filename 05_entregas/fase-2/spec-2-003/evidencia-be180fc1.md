# Evidência — Task be180fc1: Construir a tela de apontamentos (SPEC-2-003, CA-E1/E2/E3/E4, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo ("continue", 08:40 BRT)
- **Versões Skip**: 0.0.84 (contrato+testes, QA ok) → **0.0.85** (tela /apontamentos, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.85, ref fe6114f** (11:48 UTC; status: lastPublishedRef = fe6114f = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/apontamento.ts`: registrarEvento (OP cancelada/sincronizando/incerta/sincronizada não recebe evento; ponto sem acesso nega sem pistas; insumo/perda q>0; realizado q>=0 com motivo se 0; unidade null bloqueia — nada presumido), hashEvento determinístico (mesmo UUID+hash = replay idempotente; mesmo UUID+hash diferente = conflito 409 sem sobrescrever), consumoLiquido (líquido = retiradas+adicionais−devoluções; previsto = realizado×componente/base_ficha só com ficha compatível; perda declarada SEPARADA, nunca inferida), retificarEvento (evento NOVO com motivo obrigatório e referência ao original; original preservado; líquido passa a usar a quantidade retificada).
2. **Tela** `/apontamentos` (área apontar_producao): registro dos 5 tipos com unidade/ponto, motivo obrigatório para realizado 0, consumo por item com diferença vs previsto e perda separada, tabela de eventos imutáveis com retificação auditável. Banner "Tela de demonstração" permanente.
3. **Testes TDD** `tests/pcp/spec-2-003-apontamento.test.mjs`: 10 testes (T0–T5, oráculos T1–T5 da SPEC).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.85, ref fe6114f) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **10/10 pass** — T1: líquido 6 vs previsto 5 (diferença 1), perda 0,5 separada; T2: replay idempotente + 409; T3a: ponto errado nega; T3b: OP cancelada nega; T3c: unidade null bloqueia; T3d: retificação 6→5,8 preserva original; T4: replay pós-timeout sem novo evento; T5a/b: realizado 0 com motivo ok, sem motivo negado, insumo 0 negado |
| Publicação | skip_project_publish → publishedRef **fe6114f** (11:48:58Z); status confirma lastPublishedRef=fe6114f |
| Isolamento | fixtures sintéticas (OP-S-2-001, ficha 100 UN→5 KG, ponto cozinha); nenhuma chamada de rede |

## Observação de escopo

Ligar eventos à OP publicada REAL e acessos por ponto reais é a task 64ac4f85; retificação com guards de envio é a 0096ab26. Esta task entrega o fundamento sintético (CA-E1/E2/E3/E4 no recorte).

## Teste humano — roteiro (bloco: planejamento + apontamentos)

1. Entrar com conta da área apontar_producao (ex.: arivaldo.missias@mccfranchising.com.br).
2. Menu **Apontamentos**: registrar retirada 6 KG → consumo mostra líquido 6, previsto 5, diferença +1; registrar perda 0,5 → aparece SEPARADA.
3. Registrar realizado 100 UN → previsto passa a 5; realizado 0 sem motivo → negado com explicação.
4. Retificar a retirada 6 → 5,8 com motivo → original preservado na tabela, líquido passa a 5,8.
5. Confirmar que Painel/Catálogo/Qualidade/Planejamento continuam funcionando.

Estado da task: no ar, aguardando teste do bloco.
