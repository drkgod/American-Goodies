# Evidência — Task 0baec76e: Construir as sugestões com memória de cálculo (SPEC-2-006, CA-S1/S2, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (556da315 aprovada 09:19)
- **Versões Skip**: 0.0.90 (contrato+testes, QA ok) → **0.0.91** (tela /sugestoes, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.91, ref e7bfa2f** (12:23 UTC; status: lastPublishedRef = e7bfa2f = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/sugestao.ts` (método PROPOSTO baseline90-v1, não regra aprovada):
   - Produção: media_diaria = vendas90/90; projeção = média×horizonte×(1+margem); **demanda_alvo = max(projeção, firmes) — NUNCA soma**; necessidade = max(0, alvo+mínimo−saldo−produção futura); sugestão = 0 se necessidade 0, senão teto(max(necessidade, lote_mínimo)/múltiplo)×múltiplo; excedente declarado quando arredondado > capacidade.
   - Compra: falta = max(0, consumo+mínimo−saldo−confirmadas_a_receber); **recebimento desconhecido bloqueia (não vira 0)**; fixture positiva 4,8 → 6 KG.
   - **Memória de cálculo reproduzível**: fórmula, versão, entradas e passos nomeados; faltante → quantidade null + pendências (nunca default); saldo negativo sinalizado.
2. **Tela** `/sugestoes` (área painel): 7 cards sintéticos (T1/T2/T4/T6 + 3 de compra) com badge de quantidade ou "Bloqueada (null)", memória expansível por card e botão Aceitar DESABILITADO (aceitar→rascunho é a task 8bb4ef77).
3. **Testes TDD** `tests/pcp/spec-2-006-sugestao.test.mjs`: 12 testes (oráculos T1/T2/T3/T4/T6 da SPEC; T5 fluxo integrado e T7 permissão ficam nas tasks 0d876150 e 8bb4ef77).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.91, ref e7bfa2f) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **12/12 pass** — T1: 50 UN com memória exata (média 10, projeção 70, alvo 70, necessidade 50); T2: firmes 80 → alvo 80/necessidade 60 (não soma 150); T6a: firmeza ausente → null/bloqueada; T3: entrada não finita → bloqueada, item válido preservado; T4: 51→60 com excedente 10; necessidade 0 → 0 sem lote mínimo; compra 4,8→6 KG; falta 1 com mínimo 5 → 6 KG; falta 0 → 0; recebimento desconhecido → bloqueada; memória determinística |
| Correção em ciclo | 1ª rodada 11/12: T3 expôs NaN propagando (média NaN) — corrigido: cálculo interrompido quando pendência existe (passos null); re-run 12/12 |
| Publicação | skip_project_publish → publishedRef **e7bfa2f** (12:23:40Z); status confirma lastPublishedRef=e7bfa2f=versionHash |
| Isolamento | fixtures sintéticas; nenhuma chamada de rede |

## Observação de escopo

- Aprovação do método (CL-006) e cálculo com dados reais: task 2ea1e7ab (gate interno antes de qualquer cálculo real).
- Aceitar sugestão → rascunho (CA-S3/T7): task 8bb4ef77.
- Fluxo integrado (CA-S4/T5): task 0d876150.

## Teste humano — roteiro (com a sua conta — área painel)

1. Menu **Sugestões** (novo item): 7 cards sintéticos.
2. Card T1 mostra badge **50 UN**; T2 mostra **60 UN** (firme 80 vence projeção — máximo, não soma); T4 mostra **60 UN** com excedente 10 na memória.
3. Card T6 e OLEO mostram **Bloqueada (null)** — faltante nunca vira default/0.
4. Abrir **Ver memória de cálculo** em qualquer card: passos nomeados com fórmula (média → projeção → alvo → necessidade → arredondado → excedente).
5. Botão **Aceitar desabilitado** com título explicativo (próxima task).
6. Confirmar que as outras telas continuam funcionando.

Estado da task: no ar, aguardando teste.
