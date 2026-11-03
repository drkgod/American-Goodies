# Fase 3 — Compras, recebimento, pedidos, alertas, consulta e validação final

**Revisão:** 26/10/2026 (AC-26-01). **Fase única:** a fase 3 é a última e reúne tudo o que faltava do projeto: o que estava nas antigas fases 3, 4 e 5 e as três tarefas abertas da fase 2. As fases 4 e 5 não têm tarefas. São 18 SPECs e 48 tarefas; a sessão de validação final com a equipe está marcada no portal para 03/12/2026.

## Como executar

- Construir as tarefas em sequência, na ordem do `fase.md`, sem teste no meio e sem pedir autorização antes de cada uma. Cada tarefa fecha quando as provas automáticas da sua SPEC passam e a evidência fica em `05_entregas/fase-3/spec-3-NNN/`.
- O único teste com o cliente é a sessão de validação final (SPEC-3-018). As outras SPECs listam, em "Teste humano do cliente", o que cada área confere nessa sessão.
- Leitura real do Omie e da Nuvemshop pode ser usada logo depois de construída. Escrita no Omie é construída com a chave desligada e provada no simulador; só liga com a autorização explícita do dono (regra 6 abaixo).
- Dado do cliente ausente ou Omie bloqueado deixa pendente só a parte afetada: construir o restante, registrar em `06_notas/` e no `STATUS.md` e seguir para a próxima tarefa. Voltar à parte pendente quando a entrada chegar.
- Compras e recebimento (SPECs 3-003 a 3-007) e preparação de pedidos e faturamento (SPECs 3-008 e 3-009) são blocos independentes: um bloqueio num deles não para o outro.
- O que o cliente envia ou decide está no checklist do cliente, em `04_fase-atual/`. Nenhum item dele trava a construção; alguns são condição para ligar uma escrita ou um loop.

## Ordem das SPECs

| Bloco | SPEC | Entrega | Origem |
|---|---|---|---|
| Fase 2 | [SPEC-3-001](spec-3-001-dados-reais-da-fase-2.md) | Catálogo real, 90 dias, sugestões reais e telas da fase 2 em uso real | Tarefas 4e0fcf1c e 2ea1e7ab da fase 2; RQ-003/008/012 |
| Fase 2 | [SPEC-3-002](spec-3-002-conclusao-da-op-no-omie.md) | Conclusão da ordem de produção no Omie, com a chave desligada | Tarefa 6e38e5a3 da fase 2; RQ-002/012 |
| Compras e recebimento | [SPEC-3-003](spec-3-003-fornecedores-cadastro-e-conversoes.md) | Acessos de compras, fornecedores, item cadastrado antes da compra, conversões | Antiga fase 3; RQ-004/007/010 |
| Compras e recebimento | [SPEC-3-004](spec-3-004-historico-de-precos.md) | Histórico de preços por produto e fornecedor | Antiga fase 3; RQ-004 |
| Compras e recebimento | [SPEC-3-005](spec-3-005-requisicao-cotacao-e-aprovacao.md) | Requisição por fornecedor, cotação e aprovação | Antiga fase 3; RQ-004 |
| Compras e recebimento | [SPEC-3-006](spec-3-006-pedido-de-compra-e-entregas.md) | Acompanhamento das entregas e lançamento da compra no Omie | Antiga fase 3; RQ-004/012 |
| Compras e recebimento | [SPEC-3-007](spec-3-007-recebimento-conferido.md) | Recebimento conferido, parcelas e exceções; nota de entrada em revisão | Antiga fase 3; RQ-010 |
| Pedidos e faturamento | [SPEC-3-008](spec-3-008-unidades-tabela-e-canal.md) | Acessos de faturamento, unidades, tabela de preço e origem do canal | Antiga fase 3; RQ-005/011 |
| Pedidos e faturamento | [SPEC-3-009](spec-3-009-pedido-pronto-para-faturar.md) | Frete, volumes, fila apto/bloqueado, pedidos manuais e envio ao Omie | Antiga fase 3; RQ-005/011/012 |
| Alertas | [SPEC-3-010](spec-3-010-alertas.md) | Parâmetros e alertas de estoque, produção, compra, preço, pedido e divergência | Antiga fase 4; RQ-013 |
| Alertas | [SPEC-3-011](spec-3-011-tratamento-dos-alertas.md) | Ciclo de tratamento, responsável, histórico e destinatário por área | Antiga fase 4; RQ-013 |
| Alertas | [SPEC-3-012](spec-3-012-historico-e-sazonalidade.md) | Comparação histórica, sazonalidade e sugestão de antecipação | Antiga fase 4; RQ-003/013 |
| Alertas | [SPEC-3-013](spec-3-013-loop-01-alertas-tratados.md) | LOOP-01: alertas críticos tratados | Antiga fase 4; RQ-014 |
| Consulta | [SPEC-3-014](spec-3-014-relatorios-comparativos.md) | Relatórios comparativos | Antiga fase 5; RQ-009/013 |
| Consulta | [SPEC-3-015](spec-3-015-assistente-de-consulta.md) | Assistente de consulta somente leitura | Antiga fase 5; RQ-006/007 |
| Consulta | [SPEC-3-016](spec-3-016-exportacao-e-recuperacao.md) | Exportação dos dados e recuperação demonstrada | Antiga fase 5; RQ-012 |
| Consulta | [SPEC-3-017](spec-3-017-loop-02-perguntas-respondidas.md) | LOOP-02: perguntas prioritárias respondidas com fonte | Antiga fase 5; RQ-014 |
| Validação | [SPEC-3-018](spec-3-018-validacao-final-ponta-a-ponta.md) | Sessão de validação final ponta a ponta com a equipe | Antiga fase 5 e validação final da fase 2; RQ-014 |

## Regras comuns a todas as SPECs

1. **Ambiente.** Projeto Skip 62774 (mcc automação fabrica), com MCP do Skip e Skip Cloud. Não criar outro projeto nem outro banco. Ler o código, as migrations e as coleções atuais antes de alterar. Antes de migration ou hook, consultar `skip_cloud_migrations_guide` e `skip_cloud_hooks_guide`. Rotas novas em `/backend/v1/`, um `routerAdd` por arquivo; a tela chama pelo cliente PocketBase existente (`pb.send`); o endereço do backend vem de `skip_cloud_get_backend_url`. Mutação local dentro de `$app.runInTransaction` (usar `txApp`); chamada HTTP externa só depois do commit. Depois de cada recorte, `skip_project_apply_changes` roda o QA: conferir cada etapa e `qa.test.ran`.
2. **Fonte oficial.** O Omie é a fonte de produtos, estoque, vendas, fichas, ordens de produção, pedidos e documentos. O Skip Cloud guarda só a camada complementar: propostas, conferências, aprovações, eventos, histórico técnico e parâmetros. A Nuvemshop é complementar (pedido não pago é intenção, não soma ao confirmado). A Lunet chega pelo Omie; não criar conector direto.
3. **Acesso.** Conferido no servidor em cada chamada: conta ativa, área, ação e ponto. Sem permissão, negar sem dar pistas. O servidor grava autor e hora; nenhuma coleção operacional aceita gravação direta do navegador; administrar perfis não dá direito de editar ou apagar registro operacional. As ações novas desta fase são construídas e provadas com perfis de teste; as contas reais só recebem ação nova pela matriz de acesso aprovada pelo dono (checklist CL-003).
4. **Dados.** Quantidade com decimais; ids em texto; unidade desconhecida não vira padrão; unidades diferentes não se somam; valor desconhecido fica pendente (nulo) com o motivo, nunca zero. Negócio em America/Sao_Paulo, auditoria em UTC. Dado de demonstração fica marcado e separado do real no servidor.
5. **Leitura do Omie.** Só pelo servidor, com o segredo guardado no backend. Um sub-lote por vez, com pausa entre chamadas e retomada pelo ponto em que parou. "Consumo redundante" (HTTP 500 com `SOAP-ENV:Client-6`) e bloqueio por excesso de consultas (HTTP 425) param a rotina, registram a hora da próxima tentativa e mantêm o último dado válido; nunca repetir em laço. Contrato novo de leitura (endpoint, método, campos, paginação e amostra sanitizada) vai para `07-sistemas/pcp/contratos-fase-3.md` antes do adapter.
6. **Escrita no Omie.** Toda escrita tem uma chave própria, desligada por padrão:

   | Chave | O que grava | SPEC |
   |---|---|---|
   | `omie_op_escrita` | Inclusão ou conclusão da ordem de produção conferida | 3-002 |
   | `omie_pedido_compra_escrita` | Pedido de compra aprovado | 3-006 |
   | `omie_recebimento_escrita` | Recebimento da compra (em revisão; não construir) | 3-007 |
   | `omie_pedido_venda_escrita` | Pedido manual e volumes e frete do pedido liberado | 3-009 |

   Com a chave desligada, a rota responde 423 ("escrita desligada") e não faz nenhuma chamada ao Omie. Construir e provar com um simulador do Omie que segue o mesmo contrato. A chave só liga com a autorização explícita do dono (ação `autorizar_escrita_omie`, só dele), na sessão de validação final ou quando ele autorizar, uma chave por vez e com a condição do checklist cumprida. A primeira gravação de cada tipo é feita com o dono presente e conferida por leitura logo depois. Antes de qualquer repetição, consultar o Omie; código de integração persistido antes do envio; sem reversão automática; autor, hora, conteúdo e resultado registrados. Ter a credencial cadastrada não liga nada. Emissão de nota fiscal e lançamento financeiro não são feitos pelo sistema.
7. **Provas.** RED antes do comportamento, GREEN e regressão. Sem runner confiável no projeto, usar testes Node nativos (`node:test` e `assert/strict`) em `tests/pcp/spec-3-NNN.test.mjs`, com fixtures em `tests/pcp/fixtures/fase-3/`, chamando o mesmo módulo da aplicação. `npm test` que só imprime "sem testes" não é prova; build e lint não substituem prova de aceite. Registrar comando, versão do Skip e saída na evidência.
8. **Reversão.** Desligar a rota ou a chave nova; migrations só aditivas; não apagar coleção nem evento. Efeito já gravado no Omie exige decisão humana separada; voltar a versão da tela não desfaz o efeito.
9. **Segurança e privacidade.** Segredo nunca no navegador, no Git, em documento ou em log. Contatos de fornecedores, dados de clientes e valores financeiros ficam no Skip Cloud; no Git só estrutura, estado e evidência sanitizada.

## Fora desta fase

Emissão ou transmissão de nota fiscal pelo sistema, pagamento ou lançamento financeiro automático, compra ou produção decidida pela IA, portal de pedidos B2B, prospecção comercial, saneamento do estoque físico e garantia de adesão da operação.
