# Changelog operacional

## 2026-10-16

- 2026-10-16 · [MCC/ETHOS] · **Task c44c11da CONCLUÍDA** (teste humano aprovado pelo owner 09:57 BRT: "testei e aprovado"). fase.md [x] com disposição (commit 0a0e51ad; releitura do servidor prova blob dafa20a8 = reconstrução exata, 29 UUIDs); STATUS 12/29; **Fase 2: 12/29 concluídas — todas as tasks de construção das SPECs 004–006 fechadas.** Restantes: subtasks de dados reais/uso real, contrato Omie (a2a4ccf1), provas de recuperação (4e9a1d0e), caso real autorizado (6e38e5a3), rascunho de sugestão (8bb4ef77) e validação integrada (0d876150).
- 2026-10-16 · [MCC/ETHOS] · **Task c44c11da (fila de envio com simulação, SPEC-2-005 CA-O1/O3/O4, recorte MOCK) implementada e publicada**: contrato fila-omie.ts (estados preparada→autorizada→enviando→confirmada/resultado_incerto/bloqueada; sem aprovação zero POST; payload alterado invalida aprovação; lease de trabalhador único; resposta perdida → incerto; consulta conclusiva confirma SEM novo POST; inconclusiva nunca habilita retry; qtd 0 bloqueada com pendência), adapter MOCK (zero rede) e tela /consolidacoes (6 cenários T1/T1b/T2/T3/T4/T6 com badge de estado + contador de POSTs). TDD 7/7 (correção: anotações TS não transpiladas em .mjs local). Skip v0.0.92→0.0.93; **produção v0.0.93 (ref ac980b6, 12:54 UTC) provada** (lastPublishedRef=versionHash). Evidência: 05_entregas/fase-2/spec-2-005/evidencia-c44c11da.md (commit 1aad0b04). fase.md [/] durante implementação (8c0c8ad4, blob 57395b8c provado).
- 2026-10-16 · [MCC/ETHOS] · **Task 0baec76e CONCLUÍDA** (aceite 09:50 BRT). fase.md [x] (51a49c2f; blob 2de5713f provado); STATUS 11/29. Sugestões com memória de cálculo (baseline90-v1 proposto) publicadas v0.0.91 (ref e7bfa2f).
- 2026-10-16 · [MCC/ETHOS] · **Task 556da315 CONCLUÍDA** (aceite 09:19 BRT). fase.md [x] (bd132598; blob f6db21cc provado); STATUS 10/29. Duas telas de conferência com acesso de demonstração (flag DEMO_CONFERENCIA, a remover na d77447ab).
- 2026-10-16 · [MCC/ETHOS] · **BLOCO CONCLUÍDO — 3 tasks com teste humano aprovado pelo owner (09:02 BRT: "testei e aprovado")**: a6bf06fb (adendos D5), 3cd404e5 (calendário e OP digital) e be180fc1 (tela de apontamentos). fase.md [x] nas três (0bc58313; blob 3ebafdff provado); STATUS 9/29.
- 2026-10-16 · [MCC/ETHOS] · Plugin adapta-cliente atualizado 0.7.1→0.8.0 (cron de 48h + manual; testes 28/28): ciclo contínuo, perguntas juntas com recomendação, teste do cliente nos momentos certos, GitHub 1 commit por parada, estado v3.

## 2026-10-15

- 2026-10-15 · [MCC/ETHOS] · **Task e57df8ff CONCLUÍDA** (aceite 15:39 BRT): visão de qualidade dos dados; produção v0.0.81 (ref 4d45315); STATUS 6/29; aprendizado skip_file_write no controle.md (fcb3d00d).
- 2026-10-15 · [MCC/ETHOS] · Task 69ffd20a CONCLUÍDA (aceite 14:08): CA-A4 fechado 3/3; STATUS 5/29.

## 2026-10-08

- 2026-10-08 · [MCC/ETHOS] · **FASE 1 CONCLUÍDA E VALIDADA — 18/18 (100%)**: aceite "validado" 18:23; produção no ar (0.0.59→0.0.61); regressão R1–R8 8/8; ensaio de UI aprovado.

## 2026-10-01

- 2026-10-01 · [MCC/ETHOS] · **SPEC-1-000 CONCLUÍDA** (3/3): base no Skip; pacote F1 gerado; repositório criado.

## 2026-10-09

- Consultor autorizou encerrar F1 no recorte homologado e levar pendências à F2. Liberado pacote F2: 7 SPECs, 29 tasks/UUIDs reais.

## 2026-10-13 — revisão documental publicada

- Revisadas 7 SPECs e 29 tasks; contratos/guardas/TDD explicitados; recuperação antes do envio.

## 2026-10-14

- 2026-10-14 · [MCC/ETHOS] · **Task 51356fad (CL-003) CONCLUÍDA**: matriz nominal v1.2 (aceite 12:02 + ajuste 12:04); fase.md [x] (2df11aa2).
- 2026-10-14 · [MCC/ETHOS] · **Task 49327a88 CONCLUÍDA** (aceite ~16:35): 21 contas reais com troca obrigatória; produção v0.0.77 (ref 6e05dac); fase.md [x] (37b4bf88, blob f41330cc).
- 2026-10-14 · [MCC/ETHOS] · Rotação da senha inicial (plano B): novo valor no cofre; migrations 0022–0025.
- 2026-10-14 · [MCC/ETHOS] · **Tasks 3def6d06 e 45dc0e7d CONCLUÍDAS** (aceites 17:57 e 18:28): duplicatas da base e das telas conciliadas; STATUS 4/29.
