# Evidência — Histórico de preços por produto e fornecedor (SPEC-3-004)

Data: 28/10/2026 · Skip v0.0.178 (ref b9fad7e), publicada e provada (referência publicada = versão atual).

## Construído (no Skip)
- **CA-3-12 histórico:** `historico-precos.ts` (classificação insumo, frete, serviço, N-D e "a classificar"; preço na unidade de estoque pelo fator confirmado da SPEC-3-003;
  menor, maior, média e último por fornecedor e período; cancelado marcado e fora da média; sem preço = pendente, nunca zero; sem fator = unidade de compra, fora da comparação),
  migration `0032_pcp_precos_compra` (coleção derivada, regras null), rotas `GET /backend/v1/pcp/compras/historico` (exige `consultar_compras` e área compras) e
  `POST .../compras/historico/classificar` (exige `editar_requisicao`), tela `/compras/historico` com filtro de período, frete/serviço no documento e fila "a classificar".
- **CA-3-13 leitura real:** o conversor `lerPedidoCompra` e a chave de linha (aplicativo + pedido + linha, sem apagar linha) existem e estão provados em fixture, mas a leitura
  de preço fica DESLIGADA (`camposConfirmados = false`): os campos de preço e o tipo do item não foram conferidos numa amostra real, porque a chave do Omie está bloqueada (CL-PEND-006).
  Os nomes `nValUnit`, `nValTot`, `nCodFor` no código são hipóteses a confirmar, não contrato.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-004, **64 de 64 passaram** (8 novos).
  P3.04-01 (insumo, frete e serviço no mesmo pedido: só o insumo no histórico), P3.04-02 (sem preço → pendente, não zero), P3.04-03 (4 sacos a R$ 250,00, fator 25 → 100 KG a R$ 10,00/KG),
  cancelado fora da média, período, fatores ambíguos recusados, nova leitura mantém a classificação de Compras, leitura desligada até a amostra.
- QA do Skip verde na v0.0.178; migration 0032 incluída.

## Limites e pendências
- **P3.04-04 (leitura real) e preenchimento do histórico:** esperam o Omie liberar a chave (CL-PEND-006) para conferir a amostra e registrar os campos em `07-sistemas/pcp/contratos-fase-3.md`.
  Não existe rotina que grave linhas em `pcp_precos_compra` ainda; sem ela o histórico aparece vazio. A rotina é construída depois da amostra, com a pausa e a parada de 425 já usadas no catálogo.
- **Ligação código do produto × id do pedido:** o pedido traz `nCodProd` (id) e o catálogo e os fatores usam o código; a tabela de ligação precisa ser conferida na amostra.
- **Desconto:** não aplicado (campo não conferido); entra como pendência até a amostra.
- **P3.04-05 (regressão da fase 2):** os testes `spec-2-*` não foram copiados; o cálculo de compras a receber da fase 2 não foi alterado.
- Rotas e tela não exercitadas contra o servidor (sem conta de teste neste ambiente).
