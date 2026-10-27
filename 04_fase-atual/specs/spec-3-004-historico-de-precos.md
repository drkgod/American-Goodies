# SPEC-3-004 — Histórico de preços por produto e fornecedor

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (Compras) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (histórico por produto e fornecedor; regra "frete, serviço e N-D ficam fora do histórico analítico de insumos, preservados no fiscal"); fluxo-alvo 9 ("comparar histórico"); orientação P5 de reaproveitar a leitura de pedidos de compra já provada; RQ-004  
**Degrau da solução:** reuso — a leitura `PesquisarPedCompra` já foi provada na conta (pedido 1514); acrescenta os campos de preço, a classificação das linhas e a tela de histórico.

## Contexto e decisões fechadas

- **Estado atual:** a leitura de pedidos de compra traz identidade (`nCodPed`, `nCodItem`), produto (`nCodProd`, `cProduto`), unidade (`cUnidade`), quantidade pedida e recebida (`nQtde`, `nQtdeRec`), data prevista (`dDtPrevisao`) e etapa (`cEtapa`). Os campos de preço não foram mapeados. A leitura de notas de entrada (`ListarNFe`) voltou com 0 registros de 2023 a 2026.
- **Estado desejado:** para cada insumo, o histórico de preços por fornecedor e data, sempre na unidade de estoque, alimentado pelos pedidos de compra do Omie; frete, serviço e N-D fora do histórico de insumos, mas preservados no registro do documento.
- **Decisões já fechadas:**
  - Fonte desta SPEC: pedidos de compra do Omie. Nota de entrada não entra enquanto a origem estiver em revisão (SPEC-3-007).
  - Preço comparável só com fator confirmado (SPEC-3-003); sem fator, o preço fica na unidade de compra e fora da comparação.
  - Classificação da linha: pelo tipo do item no Omie quando a leitura trouxer; senão, pela classificação feita por Compras na tela (insumo, frete, serviço ou N-D). Linha sem classificação fica "a classificar" e fora do histórico de insumos.
  - Nenhuma linha é apagada.
- **Bloqueios:** nenhum para construir. Leitura real depende de o Omie aceitar consultas (CL-PEND-006).

## Resultado observável

Em `/compras/historico`, Compras escolhe um insumo e vê, por fornecedor, cada preço por unidade de estoque com data, pedido e quantidade, além do menor, do maior e da média do período. Frete e serviço aparecem no documento, não no histórico do insumo.

## Limites e dependências

- **Inclui:** campos de preço do pedido de compra; classificação das linhas; histórico por produto e por fornecedor; filtro por período.
- **Fora de escopo:** preço vindo de nota de entrada (em revisão); custo médio contábil; alteração de documento no Omie.
- **Entradas e pré-condições:** leitura de pedidos de compra (fase 2); fatores (SPEC-3-003); campos de preço conferidos numa amostra e registrados em `07-sistemas/pcp/contratos-fase-3.md` antes do uso.
- **Saídas/artefatos:** coleção `pcp_precos_compra` (linha, documento, fornecedor, item, classificação, preço na unidade de compra, fator usado, preço na unidade de estoque, data, origem); tela de histórico; evidências em `05_entregas/fase-3/spec-3-004/`.
- **Dependências e responsáveis:** Compras classifica as linhas que o Omie não identifica; Maestro constrói.
- **Atores e permissões mínimas:** `consultar_compras` vê; `editar_requisicao` classifica linhas.
- **Superfícies/arquivos/configurações afetadas:** `/compras/historico`; rotina de leitura de pedidos de compra.
- **Risco e plano B:** se a leitura não trouxer o preço unitário, usar o valor total da linha dividido pela quantidade só se os dois vierem da mesma linha; senão, preço pendente.
- **Rollback ou reversão:** desligar a tela; a coleção é só leitura derivada e pode ser recalculada.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → histórico | Omie | `PesquisarPedCompra` em `produtos/pedidocompra/`, com os campos já mapeados mais os de preço e desconto confirmados na amostra | Segredo no backend | Paginação até página menor que o tamanho pedido (o total não vem na resposta); chave = aplicativo + pedido + linha | Bloqueio do Omie: mantém o último lote |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Linha de frete, serviço ou N-D | Fora do histórico de insumos; continua visível no documento | — | Escopo, antiga fase 3 |
| RN-02 | Linha sem classificação | "A classificar"; fora do histórico até a classificação | — | Decisão desta SPEC |
| RN-03 | Sem fator confirmado | Preço só na unidade de compra; fora da comparação | — | SPEC-3-003 |
| RN-04 | Pedido cancelado | Fica no histórico marcado como cancelado e fora da média | Status de cancelado comprovado na amostra | Escopo |
| RN-05 | Campo de preço ausente | Preço pendente, nunca zero | — | Regras comuns, item 4 |

## Fluxo e regras

1. Conferir numa amostra os campos de preço e de tipo de item; registrar no contrato.
2. Construir o histórico com fixture: insumo, frete e serviço no mesmo pedido.
3. Ligar a leitura real dos pedidos de compra e preencher o histórico.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Pedido com 4 sacos de 25 kg a R$ 250,00 e frete de R$ 80,00 | Histórico do insumo: R$ 10,00/KG; frete só no documento | — |
| Limite | Linha "taxa de entrega" sem tipo no Omie | "A classificar" | Compras classifica como frete |
| Falha | Omie bloqueado | Último histórico válido, com a hora | Retoma depois da guarda |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `07-sistemas/pcp/contratos-fase-2.md` (compras a receber); o código da leitura de pedidos de compra no Skip.
2. **Alterar somente:** leitura dos campos de preço, classificação e histórico.
3. **Não alterar:** o cálculo de compras a receber da fase 2.
4. **Executar nesta ordem:** amostra e contrato; histórico com fixture; leitura real.
5. **Parar e pedir validação quando:** nunca para esta SPEC; campo de preço ausente na amostra vira pendência registrada.
6. **Estado válido ao parar:** compras a receber da fase 2 funcionando.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Campos de preço e de tipo conferidos na amostra e registrados.
- [ ] Classificação insumo, frete, serviço, N-D e "a classificar".
- [ ] Histórico por produto e por fornecedor na unidade de estoque.
- [ ] Leitura real ligada.
- [ ] Evidências em `05_entregas/fase-3/spec-3-004/`.

## Critérios de aceite

- [ ] **CA-3-12:** o histórico mostra, por insumo e fornecedor, preço na unidade de estoque, data, pedido e quantidade, com menor, maior e média do período; frete, serviço e N-D ficam fora do histórico do insumo e continuam no documento; linha sem classificação fica "a classificar".
- [ ] **CA-3-13:** a leitura real dos pedidos de compra preenche o histórico; os campos de preço foram conferidos numa amostra antes do uso; campo ausente fica pendente; pedido cancelado fica marcado e fora da média.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.04-01: pedido com insumo, frete e serviço | `node --test tests/pcp/spec-3-004.test.mjs` | Só o insumo no histórico; frete e serviço no documento | `05_entregas/fase-3/spec-3-004/` |
| RED | P3.04-02: linha sem preço | Fixture | Preço pendente, não zero | Idem |
| GREEN | P3.04-03: 4 sacos a R$ 250,00 com fator 25 | Fixture | R$ 10,00/KG | Idem |
| GREEN | P3.04-04: leitura real | Rotina no Skip | Contagem e amostra conferidas com o Omie | Idem |
| REFACTOR/REGRESSÃO | P3.04-05: compras a receber da fase 2 | Testes da fase 2 | Verdes | Idem |

**Dados/fixtures:** pedidos de demonstração com insumo, frete, serviço, cancelado e linha sem preço.  
**Caminhos de erro obrigatórios:** sem fator, sem preço, sem classificação, cancelado, Omie bloqueado.  
**Evidência exigida:** saída dos testes e amostra sanitizada.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** Compras
- **O que confere:** o histórico de dois insumos reais, com o preço por unidade de estoque, e um pedido com frete em que o frete não entra no preço do insumo.
- **Resultado esperado:** preços batem com os pedidos do Omie; frete separado.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** histórico de um insumo com dois fornecedores.
- **Como operar depois:** Compras classifica as linhas "a classificar".
- **Como monitorar:** número de linhas a classificar e de preços pendentes.
- **Pendência conhecida:** preço das notas de entrada depende da SPEC-3-007 sair da revisão.

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Montar o histórico de preços por produto e por fornecedor | American Goodies | SPEC-3-004 | CA-3-12 | P3.04-01, P3.04-02, P3.04-03 | 05_entregas/fase-3/spec-3-004/ | — | ☐ |
| pendente | Trazer o histórico real dos pedidos de compra do Omie | American Goodies | SPEC-3-004 | CA-3-13 | P3.04-04, P3.04-05 | 05_entregas/fase-3/spec-3-004/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
