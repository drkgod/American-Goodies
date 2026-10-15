# Evidência — Task e57df8ff: Construir a visão de qualidade dos dados (SPEC-2-001, CA-D1/D2/D4, recorte sintético)

- **Data**: 2026-10-15 · Executor: MCC (ETHOS) · Autorização do owner: "sim" (14:31 BRT)
- **Versões Skip**: 0.0.79 (build falhou — arquivo qualidade.ts não persistido na 1ª gravação; corrigido) → **0.0.80** (contrato+fixtures+tela, QA ok) → **0.0.81** (teste TDD, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.81, ref 4d45315** (17:41 UTC; skip_project_status: lastPublishedRef = 4d45315 = versionHash, sem pendências exceto .skip.config.json)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/qualidade.ts`: avaliarProduto (unidade null NUNCA vira UN; ficha null; cobertura <90 bloqueia sugestão), producaoLiquida (dedup por chave, horizonte D-89..D, concluída soma/cancelada subtrai/devolução vinculada soma), ativarLote (página falha preserva lote anterior com aviso; geração ≤ ativa recusada) + fixtures isoladas (COOKIE-1 UN com ficha INS-1=0,05 KG; P2 unidade null; P3 ficha null; P4 cobertura 45d).
2. **Tela** `/qualidade` (área painel): 4 cards de produto com estado e bloqueios explícitos, banner "Tela de demonstração", mapa de produção líquida 90 UN = 100−20+10. Menu "Qualidade" no Layout (área painel).
3. **Teste TDD** `tests/pcp/spec-2-001-qualidade.test.mjs`: 12 testes (T0–T4, oráculos T1/T2/T3 da SPEC).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.81, ref 4d45315) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false (sem runner na plataforma) |
| TDD local (tsx --test, cópia fiel do contrato gravado) | **12/12 pass** (T1a-d, T2a-c, T3a-c, T4, T0) |
| Publicação | skip_project_publish → publishedRef **4d45315** (17:41:27Z); status confirma lastPublishedRef=4d45315 |
| Isolamento | fixtures sintéticas em qualidade.ts; nenhuma chamada de rede (varredura do módulo); nada mesclado com provider real |
| Regressão | build/QA da plataforma cobre o app inteiro (catálogo/painel intactos — nenhum arquivo existente alterado além de App.tsx e Layout.tsx, 2 patches cirúrgicos) |

## Observação de teste automatizado de UI

Tentativa de login automatizado em produção com a senha inicial do cofre retornou "E-mail ou senha inválidos" — esperado: a champion já trocou a senha no aceite da task 49327a88. O teste visual fica para o teste humano abaixo.

## Teste humano (owner/champion) — roteiro

1. Abrir https://mcc-automacao-fabrica-98125.goskip.app e entrar com a sua conta.
2. No menu, clicar **Qualidade**: ver 4 produtos de demonstração — COOKIE-1 "Pronto para calcular"; P2 "Estoque bloqueado" (unidade desconhecida); P3 "Receita bloqueada" (ficha ausente); P4 "Sugestões bloqueadas" (cobertura 45 de 90 dias).
3. Ver o mapa: **90 UN líquidas = 100 concluídas − 20 canceladas + 10 devoluções**.
4. Confirmar que Catálogo e Painel continuam funcionando.

Estado da task: aguardando_teste_humano. fase.md permanece [/] até o aceite.
