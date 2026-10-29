# Changelog operacional

## 2026-10-26

- 2026-10-26 · [consultor] · **Fase 2 fechada e fase 3 única até a validação final (AC-26-01).** Fase 2 com 29 de 29 fechadas: catálogo real (4e0fcf1c), sugestões com dados reais (2ea1e7ab) e envio ao Omie (6e38e5a3) passaram para a fase 3 como tarefas novas; a validação final da fase 2 (0d876150) entra na sessão final da fase 3. Tarefas, SPECs e índice da fase 2 arquivados em 05_entregas/fase-2/. Fase 3 com 18 SPECs (3-001 a 3-018) e 48 tarefas, juntando o que estava nas fases 3, 4 e 5 do escopo; fases 4 e 5 sem tarefas. Um teste só: a sessão de validação final com a equipe (SPEC-3-018), prevista para 03/12/2026. Gravações no Omie (ordem de produção, pedido de compra, pedido de venda) construídas com a chave desligada e simulador; só ligam com a autorização do dono, com as condições no checklist do cliente. Notas de entrada e gravação do recebimento em revisão (CL-PEND-007). Novo AGENTS.md; README, STATUS e estado do executor atualizados. Publicação documental; sem alteração de código, do Skip nem do portal.
- 2026-10-26 · [Rodrigo/consultor] · **Emenda: testes humanos retirados da fase 2.** As 7 SPECs (seção "Teste humano do cliente", regra P5 e checklist), o índice e o fase.md agora dizem que toda task fecha pela prova automática (RED/GREEN/regressão e QA do Skip). Única trava humana mantida: a autorização do dono antes do primeiro envio real ao Omie (6e38e5a3), por gravar no ERP — trava de segurança, não teste. d77447ab fechada pela prova automática (debug TDD 3/3, v0.0.169); 0d876150 (validação final com a equipe) dispensada. Restam 3: 4e0fcf1c (catálogo Omie), 2ea1e7ab (sugestões com dados reais) e 6e38e5a3 (envio real autorizado).

## 2026-10-22

- 2026-10-22 · [MCC/ETHOS] · **Correção v0.0.169 — campo de conferência não puxa valor automático** (pedido do dono: "quando clico no conferir camara ele automaticamente puxa"): o campo de quantidade era compartilhado entre as etapas e mantinha o valor anterior — clicar em "Conferir câmara" registrava o valor da expedição sem digitar. Agora o campo inicia vazio (placeholder "Digite a quantidade conferida"), limpa e foca após cada registro, e o registro sem digitar é negado ("Digite a quantidade conferida antes de registrar — nada é preenchido por padrão"). 1ª aplicação falhou por marcador de conflito órfão do patch (corrupção conhecida do canal); reparado em 6 patches mínimos com releitura provando 0 marcadores e paridade de chaves/parênteses. Skip v0.0.169 (ref 2b39eb6, 22/10 17:50 UTC) publicada e provada; /conferencias 200. Aguardando teste humano.
- 2026-10-22 · [MCC/ETHOS] · **Debug d77447ab (dupla conferência) — bug do dono corrigido e publicado**: dono reportou "mesmo preenchendo correto não aprova" e "botões não mudam de cor". Duas causas reais: (1) a fila de consolidação lia a PRIMEIRA conferência de cada etapa (find()) — conferir 98 depois de 100 nunca mudava a fila; corrigido para a ÚLTIMA (última escrita vence — base do oráculo T4 e da invalidação C4); (2) o gate da aprovação exigia fila revisável, mas a demonstração tem divergência estrutural 100/98 fixa — a aprovação nunca liberava; pela SPEC (oráculo T4) a aprovação É o mecanismo de decisão do PCP sobre a divergência — gate corrigido para exigir só conferências presentes + motivo; a divergência bloqueia só o envio Omie (gate da SPEC-2-005). TDD 3/3 (cenário exato do dono, ausência, fila revisável). Skip v0.0.165 (ref 592f896, 21/10 17:58 UTC) publicada e provada.
- 2026-10-22 · [MCC/ETHOS] · **Feedback visual na /conferencias (pedido do dono)**: botões Conferir expedição/câmara ficam VERDES com a última quantidade vigente ("Conferir expedição: 98 UN") quando há conferência registrada; memó por etapa com a mesma regra da fila. Skip v0.0.167 (ref b591b62, 22/10 15:42 UTC) publicada e provada; /conferencias 200. Aguardando teste humano da consolidação na demonstração (conferir 98/98 → aprovar com final 98 + motivo).

## 2026-10-21

- 2026-10-21 · [MCC/ETHOS] · **BLOCO CONCLUÍDO — 3 tasks com teste humano aprovado pelo owner (10:55 BRT: "testei e aprovado")**: 5d8793fb (reconciliar catálogo, unidades e fichas — piloto real M011001), a2a4ccf1 (comprovar o contrato de produção no Omie — sondas de leitura, guarda CA-O1) e 64ac4f85 (registrar e encerrar a produção por ponto — incrementos, hash de encerramento, 409 estado_congelado). fase.md [x] nas três com aceite nas disposições (commit deste envio); STATUS 21/29; **Fase 2: 21/29 concluídas.** Ciclo contínuo: 0096ab26 elegível (retificações sobre os contratos aceitos); 9318a299/d77447ab aguardam dados reais (cadastro Omie/pontos); 6e38e5a3 e 2ea1e7ab aguardam autorização/decisão do owner.
- 2026-10-20 · [MCC/ETHOS] · **Bloco de 3 tasks implementado e publicado (v0.0.129→v0.0.136)**: 5d8793fb (contrato conciliacao.ts TDD 10/10; defaultUN retirado do sync; card "Piloto real" na /catalogo; v0.0.129 ref f1673e6), a2a4ccf1 (sondas de LEITURA provaram ListarOrdemProducao 1.114 OPs e ConsultarOrdemProducao OP 9858633368 do M011001; contrato-op.ts com guarda CA-O1 TDD 6/6; card na /consolidacoes; v0.0.135 ref 5630477; sonda temporária removida) e 64ac4f85 (ponto.ts: incrementos 40+60=100, encaixotamento 98 independente, previsto 5 KG, encerramento com hash, 409 estado_congelado; TDD 8/8; card na /apontamentos; v0.0.136 ref 9c155d8). Evidências em 05_entregas/fase-2/spec-2-001|003|005/. Aprendizado: AP-2026-10-20-1745 (corrupção do canal de tool-call no create_or_update_file — padrão de cópia local + prova por blob-SHA; controle.md commit 6aa1cfc1).

## 2026-10-19

- 2026-10-19 · [MCC/ETHOS] · **Task d2a44349 CONCLUÍDA** (teste humano aprovado pelo owner 10:28 BRT: "testei e aprovado"). fase.md [x] com disposição (commit dfe5241b; releitura do servidor prova blob fb50ff38 = reconstrução exata, 29 UUIDs); STATUS 18/29; **Fase 2: 18/29 concluídas.** Parâmetros oficiais CL-006: infraestrutura pronta e aceita (tela /parametros com aprovação versionada); aprovação dos VALORES reais pelo PCP registra a versão oficial.
- 2026-10-19 · [MCC/ETHOS] · **Task d2a44349 (confirmar parâmetros e dias de produção, SPEC-2-002 CA-P1/P2, recorte do executor) implementada e publicada**: a pré-condição "tela/contrato de parâmetros demonstrados" era trabalho do executor e não existia — entregues contrato parametros.ts (validação: faltante null/0 bloqueia, NUNCA default; unidade de recurso obrigatória; aprovação com gate editar_parametros → 403; replay idêntico idempotente; payload divergente → 409; publicação real só consome parâmetros APROVADOS), coleção pcp_parametros (migration 0026 aditiva, acesso direto negado, índice único por versão), hooks pcp_parametros_estado (GET) e pcp_parametros_aprovar (POST, servidor revalida e fixa aprovador/hora/versão em transação), service pcp-parametros.ts e tela /parametros (banner do estado, bloqueios visíveis, botão desabilitado sem a ação). TDD 6/6 (tsx local). Skip v0.0.102; **produção v0.0.102 (ref bcd1676, 13:18 UTC) provada** (lastPublishedRef=versionHash; logs de erro/warn: 0). Evidência: 05_entregas/fase-2/spec-2-002/evidencia-d2a44349.md (commit ea271700). fase.md [/] durante implementação (8b5581e8, blob 1ac17c55 provado).

## 2026-10-16

- 2026-10-16 · [MCC/ETHOS] · **Task 16b8a592 CONCLUÍDA** (teste humano aprovado pelo owner 12:07 BRT: "testei e aprovado"). fase.md [x] com disposição; **incidente de gravação reparado**: 1º envio do [x] redigido de memória corrompeu o arquivo (perdeu os marcadores de id de 3 conciliações e uma linha de disposição) — detectado pela prova de blob-SHA pós-gravação e reparado em 3 rodadas partindo do servidor verificado; canônico final v5 provado (commit 798aa17e, blob 54e07f38, 29 UUIDs). STATUS 17/29; **Fase 2: 17/29 concluídas.** Ciclo contínuo sem task elegível: as 12 abertas dependem de ação do cliente (cadastro Omie 4e0fcf1c), dados do PCP (CL-006/d2a44349), acesso nominal/pontos ou autorização específica do caso real.
- 2026-10-16 · [MCC/ETHOS] · **Task 16b8a592 (publicar a programação por área, SPEC-2-002 CA-P3, recorte sintético isolado) implementada e publicada**: publicação e reprogramação passam a usar as **ações REAIS do perfil logado** (obterPerfil; servidor decide; sem a ação → 403 e nada é publicado/transferido) com nota visível das ações do usuário na tela /planejamento; fundamento atômico já provado (3cd404e5, TDD 10/10). Skip v0.0.101; **produção v0.0.101 (ref cd69b46, 15:02 UTC) provada** (lastPublishedRef=versionHash). Evidência: 05_entregas/fase-2/spec-2-002/evidencia-16b8a592.md (commit 3bf87fe9). fase.md [/] durante implementação (a8084aca, blob a62e4375 provado).
- 2026-10-16 · [MCC/ETHOS] · **Task 30118f65 CONCLUÍDA** (teste humano aprovado pelo owner 11:37 BRT: "testei e aprovado"). fase.md [x] com disposição (commit 2a102f84; releitura do servidor prova blob 6dbbc4af = reconstrução exata, 29 UUIDs); STATUS 16/29; **Fase 2: 16/29 concluídas — todas as tasks de construção (recorte sintético/mock) fechadas.** Ciclo contínuo sem task elegível restante: as 13 abertas dependem de ação do cliente (cadastro Omie 4e0fcf1c), dados do PCP (CL-006/d2a44349), acesso nominal/pontos ou autorização específica do caso real.
- 2026-10-16 · [MCC/ETHOS] · **Task 30118f65 (revisar divergências e invalidar aprovações antigas, SPEC-2-004 CA-C3/C4/T4, recorte sintético) implementada e publicada**: contrato revisao-consolidacao.ts (aprovar exige aprovar_consolidacao→403; registra motivo/quantidade final/hashes de eventos e conferências; fila bloqueada nega; igualdade 0=0 registra pendência quantidade_final_zero e NÃO libera transação no Omie; nova conferência muda o hash → invalidação atômica da aprovação anterior; corrida: retificação antes da aquisição vale com zero POST antigo, durante sincronizando→409), card "Revisão do PCP" na tela /conferencias (quantidade final + motivo, badge do estado da aprovação, botão de invalidação) e TDD 6/6. Skip v0.0.99→0.0.100; **produção v0.0.100 (ref 14374c9, 14:26 UTC) provada** (lastPublishedRef=versionHash). Evidência: 05_entregas/fase-2/spec-2-004/evidencia-30118f65.md (commit 1d0a2a38). fase.md [/] durante implementação (c13a9d2c, blob 6cc59a0b provado).
- 2026-10-16 · [MCC/ETHOS] · **Task 87e4af63 CONCLUÍDA** (aceite 11:18 BRT). fase.md [x] (cdfd9579; blob fafb1bc7 provado); STATUS 15/29. Reprogramação parcial (T4) com conservação do passado; v0.0.98 (ref b216eee).
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

## 21/10/2026 — Task 0096ab26 concluída (SPEC-2-003 CA-E2/E4)

- **Retificar apontamentos sem duplicar eventos** (recorte do executor): contrato `src/lib/pcp/retificacao.ts` — retificarComGuardas (replay idempotente por UUID+hash; hash diferente = 409; durante envio/incerto = 409 estado_congelado; OP não publicada, ponto sem acesso e OP cancelada negam sem pistas; motivo obrigatório inclusive para anulação por quantidade 0; quantidade >= 0; OP/versão incompatível nega; original preservado append-only) e buscarEventoPorUUID (timeout → consulta por UUID antes de qualquer retry, sem evento novo).
- TDD 6/6 (RED 5/6 provado; a falha era do oráculo do teste — retificação SUBSTITUI o valor do alvo, não soma; corrigido antes do código). Card com oráculos na tela /apontamentos.
- Skip v0.0.137 (ref 1bd6731) publicada e provada; teste humano aprovado pelo owner em 21/10 ~11:32 ("testei e aprovado").
- Evidência: 05_entregas/fase-2/spec-2-003/evidencia-0096ab26.md · Aprendizado: AP-2026-10-21-1145 (oráculo antes do código). Fase 2: **22/29**.

## 21/10/2026 — Task 9318a299 concluída (SPEC-2-001 CA-D3)

- **Comprovar as leituras de histórico e compras a receber** (recorte do executor): sondas read-only na conta real provaram os 3 métodos — `ListarPedidos` HTTP 200 (5.501 pedidos; status em infoCadastro; paginação pagina/total_de_paginas), `PesquisarPedCompra` HTTP 200 (pedido real 1514, etapa 20; itens com nQtde/nQtdeRec/cUnidade), `ListarNFe` HTTP 200 (0 registros 2023–2026 — módulo sem uso na conta; pendência explícita).
- Contrato sintético `src/lib/pcp/pedidos-firmes.ts` com os oráculos T5 da SPEC (15 no horizonte; cancelado/fora do horizonte 0; replay por pedido+linha; desconhecido → null bloqueia, nunca 0; borda inclusiva; saldo nunca negativo) — TDD 6/6. Card na tela /apontamentos.
- Mapas CA-D3 registrados em 07-sistemas/pcp/contratos-fase-2.md (arquivo novo): regra REAL aguarda aprovação do PCP. Skip v0.0.142 (ref 117a14d) publicada e provada; sondas e token efêmero removidos.
- Teste humano aprovado pelo owner em 21/10 ~11:53 ("testei e aprovado"). Evidência: 05_entregas/fase-2/spec-2-001/evidencia-9318a299.md. Fase 2: **23/29**.

## 21/10/2026 — Task e6aa4afa concluída (SPEC-2-001 CA-D4)

- **Importar os 90 dias e recebimentos confirmados** (recorte do executor): contrato `src/lib/pcp/importacao-90d.ts` — janela D-89..D inclusiva; chave aplicativo+recurso+documento+linha com replay sem duplicação; página falha preserva o lote anterior com aviso e lote incompleto não ativa; geração ≤ ativa recusada; normalização da borda (IDs em texto, unidade null nunca vira UN, quantidade finita ≥ 0); restante a receber = pedida−recebida (nunca negativa nem acima do pedido), desconhecido bloqueia (nunca 0), cancelado/fora do horizonte não elegíveis.
- TDD 7/7 GREEN de primeira. Card na tela /apontamentos. Skip v0.0.143 (ref 7084d96) publicada e provada.
- Teste humano aprovado pelo owner em 21/10 ~12:45 ("Testei e aprovado"). USO REAL pendente do mapa REAL aprovado pelo PCP (contratos-fase-2.md) e do cadastro Omie 4e0fcf1c.
- Evidência: 05_entregas/fase-2/spec-2-001/evidencia-e6aa4afa.md. Fase 2: **24/29**.

## 21/10/2026 — Pendência 2c4a9b7e fechada (matriz v2 — pontos da Keoma)

- Owner enviou o fluxograma oficial de produção (validação com as gerências, 10/2026): etapas 4–7 (triagem, cozinha, resfriamento, encaixotamento) sob gerência do Arivaldo; Keoma supervisiona 1–3 e 8–11 (produto acabado, faturamento, expedição, entrega).
- **Matriz v2** (aprovada por Mr Cheney, "aprovo", 21/10 14:03): Keoma Targino ganha pontos **produto_acabado** e **expedicao** (espelhando a equipe da expedição). Perfil atualizado no Skip (migration 0027).
- Registro: 06_notas/organograma-2026-10.md (fonte) + matriz v2 datada. Fase 2: **24/29** (pendências restantes: d77447ab, 6e38e5a3, 0d876150 + uso real da e6aa4afa).

## 28/10/2026 — Fase 3: catálogo real produto a produto (SPEC-3-001, CA-3-01) em andamento

- Contrato `catalogo-sync.ts` + endpoint `/backend/v1/pcp/catalogo/sync` (só leitura): sub-lotes com pausa, cursor, parada no 425/consumo redundante com nova tentativa em 12 h, catálogo anterior mantido até o lote novo completar. Skip v0.0.170 (ref b2387dd) publicada e provada; QA verde.
- A suíte de testes não foi executada (sem executor); prova por teste de mesa. Leitura real e conferência de 3 produtos pendentes do Omie liberar a chave (CL-PEND-006). Evidência: 05_entregas/fase-3/spec-3-001/evidencia-catalogo-sync.md.

## 28/10/2026 — Fase 3: lista do que falta cadastrar no Omie (SPEC-3-001, CA-3-02) em andamento

- Contrato `faltantes.ts`, endpoint `/backend/v1/pcp/faltantes` e card em `/qualidade`. Cobre só o estoque; ficha e pedido avisados como "ainda não entram". Catálogo não lido por inteiro = lista vazia com aviso. Skip v0.0.172 (ref 594132b) publicada e provada; QA verde; testes só de mesa.
- Ajuste do `pcp_catalogo_sync.js`: linha do catálogo no formato lido pela tela (`produto_id`, `familia`, `ativo` S/N). Evidência: 05_entregas/fase-3/spec-3-001/evidencia-faltantes.md.

## 28/10/2026 — Fase 3: SPEC-3-001 construída até onde o Omie permite

- Conversão dos pedidos de venda e de compra do Omie nas linhas da importação de 90 dias (`omie-90d-mapa.ts`), Skip v0.0.173 (ref 94f5590) publicada e provada; QA verde; testes só de mesa. Cálculo real das sugestões e uso das telas com dados reais ficam em andamento até a chave do Omie ser liberada (CL-PEND-006). Nota: 06_notas/bloqueio-omie-leitura-real-2026-10-28.md.

## 28/10/2026 — Fase 3: envio da produção ao Omie com a chave desligada (SPEC-3-002, CA-3-06) em andamento

- Migration 0029 (chaves de escrita desligadas e transações), contrato `envio-op.ts` com simulador, rota `/backend/v1/pcp/omie/op/enviar` (423 com a chave desligada). Skip v0.0.174 (ref 9d19c7e) publicada e provada; QA verde; testes só de mesa. Nenhuma chamada ao Omie. Contrato em `07-sistemas/pcp/contratos-fase-3.md`. Evidência: 05_entregas/fase-3/spec-3-002/evidencia-envio-op.md.

## 28/10/2026 — Fase 3: autorização do dono e conferência (SPEC-3-002, CA-3-07) em andamento

- Autorização de uma ordem por vez (só a ação do dono), desfazer, conferência só leitura e tela "Envio ao Omie" (`/envio-omie`). Skip v0.0.175 (ref e2b0917) publicada e provada; QA verde; 38 de 38 testes (Node). Sem ordem real para autorizar ainda (depende das conferências reais). Chave de escrita desligada; nenhuma chamada ao Omie. Evidência: 05_entregas/fase-3/spec-3-002/evidencia-autorizacao-conferencia.md.

## 28/10/2026 — Fase 3: SPEC-3-003 construída até onde o Omie e a matriz permitem

- Acessos de compras e recebimento (8 ações, área `recebimento`, guarda no servidor), complemento de fornecedores com versões, bloqueio de item fora do cadastro com exceção autorizada e conversão de unidade por fator confirmado. Skip v0.0.176 e v0.0.177 (ref 86e3a1c) publicadas e provadas; migrations 0030 e 0031; 56 de 56 testes (Node). Nenhuma conta real recebeu ação nova (CL-003). Evidência: 05_entregas/fase-3/spec-3-003/evidencia-compras-base.md.

## 28/10/2026 — Fase 3: SPEC-3-004 construída até onde o Omie permite

- Histórico de preços por insumo e fornecedor na unidade de estoque, classificação de linhas (insumo, frete, serviço, N-D, a classificar), migration 0032, rotas e tela `/compras/historico`. Skip v0.0.178 (ref b9fad7e) publicada e provada; 64 de 64 testes (Node). Leitura real dos preços desligada até a amostra (CL-PEND-006). Evidência: 05_entregas/fase-3/spec-3-004/evidencia-historico-precos.md.

## 28/10/2026 — Fase 3: SPEC-3-005 construída até onde as alçadas permitem

- Requisição por fornecedor, cotações comparadas com o último preço, aprovação/recusa por alçada com hash e invalidação por mudança; migration 0033, rotas e tela `/compras/requisicoes`. Skip v0.0.179 (ref 9f76820) publicada e provada; 72 de 72 testes (Node). Sem alçadas nem tolerância cadastradas, a aprovação real fica parada. Evidência: 05_entregas/fase-3/spec-3-005/evidencia-requisicao-cotacao-aprovacao.md.

## 28/10/2026 — Fase 3: SPEC-3-006 construída com a chave de pedido de compra desligada

- Entregas por fornecedor (restante, atraso, emergência), ligação manual conferida e lançamento do pedido de compra atrás da chave (423 desligada, uma gravação, resultado incerto só consulta); migration 0034, rotas e telas. Skip v0.0.180 (ref a415ac1) publicada e provada; 80 de 80 testes (Node). Nenhuma chamada ao Omie. Evidência: 05_entregas/fase-3/spec-3-006/evidencia-entregas-e-pedido.md.

## 28/10/2026 — Fase 3: SPEC-3-007 construída (partes em revisão fora)

- Recebimento conferido com ligação a vários pedidos, falta e sobra, parcelas e pagamento antecipado com aviso de já paga, exceção de item sem cadastro e pré-conferência só com nota de demonstração; migration 0035, rotas e tela `/recebimentos`. Skip v0.0.182 (ref 48f4e84) publicada e provada; 91 de 91 testes (Node). Leitura de nota real e escrita do recebimento não construídas (CL-PEND-007). Evidência: 05_entregas/fase-3/spec-3-007/evidencia-recebimento.md.

## 28/10/2026 — Fase 3: SPEC-3-008 construída até onde o Omie e a matriz permitem

- Cinco ações na área `faturamento`, unidades versionadas com nome fantasia operacional, nomes de canal "a revisar", tabela de preço versionada, subtotal recalculado e origem do pedido; migration 0036, rotas e telas `/unidades` e `/pedidos/preparacao`. Skip v0.0.183 (ref e06ce12) publicada e provada; 101 de 101 testes (Node). Leitura de clientes do Omie e marcador do Lunet pendentes. Evidência: 05_entregas/fase-3/spec-3-008/evidencia-unidades-tabela-origem.md.

## 28/10/2026 — Fase 3: SPEC-3-009 construída até onde o Omie e a matriz permitem

- Frete por pedido (sem padrão), volumes contados pela expedição (sem cubagem), fila apto/bloqueado/liberado com liberação desfeita por mudança, pedido manual com duplicata por referência e possível duplicata a revisar, e gravação de pedido manual e de volumes e frete atrás da chave `omie_pedido_venda_escrita` (desligada) com simulador; migration 0037, rotas e telas `/pedidos/preparacao` e `/pedidos/manuais`. Skip v0.0.185 (ref 1015307) publicada e provada; 115 de 115 testes (Node). Primeira gravação real só com o dono. Evidência: 05_entregas/fase-3/spec-3-009/evidencia-pedido-pronto-para-faturar.md.

## 28/10/2026 — Fase 3: SPEC-3-010 construída até onde os dados reais permitem

- Parâmetros de alerta versionados (produto prevalece sobre família), famílias, lacunas, seis regras de alerta explicadas e rodada que atualiza o alerta aberto em vez de repetir; migration 0038, rotas e telas `/alertas` e `/parametros/alertas`. Skip v0.0.186 (ref 36d4ed6) publicada; 125 de 125 testes (Node). Estoque, produção, divergência e intenção da Nuvemshop reais sem fonte ligada. Evidência: 05_entregas/fase-3/spec-3-010/evidencia-alertas.md.

## 29/10/2026 — Fase 3: SPEC-3-011 construída até onde a matriz permite

- Ciclo de tratamento dos alertas com responsável, ação obrigatória e histórico só de inclusão, reabertura ligada ao alerta anterior, alertas por área agrupados por tipo e item, contador no menu e regra ligável/desligável preservando o histórico; migration 0039 e rotas `/alertas/*`. Skip v0.0.187 (ref 0baa9a6) publicada; 133 de 133 testes (Node). Evidência: 05_entregas/fase-3/spec-3-011/evidencia-tratamento-alertas.md.
