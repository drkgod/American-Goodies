# SPEC-3-001 — Dados reais da fase 2: catálogo, 90 dias e sugestões

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (PCP) com o Maestro; conferência na validação final  
**Origem no escopo:** tarefas 4e0fcf1c (catálogo real, SPEC-2-001 CA-D1) e 2ea1e7ab (sugestões com dados reais, SPEC-2-006 CA-S1 e CA-S2), transferidas da fase 2 por AC-26-01; uso real da importação de 90 dias (e6aa4afa) e da cadeia programação, apontamento e conferência, que seria feito na validação da fase 2 (0d876150, dispensada); RQ-002/003/008/012; CL-001; CL-006  
**Degrau da solução:** reuso — usa a importação de 90 dias, o método baseline90-v1, o mapa de pedidos firmes e as telas da fase 2; acrescenta só a sincronização do catálogo produto a produto e a lista de faltantes.

## Contexto e decisões fechadas

- **Estado atual:**
  - A listagem do cadastro do Omie (`ListarProdutosResumido`) volta vazia. Os produtos existem: a posição de estoque (`ListarPosEstoque`) traz 1.069 itens, e o produto aparece quando consultado pelo código.
  - Em 23/10 a chave do Omie ficou bloqueada por excesso de consultas (HTTP 425), com guarda de 12 horas e 0 de 108 sub-lotes. A decisão entre acionar o suporte do Omie e revisar a chave é do dono (checklist CL-PEND-006).
  - Aprovados em 21/10 e registrados em `07-sistemas/pcp/contratos-fase-2.md`: o método baseline90-v1 e o mapa de pedidos firmes (faturado, autorizado e parcial elegíveis; data de faturamento).
  - A importação de 90 dias (`importacao-90d.ts`, TDD 7/7) e as sugestões (`sugestao.ts`, TDD 12/12) estão construídas e provadas com fixture, sem uso real.
  - Programação, apontamentos e conferências (telas `/planejamento`, `/apontamentos` e `/conferencias`) estão no ar; a conferência ainda tem o acesso de demonstração (`DEMO_CONFERENCIA`).
- **Estado desejado:** catálogo real completo, lista do que falta cadastrar, 90 dias reais importados, sugestões calculadas com números reais e as telas da fase 2 usando produtos e contas reais.
- **Decisões já fechadas:**
  - O sistema não cria nem altera produto, ficha ou receita no Omie; quem cadastra é o PCP.
  - O catálogo vem pela via que funciona: consulta produto a produto, a partir dos códigos da posição de estoque, das fichas e dos pedidos.
  - Método das sugestões: baseline90-v1, sem mudança de fórmula. Pedidos firmes: o mapa aprovado em 21/10.
  - Nada desta SPEC grava no Omie.
- **Bloqueios:** nenhum para construir. A leitura real depende de o Omie aceitar consultas (CL-PEND-006); enquanto estiver bloqueado, a rotina para sozinha e marca a próxima tentativa.

## Resultado observável

O catálogo mostra os produtos reais do Omie com código, descrição, unidade e hora da leitura. A tela de qualidade lista o que falta cadastrar. As sugestões de produção e de compra aparecem com os números reais e a memória de cálculo. O PCP programa um produto real, a cozinha aponta e a expedição confere com as contas reais.

## Limites e dependências

- **Inclui:** sincronização do catálogo produto a produto; lista de faltantes; importação real de vendas, produção e compras a receber; cálculo real das sugestões; retirada do acesso de demonstração da conferência; uso dos produtos e das contas reais nas telas da fase 2.
- **Fora de escopo:** cadastrar produto no Omie; mudar o método das sugestões; publicar programação ou comprar a partir da sugestão; gravar no Omie.
- **Entradas e pré-condições:** contratos de leitura da fase 2 em `07-sistemas/pcp/`; Omie aceitando consultas; matriz de acesso aprovada (v2, 21/10).
- **Saídas/artefatos:** lote do catálogo real; lista de faltantes; lote real de 90 dias; sugestões reais; evidências em `05_entregas/fase-3/spec-3-001/`.
- **Dependências e responsáveis:** dono decide o desbloqueio do Omie (CL-PEND-006); PCP cadastra no Omie o que faltar (CL-PEND-013); Maestro constrói e roda.
- **Atores e permissões mínimas:** PCP e gestão consultam catálogo, faltantes e sugestões; as ações da fase 2 continuam como estão.
- **Superfícies/arquivos/configurações afetadas:** `/catalogo`, `/qualidade`, `/sugestoes`, `/planejamento`, `/apontamentos`, `/conferencias`; rotinas de leitura do Omie; `07-sistemas/pcp/contratos-fase-3.md`.
- **Risco e plano B:** se o Omie seguir bloqueado, o catálogo fica no último lote válido e as sugestões reais ficam pendentes com o motivo "Omie bloqueado"; o resto da fase segue.
- **Rollback ou reversão:** desligar a rotina nova volta ao último lote válido; nada é apagado.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → catálogo | Omie | Consulta dirigida por código (a mesma usada na fase 2): código, descrição, unidade, tipo, ativo; método e campos registrados em `contratos-fase-3.md` | Segredo no backend | Um sub-lote por vez, pausa entre chamadas, cursor de retomada; chave do item = aplicativo + id do produto | 425 ou "consumo redundante": para, registra próxima tentativa, mantém o lote anterior |
| Omie → 90 dias | Omie | `ListarPedidos`, `ListarOrdemProducao`, `PesquisarPedCompra`, conforme `contratos-fase-2.md` | Idem | Lote atômico; replay pela chave aplicativo + documento + linha | Página falha não ativa lote incompleto |
| Sugestões | Lotes ativos + parâmetros aprovados | baseline90-v1 (`sugestao.ts`) | PCP consulta | Chave tipo + item + período + hash | Faltante: quantidade nula com motivo |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Código no estoque, numa ficha ou num pedido sem cadastro no Omie | Entra na lista de faltantes com código, descrição da fonte e onde aparece | Sai da lista na leitura seguinte ao cadastro | SPEC-2-001 D1 |
| RN-02 | Omie responde 425 ou "consumo redundante" | Rotina para, mostra o bloqueio e a hora da próxima tentativa | Nunca repetir em laço | Regras comuns, item 5 |
| RN-03 | Item sem venda, ficha, parâmetro ou saldo | Sugestão pendente com o motivo | Nunca zero | SPEC-2-006 S1 |
| RN-04 | Pedido de venda fora do mapa de firmes | Não entra no termo de firmes | Status desconhecido bloqueia o item | Mapa de 21/10 |

## Fluxo e regras

1. Montar a lista de códigos a consultar a partir da posição de estoque, das fichas e dos pedidos já lidos.
2. Consultar o Omie produto a produto, em sub-lotes, até o fim; ativar o lote do catálogo só quando completo.
3. Gerar a lista de faltantes (RN-01).
4. Rodar a importação real de 90 dias e ativar o lote completo.
5. Calcular as sugestões reais pelo baseline90-v1.
6. Retirar o acesso de demonstração da conferência e ligar as telas da fase 2 ao catálogo real e às contas da matriz.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Omie aceitando consultas | Catálogo completo; 90 dias ativos; sugestões calculadas | — |
| Limite | Produto do estoque ausente no cadastro | Aparece na lista de faltantes; sugestão dele fica pendente | PCP cadastra; próxima leitura confere |
| Falha | Omie responde 425 no meio da sincronização | Para, guarda o cursor, mostra a próxima tentativa; catálogo anterior segue ativo | Retoma do cursor depois da guarda |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `07-sistemas/pcp/contratos-omie.md`, `catalogo.md` e `contratos-fase-2.md`; o código atual de catálogo, importação, sugestões e conferência no Skip.
2. **Alterar somente:** rotina do catálogo, lista de faltantes, execução real da importação e das sugestões, acesso de demonstração da conferência e a ligação das telas da fase 2 ao catálogo real.
3. **Não alterar:** a fórmula baseline90-v1; o mapa de pedidos firmes; a fila de envio ao Omie; o cadastro do Omie.
4. **Executar nesta ordem:** catálogo produto a produto; lista de faltantes; importação real; sugestões reais; telas da fase 2 em uso real.
5. **Parar e pedir validação quando:** nunca para esta SPEC; Omie bloqueado ou produto faltando são bloqueios localizados (registrar e seguir).
6. **Estado válido ao parar:** último catálogo e último lote de 90 dias válidos ativos; demonstração separada do real.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Sincronização produto a produto com pausa, retomada e parada no bloqueio.
- [ ] Lista de faltantes gerada e conferida contra a consulta dirigida.
- [ ] Importação real de 90 dias ativa, ou pendência registrada com o motivo.
- [ ] Sugestões reais com memória de cálculo, ou pendência por item.
- [ ] Acesso de demonstração da conferência retirado; telas da fase 2 com produtos e contas reais.
- [ ] Evidências em `05_entregas/fase-3/spec-3-001/`.

## Critérios de aceite

- [ ] **CA-3-01:** o catálogo real é montado produto a produto, em sub-lotes com pausa e retomada; 425 ou "consumo redundante" param a rotina, registram a próxima tentativa e mantêm o último catálogo; três produtos conferem código, descrição e unidade com a consulta dirigida.
- [ ] **CA-3-02:** todo código presente no estoque, numa ficha ou num pedido e ausente do cadastro aparece na lista de faltantes com o lugar onde aparece; o item sai da lista na leitura seguinte ao cadastro; o sistema não cria produto.
- [ ] **CA-3-03:** a importação real ativa um lote completo de exatamente 90 datas de vendas, produção e compras a receber, com os pedidos firmes pelo mapa de 21/10; falha mantém o lote anterior; valor desconhecido fica pendente.
- [ ] **CA-3-04:** as sugestões reais de produção e de compra seguem o baseline90-v1, mostram a memória de cálculo e deixam pendente, com motivo, o item sem dado; nada é publicado nem comprado.
- [ ] **CA-3-05:** planejamento, apontamentos e conferências usam produtos do catálogo real e as contas da matriz aprovada; o acesso de demonstração da conferência deixa de existir; a demonstração fica marcada e separada; nenhuma chamada de gravação ao Omie.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.01-01: sincronização com simulador que responde 425 no terceiro sub-lote | `node --test tests/pcp/spec-3-001.test.mjs` | Para no terceiro, cursor salvo, catálogo anterior ativo, próxima tentativa registrada | `05_entregas/fase-3/spec-3-001/` |
| RED | P3.01-02: código no estoque sem cadastro | Fixture | Aparece na lista de faltantes; some depois do cadastro simulado | Idem |
| GREEN | P3.01-03: catálogo real e conferência de três produtos | Rotina no Skip com o Omie liberado | Lote completo; três produtos batem | Idem, com contagem e hora |
| GREEN | P3.01-04: importação real de 90 dias | Rotina no Skip | 90 datas; replay sem duplicar; firmes pelo mapa | Idem |
| GREEN | P3.01-05: sugestões reais | Cálculo no Skip | Memória de cálculo; pendências com motivo; oráculos da fase 2 seguem verdes | Idem |
| REFACTOR/REGRESSÃO | P3.01-06: telas da fase 2 com produto e contas reais | Conta de teste sem permissão e conta real com permissão | Sem permissão nega; acesso de demonstração não existe; provas da fase 2 verdes | Idem |

**Dados/fixtures:** simulador do Omie com 425 e "consumo redundante"; fixtures da fase 2 (COOKIE-1, 51→60, 4,8→6 KG).  
**Caminhos de erro obrigatórios:** bloqueio do Omie, produto sem cadastro, unidade desconhecida, página falha, replay.  
**Evidência exigida:** saída dos testes, contagens do lote, hora da leitura e captura das telas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** PCP e dono
- **O que confere:** três produtos do catálogo; a lista do que falta cadastrar; os números de três sugestões, uma de produção e duas de compra; a programação de um produto real apontada e conferida pelas contas reais.
- **Resultado esperado:** números e produtos batem com o Omie; o que falta aparece como pendente, não como zero.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** catálogo com hora da leitura; lista de faltantes; cartão de uma sugestão com a memória de cálculo.
- **Como operar depois:** o PCP cadastra no Omie o que estiver na lista; a rotina confere sozinha.
- **Como monitorar:** estado da leitura do Omie (ok, lote antigo, bloqueado) e tamanho da lista de faltantes.
- **Pendência conhecida:** desbloqueio da chave do Omie (CL-PEND-006).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Trazer o catálogo real do Omie produto a produto, sem estourar o limite de consultas | American Goodies | SPEC-3-001 | CA-3-01 | P3.01-01, P3.01-03 | 05_entregas/fase-3/spec-3-001/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |
| pendente | Mostrar ao PCP a lista do que falta cadastrar no Omie | American Goodies | SPEC-3-001 | CA-3-02 | P3.01-02 | 05_entregas/fase-3/spec-3-001/ | — | ☐ |
| pendente | Importar os 90 dias reais de vendas, produção e compras a receber | American Goodies | SPEC-3-001 | CA-3-03 | P3.01-04 | 05_entregas/fase-3/spec-3-001/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |
| pendente | Calcular as sugestões de produção e de compra com os números reais | American Goodies | SPEC-3-001 | CA-3-04 | P3.01-05 | 05_entregas/fase-3/spec-3-001/ | — | ☐ |
| pendente | Usar programação, apontamentos e conferências com os produtos e as contas reais | American Goodies | SPEC-3-001 | CA-3-05 | P3.01-06 | 05_entregas/fase-3/spec-3-001/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
