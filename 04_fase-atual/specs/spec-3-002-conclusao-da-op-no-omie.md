# SPEC-3-002 — Conclusão da ordem de produção no Omie, com a chave desligada

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (PCP aprova a conferência; o dono autoriza a gravação) com o Maestro  
**Origem no escopo:** tarefa 6e38e5a3 (ligar o envio ao Omie e fazer o primeiro envio real, SPEC-2-005 CA-O2 e CA-O5), transferida da fase 2 por AC-26-01; fluxo-alvo 7 do escopo; RQ-002/012; CL-001  
**Degrau da solução:** reuso — a fila de envio, as provas de recuperação e o contrato de leitura das ordens de produção já existem; acrescenta o adapter real atrás da chave `omie_op_escrita`, a tela de autorização do dono e a conferência depois do envio.

## Contexto e decisões fechadas

- **Estado atual:** a fila de envio é simulada (`fila-omie.ts`), com as provas de recuperação verdes (`recuperacao-omie.ts`: revogação, reinício, corrida, resposta perdida). A leitura das ordens de produção foi provada na conta (`ListarOrdemProducao` com 1.114 ordens e `ConsultarOrdemProducao` com os componentes da ficha do produto piloto). A aprovação do PCP sobre a conferência (`revisao-consolidacao.ts`) existe. Nenhuma chamada de gravação foi feita ao Omie.
- **Estado desejado:** a fila sabe concluir a ordem no Omie de verdade, mas com a chave `omie_op_escrita` desligada não grava nada. O dono vê o que vai ser gravado e autoriza uma ordem por vez; depois do envio, o sistema confere no Omie a ordem, a quantidade, o status e o estoque.
- **Decisões já fechadas:**
  - A conclusão gera os movimentos de estoque do próprio Omie; o sistema não envia baixa adicional pelos apontamentos.
  - Ordem existente no Omie só é vinculada pelo número exato; inclusão nova usa código de integração persistido antes do envio, sem truncar.
  - Quantidade final zero ou negativa nunca é enviada.
  - Resposta perdida ou timeout: só consultar; nunca repetir a gravação sem a consulta provar que não houve efeito.
  - Divergência de consumo entre o apontado e a ficha bloqueia aquela ordem até decisão do PCP.
- **Condição para ligar:** autorização explícita do dono, na sessão de validação final ou quando ele autorizar, com a ordem conferida escolhida por ele (checklist CL-PEND-011).
- **Bloqueios:** nenhum para construir.

## Resultado observável

Com a chave desligada, o botão de envio mostra "envio desligado: aguarda autorização do dono" e nada sai. No simulador, com a chave ligada, uma ordem conferida e aprovada é concluída uma vez e a tela mostra "gravado e conferido". Na tela de autorização, o dono vê a ordem, o produto, a quantidade, a data, o local e o efeito esperado no estoque.

## Limites e dependências

- **Inclui:** adapter real de inclusão e conclusão da ordem; chave `omie_op_escrita`; simulador com o mesmo contrato; tela de autorização do dono; leitura de conferência depois do envio.
- **Fora de escopo:** baixa adicional por apontamento; ajuste de estoque separado; cancelamento, estorno ou exclusão automática no Omie; escrita fiscal ou financeira.
- **Entradas e pré-condições:** conferência e aprovação do PCP da fase 2; contrato de inclusão e conclusão registrado em `07-sistemas/pcp/contratos-fase-3.md` a partir da documentação oficial de `produtos/op/`, conferido por leitura antes do adapter.
- **Saídas/artefatos:** adapter real; registro de autorização (ordem, conteúdo, dono, hora); resultado conferido; evidências em `05_entregas/fase-3/spec-3-002/`.
- **Dependências e responsáveis:** dono autoriza; PCP aprova a conferência; Maestro constrói.
- **Atores e permissões mínimas:** `executar_sync_omie` prepara o envio; `autorizar_escrita_omie` (só o dono) liga a chave e autoriza a ordem.
- **Superfícies/arquivos/configurações afetadas:** `/consolidacoes`, fila `pcp_transacoes_omie`, configuração das chaves, rotas de envio.
- **Risco e plano B:** se o Omie recusar o formato, a ordem fica "falhou sem efeito" com a resposta sanitizada e o PCP conclui à mão no Omie; o sistema vincula pelo número na leitura seguinte.
- **Rollback ou reversão:** desligar a chave volta ao modo simulado; efeito já gravado no Omie exige decisão humana.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Sistema → Omie (ordem de produção) | Omie | Inclusão com código de integração; conclusão com ordem, data, quantidade e observação; campos exatos da documentação de `produtos/op/` registrados em `contratos-fase-3.md` | Segredo no backend; `executar_sync_omie` e chave ligada | Uma tentativa por operação; código de integração persistido antes; consulta antes de qualquer repetição | Timeout: "resultado incerto" e consulta; recusa: "falhou sem efeito" |
| Omie → sistema (conferência) | Omie | `ConsultarOrdemProducao` (status, quantidade) e `ListarPosEstoque` do produto | Idem | Só leitura | Divergência: bloqueia e mostra |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Chave desligada | Rota responde 423; zero chamadas ao Omie | — | AC-26-01 |
| RN-02 | Conteúdo diferente do autorizado | Autorização invalidada; nova autorização | — | SPEC-2-005 O2 |
| RN-03 | Quantidade final ≤ 0 | Envio negado; pendência para o PCP | — | SPEC-2-005 |
| RN-04 | Resposta perdida | Só consulta; repetir só com prova de que não houve efeito | — | SPEC-2-005 O4 |
| RN-05 | Leitura depois do envio diverge | Ordem marcada "divergente"; nenhuma nova gravação | — | SPEC-2-005 O5 |

## Fluxo e regras

1. O PCP aprova a conferência (fase 2). A ordem aparece em `/consolidacoes` como pronta para enviar.
2. Com a chave desligada, a tela explica que aguarda o dono; nada sai.
3. O dono abre a autorização, confere o conteúdo e autoriza aquela ordem; a chave liga para ela.
4. O servidor revalida conta, ação, conteúdo e aprovação, persiste a tentativa, envia uma vez e consulta.
5. A leitura de conferência compara ordem, quantidade, status e estoque e mostra "gravado e conferido" ou a divergência.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Ordem conferida de 100 UN, autorizada, simulador | Uma conclusão; leitura confere 100 UN | — |
| Limite | Clique duplo e dois trabalhadores | Uma gravação | O segundo lê o estado |
| Falha | Simulador grava e corta a resposta | "Resultado incerto", consulta, "confirmada"; total de gravações = 1 | Sem nova gravação |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3 (regra 6); `07-sistemas/pcp/contratos-fase-2.md`; `fila-omie.ts`, `recuperacao-omie.ts`, `contrato-op.ts` e a tela `/consolidacoes` no Skip.
2. **Alterar somente:** adapter real, chave, simulador, tela de autorização e leitura de conferência.
3. **Não alterar:** as provas de recuperação da fase 2 (só acrescentar); apontamentos; conferências.
4. **Executar nesta ordem:** contrato registrado; chave e simulador; adapter real com a chave desligada; autorização do dono; conferência depois do envio.
5. **Parar e pedir validação quando:** qualquer prova exigir gravar na conta real; isso só acontece com o dono, na sessão final ou quando ele autorizar.
6. **Estado válido ao parar:** chave desligada; fila simulada funcionando.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum; a autorização do dono para gravar é trava de segurança, não teste.

## Checklist de execução

- [ ] Contrato de inclusão e conclusão registrado e conferido por leitura.
- [ ] Chave `omie_op_escrita` existe e está desligada.
- [ ] Simulador com o mesmo contrato; provas de clique duplo, corrida, queda e resposta perdida.
- [ ] Tela de autorização do dono e leitura de conferência.
- [ ] Evidências em `05_entregas/fase-3/spec-3-002/`.

## Critérios de aceite

- [ ] **CA-3-06:** com a chave desligada a rota responde 423 e nenhuma chamada sai; no simulador, com a chave ligada, uma ordem conferida e aprovada é concluída uma vez, inclusive com clique duplo, dois trabalhadores, queda ou resposta perdida; as provas de recuperação da fase 2 seguem verdes.
- [ ] **CA-3-07:** a autorização mostra ordem, produto, quantidade, data, local e efeito no estoque; só o dono autoriza, uma ordem por vez; conteúdo alterado invalida; depois do envio o sistema lê a ordem, a quantidade, o status e o estoque e mostra "gravado e conferido" ou a divergência, sem nova gravação.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.02-01: envio com a chave desligada | `node --test tests/pcp/spec-3-002.test.mjs` | 423; zero chamadas no simulador | `05_entregas/fase-3/spec-3-002/` |
| RED | P3.02-02: autorização de outra pessoa que não o dono | Rota de autorização | 403; chave segue desligada | Idem |
| GREEN | P3.02-03: ordem de 100 UN autorizada no simulador | Simulador | Uma conclusão; leitura confere 100 UN | Idem |
| GREEN | P3.02-04: resposta perdida e reinício | Simulador | Consulta e "confirmada"; total de gravações = 1 | Idem |
| REFACTOR/REGRESSÃO | P3.02-05: provas O2, O3 e O4 da fase 2 e conteúdo alterado depois da autorização | Testes da fase 2 e simulador | Verdes; autorização invalidada | Idem |

**Dados/fixtures:** ordem de demonstração com 100 UN conferidas; simulador do Omie com recusa, timeout e resposta perdida.  
**Caminhos de erro obrigatórios:** chave desligada, sem autorização, conteúdo alterado, quantidade zero, timeout, recusa, divergência na leitura.  
**Evidência exigida:** saída dos testes, registros do simulador e captura da tela de autorização.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final) e CL-PEND-011 (autorização do dono)
- **Quem confere:** dono e PCP
- **O que confere:** o dono escolhe uma ordem de produção conferida, confere o que vai ser gravado e autoriza; o sistema conclui a ordem no Omie uma vez e mostra a ordem, a quantidade, o status e o estoque conferidos no Omie.
- **Resultado esperado:** uma conclusão no Omie, igual ao que foi conferido; sem autorização, nada é gravado.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** ordem pronta, tela de autorização, resultado "gravado e conferido".
- **Como operar depois:** o PCP aprova a conferência; o envio segue a decisão do dono sobre deixar a chave ligada.
- **Como monitorar:** ordens em "resultado incerto", "falhou sem efeito" ou "divergente".
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Ligar o envio da produção ao Omie com o envio desligado e provar no simulador | American Goodies | SPEC-3-002 | CA-3-06 | P3.02-01, P3.02-03, P3.02-04 | 05_entregas/fase-3/spec-3-002/ | — | ☐ |
| pendente | Preparar a autorização do dono e a conferência depois do envio | American Goodies | SPEC-3-002 | CA-3-07 | P3.02-02, P3.02-05 | 05_entregas/fase-3/spec-3-002/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
