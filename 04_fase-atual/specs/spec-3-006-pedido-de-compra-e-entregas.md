# SPEC-3-006 — Acompanhamento das entregas e lançamento da compra no Omie

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (Compras) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (follow-up; regra "pedido sem aprovação não é concluído"); fluxo-alvo 9 (manter follow-up e compras emergenciais identificáveis); decisão P1 (Omie mantém os documentos oficiais); orientação P5 de reaproveitar a leitura de pedidos de compra já provada; RQ-004/012; CL-PEND-011  
**Degrau da solução:** reuso — a leitura `PesquisarPedCompra` existe; acrescenta a tela de entregas e o lançamento da compra aprovada atrás da chave `omie_pedido_compra_escrita`.

## Contexto e decisões fechadas

- **Estado atual:** a leitura de pedidos de compra calcula o restante a receber (pedida − recebida) para as sugestões; não há tela de acompanhamento nem ligação entre o pedido do Omie e uma compra aprovada no sistema. O pedido de compra é lançado à mão no Omie.
- **Estado desejado:** Compras acompanha, por fornecedor, o que está em aberto, a data prevista, o que chegou, o que falta e o que está atrasado. A compra aprovada (SPEC-3-005) é ligada ao pedido do Omie: com a chave desligada, o comprador lança à mão e informa o número; com a chave ligada, o sistema lança uma vez e confere.
- **Decisões já fechadas:**
  - Acompanhamento é só leitura do Omie e pode ser usado logo depois de construído.
  - Só compra aprovada pode ser lançada ou ligada.
  - Ligação manual pelo número informado pelo comprador, conferida pela leitura: mesmo fornecedor e mesmos itens; nunca ligar só por valor.
  - Código de integração do pedido = id da compra aprovada, persistido antes do envio.
- **Condição para ligar:** autorização explícita do dono, alçadas cadastradas, fornecedor e itens cadastrados no Omie e contrato de inclusão conferido (checklist CL-PEND-011).
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/compras/entregas`, por fornecedor: pedido, item, data prevista, pedida, recebida, restante, dias de atraso e marca de emergência. Na compra aprovada, com a chave desligada, o botão "lançar no Omie" mostra os dados para digitar e um campo para o número do pedido; depois da leitura, aparece "ligado ao pedido N". No simulador, com a chave ligada, o sistema lança e mostra "gravado e conferido".

## Limites e dependências

- **Inclui:** tela de entregas; atraso; ligação manual; adapter de inclusão do pedido de compra atrás da chave; simulador; leitura de conferência.
- **Fora de escopo:** alterar ou cancelar pedido no Omie; enviar pedido ao fornecedor por e-mail ou WhatsApp; recebimento (SPEC-3-007).
- **Entradas e pré-condições:** compras aprovadas (SPEC-3-005); contrato de inclusão de pedido de compra registrado em `07-sistemas/pcp/contratos-fase-3.md` a partir da documentação oficial de `produtos/pedidocompra/`, conferido por leitura antes do adapter.
- **Saídas/artefatos:** coleção `pcp_pedidos_compra_vinculo`; tela de entregas; adapter; evidências em `05_entregas/fase-3/spec-3-006/`.
- **Dependências e responsáveis:** dono autoriza ligar a chave; Compras lança ou confere; Maestro constrói.
- **Atores e permissões mínimas:** `consultar_compras` vê; `editar_requisicao` liga o número; `autorizar_escrita_omie` (dono) liga a chave.
- **Superfícies/arquivos/configurações afetadas:** `/compras/entregas`, tela da compra aprovada, configuração das chaves.
- **Risco e plano B:** se a inclusão pela API não for aceita, a chave fica desligada e o lançamento continua manual com ligação pelo número.
- **Rollback ou reversão:** desligar a chave volta ao lançamento manual; pedido já gravado no Omie exige decisão humana.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → entregas | Omie | `PesquisarPedCompra`: `nCodPed`, `cNumero`, fornecedor, `nCodItem`, produto, `cUnidade`, `nQtde`, `nQtdeRec`, `dDtPrevisao`, `cEtapa` | Segredo no backend | Paginação até página menor que o tamanho pedido; chave = aplicativo + pedido + linha | Bloqueio do Omie: último dado com a hora |
| Sistema → Omie (pedido de compra) | Omie | Inclusão com fornecedor, itens, quantidades, preços, data prevista e código de integração; campos exatos da documentação registrados no contrato | Segredo no backend; chave ligada | Código de integração persistido antes; consulta antes de qualquer repetição | Timeout: "resultado incerto" e consulta; recusa: "falhou sem efeito" |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Data prevista anterior a hoje e restante > 0 | Atrasado, com os dias | Cancelado comprovado não atrasa | Escopo |
| RN-02 | Compra não aprovada | Sem lançamento nem ligação | — | Escopo |
| RN-03 | Número informado com fornecedor ou itens diferentes | Ligação recusada com a diferença | — | Decisão desta SPEC |
| RN-04 | Chave desligada | 423; zero chamadas | — | AC-26-01 |
| RN-05 | Resposta perdida | Consulta pelo código de integração; sem nova gravação | — | Regras comuns, item 6 |

## Fluxo e regras

1. Ler os pedidos de compra e montar a tela de entregas.
2. Na compra aprovada, mostrar os dados para lançar e o campo do número; conferir pela leitura e ligar.
3. Com a chave ligada (simulador na construção), lançar uma vez, consultar e ligar.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Pedido com 20 KG, 5 recebidos, previsto para ontem | Restante 15 KG, 1 dia de atraso | — |
| Limite | Comprador informa número de outro fornecedor | Ligação recusada com a diferença | Corrigir o número |
| Falha | Simulador grava e corta a resposta | Consulta acha o pedido; uma gravação | Sem nova gravação |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3 (regras 5 e 6); `07-sistemas/pcp/contratos-fase-2.md`; a leitura de pedidos de compra no Skip.
2. **Alterar somente:** tela de entregas, ligação, adapter, chave e simulador.
3. **Não alterar:** compras a receber da fase 2; aprovação (SPEC-3-005).
4. **Executar nesta ordem:** entregas; ligação manual; contrato registrado; adapter com a chave desligada e simulador.
5. **Parar e pedir validação quando:** qualquer prova exigir gravar na conta real; isso só acontece com o dono.
6. **Estado válido ao parar:** chave desligada; lançamento manual com ligação funcionando.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum; a autorização do dono para gravar é trava de segurança, não teste.

## Checklist de execução

- [ ] Tela de entregas com atraso e emergenciais.
- [ ] Ligação manual conferida pela leitura.
- [ ] Contrato de inclusão registrado e conferido.
- [ ] Chave desligada; simulador com gravação única.
- [ ] Evidências em `05_entregas/fase-3/spec-3-006/`.

## Critérios de aceite

- [ ] **CA-3-17:** a tela de entregas mostra, por fornecedor, pedido, item, data prevista, pedida, recebida, restante, dias de atraso e marca de emergência, a partir da leitura real do Omie; bloqueio do Omie mostra o último dado com a hora.
- [ ] **CA-3-18:** só compra aprovada é lançada ou ligada; com a chave desligada a rota responde 423 e a tela mostra os dados para lançar e liga pelo número conferido (mesmo fornecedor e itens); no simulador, com a chave ligada, o pedido é gravado uma vez, consultado e ligado, mesmo com resposta perdida.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.06-01: lançar compra não aprovada | `node --test tests/pcp/spec-3-006.test.mjs` | Negado | `05_entregas/fase-3/spec-3-006/` |
| RED | P3.06-02: lançar com a chave desligada | Rota | 423; zero chamadas | Idem |
| RED | P3.06-03: ligar número de outro fornecedor | Fixture | Recusado com a diferença | Idem |
| GREEN | P3.06-04: 20 KG pedidos, 5 recebidos, previsto ontem | Fixture | 15 KG e 1 dia de atraso | Idem |
| GREEN | P3.06-05: lançamento no simulador com resposta perdida | Simulador | Uma gravação; ligada | Idem |
| REFACTOR/REGRESSÃO | P3.06-06: compras a receber da fase 2 | Testes da fase 2 | Verdes | Idem |

**Dados/fixtures:** pedidos de compra de demonstração; simulador do Omie com recusa e resposta perdida.  
**Caminhos de erro obrigatórios:** compra não aprovada, chave desligada, número divergente, timeout, recusa, Omie bloqueado.  
**Evidência exigida:** saída dos testes e registros do simulador.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final) e CL-PEND-011 (autorização do dono)
- **Quem confere:** Compras e dono
- **O que confere:** as entregas em aberto de um fornecedor real batem com o Omie; uma compra aprovada é lançada no Omie com a autorização do dono (ou à mão e ligada pelo número, se ele não autorizar) e aparece uma vez.
- **Resultado esperado:** entregas e atrasos certos; um pedido no Omie por compra aprovada.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** tela de entregas e uma compra aprovada ligada ao pedido do Omie.
- **Como operar depois:** Compras acompanha os atrasos e cobra o fornecedor.
- **Como monitorar:** pedidos atrasados, compras aprovadas sem pedido e lançamentos em "resultado incerto".
- **Pendência conhecida:** autorização do dono para ligar a chave (CL-PEND-011).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Acompanhar as entregas dos pedidos de compra pelo Omie | American Goodies | SPEC-3-006 | CA-3-17 | P3.06-04 | 05_entregas/fase-3/spec-3-006/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |
| pendente | Preparar o lançamento da compra aprovada no Omie, com o envio desligado | American Goodies | SPEC-3-006 | CA-3-18 | P3.06-01, P3.06-02, P3.06-03, P3.06-05, P3.06-06 | 05_entregas/fase-3/spec-3-006/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
