# Evidência — Autorização do dono e conferência depois do envio (SPEC-3-002, CA-3-07)

Data: 28/10/2026 · Skip v0.0.175 (ref e2b0917), publicada e provada (referência publicada = versão atual).

## Construído (no Skip)
- `src/lib/pcp/autorizacao-op.ts`: resumo para o dono (ordem, produto, quantidade, data, local, efeito esperado), autorização de uma ordem por vez com hash visto,
  desfazer autorização, conferência depois do envio (só leitura).
- Rotas (`pocketbase/hooks/`): `pcp_op_autorizar.js` (só a ação `autorizar_escrita_omie`; liga a chave só para a ordem), `pcp_op_desautorizar.js`,
  `pcp_op_conferir.js` (só leitura, uma consulta, para no 425), `pcp_op_fila.js` (o que a tela mostra).
- Tela `/envio-omie` (menu "Envio ao Omie"): estado da chave, cartão por ordem com o que será gravado, botões Autorizar, Desfazer, Enviar e Conferir conforme a ação da conta;
  estados vazio, carregando e erro.
- Testes: `tests/pcp/spec-3-002-autorizacao.test.mjs` (10 provas).

## Provas
- `node --test` (Node v24.22.1): suíte inteira das SPECs 3-001 e 3-002, **38 de 38 passaram**, incluindo P3.02-02 (outra pessoa que não o dono não autoriza), conteúdo alterado,
  uma ordem por vez, desfazer, fluxo completo no simulador ("gravado e conferido") e conferência divergente/inconclusiva/sem estoque.
- QA do Skip verde. Logs do Skip Cloud depois da publicação sem erro de carga dos hooks.

## Limites e pendências
- **Nenhuma ordem existe para autorizar ainda:** a preparação da transação (a partir da conferência real aprovada pelo PCP) não foi construída, porque as conferências
  reais dependem do catálogo e das ordens reais (CA-3-05, Omie bloqueado). A tela mostra "Nenhuma ordem pronta para autorizar".
- Produto e local aparecem como "não informado" até a preparação guardá-los; estoque da conferência fica "não comparado" até haver posição de antes do envio.
- As rotas e a tela não foram exercitadas contra o servidor (sem conta de teste neste ambiente); a prova é o módulo testado, o QA e a ausência de erro nos logs.
- A chave de escrita segue desligada; nenhuma chamada ao Omie foi feita.
