# Evidência — Task 9318a299 (Comprovar as leituras de histórico e compras a receber)

SPEC-2-001 CA-D3 · 21/10/2026 · recorte do executor · executor MCC (ETHOS)

## Sondas read-only na conta real (21/10, hooks temporários removidos após a prova)
- **vendas** — `produtos/pedido` · `ListarPedidos` (apenas_resumo S): HTTP 200, **total_de_registros 5.501**, paginação pagina/total_de_paginas/registros; por pedido: infoCadastro.{faturado, cancelado, denegado, devolvido, devolvido_parcial, dFat, dCan}, cabecalho.{codigo_pedido, numero_pedido, etapa, data_previsao, codigo_cliente, quantidade_itens, origem_pedido}, det[].produto.{codigo_produto, quantidade, unidade}.
- **compras** — `produtos/pedidocompra` · `PesquisarPedCompra` (todos os status T): HTTP 200; cabecalho_consulta.{nCodPed, cNumero, cEtapa, dDtPrevisao, dIncData, cCodCateg}; produtos_consulta[].{nCodProd, cProduto, cDescricao, cUnidade, nQtde, nQtdeRec, nValUnit, nCodItem}; parcelas_consulta[].{nParcela, nPercent, nValor, dVencto}. Amostra real: pedido 1514 (nCodPed 9932022414, etapa 20, previsão 20/11/2026) — ESPONJA DUPLA FACE M084073 UN nQtde 1 nQtdeRec 0; COPO CRISTAL M043033 PA; XAROPE FRAMBOESA.
- **nfe** — `produtos/nfe` · `ListarNFe`: HTTP 200 com **0 registros em 2023–2026** — a conta não emite NF-e por esse módulo; vendas transitam por pedidos de venda. Mapa do método registrado; SEM amostra → sem campos homologados (pendência explícita, não zero).
- Sem mutantes (nenhum Incluir/Alterar/Excluir/Upsert/Devolver); token efêmero criado e apagado; sondas removidas do projeto (v0.0.140/0.0.141).

## Contrato sintético (TDD 6/6 — oráculos T5 da SPEC)
- src/lib/pcp/pedidos-firmes.ts: saldoFirme com MAPA explícito (status elegíveis, horizonte inclusivo), replay por pedido+linha, desconhecido → null e bloqueia (nunca 0), restante nunca negativo.
- T5-1 20−5=15 no horizonte · T5-2 cancelado/fora do horizonte=0 · T5-3 replay mantém 15 · T5-4 status desconhecido bloqueia · T5-5 data ausente bloqueia; borda inclusiva · T5-6 saldo inconsistente bloqueia.
- Card visível na tela /apontamentos. Skip v0.0.142, produção ref 117a14d provada.

## Mapas CA-D3 (registrados em 07-sistemas/pcp/contratos-fase-2.md — aguardando aprovação do PCP)
- vendas_90d: ListarPedidos (apenas_resumo S) com status de infoCadastro + data_operacional a aprovar (dFat ou data_previsao) e restante por linha de det[].
- compras_a_receber: PesquisarPedCompra com restante = nQtde − nQtdeRec por item, data_prevista_local = dDtPrevisao, status_origem = cEtapa.
- producao_90d: ListarOrdemProducao (já provado na a2a4ccf1: 1.114 OPs).
- Regra real (status elegíveis/excluídos e campo de data) SÓ vale após aprovação do PCP — sem inferir regra empresarial.

## Teste humano (pendente)
- Login na produção → Apontamentos → card "Pedidos firmes no horizonte — oráculos T5 da SPEC-2-001 (9318a299)": firme 15 · cancelado/fora 0 · replay 15 · desconhecido null (bloqueia) · borda inclusiva 30 · inconsistente null.
