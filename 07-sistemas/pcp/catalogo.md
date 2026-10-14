# Contrato do catálogo — leitura (SPEC-1-004)

Atualizado em 2026-10-09 · Complementa `contratos-omie.md` (fonte) e `fundamento.md` (mecânica de lotes).

## Rotas (área `catalogo` conferida no servidor)

| Rota | Função |
|---|---|
| `GET /backend/v1/pcp/catalogo?busca=&pagina=` | lista com busca por código/descrição (aplicada em memória, sem injeção), paginação 50/pág, lote/horário visíveis |
| `GET /backend/v1/pcp/catalogo/{produtoId}` | detalhe: produto + ficha (estado explícito) + saldo por local (só com área `estoque` separada) |

## Identidade e estados

- Identidade do item: `omie:produtos:app1:<produto_id>` (código NUNCA é identidade — dois
  produtos com mesmo código são dois registros);
- Ficha: `ficha_indisponivel_sem_contrato` (a API autorizada não expõe ficha/receita — nada
  inventado, sem receita vazia com zero);
- Unidade ausente → pendência "conversão e cálculo IMPEDIDOS" (sem default UN);
- Unidade incompatível entre cadastro e saldo → flag `unidade_incompativel` por local, sem
  conversão e sem soma;
- Inativo → preservado com pendência (inatividade ≠ apagado; fora do lote →
  `produto_nao_encontrado`);
- Saldo: só com área `estoque` separada (catálogo não concede estoque — CA-C4).

## Fonte

`ListarProdutosResumido` em `geral/produtos/`, 100/pág, fim por metadatagem OU página
incompleta (cadastro vazio ativa lote vazio na 1ª página — 0=0 é conferência válida).
Estado da conta em 2026-10-09: **cadastro VAZIO (0 registros)** — pendência do cliente.
