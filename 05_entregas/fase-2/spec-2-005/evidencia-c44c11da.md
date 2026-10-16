# Evidência — Task c44c11da: Construir a fila de envio com simulação (SPEC-2-005, CA-O1/O3/O4, recorte MOCK)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (0baec76e aprovada 09:50)
- **Versões Skip**: 0.0.92 (contrato+testes, QA ok) → **0.0.93** (tela /consolidacoes, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.93, ref ac980b6** (12:54 UTC; status: lastPublishedRef = ac980b6 = versionHash)

## Escopo entregue (recorte MOCK — NENHUM POST real ao ERP)

1. **Contrato** `src/lib/pcp/fila-omie.ts`: estados da transação (preparada→autorizada→enviando→confirmada/resultado_incerto/falhou_sem_efeito/bloqueada); prepararTransacao (quantidade ≤ 0 → bloqueada com pendência explícita, zero POST — T6); autorizarPayload (hash do payload aprovado; payload alterado → bloqueada com aprovação invalidada — T1b); enviarComAquisicao (só autorizada envia; sem lease → negado — trabalhador único O3/T2; resposta cortada → resultado_incerto — O4/T3); reconciliarPorConsulta (consulta conclusiva → confirmada SEM novo POST; inconclusiva → mantém incerto, novoPostAutorizado sempre false — O4/T3/T4; lease vencido não libera POST).
2. **Adapter MOCK** — comportamento injetado pelos testes; nenhuma chamada de rede; mutantes reais desligados (O1).
3. **Tela** `/consolidacoes` (área painel): 6 cenários mock (T1, T1b, T2, T3, T4, T6) com badge de estado final + contador de POSTs e passos expansíveis. Banner de demonstração.
4. **Testes TDD** `tests/pcp/spec-2-005-fila.test.mjs`: 7 testes (oráculos T1/T2/T3/T4/T6 da SPEC; T5 caso real fica na task 6e38e5a3).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.93, ref ac980b6) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **7/7 pass** — T1a: sem aprovação → negado, zero POST; T1b: payload 99 vs hash 100 → bloqueada/invalidada; T2: worker 1 confirmada + worker 2 negado (lease), 1 POST; T3: resposta perdida → incerto → consulta 100 → confirmada, 1 POST, sem reenvio; T4: consulta inconclusiva → incerto preservado, novoPostAutorizado=false (também com lease vencido); T6: qtd 0 → bloqueada com pendência, zero POST |
| Correção em ciclo | .mjs local não transpila anotações TS (`unknown[]`) — removidas as anotações no teste; 7/7 após correção |
| Publicação | skip_project_publish → publishedRef **ac980b6** (12:54:33Z); status confirma lastPublishedRef=ac980b6=versionHash |
| Isolamento | fixtures sintéticas (OP-S-2-005); zero chamada de rede |

## Observação de escopo

- Contrato real da conta Omie (consulta/inclusão/conclusão): task a2a4ccf1.
- Provas de revogação/reinício/lease/corrida/timeout antes do primeiro envio real: task 4e9a1d0e.
- Caso real autorizado (T5): task 6e38e5a3 — exige autorização específica do caso.

## Teste humano — roteiro (com a sua conta — área painel)

1. Menu **Consolidações** (novo item): 6 cenários mock com badge de estado e contador "POSTs".
2. T1 e T6: badge bloqueada/preparada com **POSTs: 0** (mutante nunca executa sem aprovação ou com qtd 0).
3. T2: badge **confirmada** com **POSTs: 1** (segundo worker negado pelo lease).
4. T3: **resultado_incerto** → consulta confirma → **confirmada** com **POSTs: 1** (nunca reenvia).
5. T4: **resultado_incerto** preservado com pendência "sem retry automático".
6. **Ver passos** em qualquer cenário mostra a sequência com estado e decisão.
7. Confirmar que as outras telas continuam funcionando.

Estado da task: no ar, aguardando teste.
