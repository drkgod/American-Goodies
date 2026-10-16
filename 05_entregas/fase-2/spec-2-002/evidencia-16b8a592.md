# Evidência — Task 16b8a592: Publicar a programação por área (SPEC-2-002, CA-P3, recorte sintético isolado)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (30118f65 aprovada 11:37; "Continue" 12:00)
- **Versões Skip**: **0.0.101** (ações reais do perfil logado, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.101, ref cd69b46** (15:02 UTC; status: lastPublishedRef = cd69b46 = versionHash)

## Escopo entregue (recorte sintético isolado — zero chamada a ERP)

A publicação atômica com versionamento já estava provada no fundamento (3cd404e5, TDD 10/10: oráculos T3b/T3c/T3d — ação exigida, conflito de versão 409 sem sobrescrever, OPs fatiadas na mesma versão/contexto). O recorte que faltava nesta task era o **"provar ação/área" com a conta REAL**: os botões de publicar/reprogramar usavam uma conta fixa no código (keoma.targino com as ações hardcoded), não o perfil logado.

1. **Tela** `/planejamento`: publicarProgramacao e reprogramarSaldo agora usam as **ações REAIS do perfil logado** (obtidas do servidor via obterPerfil) — o servidor decide; sem a ação, o guard nega (403) e nada é publicado/transferido. Nota visível na tela mostra as ações do usuário e o comportamento esperado.
2. **Contratos** (sem alteração de regras): publicarProgramacao (publicar_programacao exigido; 409 em versão divergente; rascunho com bloqueios permanece) e reprogramacao.ts (editar_programacao exigido) já provados por TDD.
3. **Escopo real pendente**: publicar com parâmetros/dados reais exige d2a44349 (CL-006) — a cláusula da SPEC "fundamento sintético pode ser verificado isoladamente" fica cumprida com este recorte; o uso real permanece na task com dados reais.

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.101, ref cd69b46) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD de fundamento (já provado em 3cd404e5) | 10/10 — ação exigida (403 sem ela), conflito de versão 409, OPs fatiadas por capacidade diária na mesma versão/contexto |
| Publicação | skip_project_publish → publishedRef **cd69b46** (15:02:51Z); status confirma lastPublishedRef=cd69b46=versionHash |
| Isolamento | fixtures sintéticas; nenhuma chamada de rede |

## Teste humano — roteiro (com a sua conta — área painel)

1. Menu **Planejamento**: a nota abaixo do botão Publicar mostra as **ações reais do seu perfil** (servidor): consultar_planejamento, editar_programacao, editar_parametros, publicar_programacao, aprovar_consolidacao, executar_sync_omie.
2. Publicar um rascunho → funciona (você tem publicar_programacao).
3. Reprogramar o saldo → funciona (você tem editar_programacao) e o vínculo mostra o seu usuário real.
4. Confirmar que as outras telas continuam funcionando.

Estado da task: no ar, aguardando teste.
