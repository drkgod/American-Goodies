# Contratos — Fase 3 (07-sistemas/pcp/contratos-fase-3.md)

> Contratos novos da fase 3. Regra: contrato de leitura ou de escrita só entra aqui com a fonte; nada é inventado.

## SPEC-3-002 — Ordem de produção no Omie (28/10/2026)

Fonte: descrição oficial do serviço (`https://app.omie.com.br/api/v1/produtos/op/?WSDL`), lida em 28/10/2026 sem chave nem credencial.
O WSDL traz os campos e tipos, mas **não traz texto explicando o significado de cada campo nem o comportamento de cada método**:
o efeito exato da conclusão (movimentos de estoque, o que acontece com ordem já concluída) fica **para conferir com o dono
presente na primeira gravação**, como manda a regra 6 do índice. Nenhuma chamada foi feita.

### ConcluirOrdemProducao (a que o sistema usa)
- Endpoint: `https://app.omie.com.br/api/v1/produtos/op/` · `call: ConcluirOrdemProducao` · `param: [ { ... } ]`.
- Pedido: `nCodOP` (inteiro), `cCodIntOP` (texto), `dDtConclusao` (texto, `dd/mm/aaaa`), `nQtdeProduzida` (decimal, obrigatório), `cObsConclusao` (texto).
- Resposta: `nCodOP`, `cCodIntOP`, `cCodStatus`, `cDesStatus`. O sistema trata `cCodStatus = "0"` como aceito; qualquer outra coisa não é sucesso.
- O sistema envia a ordem por `nCodOP` (vínculo pelo número exato) quando o tem, sempre com `cCodIntOP`; nunca trunca o código de integração.

### Outros métodos do serviço (documentados, não usados nesta task)
- `IncluirOrdemProducao`: `identificacao` (nCodOP, cCodIntOP, cNumOP, nCodProduto, cCodIntProd, dDtPrevisao, nQtde, codigo_local_estoque, cReservado, lote_validade_op), `infAdicionais` (dDtInicio, dDtConclusao, nCodProjeto, cEtapa), `observacoes` (cObs), `outrasInf`, `itens` (nIdProdutoMalha, cUtilizarDoEstoque, lote_validade). Resposta: nCodOP, cCodIntOP, cCodStatus, cDesStatus.
- `ReverterOrdemProducao`: `nCodOP`, `cCodIntOP`. **O sistema nunca reverte** (regra: efeito gravado exige decisão humana).

### Decisões do sistema sobre o contrato
- Uma tentativa por operação. Resposta perdida ou ambígua = "resultado incerto": só consulta (`ConsultarOrdemProducao`), nunca repete a gravação.
- Recusa de validação do Omie (`faultcode` começando com `SOAP-ENV:Client`, fora de bloqueio por consumo) = "falhou sem efeito". Bloqueio por consumo (HTTP 425 / "consumo redundante") **não** é tratado como sem efeito: fica "resultado incerto".
- Quantidade final zero ou negativa nunca monta payload.
- A chave `omie_op_escrita` volta a desligar antes de cada chamada que grava: uma ordem por vez.

### ConsultarOrdemProducao — o que a conferência lê (SPEC-3-002, CA-3-07)
- Pedido: `nCodOP` (quando o sistema o tem) ou `cCodIntOP`. Só leitura; uma consulta por conferência; bloqueio por consumo (HTTP 425 / "consumo redundante") devolve "inconclusivo".
- Campos usados: `identificacao.nQtde` (quantidade da ordem) e `outrasInf.cConcluida` (`S` = concluída), conforme a amostra de 20/10 e o WSDL.
- **Ponto em aberto, a confirmar na primeira gravação com o dono:** a leitura documentada devolve a quantidade da ordem (`nQtde`), não uma quantidade produzida à parte. Se o Omie atualizar `nQtde` ao concluir, a conferência bate; se não, a conferência aponta divergência sem gravar nada.
- Estoque: sem leitura de estoque guardada antes do envio, o resultado é "conferido sem estoque", nunca "conferido".

## PedidoCompra (produtos/pedidocompra/) — lido do WSDL em 28/10/2026 (SPEC-3-004 e SPEC-3-006)

Fonte: WSDL público do método, só leitura da documentação; nenhuma chamada à conta. Conferência por amostra real continua pendente (chave bloqueada, CL-PEND-006).

- **IncluirPedCompra (pedido):** `cabecalho_incluir` (`cCodIntPed`, `dDtPrevisao`, `cCodParc`, `nQtdeParc`, `nCodFor`/`cCnpjCpfFor`/`cCodIntFor`, `cCodCateg`, `nCodCompr`, `cContato`, `cNumPedido`, `cObs`, `cObsInt`, `cEmailAprovador`…), `produtos_incluir[]` (`cCodIntItem`, `cCodIntProd`, `nCodProd`, `cProduto`, `cUnidade`, `nQtde`, `nValUnit`, `nDesconto`, impostos…), `frete_incluir`, `parcelas_incluir[]`, `departamentos_incluir[]`. Todos os blocos são obrigatórios no esquema, mas aceitam nulo.
- **Resposta da inclusão:** `nCodPed`, `cCodIntPed` (código de integração), `cCodStatus`, `cDescStatus`, `cNumero`.
- **ConsultarPedCompra:** aceita `nCodPed`, `cCodIntPed` ou `cNumero`; o cabeçalho traz `nCodFor`, `dIncData`, `cEtapa`, `cNumero`, `dDtPrevisao`.
- **Efeito na SPEC-3-004:** o fornecedor do pedido vem em `nCodFor` (código do Omie, não o nome) e a data de inclusão em `dIncData`; os nomes `nValUnit` e `nValTot` dos itens na CONSULTA ainda não foram vistos numa resposta real e seguem como hipótese (`camposConfirmados = false`).
- **Efeito na SPEC-3-006:** o código de integração (`cCodIntPed`) permite consultar sem repetir a gravação. O adapter ainda não foi construído; a chave `omie_pedido_compra_escrita` segue desligada.

## PedidoVenda (produtos/pedido/) — lido do WSDL em 28/10/2026 (SPEC-3-009)

Fonte: WSDL público do método, só leitura da documentação; nenhuma chamada à conta. Conferência por amostra real continua pendente (chave bloqueada, CL-PEND-006).

- **Operações do serviço:** `IncluirPedido`, `AlterarPedidoVenda`, `ConsultarPedido`, `ListarPedidos`, `StatusPedido`, `TrocarEtapaPedido`, `AlterarPedFaturado`, `ExcluirPedido`, `DevolverPedido`, `SimularImpostos`. O sistema usa só `IncluirPedido` (pedido manual), `AlterarPedidoVenda` (volumes e frete do pedido liberado) e `ConsultarPedido`. Nunca usa `ExcluirPedido`, `DevolverPedido` nem `TrocarEtapaPedido`: não fatura nem emite nota.
- **cabecalho:** `codigo_pedido_integracao` (código de integração, persistido antes de gravar), `codigo_cliente`, `data_previsao`, `etapa`, `quantidade_itens`, `codigo_parcela`, `origem_pedido`.
- **det[]:** `ide.codigo_item_integracao`, `produto.codigo_produto`/`codigo`, `produto.quantidade`, `produto.valor_unitario`, `produto.unidade`.
- **frete:** `modalidade` (texto do Omie; valores aceitos ainda não conferidos), `quantidade_volumes`, `peso_bruto`, `peso_liquido`, `codigo_transportadora`, `especie_volumes`. Não existe campo de cubagem.
- **informacoes_adicionais:** `numero_pedido_cliente` (referência do canal, usada na checagem de duplicata).
- **Resposta da inclusão e da alteração:** `codigo_pedido`, `codigo_pedido_integracao`, `codigo_status`, `descricao_status`, `numero_pedido`.
- **ConsultarPedido:** aceita `codigo_pedido`, `codigo_pedido_integracao` ou `numero_pedido`.
- **Pontos em aberto, a confirmar na primeira gravação com o dono:** valores aceitos de `modalidade`; `etapa` inicial do pedido manual; se `AlterarPedidoVenda` aceita só `frete` sem reenviar o cabeçalho.
- **Decisões do sistema:** uma tentativa por operação; resposta perdida ou 425 = "resultado incerto" (só consulta); recusa de validação = "falhou sem efeito"; a chave `omie_pedido_venda_escrita` volta a desligar antes de cada chamada que grava. Nenhuma nota fiscal é emitida nem transmitida.

## Histórico de vendas por período (SPEC-3-012) — 29/10/2026

- **Leitura:** `ListarPedidos` (produtos/pedido/) com `data_faturamento_de` e `data_faturamento_ate` (campos do WSDL público; nenhuma chamada à conta), uma página por chamada (`registros_por_pagina` 20, `apenas_resumo` N para trazer `det`). Fim = `pagina >= total_de_paginas`.
- **Regra de pedido (mapa de 21/10):** entra só pedido faturado com `infoCadastro.dFat`; saem cancelado, denegado, devolvido e devolvido parcial; item sem código ou sem quantidade válida é ignorado (nunca zero). Mês só conta como lido quando a última página entrou.
- **Não confirmado numa amostra real (chave bloqueada, CL-PEND-006):** que o filtro `data_faturamento_*` devolva exatamente os pedidos faturados no intervalo; a rota confere a data de cada pedido e ignora os que caírem fora do mês.
