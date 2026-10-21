# Contratos — Fase 2 (07-sistemas/pcp/contratos-fase-2.md)

> Registro dos mapas de leitura da SPEC-2-001 (CA-D3). Regras empresariais (status elegíveis/excluídos, campo de data operacional) só valem após aprovação do PCP neste arquivo — sem inferir regra.

## Adendo (21/10/2026) — Mapas CA-D3 da task 9318a299 (sondas read-only provadas)

> Fonte: sondas de leitura na conta real em 21/10/2026 (hooks temporários, sem mutantes, removidos após a prova; evidência em 05_entregas/fase-2/spec-2-001/evidencia-9318a299.md). Mapas SINTÉTICOS — a regra empresarial só vale após aprovação do PCP neste arquivo.

### vendas_90d (pedidos de venda)
- Endpoint/método: https://app.omie.com.br/api/v1/produtos/pedido/ · `ListarPedidos` · param {pagina, registros_por_pagina, apenas_resumo: 'S'}.
- Prova: HTTP 200, total_de_registros 5.501, total_de_paginas 1.101 (5/página).
- Campos: status em infoCadastro.{faturado, cancelado, denegado, devolvido, devolvido_parcial} com datas dFat/dCan; identidade cabecalho.codigo_pedido + det[].ide.codigo_item_integracao; produto/quantidade/unidade em det[].produto.{codigo_produto, quantidade, unidade}; data candidata a operacional: dFat (faturado) ou cabecalho.data_previsao — ESCOLHA PENDENTE DE APROVAÇÃO DO PCP.
- Paginação: pagina/total_de_paginas; fim = pagina > total_de_paginas.

### compras_a_receber (pedidos de compra)
- Endpoint/método: https://app.omie.com.br/api/v1/produtos/pedidocompra/ · `PesquisarPedCompra` · param com lExibirPedidos* = T (todos os status).
- Prova: HTTP 200; amostra real pedido cNumero 1514 (nCodPed 9932022414, cEtapa 20, dDtPrevisao 20/11/2026).
- Campos: identidade cabecalho_consulta.nCodPed + produtos_consulta[].nCodItem; produto nCodProd/cProduto; unidade cUnidade; quantidade_pedida nQtde; quantidade_recebida nQtdeRec; restante = nQtde − nQtdeRec (nunca negativo); data_prevista_local = dDtPrevisao; status_origem = cEtapa (20 = pendente na amostra); cancelado a comprovar no mapa da conta.
- Paginação: nPagina/nRegsPorPagina; total de registros a confirmar na homologação (amostra não trouxe nTotRegistros).

### producao_90d (ordens de produção)
- Endpoint/método: https://app.omie.com.br/api/v1/produtos/op/ · `ListarOrdemProducao` — já provado na a2a4ccf1 (HTTP 200, 1.114 OPs em 112 páginas) e ConsultarOrdemProducao com 14 componentes do M011001.

### NF-e (sem uso na conta)
- `produtos/nfe` · `ListarNFe`: HTTP 200 com 0 registros em 2023–2026. Método existe; SEM amostra → sem campos homologados. Pendência explícita: se a conta começar a emitir NF-e, reabrir mapa antes de usar.
