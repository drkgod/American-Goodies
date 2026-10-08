# Evidência — SPEC-1-002 · CA-O1/O2 (Conectar a leitura dos dados do Omie)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: f39ced9b-dbae-4966-bbb5-f93da1a4573c
- Versões do projeto Skip 62774: 0.0.18–0.0.21 (QA nativo ok em todas)

## Autorização

- Análise entregue em 2026-10-08 (`.adapta-cliente/analises/spec-1-002-ca-o1-o2.md`, commit b5d6d130).
- Continuidade autorizada pelo owner ("continue e nao pergunte mais", 11:48), respeitando o recorte.

## Bloqueio registrado (CL-001)

Secrets do projeto: `PCP_TEST_PASSWORD` + sistema — **sem OMIE_APP_KEY/OMIE_APP_SECRET**.
Nenhuma chamada real ao Omie nesta task; a SPEC define "bloqueio localizado, sem afirmar
integração real". O adapter real está implementado e pronto atrás dos secrets; sem eles o
servidor usa **modo mock de HOMOLOGAÇÃO identificado** (fixtures da SPEC) e o recurso aparece
indisponível em produção até CL-001 chegar.

Contrato comprovado na documentação oficial (portal do desenvolvedor):
- `geral/produtos/` → call `ListarProdutosResumido` (pagina/registros_por_pagina)
- `estoque/consulta/` → call `ConsultaEstoque` (nPagina/nRegPorPagina)
- corpo: `{call, app_key, app_secret, param[]}`; 401/403 sem retry; timeout 15s

## Implementado

- `pcp_sync_iniciar.js` — allowlist {estoque, produtos}; perfil ativo + `pode_atualizar_fontes`;
  lease 5min + geração crescente; execução ativa devolvida em vez de duplicar; transação curta.
- `pcp_sync_pagina.js` — recebe **só `execucao_id`** (cursor/fonte/recurso do servidor, nunca do
  navegador); rede FORA da transação; upsert idempotente por `chave_origem`
  (omie:recurso:app1:produto:local:unidade); ativação **atômica** na última página
  (staging→completo, anterior→substituido, contagem POR LOTE); falha NÃO ativa (CA-O3);
  401/403 sem retry; lease renovado por etapa.
- `pcp_sync_estado.js` — metadados por área (sem dado bruto/segredo); indisponível ≠ zero.
- Migration 0009 — `pode_atualizar_fontes=true` no fixture teste-PCP (sintético, não concessão real).
- `tests/pcp/spec-1-002.test.mjs` — suíte node:test alinhada à SPEC (env-gated).

## Provas executadas (HTTP contra o backend)

| Cenário | Prova | Resultado |
|---|---|---|
| RED | rotas sync → 404 antes da implementação (0.0.18) | ✓ |
| CA-O2 | iniciar→pág1(2)→pág2(2)→fim → lote ativado; estado: total_itens=4, ok, ultimo_sucesso, geração crescente; P1/local1=10 UN e P1/local2=5 UN = 2 linhas; null≠zero; -2 preservado | ✓ PASSOU |
| CA-O3 | falha na pág 2 (secret temporário, removido depois): {ok:false}; lote anterior PERMANECE ativo (id conferido); estado_tecnico=falha_pagina_2; recuperação conclui uma vez (geração 4, total 4) | ✓ PASSOU |
| CA-O4 | replay do ciclo → total segue 4; execução concluída → {ja_concluida:true} | ✓ PASSOU |
| Lease | 2º iniciar durante execução ativa devolve a MESMA execução | ✓ PASSOU |
| Autorização | Compras sem pode_atualizar_fontes → 403; estado de Compras → fontes=[]; recurso 'financeiro' → 400; execução inexistente → 400 | ✓ PASSOU |
| Regressão | T1–T8 (acesso) + SYNC: 9/9; health 200; QA nativo ok | ✓ PASSOU |

## Bug encontrado e corrigido no ciclo

Contagem global em vez de por lote (total_itens=8 no replay) → contagem **por lote** (v0.0.20).

## Teste humano solicitado (v0.0.21, preview)

1. Login com usuario-teste-pcp@pcp.local (tem `pode_atualizar_fontes` no fixture).
2. Observar que o Painel continua mostrando Estoque (lote ativo, dados de demonstração).
3. Falha simulada: com a ajuda do executor, uma execução com erro mantém o painel com o lote
   anterior e o diagnóstico "falha_pagina_2" — nenhuma linha some, nenhum zero inventado.
4. Confirmar entendimento: **integração real aguarda CL-001**; hoje o que liga é o mock de
   homologação identificado.
