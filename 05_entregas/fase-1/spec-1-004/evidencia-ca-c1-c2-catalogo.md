# Evidência — SPEC-1-004 · Task 8352cecc: Exibir catálogo e fichas técnicas do Omie (CA-C1, CA-C2)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: 8352cecc-0dee-41d0-a445-5751127dbe55
- Versões do projeto Skip 62774: 0.0.48–0.0.50 (QA nativo ok em todas)

## Implementação

- **Recurso `produtos` no sync** (`ListarProdutosResumido`, 100/pág, allowlist liberado):
  normalização `produto_id/codigo/descricao/unidade/ativo/familia`, IDs texto, chave
  `omie:produtos:app1:<produto_id>` (código NÃO é identidade — C1).
- **Rotas de catálogo** (`pocketbase/hooks/pcp_catalogo.js`, área `catalogo` conferida no
  servidor):
  - `GET /backend/v1/pcp/catalogo?busca=&pagina=` — lista com busca por código/descrição
    (aplicada em memória, sem concatenação em filtro — sem injeção), paginação 50/pág,
    fonte/lote/horário visíveis;
  - `GET /backend/v1/pcp/catalogo/{produtoId}` — detalhe com ficha como **estado explícito**
    `ficha_indisponivel_sem_contrato` (a conta não expõe ficha pela API autorizada — nada
    inventado, sem receita vazia com zero — C2/C3) e saldo por local SOMENTE com área
    `estoque` separada (C4 — catálogo não concede estoque).
- **Página Catálogo real** (`src/pages/Catalogo.tsx` + `src/services/pcp-catalogo.ts`):
  substitui a de demonstração; estados explícitos para cadastro vazio, busca sem resultado,
  produto não encontrado, ficha indisponível e saldo bloqueado; paginação; origem/horário.

## Defeitos corrigidos durante a prova (honestos)

1. **Área no lugar errado**: migration 0012 adicionou `catalogo` em `users.areas`, mas o
   servidor lê áreas de `pcp_perfis.areas` — 403 persistiu; corrigido na 0013 (no perfil).
2. **Fim de paginação com lote vazio**: Omie devolve `total_de_paginas: 0` para cadastro
   vazio e o laço não terminava (2ª chamada ainda `lote_ativado:false`); corrigido com fim
   também por página incompleta (`arr.length < tam_pagina`) — lote vazio ativa na 1ª página.

## Prova real (conta do cliente — cadastro VAZIO)

- `sync/iniciar produtos` → execução gen 1; `sync/pagina` → **lote vazio ativado**
  (`lote_ativado:true`, 0 itens = fim por página incompleta); fonte `omie/produtos` estado
  `ok`, total 0 (lote vazio legítimo, não erro).
- `GET /catalogo` com área → `disponivel:true, total:0, produtos:[]` + pendência explícita
  "Lote ativo sem produtos (cadastro vazio na origem)"; antes do lote existir, a mesma rota
  devolvia `cadastro_omnie_vazio` com orientação — nunca lista inventada.
- `GET /catalogo/9999999` → `produto_nao_encontrado` (estado específico).
- 403 sem área `catalogo` (autorização no servidor provada antes da correção da 0013).
- Regressão: fontes pedidos/estoque/pedidos-oficiais intactas (3344/1055/5393, estados ok);
  health 200.

## Pendência registrada (dono: cliente)

- **Cadastro de produtos do Omie VAZIO** — quando povoado no ERP, o catálogo lista
  automaticamente (mesma mecânica de lotes; nenhuma mudança de código).
- Ficha técnica: sem contrato exposto na API autorizada — fica como indisponível explícito
  até a liberação do recurso (sem reconstruir com planilha — regra da SPEC).

## Teste humano (roteiro)

1. Login → Catálogo: ver o estado explícito de cadastro vazio (não uma tela quebrada nem
   produtos de demonstração).
2. Buscar por código/descrição qualquer termo → "Nenhum produto encontrado" (busca
   funcionando sobre lote vazio).
3. (Opcional, após povoar o cadastro no Omie) Conferir que o produto aparece com
   ID/código/unidade/ativo e origem/lote/horário.
