# Evidência — Task 8bb4ef77: Levar a sugestão somente para rascunho (SPEC-2-006, CA-S3/T7, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (c44c11da aprovada 09:57)
- **Versões Skip**: 0.0.94 (contrato+testes, QA ok) → **0.0.95** (aceitar→rascunho na tela /sugestoes, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.95, ref c88b1b1** (13:05 UTC; status: lastPublishedRef = c88b1b1 = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/rascunho.ts`: aceitarSugestao (sem editar_programacao → negado 403 sem pistas e zero rascunho — T7a; sugestão bloqueada → negado; rascunho criado com publicado=false e pedido_compra_enviado=false — T7b; replay idempotente não duplica; sugestão alterada → conflito 409 — T7c), publicarRascunho (gate: exige editar_programacao; acima da capacidade negado — oráculo T4; publicação real por área é a task 16b8a592).
2. **Tela** `/sugestoes` atualizada: botão "Aceitar → rascunho" ativo (demo com a conta do owner, que tem editar_programacao na matriz v1.2); tabela de rascunhos criados com as colunas "Publicado: não (gate mantido)" e "Compra enviada: não (gate mantido)"; mensagem de resultado por card.
3. **Testes TDD** `tests/pcp/spec-2-006-rascunho.test.mjs`: 6 testes (T7a/T7b/T7c + bloqueada + gate de publicação + compra não envia pedido).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.95, ref c88b1b1) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **6/6 pass** — T7a: conta de consulta → negado, zero rascunho; T7b: rascunho com publicado=false/pedido_compra_enviado=false; T7c: replay não duplica + sugestão alterada → 409; bloqueada → negado; publicar 50 com capacidade 30 → negado, sem ação → negado, capacidade 60 → gate_ok; compra aceita → pedido_compra_enviado=false |
| Correção em ciclo | 1ª rodada 5/6: T7c expôs replay falso quando a sugestão mudava (hash de rascunho não comparava o conteúdo atual) — corrigido: replay exige hash_sugestao E hash_conteudo atual; re-run 6/6 |
| Publicação | skip_project_publish → publishedRef **c88b1b1** (13:05:10Z); status confirma lastPublishedRef=c88b1b1=versionHash |
| Isolamento | fixtures sintéticas; nenhuma chamada de rede |

## Observação de escopo

Publicação real do rascunho por área (CA-P3/T4 completo) é a task 16b8a592, que depende de parâmetros reais (d2a44349). Aqui apenas o gate é provado.

## Teste humano — roteiro (com a sua conta — área painel)

1. Menu **Sugestões**: os 7 cards continuam lá; agora com botão **"Aceitar → rascunho"**.
2. Aceitar o card T1 (50 UN) → mensagem "Rascunho criado ... NÃO publica e NÃO envia compra" + tabela de rascunhos com gates mantidos.
3. Aceitar de novo o mesmo card → "Repetição ignorada" (não duplica).
4. Aceitar um card bloqueado (T6/OLEO) → botão desabilitado.
5. Confirmar que as outras telas continuam funcionando.

Estado da task: no ar, aguardando teste.
