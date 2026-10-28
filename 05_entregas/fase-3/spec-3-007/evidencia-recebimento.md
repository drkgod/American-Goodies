# Evidência — Recebimento conferido, parcelas, exceção e pré-conferência (SPEC-3-007)

Data: 28/10/2026 · Skip v0.0.182 (ref 48f4e84), publicada e provada (referência publicada = versão atual; a v0.0.181 não foi publicada: a conexão com o Skip caiu no meio do envio e a alteração foi refeita e conferida).

## Construído (no Skip)
- **CA-3-19 conferência física:** `recebimento.ts` (módulo no espelho do repositório; os hooks repetem a regra), migration `0035_pcp_recebimentos` (`pcp_recebimentos`, `pcp_parcelas_compra`, `pcp_notas_demo`, regras null),
  rota `POST /backend/v1/pcp/compras/recebimento` (exige `conferir_recebimento` e a área recebimento): cada linha liga a um ou mais pedidos aprovados e ligados do mesmo fornecedor, com o item; a soma das ligações tem de bater (422);
  quantidade de compra converte pelo fator confirmado; falta e sobra somam recebimentos anteriores; mesma identificação não duplica. Nada ajusta estoque, classifica nota ou lança no financeiro.
- **CA-3-20 parcelas:** rotas `POST .../compras/parcelas` e `.../parcelas/pago` (exigem `conferir_financeiro_recebimento`): parcelas previstas por pedido e número, marca de pagamento antecipado com referência. Recebimento de pedido já pago mostra "já paga: não lançar nova conta a pagar" e não cria parcela.
- **CA-3-21 item sem cadastro:** barrado com "cadastrar no Omie antes de comprar"; só entra com exceção autorizada (rota de exceção da SPEC-3-003, documento "recebimento") e fica pendente de cadastro e ligação; linha sem pedido aprovado também só por exceção.
- **CA-3-22 pré-conferência:** rota `POST .../compras/preconferencia` compara nota, pedido, recebimento e parcelas; **nota real é recusada (422)**; resultado "confere" ou "pendente" com a diferença.
- Leitura `GET .../compras/recebimentos` e tela `/recebimentos` (registrar chegada, diferenças em vermelho, parcelas, aviso de já paga, pré-conferência).

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-007, **91 de 91 passaram** (11 novos).
  P3.07-01 (100 KG ligados a 60 + 30: recusado), P3.07-02 (compra já paga: aviso, nenhuma parcela), P3.07-03 (item sem cadastro: bloqueado; com exceção entra pendente), P3.07-04 (100 KG = 60 do pedido A + 40 do B: sem diferença),
  P3.07-05 (nota de demonstração com 110 KG para pedido de 100 KG: pendente com 10 KG), além de falta/sobra acumulada, item não pedido por exceção, fator, parcelas e nota real recusada.
- QA do Skip verde na v0.0.182; migration 0035 aplicada e coleções conferidas; sem avisos nos logs.

## Parte em revisão (não construída, de propósito)
- Leitura de notas de entrada reais e escrita do recebimento no Omie (`omie_recebimento_escrita` não existe). Aguarda a resposta do CL-PEND-007 e a emenda do consultor.

## Limites e pendências
- Os pedidos aprovados e ligados dependem do fluxo das SPECs 3-005 e 3-006; sem compra aprovada e ligada (alçadas e leitura do Omie ainda pendentes), a tela não tem pedido para receber.
- **P3.07-06 (regressão):** as provas das SPECs 3-003, 3-005 e 3-006 passam (mesma suíte de 91), mas os testes `spec-2-*` não foram reexecutados.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste). As ações de recebimento não foram dadas a nenhuma conta real (matriz CL-003).
