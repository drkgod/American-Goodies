# Análise — SPEC-1-002, CA-O1/O2: Conectar a leitura dos dados do Omie

Data: 2026-10-08 · Executor: MCC (ETHOS) · Etapa: implementando (autorização presumida do owner: "continue e nao pergunte mais", 11:48)

## Objetivo e resultado observável

Uma atualização de leitura produz conjunto completo por recurso com origem/horário e relatório
técnico; falha em qualquer página mantém o último conjunto completo (nada de saldo fictício ou
sucesso parcial).

## Pré-condições da SPEC e estado real

| Pré-condição | Estado |
|---|---|
| SPEC-1-001 aceita | ✅ 3/3 concluídas e aceitas (v0.0.17) |
| CL-001 — API/permissão Omie | ❌ **Ausente**: secrets do projeto só têm PCP_TEST_PASSWORD + sistema (sem OMIE_APP_KEY/SECRET) — **bloqueio localizado** |
| Projeto Skip identificado | ✅ 62774 |
| Contrato oficial | ✅ Comprovado na documentação: `geral/produtos/` (ListarProdutosResumido), `estoque/consulta/` (ConsultaEstoque/PosicaoEstoque), paginação `pagina/registros_por_pagina`, corpo `{call, app_key, app_secret, param[]}` |
| Coleções técnicas | ✅ pcp_execucoes/lotes/dados/fontes existem da SPEC-1-000 (sem migration nova de schema) |

## Recorte (menor recorte completo) — com bloqueio CL-001

**Entra:** adapter de leitura Omie (allowlist de consultas; chamada real exige secrets;
ausentes → modo mock identificado em homologação e recurso indisponível para produção),
rotas sync/iniciar · sync/pagina · sync/estado (lease/geração, cursor do servidor, autorização
`pode_atualizar_fontes`), pipeline lote staging→ativo com ativação atômica e replay idempotente,
testes TDD com fixtures de duas páginas (página 2 falha, replay, lease, 401 sem retry, IDs texto,
null ≠ zero). Recurso piloto: **estoque (saldo por local)**.

**Não entra (bloqueado ou fora):** reconciliação com a conta real (CL-001 pendente — fica para a
task CA-O1–O4), demais recursos (produtos/fichas/pedidos/OPs/compras — entram nas próximas tasks
da SPEC com o adapter já pronto), UI de sincronização (SPEC-1-005), escrita no ERP (proibida).

## Plano de implementação

1. **RED**: tests/pcp/spec-1-002.test.mjs (node:test) — unit (fixtures em memória, importando
   módulo de normalização) + integração env-gated; rodar antes do adapter e registrar reprovações
   de CA-O2/O3/O4.
2. **Adapter** (hook módulo único `omie_adapter.js`? goja não compartilha top-level entre arquivos
   → lógica inline duplicada em cada rota): mapa de recursos → endpoint+call (allowlist: só
   consulta); `OMIE_APP_KEY/SECRET` via $secrets.get; modo mock quando ausentes.
3. **Rotas** (1 por arquivo): sync/iniciar (lease 5min, geração, execução ativa), sync/pagina
   (só execucao_id; rede fora de transação; persistência curta; última página ativa lote e
   substitui anterior; falha não ativa), sync/estado (metadados por área).
4. **Migration 0009**: marca pode_atualizar_fontes=true no fixture teste-PCP (conta sintética de
   teste — habilita o piloto; não é concessão real).
5. **GREEN + regressão** + QA nativo.

## Matriz critério → prova

| Critério | Prova |
|---|---|
| CA-O2: 2 páginas → 1 lote ativo com IDs/saldos preservados | integração: P1/A=10 UN + P1/B=5 KG como 2 linhas; fonte/horário |
| CA-O3: falha página 2 mantém lote anterior | integração: falha → lote antigo segue ativo; estado_tecnico=erro |
| CA-O4: replay não duplica; recuperação conclui uma vez | repetir pagina → mesmo lote; reativar não reexecuta |
| Lease/geração | segunda iniciar durante lease devolve execução vigente |
| Autorização | leitor sem pode_atualizar_fontes → negado; fontes por área |
| Segredo ausente em UI/logs | logs sanitizados; secrets só no servidor |

## Bloqueio registrado

CL-001 ausente → **nenhuma chamada real ao Omie nesta task**; nenhuma prova de integração real
será declarada. O adapter deixa a chamada real pronta atrás dos secrets; recurso aparece
indisponível em produção enquanto CL-001 não chegar.
