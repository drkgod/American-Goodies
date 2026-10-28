# Evidência — Pedido pronto para faturar: frete, volumes, fila, manuais e envio ao Omie (SPEC-3-009)

Data: 28/10/2026 · Skip v0.0.185 (ref 1015307), publicada e provada (referência publicada = versão atual). A primeira tentativa de aplicar (v0.0.184) falhou por erro de infraestrutura do Skip ("could not read the instance migrations"); a repetição passou com o QA verde e a migration 0037 aplicada.

## Construído (no Skip)
- **CA-3-26 frete e volumes:** `preparacao-pedido.ts`; coleções `pcp_preparacao_pedido`, `pcp_volumes` (histórico de contagens). Rotas `POST .../faturamento/pedido/frete` (`preparar_pedido`; seis modalidades, nenhuma padrão) e `.../pedido/volumes` (`conferir_volumes`; inteiro de 1 a 9999, peso opcional; sem campo de cubagem). Versão esperada, 409 em conflito, 403 sem pistas.
- **CA-3-27 fila e liberação:** `GET .../faturamento/pedidos` (ampliada) mostra frete, volumes, duplicata e o selo apto / bloqueado com motivos / liberado; `POST .../pedido/liberar` (`liberar_faturamento`) só libera o que a leitura mais recente da fila marcou como apto (selo igual ao visto, até 5 min). Autor e hora gravados em `pcp_liberacoes_faturamento`. Mudança de frete, volumes ou conteúdo depois da liberação a desfaz e registra.
- **CA-3-28 pedido manual:** `POST .../pedido/manual` (motivo obrigatório; mesma referência de pedido do Omie ou de outro manual = duplicata bloqueada; mesmo cliente, data e itens sem referência que os distinga = "a revisar"; o valor nunca entra na conta) e `POST .../pedido/duplicata` (decisão com motivo; duplicata comprovada não se decide). Tela `/pedidos/manuais`.
- **CA-3-29 gravação atrás da chave:** `POST .../venda/autorizar` (só `autorizar_escrita_omie`, escopo "pedido:operação", uma autorização por vez, conteúdo igual ao visto), `POST .../venda/gravar` (423 com a chave desligada e a tela recebe o que lançar; chave desliga antes da chamada; uma linha única por pedido e operação; resposta perdida = "resultado incerto", sem repetir), `POST .../venda/conferir` (só `ConsultarPedido`). Chave `omie_pedido_venda_escrita` semeada DESLIGADA na migration. Contrato lido do WSDL público em `07-sistemas/pcp/contratos-fase-3.md` (sem chamada à conta). Nenhuma nota fiscal é emitida.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-009, **115 de 115 passaram** (14 novos em `spec-3-009.test.mjs`).
  P3.09-01 (sem frete e sem volumes: bloqueado com os dois motivos), P3.09-02 (manual com mesma referência: duplicata bloqueada), P3.09-03 (chave desligada: 423, zero chamadas, dados para lançar à mão), P3.09-04 (CIF, 12 volumes: apto, liberado, gravado uma vez no simulador e conferido), P3.09-05 (manual parecido sem referência: "possível duplicata"), P3.09-06 (volumes alterados depois da liberação: liberação desfeita; provas da SPEC-3-008 verdes),
  além de escopo da chave (outro pedido ou operação não vale), resposta perdida (só consulta), recusa ("falhou sem efeito"), valor não junta pedidos e acessos 403.
- QA do Skip verde na v0.0.185; migration 0037 aplicada.

## Limites e pendências
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); os hooks duplicam a lógica do módulo e só o módulo tem teste automático.
- Nenhuma conta real recebeu as ações novas (matriz CL-003). Nenhuma chamada ao Omie; a chave de venda segue desligada.
- Campos do pedido do Omie lidos pela fila seguem sem amostra real (chave bloqueada, CL-PEND-006). Valores aceitos de `modalidade`, `etapa` inicial do pedido manual e se `AlterarPedidoVenda` aceita só o bloco `frete` ficam para a primeira gravação com o dono presente (CL-PEND-011); `IncluirPedido` pode ser recusado até lá ("falhou sem efeito").
- Regras de frete das unidades (CL-PEND-010) não chegaram; o frete é escolhido pedido a pedido.
- A duplicata é checada na leitura da fila e na criação; a checagem no momento exato da liberação vale pelo selo da última leitura (até 5 min).
- Regressão da fase 1 e 2 não reexecutada.
