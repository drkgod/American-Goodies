# SPEC-3-005 — Requisição por fornecedor, cotação e aprovação da compra

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (Compras e aprovador) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (requisição por fornecedor; cotação, preço, prazo e aprovação; regra "pedido sem aprovação não é concluído"); fluxo-alvo 9 (aprovação humana; compras emergenciais identificáveis); decisão de controle humano (responsáveis aprovam compras); RQ-004; CL-PEND-001; CL-PEND-008  
**Degrau da solução:** construção mínima — parte da sugestão de compra da fase 2 (rascunho, sem envio) e do histórico de preços (SPEC-3-004); acrescenta requisição, cotação e aprovação.

## Contexto e decisões fechadas

- **Estado atual:** a sugestão de compra da fase 2 calcula a falta por insumo e, ao ser aceita, abre só rascunho (`pedido_compra_enviado=false`). Não existe requisição, cotação nem aprovação de compra no sistema.
- **Estado desejado:** a necessidade (sugestão aceita ou pedido do comprador) vira requisição separada por fornecedor; cada item recebe uma ou mais cotações comparadas com o histórico; quem tem a alçada aprova ou recusa com registro. Só compra aprovada segue para o pedido (SPEC-3-006).
- **Decisões já fechadas:**
  - A sugestão não compra; a pessoa decide.
  - Alçada não é presumida: sem alçada cadastrada, a aprovação real fica parada com o motivo "alçada não cadastrada" (CL-PEND-008). Na construção, alçadas de demonstração.
  - Tolerância de preço vem dos parâmetros aprovados (CL-PEND-001); sem tolerância, a tela mostra a diferença sem julgar.
  - Compra emergencial é marcada com motivo e aparece separada em todos os relatórios.
  - Mudança depois da aprovação invalida a aprovação.
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/compras/requisicoes`, o comprador vê as requisições agrupadas por fornecedor, com item, quantidade (unidade de compra e de estoque), data necessária e marca de emergência. Em cada item, as cotações com preço, prazo e a diferença para o último preço. O aprovador vê o valor, a alçada e aprova ou recusa com motivo.

## Limites e dependências

- **Inclui:** requisição a partir da sugestão aceita ou manual; agrupamento por fornecedor; cotações; comparação com histórico e tolerância; aprovação por alçada; recusa; invalidação por mudança; marca de emergência.
- **Fora de escopo:** gravar o pedido no Omie (SPEC-3-006); pagamento; negociação automática com fornecedor.
- **Entradas e pré-condições:** fornecedores, fatores e bloqueio de item sem cadastro (SPEC-3-003); histórico (SPEC-3-004); sugestões (SPEC-3-001).
- **Saídas/artefatos:** coleções `pcp_requisicoes`, `pcp_cotacoes`, `pcp_aprovacoes_compra`, `pcp_alcadas`; telas de requisição, cotação e aprovação; evidências em `05_entregas/fase-3/spec-3-005/`.
- **Dependências e responsáveis:** dono informa alçadas (CL-PEND-008) e tolerância de preço (CL-PEND-001); Maestro constrói.
- **Atores e permissões mínimas:** comprador `editar_requisicao`; aprovador `aprovar_compra` dentro da sua alçada; consulta `consultar_compras`.
- **Superfícies/arquivos/configurações afetadas:** `/compras/requisicoes`, `/compras/aprovacoes`, cartão de sugestão de compra.
- **Risco e plano B:** sem alçada real, as aprovações reais esperam o cadastro; a construção e as provas seguem com alçadas de demonstração.
- **Rollback ou reversão:** desligar as rotas; requisições ficam como histórico.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Sugestão → requisição | Skip Cloud | Item, quantidade sugerida, data necessária, versão da sugestão | `editar_requisicao` | Uma requisição por sugestão e versão; repetição devolve a mesma | Sugestão alterada: 409 e recálculo |
| Requisição | Skip Cloud | Fornecedor, itens, quantidade na unidade de compra e de estoque, fator usado, data necessária, emergencial e motivo, estado (rascunho, em cotação, em aprovação, aprovada, recusada, cancelada) | `editar_requisicao` | Versão esperada em cada alteração | Conflito: 409 |
| Cotação | Skip Cloud | Fornecedor, preço por unidade de compra, preço por unidade de estoque, prazo de entrega, condição de pagamento, validade | `editar_requisicao` | — | Sem fator: preço só na unidade de compra |
| Aprovação | Skip Cloud | Aprovador, valor, alçada usada, decisão, motivo, hora, hash do conteúdo aprovado | `aprovar_compra` | Hash do conteúdo; repetição não duplica | Conteúdo mudou: aprovação invalidada |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Itens de fornecedores diferentes | Uma requisição por fornecedor | Item sem fornecedor definido fica "a definir" | Escopo |
| RN-02 | Valor acima da alçada do aprovador | Aprovação negada para ele; segue para alçada maior | Sem alçada cadastrada: "alçada não cadastrada" | Escopo; CL-PEND-008 |
| RN-03 | Preço acima da tolerância | Destaque com a diferença percentual | Sem tolerância: mostra só a diferença | CL-PEND-001 |
| RN-04 | Conteúdo alterado depois da aprovação | Aprovação invalidada; volta para aprovação | — | Escopo |
| RN-05 | Compra emergencial | Marca e motivo obrigatórios; separada nos relatórios | — | Escopo, fluxo-alvo 9 |
| RN-06 | Requisição não aprovada | Não pode virar pedido (SPEC-3-006) | — | Escopo |

## Fluxo e regras

1. O comprador cria a requisição a partir da sugestão aceita ou à mão; o sistema separa por fornecedor.
2. O comprador registra as cotações; a tela compara com o histórico.
3. O comprador escolhe a cotação e envia para aprovação.
4. O aprovador com alçada aprova ou recusa com motivo.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Sugestão de 6 KG aceita; duas cotações; aprovador com alçada | Requisição, cotação escolhida, aprovação registrada | — |
| Limite | Valor acima da alçada do primeiro aprovador | Negado para ele; aprovado pela alçada maior | — |
| Falha | Quantidade alterada depois da aprovação | Aprovação invalidada | Nova aprovação |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; SPECs 3-003 e 3-004; `sugestao.ts` e `rascunho.ts` no Skip.
2. **Alterar somente:** requisição, cotação, aprovação, alçadas e o botão de criar requisição no cartão da sugestão.
3. **Não alterar:** o cálculo das sugestões; o rascunho de produção.
4. **Executar nesta ordem:** requisição; cotação e comparação; aprovação e alçadas.
5. **Parar e pedir validação quando:** nunca para construir; alçada real ausente é bloqueio localizado.
6. **Estado válido ao parar:** sugestões e rascunhos da fase 2 funcionando.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Requisição por fornecedor a partir da sugestão e manual.
- [ ] Cotações com comparação ao histórico e tolerância.
- [ ] Aprovação por alçada, recusa e invalidação.
- [ ] Emergencial marcada com motivo.
- [ ] Evidências em `05_entregas/fase-3/spec-3-005/`.

## Critérios de aceite

- [ ] **CA-3-14:** a sugestão aceita ou o pedido do comprador vira requisição separada por fornecedor, com quantidade nas duas unidades, data necessária e marca de emergência com motivo; repetir a criação não duplica.
- [ ] **CA-3-15:** cada item aceita uma ou mais cotações com preço convertido e prazo; a tela mostra a diferença para o último preço do histórico e destaca o que passa da tolerância aprovada.
- [ ] **CA-3-16:** só aprova quem tem `aprovar_compra` e alçada para o valor; aprovação e recusa registram autor, hora e motivo; alteração depois da aprovação a invalida; sem alçada cadastrada a aprovação real fica parada com o motivo; requisição não aprovada não vira pedido.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.05-01: requisição com itens de dois fornecedores | `node --test tests/pcp/spec-3-005.test.mjs` | Duas requisições | `05_entregas/fase-3/spec-3-005/` |
| RED | P3.05-02: aprovação acima da alçada | Fixture | Negada; segue para alçada maior | Idem |
| RED | P3.05-03: alteração depois da aprovação | Fixture | Aprovação invalidada | Idem |
| GREEN | P3.05-04: sugestão de 6 KG até a aprovação | Fixture | Requisição, cotação, aprovação com hash | Idem |
| GREEN | P3.05-05: cotação 15% acima do último preço, tolerância 10% | Fixture | Destaque com a diferença | Idem |
| REFACTOR/REGRESSÃO | P3.05-06: sugestões e rascunhos da fase 2 | Testes da fase 2 | Verdes | Idem |

**Dados/fixtures:** sugestão de compra 6 KG (oráculo da fase 2); fornecedores e alçadas de demonstração.  
**Caminhos de erro obrigatórios:** sem ação, sem alçada, acima da alçada, conteúdo alterado, item sem cadastro, sem fator.  
**Evidência exigida:** saída dos testes e captura das telas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** comprador e aprovador
- **O que confere:** uma sugestão real de compra vira requisição, recebe duas cotações e é aprovada dentro da alçada; uma alteração depois da aprovação pede aprovação nova.
- **Resultado esperado:** requisição, cotação e aprovação registradas; nada é comprado sem aprovação.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** do cartão da sugestão até a aprovação.
- **Como operar depois:** Compras cota e envia para aprovação; o aprovador decide na tela.
- **Como monitorar:** requisições paradas em aprovação e compras emergenciais.
- **Pendência conhecida:** alçadas (CL-PEND-008) e tolerância de preço (CL-PEND-001).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Transformar a necessidade de compra em requisição por fornecedor | American Goodies | SPEC-3-005 | CA-3-14 | P3.05-01 | 05_entregas/fase-3/spec-3-005/ | — | ☐ |
| pendente | Registrar cotações com preço e prazo e comparar com o histórico | American Goodies | SPEC-3-005 | CA-3-15 | P3.05-05 | 05_entregas/fase-3/spec-3-005/ | — | ☐ |
| pendente | Aprovar a compra pela alçada, com registro de quem aprovou | American Goodies | SPEC-3-005 | CA-3-16 | P3.05-02, P3.05-03, P3.05-04, P3.05-06 | 05_entregas/fase-3/spec-3-005/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
