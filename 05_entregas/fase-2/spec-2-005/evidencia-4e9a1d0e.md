# Evidência — Task 4e9a1d0e: Provar a recuperação antes do envio real (SPEC-2-005, CA-O2/O3/O4)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (8bb4ef77 aprovada 10:42)
- **Versões Skip**: 0.0.96 (provas + revalidação de hash, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.96, ref 4f34817** (13:45 UTC; status: lastPublishedRef = 4f34817 = versionHash)

## Escopo entregue (provas sobre a fila MOCK — NENHUM POST real)

1. **Contrato** `src/lib/pcp/recuperacao-omie.ts`: enviarComGuardaAcao (O2 — revogação de executar_sync_omie antes do envio → 403, tentativa cancelada SEM POST; revalidação imediatamente antes da chamada), retomarAposReinicio (O4 — tentativa enviando/incerto é potencialmente enviada: SOMENTE consulta; conclusiva confirma com POST total 1; inconclusiva mantém incerto; nunca autoriza novo POST), tentarRetificarDurante (O3 — durante enviando/resultado_incerto → 409 com hash 100 preservado; antes da aquisição com payload divergente → aprovação invalidada e zero POST), negarCrudDireto (transversal — PATCH/DELETE direto em transações/hashes aprovados → 403 mesmo para perfil administrativo funcional; manutenção privilegiada exige autorização/backup/auditoria separados).
2. **Correção de segurança na fila** (`fila-omie.ts`): enviarComAquisicao agora REVALIDA o hash do payload contra o hash aprovado antes de qualquer mutação (O2/T1) — payload divergente → negado, zero POST. A 1ª rodada do TDD (7/8) expôs essa lacuna: o teste O3-antes provou que um payload 99 era enviado com hash de 100. Corrigido e re-provado.
3. **Testes TDD** `tests/pcp/spec-2-005-recuperacao.test.mjs`: 8 testes (O2 revogação + controle positivo; O4 reinício conclusivo/inconclusivo; O3 congelamento enviando/incerto + antes da aquisição com zero POST; admin 403).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.96, ref 4f34817) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **8/8 pass** — O2: revogada → 403/zero POST, vigente → confirmada; O4: queda → incerto → reinício consulta → confirmada com POST total 1 (novoPostAutorizado=false), inconclusiva → incerto preservado; O3: retificar 99 durante enviando/incerto → 409 com hash 100 intacto, antes da aquisição → invalidada e zero POST; admin: PATCH/DELETE → 403 |
| Correção em ciclo | 1ª rodada 7/8: TDD expôs que o envio não revalidava o hash do payload — corrigido na fila (revalidação O2/T1) e re-provado 8/8 |
| Publicação | skip_project_publish → publishedRef **4f34817** (13:45:23Z); status confirma lastPublishedRef=4f34817=versionHash |
| Isolamento | fixtures sintéticas; zero chamada de rede |

## Observação de escopo

Com esta task, **todos os casos de revogação/reinício/lease/corrida/timeout da SPEC-2-005 estão provados no mock** — pré-condição do primeiro envio real (6e38e5a3) cumprida no recorte. O caso real (T5) segue exigindo: contrato da conta (a2a4ccf1), produto/ficha/local reais (4e0fcf1c) e autorização específica do caso.

## Teste humano — roteiro (com a sua conta — área painel)

Esta task não tem tela nova: as provas são de contrato (TDD 8/8) e o comportamento visível é o endurecimento da fila na tela **Consolidações** (cenários T1/T2/T3/T4/T6 continuam passando, agora com revalidação de hash).

1. Menu **Consolidações**: os 6 cenários continuam com os mesmos badges e contadores de POST.
2. Confirmar que as outras telas continuam funcionando.
3. (Opcional, para o registro) As provas detalhadas estão no arquivo de testes e na tabela acima.

Estado da task: no ar, aguardando teste.
