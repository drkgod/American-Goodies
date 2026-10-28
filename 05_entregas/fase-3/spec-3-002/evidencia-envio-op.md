# Evidência — Ligar o envio da produção ao Omie com o envio desligado (SPEC-3-002, CA-3-06)

Data: 28/10/2026 · Skip v0.0.174 (ref 9d19c7e), publicada e provada (referência publicada = versão atual).

## Construído (no Skip)
- Migration `0029_pcp_escrita_omie`: coleções `pcp_chaves_escrita` (3 chaves, todas desligadas; a de recebimento não foi criada, está em revisão) e
  `pcp_transacoes_omie`. Aditiva; regras de acesso `null` (só o servidor). Aplicada (`skip_cloud_list_migrations`: applied) e coleções conferidas.
- `src/lib/pcp/envio-op.ts`: montagem do payload canônico, ordem das conferências (ação → chave → estado/hash → lease → adapter), simulador do Omie
  com os modos normal, resposta cortada, recusa e timeout sem efeito.
- `pocketbase/hooks/pcp_op_enviar.js`: `POST /backend/v1/pcp/omie/op/enviar`. Chave desligada = 423 "envio desligado: aguarda autorização do dono", sem
  chamada ao Omie. Contrato em `07-sistemas/pcp/contratos-fase-3.md` (fonte: descrição oficial do serviço).
- `tests/pcp/spec-3-002.test.mjs`: 10 provas.

## Provas
- QA do Skip verde (setup, análise estática, build, integrações). **A suíte não rodou** (`qa.test.ran = false`; sem Node neste computador): os 10 testes ficam
  escritos e **não foram executados**. Teste de mesa refeito contra o código final: chave desligada → 423 e 0 gravações; chave de outra transação → 423;
  sem a ação → 403; 100 UN → 1 conclusão, consulta confere 100, chave volta a desligar; clique duplo e dois trabalhadores → 1 gravação; resposta perdida →
  incerto → consulta → confirmada com 1 gravação; timeout sem efeito → segue incerto; recusa → falhou sem efeito; conteúdo alterado → 422 e 0 gravações;
  quantidade 0 não monta payload.
- P3.02-05 (provas O2/O3/O4 da fase 2 seguem verdes): os arquivos da fase 2 não foram alterados (`fila-omie.ts` e `recuperacao-omie.ts` intactos); a suíte
  não foi reexecutada.

## Limites e pendências
- O envio real nunca foi chamado e nada cria ainda uma transação autorizada: a autorização do dono é a próxima task (CA-3-07). Até lá a rota só responde 423.
- O efeito exato de `ConcluirOrdemProducao` no Omie (estoque, ordem já concluída) não consta do WSDL e será conferido com o dono na primeira gravação.
- Mirror em `07-sistemas/pcp/codigo/`: não feito nesta task; os fontes estão no Skip v0.0.174.

## Atualização 28/10/2026 — testes executados de verdade
`node --test` (Node v24.22.1, baixado de nodejs.org com checksum conferido, pasta temporária) rodou os 10 testes de `tests/pcp/spec-3-002.test.mjs`: **10 de 10 passaram**
(P3.02-01, P3.02-03 e P3.02-04 incluídos; mais conteúdo alterado, recusa, timeout, clique duplo e dois trabalhadores). Total da rodada com a SPEC-3-001: 28 de 28.
Pendente: P3.02-05 (regressão das provas O2/O3/O4 da fase 2), porque os testes `spec-2-*` não foram copiados para rodar.
