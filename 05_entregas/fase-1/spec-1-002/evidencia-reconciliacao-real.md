# Evidência — SPEC-1-002 · Reconciliação real (CA-O1/O2 com CL-001)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: f39ced9b-dbae-4966-bbb5-f93da1a4573c
- Versões do projeto Skip 62774: 0.0.24–0.0.26 (QA nativo ok em todas)
- CL-001: recebido do owner (13:19) e registrado como secrets `OMIE_APP_KEY`/`OMIE_APP_SECRET` — **somente no servidor**; nunca em repo, UI ou log

## Contrato comprovado na conta real (CA-O1)

`ListarPosEstoque` (`estoque/consulta/`), chamada direta de prova:

| Campo | Valor |
|---|---|
| HTTP | 200 |
| nTotRegistros | **1055** |
| nTotPaginas | 22 |
| nRegistros (pág. 1) | 50 |
| Campos reais do item | nCodProd, cCodigo, cDescricao, codigo_local_estoque, nSaldo, fisico, reservado, nCMC, nPendente |

Amostra: `M043055 — FILME PVC 28X300M C TRILHO ALP FILM`, local 9300980125, saldo 53.
Paginação `nPagina/nRegPorPagina`; fim da fonte por `nPagina >= nTotPaginas` (metadatagem da resposta).

## Ajustes no adapter a partir da amostra real (0.0.24–0.0.26)

1. Call correta: `ListarPosEstoque` (a posição consolidada da conta usa esse método).
2. Normalização pelos campos **reais** (nCodProd/cCodigo/cDescricao/nSaldo/fisico/reservado).
3. Fim da fonte pela **metadatagem** (`nTotPaginas`), não por `itens.length` — página parcial não encerra.
4. Recurso `produtos` sem reconciliação na conta real → `recurso_nao_reconciliado` (400) — sem falso sucesso.
5. Mock restrito à ausência de credencial (homologação identificada); com credencial, modo é sempre `real`.

## Leitura real executada pelas rotas (CA-O2)

- 1ª tentativa: `falha_transporte` (egress do worker); retry em etapas separadas **recuperou sozinho**
  (execução nova na 0.0.26 concluiu) — comportamento CA-O3/O4 provado em falha real.
- 22 páginas × 50 itens (última com 5) → `lote_ativado=true`.
- **Estado final: total_itens = 1055 = nTotRegistros do Omie** ✓ · estado_tecnico `ok` · geração 11 ·
  lote_ativo `z8ohz2r2pc5jgu9` · `ultimo_sucesso` preenchido.
- Interrupção real absorvida: "Backend unavailable" na página 4 → cursor do servidor permaneceu em 3 →
  chamada seguinte re-leu a página 4 e seguiu até 22 (prova viva de retomada sem duplicar).

## Reconciliação de contagem e amostra

- Contagem: **1055 no lote ativo = 1055 reportado pelo Omie** ✓
- Itens: id/local/saldo preservados como texto/número da fonte; **unidade não exposta pela posição** —
  registrado como pendência para a SPEC-1-004 (unidade oficial vem do cadastro de produtos).
- Sem segredo em UI/logs; nenhuma operação de escrita no ERP (allowlist só consulta).

## Teste humano (roteiro)

1. No Painel, Estoque agora mostra **dados reais** do Omie com fonte/horário do último sucesso.
2. Escolher um item no Omie (ex.: M043055) e conferir código/descrição/local/saldo no painel.
3. Confirmar o aceite da leitura real (reconciliação CA-O1 e lote completo CA-O2).
