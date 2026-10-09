# Contrato Omie — leitura (SPEC-1-002, reconciliado com a conta real)

Atualizado em 2026-10-08 16:30 · Credenciais: secrets do projeto (nunca aqui).

## Recursos liberados (allowlist de CONSULTA — nada mutante)

| Recurso | Endpoint | Call | Paginação confirmada |
|---|---|---|---|
| estoque (piloto) | `https://app.omie.com.br/api/v1/estoque/consulta/` | `ListarPosEstoque` | `nPagina`/`nRegPorPagina`; fim por `nPagina >= nTotPaginas` |
| posição (reconciliação) | `.../estoque/consulta/` | `PosicaoEstoque` | por produto (`id_prod`/`cod_int` + `data`) |
| pedidos de venda | `https://app.omie.com.br/api/v1/produtos/pedido/` | `ListarPedidos` | `pagina`/`registros_por_pagina`; conta real: 5393 pedidos |
| produtos | `https://app.omie.com.br/api/v1/geral/produtos/` | `ListarProdutosResumido` | `pagina`/`registros_por_pagina` — **NÃO reconciliado: conta com 0 registros** |

## Corpo de chamada (POST, JSON)

`{"call": "<Método>", "app_key": "<secret>", "app_secret": "<secret>", "param": [ ... ]}`

## Erros observados na conta real

| Sinal da fonte | Significado | Tratamento implementado |
|---|---|---|
| HTTP 403 + `faultstring` "A chave de acesso não está preenchida ou não é válida." | credencial inválida | `autenticacao_recusada` — SEM retry, execução encerrada |
| HTTP 500 + `faultcode: SOAP-ENV:Client-6` "Consumo redundante detectado. Aguarde N segundos" (REDUNDANT) | rate-limit por janela (NÃO é 429) | `falha_http_500` transitória — retry em etapas separadas (2s/5s, máx. 3) |
| `Method "X" not exists` | método/endpoint errado | bloqueio localizado; ajustar contrato antes de liberar |
| `faultstring` "ID do Produto ou Código de Integração deve ser informado" | parâmetro obrigatório ausente | erro de chamada — não é dado |

## Normalização implementada (estoque)

- Fonte: `ListarPosEstoque` com `cExibeTodos: S`;
- chave de origem: `omie:estoque:app1:<nCodProd>:<codigo_local_estoque>:UN`;
- `saldo` numérico da fonte (zero válido preservado; null quando ausente — não vira zero);
- IDs SEMPRE texto (nCodProd de 10 dígitos não é arredondado);
- unidade: `UN` (posição não expõe unidade; unidade oficial vem do cadastro — pendência SPEC-1-004).

## Vínculo com canais (SPEC-1-003)

- Referência canônica: `codigo_pedido_integracao` no cabeçalho do pedido;
- **conta real: campo VAZIO em amostra de 200 pedidos** — a integração atual não grava referência;
- consequence: vínculo Nuvemshop→Omie fica 0 sem suposição; lacuna registrada ao consultor.

## Limitações honestas

- `produtos` na conta real está vazio (sem cadastro no módulo) — lote vazio legítimo, não erro;
- unidade por item de saldo não vem na posição — usa `UN` até a SPEC-1-004 ler o cadastro;
- sem escrita no ERP (allowlist de consulta).
