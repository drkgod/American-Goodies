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
