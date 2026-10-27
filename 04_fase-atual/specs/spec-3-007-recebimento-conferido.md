# SPEC-3-007 — Recebimento conferido contra o pedido, parcelas e exceções

**Fase:** 3  
**Status:** planejada; a parte da nota de entrada e do lançamento do recebimento no Omie está **em revisão**  
**Dono:** American Goodies (almoxarifado e financeiro) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (pré-conferência de NF-e, pedido e parcelas; vínculo de múltiplos pedidos; regras "antecipadamente pago não duplica obrigação" e "NF-e/item inconsistente fica pendente"); fluxo-alvo 10 e 11; orientação P5 sobre a NF-e de entrada; RQ-010; CL-PEND-007  
**Degrau da solução:** construção mínima — conferência física e parcelas sobre os pedidos aprovados (SPECs 3-005 e 3-006); a pré-conferência da nota é construída só com notas de demonstração.

## Contexto e decisões fechadas

- **Estado atual:** a leitura `ListarNFe` do Omie voltou com 0 registros de 2023 a 2026; não se sabe onde ficam as notas de entrada (outro método do Omie, como o recebimento de NF-e, ou outro sistema). O recebimento é registrado à mão no Omie. Não há conferência de recebimento no sistema.
- **Estado desejado:** o almoxarifado registra o que chegou e liga cada linha a um ou mais pedidos aprovados; falta, sobra e item não pedido aparecem; o financeiro vê as parcelas e o que já foi pago, e o recebimento avisa quando uma compra já paga não deve gerar nova conta. Item sem cadastro entra só como exceção autorizada.
- **Decisões já fechadas:**
  - O sistema não ajusta estoque, não classifica a nota fiscalmente e não lança conta a pagar; isso continua com as pessoas no Omie, pela regra validada pelo responsável.
  - Ligação de linha a pedido é feita pela pessoa; o sistema não infere por valor.
  - **Em revisão (sem tarefa nesta publicação):** a leitura das notas de entrada reais e a escrita do recebimento no Omie (chave `omie_recebimento_escrita`). O Maestro não especifica fonte, não constrói adapter e não pede a nota em formato novo até o checklist responder onde estão as notas (CL-PEND-007). Com a resposta, o consultor emenda esta SPEC.
  - A pré-conferência usa os campos do leiaute nacional da nota (emitente, número, série, itens, quantidades, unidades, valores, duplicatas) só com notas de demonstração marcadas.
- **Bloqueios:** nenhum para as partes construídas; a parte em revisão espera a resposta do CL-PEND-007.

## Resultado observável

Em `/recebimentos`, o almoxarifado registra a chegada: fornecedor, data, itens e quantidades, e liga cada linha a um ou mais pedidos (ex.: 100 KG recebidos = 60 do pedido A + 40 do pedido B). Diferenças aparecem em vermelho. O financeiro vê as parcelas previstas e a marca "já paga". A pré-conferência compara uma nota de demonstração com o pedido e o recebimento e lista o que bate e o que não bate.

## Limites e dependências

- **Inclui:** conferência física por linha; múltiplos pedidos por linha; diferenças; parcelas previstas e pagamento antecipado; exceção de item sem cadastro; pré-conferência com notas de demonstração.
- **Fora de escopo:** leitura de notas reais e escrita do recebimento no Omie (em revisão); ajuste de estoque; classificação fiscal; lançamento financeiro; pagamento.
- **Entradas e pré-condições:** compras aprovadas e ligadas a pedidos (SPECs 3-005 e 3-006); fatores (SPEC-3-003).
- **Saídas/artefatos:** coleções `pcp_recebimentos`, `pcp_recebimento_linhas`, `pcp_parcelas_compra`, `pcp_notas_demo`; telas de recebimento e pré-conferência; evidências em `05_entregas/fase-3/spec-3-007/`.
- **Dependências e responsáveis:** cliente responde onde estão as notas de entrada (CL-PEND-007); almoxarifado confere; financeiro marca pagamentos; Maestro constrói.
- **Atores e permissões mínimas:** almoxarifado `conferir_recebimento`; financeiro `conferir_financeiro_recebimento`; exceção `autorizar_excecao_compra`.
- **Superfícies/arquivos/configurações afetadas:** `/recebimentos`, `/recebimentos/pre-conferencia`.
- **Risco e plano B:** sem a origem das notas, a pré-conferência real fica em revisão; a conferência física e as parcelas funcionam sozinhas.
- **Rollback ou reversão:** desligar as rotas; registros ficam como histórico.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Recebimento | Skip Cloud | Fornecedor, data, linhas (item, quantidade na unidade de compra, fator, quantidade em estoque), ligações (pedido, linha, quantidade), autor, hora | `conferir_recebimento` | Versão esperada; repetição não duplica | Soma das ligações diferente da linha: recusa |
| Parcelas | Skip Cloud | Pedido, parcela, vencimento, valor, pago antecipadamente (sim/não), referência do pagamento | `conferir_financeiro_recebimento` | Uma parcela por pedido e número | — |
| Nota de demonstração | Skip Cloud | Leiaute nacional: emitente, número, série, itens, quantidades, unidades, valores, duplicatas; marcada como demonstração | `conferir_recebimento` | — | Nota real nunca entra por aqui |
| Notas reais e escrita do recebimento | Em revisão | Origem a definir pela resposta do CL-PEND-007 | — | — | Sem tarefa nesta publicação |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Linha sem pedido aprovado | Recebimento da linha bloqueado | Exceção autorizada com motivo | Escopo, fluxo-alvo 11 |
| RN-02 | Recebido diferente do pedido | Falta ou sobra visível; nada ajusta o estoque | — | Escopo |
| RN-03 | Compra marcada como paga antes | Aviso "já paga: não lançar nova conta a pagar" no recebimento e na pré-conferência | — | Escopo |
| RN-04 | Item fora do catálogo real | Só como exceção autorizada; pendência até cadastro e ligação | — | SPEC-3-003 RN-01 e RN-02 |
| RN-05 | Nota com item ou quantidade que não bate | Pendente com a diferença; não segue como conferida | — | Escopo |

## Fluxo e regras

1. O almoxarifado registra a chegada e liga cada linha aos pedidos.
2. O sistema mostra diferenças e aplica RN-01 e RN-04.
3. O financeiro registra parcelas e pagamentos antecipados; o recebimento mostra o aviso RN-03.
4. A pré-conferência compara nota de demonstração, pedido, recebimento e parcelas.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | 100 KG recebidos ligados a 60 do pedido A e 40 do pedido B | Dois pedidos atualizados no sistema; sem diferença | — |
| Limite | Compra paga antecipadamente | Aviso "já paga"; nenhuma parcela nova | — |
| Falha | Nota de demonstração com 110 KG para pedido de 100 KG | Pendente com a diferença de 10 KG | Almoxarifado e Compras resolvem |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; SPECs 3-003, 3-005 e 3-006.
2. **Alterar somente:** recebimento, parcelas, exceções e pré-conferência com notas de demonstração.
3. **Não alterar:** estoque, financeiro e documentos do Omie; não construir leitura de notas reais nem escrita do recebimento (em revisão).
4. **Executar nesta ordem:** conferência física; parcelas e pagamento antecipado; exceção de item sem cadastro; pré-conferência com notas de demonstração.
5. **Parar e pedir validação quando:** a resposta do CL-PEND-007 chegar: registrar em `06_notas/` e levar ao consultor, que emenda esta SPEC; não especificar por conta própria.
6. **Estado válido ao parar:** recebimento manual no Omie segue como hoje.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Conferência física com múltiplos pedidos por linha.
- [ ] Parcelas e aviso de compra já paga.
- [ ] Exceção de item sem cadastro com pendência.
- [ ] Pré-conferência com notas de demonstração marcadas.
- [ ] Parte em revisão registrada sem construção.
- [ ] Evidências em `05_entregas/fase-3/spec-3-007/`.

## Critérios de aceite

- [ ] **CA-3-19:** o almoxarifado registra o recebimento e liga cada linha a um ou mais pedidos aprovados; a soma das ligações bate com a linha; falta, sobra e item não pedido aparecem; nada ajusta o estoque.
- [ ] **CA-3-20:** o financeiro vê as parcelas previstas de cada pedido e marca o pagamento antecipado; recebimento de compra já paga mostra "já paga: não lançar nova conta a pagar" e não cria parcela; o sistema não lança nada no financeiro.
- [ ] **CA-3-21:** item sem cadastro só entra como exceção com `autorizar_excecao_compra` e motivo, e fica pendente até ser cadastrado no Omie e ligado ao pedido.
- [ ] **CA-3-22:** a pré-conferência compara nota, pedido, recebimento e parcelas usando só notas de demonstração marcadas, e deixa pendente o que não bate; não há leitura de nota real nem escrita do recebimento no Omie nesta publicação.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.07-01: linha de 100 KG ligada a 60 + 30 | `node --test tests/pcp/spec-3-007.test.mjs` | Recusa: soma diferente | `05_entregas/fase-3/spec-3-007/` |
| RED | P3.07-02: recebimento de compra já paga | Fixture | Aviso; zero parcela nova | Idem |
| RED | P3.07-03: item sem cadastro sem exceção | Fixture | Bloqueado | Idem |
| GREEN | P3.07-04: 100 KG = 60 do pedido A + 40 do pedido B | Fixture | Ligações gravadas; sem diferença | Idem |
| GREEN | P3.07-05: nota de demonstração com 110 KG | Fixture | Pendente com 10 KG de diferença | Idem |
| REFACTOR/REGRESSÃO | P3.07-06: provas das SPECs 3-003, 3-005 e 3-006 | Testes | Verdes | Idem |

**Dados/fixtures:** pedidos aprovados de demonstração; notas de demonstração no leiaute nacional, marcadas.  
**Caminhos de erro obrigatórios:** soma diferente, sem pedido aprovado, item sem cadastro, compra já paga, nota divergente, sem permissão.  
**Evidência exigida:** saída dos testes e captura das telas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** almoxarifado e financeiro
- **O que confere:** um recebimento real ligado a dois pedidos; uma compra paga antes mostrando o aviso; a pré-conferência com uma nota de demonstração. Se o CL-PEND-007 tiver sido respondido e a SPEC emendada, também a pré-conferência de uma nota real.
- **Resultado esperado:** diferenças visíveis; nenhuma conta duplicada; parte em revisão registrada como pendência, se ainda estiver.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** um recebimento com dois pedidos e o aviso de compra já paga.
- **Como operar depois:** almoxarifado confere cada chegada; financeiro marca os pagamentos antecipados.
- **Como monitorar:** recebimentos com diferença e exceções abertas.
- **Pendência conhecida:** origem das notas de entrada e escrita do recebimento (CL-PEND-007), em revisão.

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Conferir o recebimento contra o pedido aprovado, linha a linha | American Goodies | SPEC-3-007 | CA-3-19 | P3.07-01, P3.07-04 | 05_entregas/fase-3/spec-3-007/ | — | ☐ |
| pendente | Mostrar as parcelas e a compra já paga sem duplicar conta a pagar | American Goodies | SPEC-3-007 | CA-3-20 | P3.07-02 | 05_entregas/fase-3/spec-3-007/ | — | ☐ |
| pendente | Registrar o recebimento de item sem cadastro como exceção a regularizar | American Goodies | SPEC-3-007 | CA-3-21 | P3.07-03 | 05_entregas/fase-3/spec-3-007/ | — | ☐ |
| pendente | Montar a pré-conferência da nota de entrada com notas de demonstração | American Goodies | SPEC-3-007 | CA-3-22 | P3.07-05, P3.07-06 | 05_entregas/fase-3/spec-3-007/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
