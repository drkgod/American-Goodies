# Changelog operacional

## 2026-10-16

- 2026-10-16 · [MCC/ETHOS] · **Task 87e4af63 CONCLUÍDA** (teste humano aprovado pelo owner 11:18 BRT: "testei e aprovado"). fase.md [x] com disposição (commit cdfd9579; releitura do servidor prova blob fafb1bc7 = reconstrução exata, 29 UUIDs); STATUS 15/29; **Fase 2: 15/29 concluídas — todas as tasks de construção (recorte sintético/mock) fechadas.** Ciclo contínuo sem task elegível restante: as 14 abertas dependem de ação do cliente (cadastro Omie 4e0fcf1c), dados do PCP (CL-006/d2a44349), acesso nominal/pontos ou autorização específica do caso real.
- 2026-10-16 · [MCC/ETHOS] · **Task 87e4af63 (reprogramar sem perder os apontamentos, SPEC-2-002 CA-P4/T4, recorte sintético) implementada e publicada**: contrato reprogramacao.ts (transfere só o saldo não iniciado com motivo/versão esperada; origem conserva realizado, saldo executável 0 e referência histórica; demanda executável conta só no destino; replay idempotente verificado antes do guard de saldo; versão divergente → 409 sem transferência parcial; capacidade do destino validada antes do commit — tudo ou nada; sincronizando/resultado_incerto/sincronizada negam; exige editar_programacao), card "Reprogramação parcial" na tela /planejamento (OP 100/realizado 40/saldo 60, badge de demanda, tabela de vínculos) e TDD 8/8 (1ª rodada 7/8: T4c expôs replay bloqueado pelo guard de saldo — ordem corrigida). Skip v0.0.97→0.0.98; **produção v0.0.98 (ref b216eee, 13:51 UTC) provada** (lastPublishedRef=versionHash). Evidência: 05_entregas/fase-2/spec-2-002/evidencia-87e4af63.md (commit ef9c4f2c). fase.md [/] durante implementação (06349050, blob 4bc06de1 provado).
- 2026-10-16 · [MCC/ETHOS] · **Task 4e9a1d0e CONCLUÍDA** (aceite 10:46 BRT). fase.md [x] (48e55b4a; blob 7b8b8c19 provado); STATUS 14/29. Provas de recuperação (O2/O3/O4) + revalidação de hash no envio; v0.0.96 (ref 4f34817).
- 2026-10-16 · [MCC/ETHOS] · **Task 8bb4ef77 CONCLUÍDA** (aceite 10:42 BRT). fase.md [x] (946c3ad6); STATUS 13/29. Aceitar→rascunho com gates mantidos; v0.0.95 (ref c88b1b1).
- 2026-10-16 · [MCC/ETHOS] · **Task c44c11da CONCLUÍDA** (aceite 09:57 BRT). fase.md [x] (0a0e51ad; blob dafa20a8 provado); STATUS 12/29. Fila de envio mock; v0.0.93 (ref ac980b6).
- 2026-10-16 · [MCC/ETHOS] · **Task 0baec76e CONCLUÍDA** (aceite 09:50 BRT). fase.md [x] (51a49c2f; blob 2de5713f provado); STATUS 11/29. Sugestões com memória de cálculo; v0.0.91 (ref e7bfa2f).
- 2026-10-16 · [MCC/ETHOS] · **Task 556da315 CONCLUÍDA** (aceite 09:19 BRT). fase.md [x] (bd132598; blob f6db21cc provado); STATUS 10/29. Duas telas de conferência com acesso de demonstração; v0.0.89 (ref 9396881).
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
