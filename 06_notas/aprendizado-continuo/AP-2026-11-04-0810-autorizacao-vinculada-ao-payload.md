# AP-2026-11-04-0810 — Autorização de gravação no ERP vinculada ao conteúdo exibido

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: patch do consultor de 02/11 (SPECs 3-005, 3-006 e 3-009), Skip v0.0.197
- Sinal: a autorização do dono passou a guardar o conteúdo exato que ele viu (`payload_autorizado`, migration 0045). Se o pedido mudar depois da autorização, a gravação recusa com 409 `pedido_alterado_apos_autorizacao` sem chamar o Omie, e a autorização cai. Antes, a autorização valia por identificador: um pedido alterado podia ser gravado com o conteúdo novo, que o dono nunca aprovou.
- Evidência: `05_entregas/fase-3/patch-2026-11-02/evidencia-patch.md`; teste "conteúdo que muda depois da autorização muda o payload" (`spec-3-019-patch-regras.test.mjs`) dentro dos 206/206 executados em 03/11.
- Regra reutilizável: toda autorização humana de ação irreversível guarda o conteúdo apresentado e o compara no momento de executar; divergência recusa a ação e derruba a autorização — nunca reconfirmar sozinha nem gravar o conteúdo novo. No mesmo movimento, dado desconhecido bloqueia só a linha afetada e o total sai marcado como parcial, nunca zero.
- Quando aplicar: gravação em ERP ou sistema externo, envio de documento, pagamento e qualquer ação que o cliente aprova olhando uma tela.
- Quando não aplicar: leitura e ação idempotente sem efeito externo — aí a comparação de conteúdo só acrescenta atrito.
- Confiança: alta — comportamento coberto por teste executado e migration aplicada em preview e produção.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
