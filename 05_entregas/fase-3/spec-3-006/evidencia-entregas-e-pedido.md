# Evidência — Entregas e lançamento da compra no Omie (SPEC-3-006)

Data: 28/10/2026 · Skip v0.0.180 (ref a415ac1), publicada e provada (referência publicada = versão atual).

## Construído (no Skip)
- **CA-3-17 entregas:** `pedido-compra.ts` (restante = pedida − recebida, nunca negativo; atraso em dias quando a previsão passou e ainda resta; cancelado comprovado não atrasa; emergencial marcada),
  migration `0034_pcp_entregas_vinculo` (`pcp_entregas_compra`, `pcp_pedidos_compra_vinculo`, regras null), rota `GET /backend/v1/pcp/compras/entregas` e tela `/compras/entregas` (por fornecedor, com a hora da última leitura).
- **CA-3-18 ligação manual:** rota `POST .../compras/pedido/ligar` (só compra aprovada e igual à aprovada; número conferido na leitura: mesmo fornecedor e mesmos itens; nunca só por valor; uma compra por pedido).
- **CA-3-18 lançamento atrás da chave:** rotas `POST .../pedido/autorizar` (só `autorizar_escrita_omie`, uma compra por vez, conteúdo visto = conteúdo atual), `.../pedido/lancar` (423 com a chave desligada; vínculo criado antes da chamada;
  a chave desliga antes; uma única chamada `IncluirPedCompra`; resposta perdida = resultado incerto) e `.../pedido/conferir` (só `ConsultarPedCompra` pelo código de integração, que é o id da compra; 425 mantém o estado).
  Campos do pedido conforme o WSDL (`07-sistemas/pcp/contratos-fase-3.md`).
- Tela de requisições: compra aprovada mostra os dados para lançar à mão, o campo do número, "Ligar ao pedido", "Lançar no Omie" e, se incerto, "Conferir no Omie".

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-006, **80 de 80 passaram** (8 novos).
  P3.06-01 (compra não aprovada: negada, zero gravações), P3.06-02 (chave desligada ou de outra compra: 423, zero chamadas), P3.06-03 (outro fornecedor/itens: recusada com a diferença),
  P3.06-04 (20 KG pedidos, 5 recebidos, previsto ontem: restante 15 e 1 dia de atraso), P3.06-05 (simulador com resposta perdida: uma gravação, consulta acha o pedido e liga sem gravar de novo).
- QA do Skip verde na v0.0.180; migration 0034 aplicada e coleções conferidas; sem avisos nos logs.

## Limites e pendências
- **Leitura real dos pedidos de compra:** `pcp_entregas_compra` está vazia até a rotina de leitura rodar com a chave do Omie liberada (CL-PEND-006); a tela avisa isso. A ligação manual depende dessa leitura para conferir.
- **Chave `omie_pedido_compra_escrita` desligada.** Nenhuma chamada ao Omie foi feita. A primeira gravação real só com o dono presente (CL-PEND-011), com alçadas cadastradas, fornecedor e itens cadastrados e o contrato conferido por leitura.
- **Código do fornecedor:** o lançamento exige o código numérico do Omie no campo fornecedor da compra; a lista de fornecedores do Omie ainda não é lida. Sem ele, a rota responde "fornecedor sem código do Omie".
- **P3.06-06 (regressão da fase 2):** testes `spec-2-*` não copiados; compras a receber da fase 2 não foi alterado.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste). O contrato de inclusão veio só do WSDL; não foi conferido por uma resposta real.
