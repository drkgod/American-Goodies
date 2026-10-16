# Changelog operacional

## 2026-10-16

- 2026-10-16 · [MCC/ETHOS] · **Task 0baec76e CONCLUÍDA** (teste humano aprovado pelo owner 09:50 BRT: "testei e aprovado"). fase.md [x] com disposição (commit 51a49c2f; releitura do servidor prova blob 2de5713f = reconstrução exata, 29 UUIDs); STATUS 11/29; **Fase 2: 11/29 concluídas.** Ciclo contínuo segue para c44c11da (fila de envio com simulação, recorte mock).
- 2026-10-16 · [MCC/ETHOS] · **Task 0baec76e (sugestões com memória de cálculo, SPEC-2-006 CA-S1/S2, recorte sintético) implementada e publicada**: contrato sugestao.ts (método PROPOSTO baseline90-v1: projeção = média×horizonte×(1+margem); demanda_alvo = max(projeção, firmes) — NUNCA soma; necessidade = max(0, alvo+mínimo−saldo−futura); sugestão = 0 se necessidade 0, senão teto(max(necessidade, lote_mínimo)/múltiplo)×múltiplo; excedente declarado; compra: falta = max(0, consumo+mínimo−saldo−confirmadas), recebimento desconhecido bloqueia (não vira 0), fixture 4,8→6 KG; memória de cálculo reproduzível com passos nomeados; faltante → null + pendências), tela /sugestoes (7 cards sintéticos T1/T2/T4/T6 + 3 de compra, memória expansível, Aceitar desabilitado) e TDD 12/12 (1ª rodada 11/12: T3 expôs NaN propagando — corrigido: cálculo interrompido quando há pendência). Skip v0.0.90→0.0.91; **produção v0.0.91 (ref e7bfa2f, 12:23 UTC) provada** (lastPublishedRef=versionHash). Evidência: 05_entregas/fase-2/spec-2-006/evidencia-0baec76e.md (commit b87a9778). fase.md [/] durante implementação (f3b14af7, blob 493b90c6 provado).
- 2026-10-16 · [MCC/ETHOS] · **Task 556da315 CONCLUÍDA** (teste humano aprovado pelo owner 09:19 BRT: "testei e aprovado" — tela /conferencias em modo demonstração com a conta do owner). fase.md [x] com disposição (commit bd132598; releitura do servidor prova blob f6db21cc = reconstrução exata, 29 UUIDs); STATUS 10/29. Acesso de demonstração (flag DEMO_CONFERENCIA) marcado para remoção na task d77447ab (uso real volta a conferir_expedicao, restrito a Angela/Cristiano/Kevin).
- 2026-10-16 · [MCC/ETHOS] · **Task 556da315 (duas telas de conferência, SPEC-2-004 CA-C1/C2, recorte sintético) implementada e publicada**: contrato conferencia.ts (câmara sem expedição eficaz bloqueada; ponto sem acesso nega; conferência 0 exige motivo; ausência NUNCA vira 0; replay UUID+hash idempotente, hash diferente = 409; igualdade exata libera fila revisável sem transação/envio), tela /conferencias (fila com 4 quantidades/deltas/pendências) e TDD 8/8. Impedimento de teste resolvido: rota/menu em modo demonstração (área painel) com botões por ação real. Skip v0.0.86→0.0.89; produção v0.0.89 (ref 9396881) provada. Evidência: evidencia-556da315.md (commits 59d49359→96661d32→003e85ac).
- 2026-10-16 · [MCC/ETHOS] · **BLOCO CONCLUÍDO — 3 tasks com teste humano aprovado pelo owner (09:02 BRT: "testei e aprovado")**: a6bf06fb (adendos D5 — SPEC-2-001 fica 100% no recorte do executor), 3cd404e5 (calendário e OP digital) e be180fc1 (tela de apontamentos). fase.md [x] nas três com disposição (commit 0bc58313; blob 3ebafdff provado); STATUS 9/29.
- 2026-10-16 · [MCC/ETHOS] · Plugin adapta-cliente atualizado 0.7.1→0.8.0 (cron de 48h + manual; testes 28/28): ciclo contínuo, perguntas juntas com recomendação, teste do cliente nos momentos certos, GitHub 1 commit por parada, estado v3.

## 2026-10-15

- 2026-10-15 · [MCC/ETHOS] · **Task e57df8ff CONCLUÍDA** (teste humano aprovado pelo owner 15:39 BRT: "testei e aprovado" — tela /qualidade na produção v0.0.81). fase.md [x] com disposição (commit dcf7a79e; blob db3f7392 provado); STATUS 6/29 (c1f931f6); estado concluida (6425f065); aprendizado no controle.md (fcb3d00d). Produção v0.0.81 (ref 4d45315).
- 2026-10-15 · [MCC/ETHOS] · **Task e57df8ff implementada** (aguardando teste): contrato+fixtures qualidade.ts, tela /qualidade, TDD 12/12; Skip v0.0.80–0.0.81 (1ª apply v0.0.79 falhou no build — arquivo não persistido, corrigido e documentado).
- 2026-10-15 · [MCC/ETHOS] · Task a6bf06fb (duplicata da conferência, CA-A4) analisada e autorizada; recorte documental; conciliação registrada (f0b54e82, blob 4dc87fcb).
- 2026-10-15 · [MCC/ETHOS] · **Task 69ffd20a CONCLUÍDA** (aceite 14:08); CA-A4 fechado 3/3; estado concluida (6162259b); STATUS 5/29 (87c3fd38).

## 2026-10-08

- 2026-10-08 · [MCC/ETHOS] · **PUBLICAÇÃO EM PRODUÇÃO — Fase 1 no ar**: https://mcc-automacao-fabrica-98125.goskip.app (versões 0.0.59→0.0.61; ref 4306849). VITE_POCKETBASE_URL mantido com backend gerenciado. Verificado em navegador real: login ok, painel consulta ativa (M043055 = 53 UN).
- 2026-10-08 · [MCC/ETHOS] · **FASE 1 CONCLUÍDA E VALIDADA — 18/18 (100%)**: aceite final do owner ("validado", 18:23) após regressão integrada R1–R8 8/8 e ensaio de UI. Evidência consolidada: 05_entregas/fase-1/spec-1-005/relatorio-validacao-integrada.md.
- 2026-10-08 · [MCC/ETHOS] · SPEC-1-005 COMPLETA (3/3): painel diário por área, lote antigo com aviso, validação integrada (0.0.54–0.0.59).
- 2026-10-08 · [MCC/ETHOS] · SPEC-1-004 COMPLETA (3/3, aceite 17:10): catálogo sobre snapshots, área catalogo, estados explícitos, divergência real reconciliada (0.0.48–0.0.53).
- 2026-10-08 · [MCC/ETHOS] · SPEC-1-003 COMPLETA (3/3, aceite 16:37): canal Nuvemshop 3344, lote oficial Omie 5393/5393, 44 vínculos, duplicados 0 (0.0.39–0.0.47).
- 2026-10-08 · [MCC/ETHOS] · SPEC-1-002 CONCLUÍDA (validação 14:20): leitura real Omie, DEFECT-1, BUG-2 goja.
- 2026-10-08 · [MCC/ETHOS] · SPEC-1-001 CONCLUÍDA (3/3): login nativo, proteção por área, revogação em sessão, logout; organograma CL-003 transcrito.
- 2026-10-08 · [MCC/ETHOS] · CL-001/CL-002 recebidos: credenciais Omie/Nuvemshop como secrets (nunca em repo).

## 2026-10-01

- 2026-10-01 · [MCC/ETHOS] · **SPEC-1-000 CONCLUÍDA** (3/3): base no Skip, fundamento conferido antes das conexões; leva de acesso liberada. Pacote F1 gerado (6 SPECs, 18 tasks); ambiente validado; repositório criado.

## 2026-10-09

- Consultor autorizou encerrar F1 no recorte homologado e levar pendências à F2. Liberado pacote F2: 7 SPECs, 29 tasks/UUIDs reais; revisões concluídas; nenhuma task executada na liberação.

## 2026-10-13 — revisão documental publicada

- Revisadas 7 SPECs e 29 tasks; contratos/guardas/TDD explicitados; recuperação antes do envio; nenhum código executado.

## 2026-10-14

- 2026-10-14 · [MCC/ETHOS] · **Task 51356fad (CL-003) CONCLUÍDA**: matriz nominal v1.2 registrada e aprovada (aceite 12:02 + ajuste 12:04); fase.md [x] (2df11aa2); incidente de changelog corrompido reparado (330f6141).
- 2026-10-14 · [MCC/ETHOS] · **Task 49327a88 CONCLUÍDA** (aceite ~16:35): 21 contas reais ativas com troca obrigatória; provas T1–T12; produção v0.0.77 (ref 6e05dac); fase.md [x] com reparo de gravação (37b4bf88, blob f41330cc).
- 2026-10-14 · [MCC/ETHOS] · Rotação da senha inicial (plano B): novo valor no cofre PCP_INITIAL_PASSWORDS; migrations 0022–0025; provas de login 200/400.
- 2026-10-14 · [MCC/ETHOS] · **Task 3def6d06 CONCLUÍDA** (aceite 17:57): duplicata da base conciliada (a45836d3, blob b28fff14); STATUS 3/29.
- 2026-10-14 · [MCC/ETHOS] · **Task 45dc0e7d CONCLUÍDA** (aceite 18:28): duplicata das telas conciliada (3f04751a, blob d937d921); STATUS 4/29.
