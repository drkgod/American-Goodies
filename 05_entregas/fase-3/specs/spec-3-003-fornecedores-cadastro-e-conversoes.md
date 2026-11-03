# SPEC-3-003 — Acessos de compras, fornecedores, item cadastrado antes da compra e conversões

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (Compras) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (fornecedores e contatos, cadastro antecipado, conversões de unidade); fluxo-alvo 9 e 10; regra "unidades só convertem por fator confirmado"; RQ-004/007/010; CL-003; CL-PEND-009; CL-PEND-012; CL-PEND-013  
**Degrau da solução:** construção mínima sobre o projeto Skip atual — reusa autenticação, perfis e catálogo real (SPEC-3-001); acrescenta ações de acesso, cadastro complementar de fornecedores e tabela de fatores.

## Contexto e decisões fechadas

- **Estado atual:** o painel da fase 1 tem a área `compras` só para consulta; não há ação de compra, cadastro de fornecedor nem fator de conversão. Os pedidos de compra do Omie são lidos (`PesquisarPedCompra`, pedido 1514) e trazem o código do fornecedor e a unidade (`cUnidade`).
- **Estado desejado:** as ações de compras e recebimento existem e são conferidas no servidor; o fornecedor vem do Omie e ganha contatos e prazo em campos separados; item sem cadastro no Omie não entra em compra sem exceção autorizada; a quantidade de compra só vira unidade de estoque por fator confirmado.
- **Decisões já fechadas:**
  - Ações novas (área `compras` e nova área `recebimento`): `consultar_compras`, `editar_fornecedor`, `editar_conversao`, `editar_requisicao`, `aprovar_compra`, `autorizar_excecao_compra`, `conferir_recebimento`, `conferir_financeiro_recebimento`. A ação `autorizar_escrita_omie` é só do dono.
  - Área ou cargo não concede ação por implicação; conta real só recebe ação pela matriz aprovada pelo dono (CL-003).
  - O cadastro do Omie não é alterado pelo sistema.
  - Contato de fornecedor fica no Skip Cloud, nunca no Git.
- **Bloqueios:** nenhum para construir. Leitura real do cadastro de fornecedores depende de o Omie aceitar consultas (CL-PEND-006).

## Resultado observável

Compras abre `/fornecedores` e vê cada fornecedor do Omie com contatos (nome, função, telefone, e-mail) e prazo de entrega em campos próprios. Uma requisição de item sem cadastro mostra "cadastrar no Omie antes de comprar". A tela de fatores mostra, por item e apresentação de compra, o fator para a unidade de estoque, quem confirmou e quando.

## Limites e dependências

- **Inclui:** ações e guardas no servidor; leitura do cadastro de fornecedores do Omie; complemento local de contatos e prazos; bloqueio de item sem cadastro com exceção autorizada e pendência de regularização; tabela versionada de fatores.
- **Fora de escopo:** cadastrar fornecedor ou produto no Omie; atribuir ação nova a conta real sem a matriz aprovada; inferir fator pela descrição do produto.
- **Entradas e pré-condições:** catálogo real (SPEC-3-001) para saber se o item está cadastrado; contrato de leitura de fornecedores registrado em `07-sistemas/pcp/contratos-fase-3.md` antes do adapter.
- **Saídas/artefatos:** coleções `pcp_fornecedores_complemento`, `pcp_conversoes` e `pcp_excecoes_compra`; telas `/fornecedores` e `/conversoes`; evidências em `05_entregas/fase-3/spec-3-003/`.
- **Dependências e responsáveis:** dono aprova a matriz com as ações novas (CL-003); Compras confirma fatores (CL-PEND-009) e contatos (CL-PEND-012); PCP cadastra itens no Omie (CL-PEND-013); Maestro constrói.
- **Atores e permissões mínimas:** comprador (`editar_fornecedor`, `editar_conversao`, `editar_requisicao`), aprovador (`aprovar_compra`, `autorizar_excecao_compra`), almoxarifado (`conferir_recebimento`), financeiro (`conferir_financeiro_recebimento`); todos com `consultar_compras`.
- **Superfícies/arquivos/configurações afetadas:** perfis e ações; `/fornecedores`; `/conversoes`; guardas das rotas de compras.
- **Risco e plano B:** se a leitura de fornecedores do Omie não estiver disponível, o fornecedor é identificado pelo código que vem no pedido de compra e o complemento segue; a lacuna fica registrada.
- **Rollback ou reversão:** desligar as rotas novas; ações sem uso não afetam a fase 2.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → fornecedores | Omie | Cadastro de fornecedores (código, razão social, nome fantasia, CNPJ, ativo); método e campos comprovados por sonda de leitura e registrados em `contratos-fase-3.md` | Segredo no backend | Sub-lotes com pausa; chave = aplicativo + código | Bloqueio do Omie: mantém o último lote |
| Complemento de fornecedor | Skip Cloud | Contatos (nome, função, telefone, e-mail, um por linha), prazo de entrega em dias, observação | `editar_fornecedor` | Versão por alteração | Campo inválido recusado com o motivo |
| Fatores | Skip Cloud | Item, fornecedor (opcional), apresentação de compra, unidade de compra, fator, unidade de estoque oficial, confirmado por, confirmado em, versão | `editar_conversao` | Mudança cria versão nova | Fator ≤ 0 ou unidade de estoque desconhecida recusados |
| Exceções de compra | Skip Cloud | Item, motivo, autorizado por, hora, estado (aberta, regularizada) | `autorizar_excecao_compra` | Uma exceção por item e documento | Sem motivo: recusada |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Item fora do catálogo real | Requisição, cotação e recebimento bloqueados: "cadastrar no Omie antes de comprar" | Exceção autorizada com motivo | Escopo, fluxo-alvo 10 |
| RN-02 | Exceção autorizada | Fica "pendente de regularização" até o item aparecer no catálogo e ser ligado ao documento | Não vira caminho padrão: o painel conta as exceções | Escopo, fluxo-alvo 10 |
| RN-03 | Sem fator confirmado | Quantidade fica na unidade de compra com pendência; preço não é comparado | — | Escopo, antiga fase 3 |
| RN-04 | Fator alterado | Versão nova; documentos antigos mantêm o fator usado | — | Escopo |
| RN-05 | Contatos | Cada dado no seu campo; nada de texto único com tudo | — | Escopo, fluxo-alvo 10 |

## Fluxo e regras

1. Criar as ações e guardas; provar permitir e negar com perfis de teste.
2. Ler os fornecedores do Omie (sonda registrada antes) e abrir o complemento de contatos e prazos.
3. Aplicar RN-01 e RN-02 em toda rota de compras e recebimento.
4. Abrir a tabela de fatores e usar a conversão em requisição, cotação, histórico e recebimento.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Saco de 25 kg, fator 25 confirmado; 4 sacos a R$ 250,00 | 100 KG; R$ 10,00 por KG | — |
| Limite | Item sem fator | Quantidade em "saco" com pendência; sem comparação de preço | Compras confirma o fator |
| Falha | Item fora do catálogo | Bloqueado; exceção só com autorização e motivo | Regularização fecha a pendência |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `07-sistemas/pcp/acessos.md`; o código de perfis e ações no Skip.
2. **Alterar somente:** ações e guardas novas, fornecedores, fatores e exceções.
3. **Não alterar:** ações da fase 2; contas reais (só pela matriz aprovada); cadastro do Omie.
4. **Executar nesta ordem:** ações e guardas; fornecedores; bloqueio de item sem cadastro; fatores.
5. **Parar e pedir validação quando:** nunca para construir; atribuir ação nova a conta real só depois da matriz aprovada pelo dono, sem tarefa nova.
6. **Estado válido ao parar:** fase 2 intacta; rotas novas negando por padrão.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Ações novas com permitir e negar provados por perfis de teste.
- [ ] Contrato de leitura de fornecedores registrado e conferido numa amostra.
- [ ] Complemento de contatos em campos separados.
- [ ] Item sem cadastro bloqueado; exceção autorizada com pendência.
- [ ] Fatores versionados e usados na conversão.
- [ ] Evidências em `05_entregas/fase-3/spec-3-003/`.

## Critérios de aceite

- [ ] **CA-3-08:** as ações de compras e recebimento existem e são conferidas no servidor em cada chamada; perfil de teste sem a ação recebe 403 sem pistas; conta real não recebe ação nova fora da matriz aprovada.
- [ ] **CA-3-09:** cada fornecedor lido do Omie aparece com contatos e prazo de entrega em campos próprios; mudança gera versão com autor e hora; o cadastro do Omie não é alterado.
- [ ] **CA-3-10:** requisição, cotação ou recebimento de item fora do catálogo real é bloqueado com "cadastrar no Omie antes de comprar"; exceção só com `autorizar_excecao_compra` e motivo, e fica pendente até o item ser cadastrado e ligado.
- [ ] **CA-3-11:** a quantidade de compra só vira unidade de estoque por fator confirmado (4 sacos de 25 kg = 100 KG); sem fator fica na unidade de compra com pendência; mudar o fator cria versão nova sem alterar documentos anteriores.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.03-01: perfil sem `aprovar_compra` tenta aprovar | `node --test tests/pcp/spec-3-003.test.mjs` | 403; nada gravado | `05_entregas/fase-3/spec-3-003/` |
| RED | P3.03-02: requisição de item fora do catálogo | Fixture | Bloqueio; exceção sem motivo recusada | Idem |
| RED | P3.03-03: conversão sem fator | Fixture | Pendência; preço sem comparação | Idem |
| GREEN | P3.03-04: fator 25 e 4 sacos a R$ 250,00 | Fixture | 100 KG e R$ 10,00/KG | Idem |
| GREEN | P3.03-05: fornecedores reais com complemento | Leitura no Skip | Contagem e amostra conferidas; contatos em campos próprios | Idem |
| REFACTOR/REGRESSÃO | P3.03-06: provas de acesso da fase 2 | Testes da fase 2 | Verdes | Idem |

**Dados/fixtures:** perfis de teste de comprador, aprovador, almoxarifado e financeiro; item demonstrativo "FARINHA-DEMO" com apresentação "saco 25 kg".  
**Caminhos de erro obrigatórios:** sem ação, item sem cadastro, exceção sem motivo, fator inválido, unidade desconhecida, Omie bloqueado.  
**Evidência exigida:** saída dos testes, amostra sanitizada da leitura e captura das telas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** Compras e dono
- **O que confere:** cada pessoa só vê e faz o que a matriz permite; um fornecedor real com contatos e prazo; uma tentativa de comprar item sem cadastro; a conversão de um insumo real pelo fator confirmado.
- **Resultado esperado:** acessos corretos; item sem cadastro barrado; conversão certa.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/fornecedores`, `/conversoes` e o bloqueio de item sem cadastro.
- **Como operar depois:** Compras mantém contatos, prazos e fatores; exceções aparecem no painel até a regularização.
- **Como monitorar:** número de exceções abertas e de itens sem fator.
- **Pendência conhecida:** matriz com as ações novas (CL-003), fatores (CL-PEND-009) e contatos (CL-PEND-012).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Criar os acessos de compras e recebimento por área | American Goodies | SPEC-3-003 | CA-3-08 | P3.03-01, P3.03-06 | 05_entregas/fase-3/spec-3-003/ | — | ☐ |
| pendente | Montar o cadastro de fornecedores com os contatos em campos separados | American Goodies | SPEC-3-003 | CA-3-09 | P3.03-05 | 05_entregas/fase-3/spec-3-003/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |
| pendente | Barrar a compra de item que não está cadastrado no Omie | American Goodies | SPEC-3-003 | CA-3-10 | P3.03-02 | 05_entregas/fase-3/spec-3-003/ | — | ☐ |
| pendente | Converter a unidade de compra para a unidade de estoque só com fator confirmado | American Goodies | SPEC-3-003 | CA-3-11 | P3.03-03, P3.03-04 | 05_entregas/fase-3/spec-3-003/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
