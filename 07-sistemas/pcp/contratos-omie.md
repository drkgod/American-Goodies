# Contrato Omie — leitura (SPEC-1-002, reconciliado com a conta real)

Atualizado em 2026-10-08 16:30 · Credenciais: secrets do projeto (nunca aqui).

## Recursos liberados (allowlist de CONSULTA — nada mutante)

| Recurso | Endpoint | Call | Paginação confirmada |
|---|---|---|---|
| estoque (piloto) | `https://app.omie.com.br/api/v1/estoque/consulta/` | `ListarMovimentoEstoque` | `nPagina`/`nRegPorPagina`; janela `dDtInicial`/`dDtFinal` (90 dias, limite F1) |
| produtos | `https://app.omie.com.br/api/v1/geral/produtos/` | `ListarProdutosResumido` | `pagina`/`registros_por_pagina`, `apenas_importado_api: N` |
| posição (reconciliação) | `.../estoque/consulta/` | `PosicaoEstoque` | por produto (`id_prod`/`cod_int` + `data`) |

## Corpo de chamada (POST, JSON)

`{"call": "<Método>", "app_key": "<secret>", "app_secret": "<secret>", "param": [ ... ]}`

## Erros observados na conta real

| Sinal da fonte | Significado |Tratamento implementado |
|---|---|---|
| HTTP 403 + `faultstring` "A chave de acesso não está preenchida ou não é válida." | credencial inválida | `autenticacao_recusada` — SEM retry, execução encerrada |
| `faultcode: SOAP-ENV:Client-6` "Consumo redundante detectado. Aguarde N segundos" | rate-limit por janela | `falha_transporte` transitória — retry em etapas separadas (2s/5s, máx. 3) |
| `Method "X" not exists` | método/endpoint errado | bloqueio localizado; ajustar contrato antes de liberar |
| `faultstring` "ID do Produto ou Código de Integração deve ser informado" | parâmetro obrigatório ausente | erro de chamada — não é dado |

## Normalização implementada (estoque)

- Fonte: movimentos (`movProdutoListar[]`) ordenados por data na fonte;
- posição reconstruída: último movimento por (idProd, codigo_local_estoque) na página;
- chave de origem: `omie:estoque:app1:<idProd>:<local>:UN`;
- `saldo` numérico da fonte (zero válido preservado; null quando ausente — não vira zero);
- IDs SEMPRE texto (idProd de 10 dígitos não é arredondado);
- unidade: `UN` (movimento não expõe unidade própria; unidade oficial vem do cadastro do produto — pendência registrada para SPEC-1-004).

## Limitações honestas

- `produtos` na conta real está vazio (sem cadastro no módulo) — lote vazio legítimo, não erro;
- unidade por item de saldo não vem no movimento — usa `UN` até a SPEC-1-004 ler o cadastro;
- janela de 90 dias (limite da Fase 1); sem escrita no ERP (allowlist de consulta).
