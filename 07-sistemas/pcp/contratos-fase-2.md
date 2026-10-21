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

## Adendo (21/10/2026 13:06) — Decisão do owner: método baseline90-v1 APROVADO (2ea1e7ab)

> Decisão registrada pelo executor a partir do aceite explícito do owner na conversa ("Aprovar o baseline90-v1", 21/10/2026 13:06). A aprovação do MÉTODO destrava o cálculo das sugestões quando os dados reais estiverem completos; as provas dos oráculos (51→60, compras 4,8→6, zero→zero, excedente) permanecem as da 0baec76e (tests/pcp/spec-2-006-sugestao.test.mjs).

- **Método aprovado**: baseline90-v1 (fórmula e memória de cálculo do contrato `src/lib/pcp/sugestao.ts`, formula_id 'baseline90-v1') — para sugestão de produção E de compra, com bloqueio por faltante (desconhecido → null, nunca 0).
- **Efeito**: a 2ea1e7ab (CA-S1/S2) passa de bloqueada para aguardando dados — a conferência das sugestões REAIS exige dados completos (vendas_90d/producao_90d reais da e6aa4afa + cadastro Omie 4e0fcf1c).
- **Vigência**: vale até o PCP devolver o método para emenda; qualquer mudança de fórmula exige novo adendo aqui.

## Adendo (21/10/2026 14:25) — Mapa REAL de pedidos firmes APROVADO pelo owner (e6aa4afa)

> Decisão registrada a partir do aceite explícito do owner ("confirmo os dois", 21/10/2026 14:24). Complementa o adendo de 13:06 (baseline90-v1).

- **Status elegíveis** (pedidos de venda): `faturado`, `autorizado`, `parcial` — somam saldo firme no horizonte.
- **Status excluídos**: `cancelado`, `denegado`, `devolvido` (com referência comprovada) — contribuem 0.
- **Data operacional**: data de **faturamento** (`infoCadastro.dFat`) do pedido.
- **Status fora do mapa / data ausente**: quantidade firme = null e bloqueia o item (nunca 0).
- **Vigência**: vale para a importação real (e6aa4afa) e para o cálculo das sugestões (2ea1e7ab). Mudança exige novo adendo datado.
