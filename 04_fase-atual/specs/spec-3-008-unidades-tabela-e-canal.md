# SPEC-3-008 — Acessos de faturamento, unidades, tabela de preço e origem do canal

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (faturamento e expedição) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (cadastro operacional de unidades; tabela comercial; referência de canal; regra "Nome Fantasia operacional não é sobrescrito silenciosamente pelo canal"); fluxo-alvo 12; decisão 6 (Nuvemshop complementar; Lunet pelo Omie); RQ-005/007/011; CL-003; CL-PEND-010  
**Degrau da solução:** reuso — os pedidos do Omie e da Nuvemshop já são lidos e classificados pela origem na fase 1; acrescenta ações de faturamento, cadastro operacional de unidades e tabela de preço.

## Contexto e decisões fechadas

- **Estado atual:** o painel lê os pedidos oficiais do Omie (`ListarPedidos`, mais de 5 mil) e os da Nuvemshop, com vínculo só por referência comprovada (44 pares por número de origem na prova de 08/10). O código de integração do pedido no Omie vem vazio na amostra. Não há cadastro de unidade, nome fantasia operacional nem tabela de preço no sistema.
- **Estado desejado:** as ações de faturamento e expedição existem; cada cliente do Omie que recebe pedido tem a unidade e o nome fantasia usados na operação; cada pedido mostra a tabela de preço da unidade, o subtotal recalculado e a origem (Omie direto, Lunet pelo Omie, Nuvemshop ou manual).
- **Decisões já fechadas:**
  - Ações novas (nova área `faturamento`): `consultar_faturamento`, `editar_unidade`, `preparar_pedido`, `conferir_volumes`, `liberar_faturamento`.
  - O nome vindo do canal nunca troca o nome fantasia operacional sozinho: diferença fica "a revisar".
  - Preço diferente da tabela aparece; o sistema não troca preço.
  - Pedido não pago da Nuvemshop segue como intenção, separado do confirmado.
  - Tabela de preço: a do Omie, se a conta usar tabela e a leitura for comprovada; senão, tabela operacional versionada mantida pelo faturamento.
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/unidades`, o faturamento vê cada cliente do Omie com a unidade, o nome fantasia operacional, o tipo (franquia, loja própria, cliente B2B) e os nomes com que aparece nos canais; nomes diferentes ficam "a revisar". Em `/pedidos/preparacao`, cada pedido mostra a unidade, a tabela vigente, o subtotal recalculado ao lado do subtotal do pedido e a origem.

## Limites e dependências

- **Inclui:** ações e guardas; cadastro operacional de unidades ligado ao cliente do Omie; nomes por canal; tabela de preço (Omie ou operacional); subtotal recalculado; origem do pedido.
- **Fora de escopo:** alterar cliente, preço ou pedido no Omie; criar cliente; portal de pedidos B2B; prospecção.
- **Entradas e pré-condições:** leitura de pedidos da fase 1; leitura do cadastro de clientes do Omie (e da tabela de preços, se usada) comprovada por sonda e registrada em `07-sistemas/pcp/contratos-fase-3.md` antes do adapter.
- **Saídas/artefatos:** coleções `pcp_unidades`, `pcp_nomes_canal`, `pcp_tabelas_preco`; telas `/unidades` e `/pedidos/preparacao`; evidências em `05_entregas/fase-3/spec-3-008/`.
- **Dependências e responsáveis:** dono aprova a matriz com as ações novas (CL-003); faturamento informa nome fantasia, tabela e regras das unidades (CL-PEND-010); Maestro constrói.
- **Atores e permissões mínimas:** faturamento `editar_unidade` e `preparar_pedido`; expedição `conferir_volumes`; quem libera `liberar_faturamento`; todos `consultar_faturamento`.
- **Superfícies/arquivos/configurações afetadas:** perfis e ações; `/unidades`; `/pedidos/preparacao`.
- **Risco e plano B:** se o Omie não expuser tabela de preço, usar a tabela operacional versionada; se o cadastro de clientes não puder ser lido, a unidade é identificada pelo cliente que vem no pedido.
- **Rollback ou reversão:** desligar as rotas; o painel da fase 1 segue igual.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → clientes | Omie | Cadastro de clientes (código, razão social, nome fantasia, CNPJ, ativo); método e campos comprovados por sonda | Segredo no backend | Sub-lotes com pausa; chave = aplicativo + código | Bloqueio do Omie: último lote |
| Unidade operacional | Skip Cloud | Cliente do Omie, unidade, nome fantasia operacional, tipo, ativo, versão, autor | `editar_unidade` | Versão esperada | Conflito: 409 |
| Nomes por canal | Skip Cloud | Canal, nome recebido, unidade, estado (igual, a revisar, aceito) | `editar_unidade` | — | Nome novo diferente: "a revisar" |
| Tabela de preço | Omie ou Skip Cloud | Unidade ou grupo, item, preço, unidade, vigência, versão, origem | `editar_unidade` | Versão por vigência | Item sem preço: subtotal pendente |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Nome do canal diferente do operacional | "A revisar"; nome operacional mantido | Faturamento aceita o novo nome com registro | Escopo |
| RN-02 | Subtotal do pedido diferente do recalculado | Diferença visível; nada é trocado | — | Escopo, fluxo-alvo 12 |
| RN-03 | Pedido da Nuvemshop não pago | Intenção, separada do confirmado | — | Decisão 6; fase 1 |
| RN-04 | Pedido sem referência de origem comprovada | Origem "a confirmar"; não liga por cliente e valor | — | RQ-005 |
| RN-05 | Pedido de cliente sem unidade cadastrada | "Unidade não cadastrada"; pedido não fica apto (SPEC-3-009) | — | Escopo |

## Fluxo e regras

1. Criar as ações e guardas; provar permitir e negar com perfis de teste.
2. Ler os clientes do Omie e abrir o cadastro operacional de unidades.
3. Ligar os nomes vindos da Nuvemshop e dos pedidos à unidade, com RN-01.
4. Abrir a tabela de preço e recalcular o subtotal de cada pedido; mostrar a origem.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Pedido de 10 caixas a R$ 50,00, tabela vigente R$ 50,00 | Subtotal R$ 500,00 igual; origem mostrada | — |
| Limite | Canal manda nome "Loja X Shopping" para unidade "Mr. Cheney X" | "A revisar"; nome operacional mantido | Faturamento aceita ou recusa |
| Falha | Item sem preço na tabela | Subtotal pendente com o item | Faturamento cadastra o preço |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `07-sistemas/pcp/contratos-canais.md` e `painel.md`; o código de pedidos no Skip.
2. **Alterar somente:** ações novas, unidades, nomes por canal, tabela de preço e a tela de preparação.
3. **Não alterar:** a classificação de origem da fase 1; o painel.
4. **Executar nesta ordem:** ações e guardas; unidades; nomes por canal; tabela e subtotal.
5. **Parar e pedir validação quando:** nunca para construir; dados das unidades ausentes são bloqueio localizado.
6. **Estado válido ao parar:** painel da fase 1 igual.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Ações novas com permitir e negar provados.
- [ ] Unidades ligadas ao cliente do Omie, com nome fantasia operacional.
- [ ] Nomes por canal com "a revisar".
- [ ] Tabela de preço e subtotal recalculado.
- [ ] Evidências em `05_entregas/fase-3/spec-3-008/`.

## Critérios de aceite

- [ ] **CA-3-23:** as ações de faturamento e expedição existem e são conferidas no servidor em cada chamada; perfil sem a ação recebe 403 sem pistas; conta real não recebe ação nova fora da matriz aprovada.
- [ ] **CA-3-24:** cada cliente do Omie com pedido tem unidade e nome fantasia operacional; nome diferente vindo do canal fica "a revisar" e não troca o cadastro; mudança gera versão com autor e hora.
- [ ] **CA-3-25:** cada pedido mostra a unidade, a tabela vigente, o subtotal recalculado ao lado do subtotal do pedido e a origem comprovada (Omie, Lunet pelo Omie, Nuvemshop ou manual); preço diferente da tabela aparece e não é trocado; pedido não pago da Nuvemshop segue como intenção.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.08-01: perfil sem `preparar_pedido` | `node --test tests/pcp/spec-3-008.test.mjs` | 403 | `05_entregas/fase-3/spec-3-008/` |
| RED | P3.08-02: nome diferente vindo do canal | Fixture | "A revisar"; nome operacional mantido | Idem |
| RED | P3.08-03: item sem preço na tabela | Fixture | Subtotal pendente | Idem |
| GREEN | P3.08-04: 10 caixas a R$ 50,00 | Fixture | R$ 500,00 igual | Idem |
| GREEN | P3.08-05: unidades reais | Leitura no Skip | Contagem e amostra conferidas | Idem |
| REFACTOR/REGRESSÃO | P3.08-06: provas dos canais e do painel da fase 1 | Testes | Verdes | Idem |

**Dados/fixtures:** clientes, unidades, tabela e pedidos de demonstração; pedidos da Nuvemshop pagos e não pagos.  
**Caminhos de erro obrigatórios:** sem ação, nome divergente, item sem preço, cliente sem unidade, origem sem referência, Omie bloqueado.  
**Evidência exigida:** saída dos testes, amostra sanitizada e captura das telas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** faturamento
- **O que confere:** três unidades reais com o nome fantasia certo; um nome de canal diferente aguardando revisão; o subtotal recalculado de um pedido real e a origem dele.
- **Resultado esperado:** unidades e preços certos; nada trocado sem a pessoa decidir.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/unidades` e um pedido em `/pedidos/preparacao`.
- **Como operar depois:** faturamento mantém unidades, nomes e tabela.
- **Como monitorar:** nomes a revisar, clientes sem unidade e itens sem preço.
- **Pendência conhecida:** matriz com as ações novas (CL-003) e dados das unidades (CL-PEND-010).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Criar os acessos de faturamento e expedição por área | American Goodies | SPEC-3-008 | CA-3-23 | P3.08-01 | 05_entregas/fase-3/spec-3-008/ | — | ☐ |
| pendente | Montar o cadastro das unidades com o nome fantasia usado na operação | American Goodies | SPEC-3-008 | CA-3-24 | P3.08-02, P3.08-05 | 05_entregas/fase-3/spec-3-008/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |
| pendente | Ligar cada pedido à tabela de preço e à origem do canal | American Goodies | SPEC-3-008 | CA-3-25 | P3.08-03, P3.08-04, P3.08-06 | 05_entregas/fase-3/spec-3-008/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
