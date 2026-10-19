# Evidência — Task d2a44349: Confirmar parâmetros e dias de produção (SPEC-2-002, CA-P1/P2, recorte do executor)

- **Data**: 2026-10-19 · Executor: MCC (ETHOS) · Ciclo contínuo ("continue" do owner 10:00)
- **Versões Skip**: **0.0.102** (ref bcd1676, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.102, ref bcd1676** (13:18 UTC; status: lastPublishedRef = bcd1676 = versionHash)

## Escopo entregue (recorte do executor — a aprovação dos VALORES é do PCP/owner)

A pré-condição da task exigia "tela/contrato de parâmetros demonstrados" — que não existia. Entregue:

1. **Contrato** `src/lib/pcp/parametros.ts`: validarParametros (faltante null/0 bloqueia, NUNCA default; unidade de recurso obrigatória; fração > 0), aprovarParametros (gate editar_parametros → 403; registra versão/aprovador/hora/hash determinístico), replayAprovacao (replay idêntico idempotente; payload divergente → 409 sem sobrescrever), consumoPublicacao (publicação real só com aprovação; origem demonstracao bloqueia — demo isolada).
2. **Coleção** `pcp_parametros` (migration 0026, aditiva/reversível): versao, aprovador, aprovado_em, hash_parametros, parametros (JSON); acesso direto de cliente NEGADO (regras vazias); índice único por versão.
3. **Hooks** (1 routerAdd por arquivo): `pcp_parametros_estado.js` (GET /backend/v1/pcp/parametros — aprovação vigente ou null/origem demonstracao) e `pcp_parametros_aprovar.js` (POST /backend/v1/pcp/parametros/aprovar — gate editar_parametros no perfil ativo; revalidação no servidor; hash canônico; replay idêntico idempotente; versao_esperada divergente → 409; aprovador/hora/versão fixados pelo servidor em transação).
4. **Tela** `/parametros` (área planejamento, menu Parâmetros): banner do estado (aprovada com versão/aprovador/hora/hash ou sem aprovação → publicação real bloqueada), campos capacidade/lote/horizonte + recursos (nome/unidade/fração), bloqueios visíveis, botão Aprovar desabilitado sem a ação ou com bloqueios, nota das ações do perfil.
5. **Service** `src/services/pcp-parametros.ts` (obterParametros / aprovarParametrosServidor).
6. **Rotas**: App.tsx (/parametros, área planejamento) + Layout.tsx (item Parâmetros).

## Provas

| Prova | Resultado |
|---|---|
| TDD contrato (local, tsx --test) | **6/6 GREEN** — T1 null bloqueia/nunca default; T2 0 bloqueia; T3 unidade faltante bloqueia/unidades não somam; T4 403 sem ação + versão/aprovador/hora/hash; T5 replay idempotente + divergente 409; T6 publicação real consome aprovados, demo bloqueada |
| QA Skip (apply v0.0.102, ref bcd1676) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| Publicação | skip_project_publish → publishedRef **bcd1676** (13:18:32Z); status confirma lastPublishedRef=bcd1676=versionHash; logs de erro/warn: 0 |
| Persistência de arquivos | 7 arquivos gravados e RELIDOS byte a byte (parametros.ts, teste .mjs, migration 0026, 2 hooks, service, tela, App/Layout) |
| fase.md | [/] provado (commit 8b5581e8, blob 1ac17c55, 29 UUIDs) |

## O que FALTA para concluir a task (uso real — dono funcional)

1. **Você/PCP aprova os valores reais** em /parametros (capacidade, lote, horizonte, recursos com unidade) — o botão Aprovar grava versão/aprovador/hora/hash.
2. Teste humano: aprovar → banner verde com versão; conferir que sem a ação (outra conta) o botão fica desabilitado/403.

Estado da task: no ar, aguardando aprovação dos valores + teste humano.
