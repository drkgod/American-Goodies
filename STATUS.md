# Status operacional — fase 3 única até a validação final

26/10/2026: o consultor fechou a fase 2 e juntou na fase 3 tudo o que faltava do projeto (AC-26-01). A fase 3 é a última e tem 18 SPECs e 48 tarefas, com a sessão de validação final com a equipe prevista para 03/12/2026. As fases 4 e 5 ficam sem tarefas.

- **Fase 2:** 29 de 29 fechadas. As três abertas (catálogo real, sugestões com dados reais e envio ao Omie) passaram para a fase 3 como tarefas novas (SPECs 3-001 e 3-002); a validação final da fase 2 entra na sessão final da fase 3. Tarefas, SPECs e evidências da fase 2 em `05_entregas/fase-2/`.
- **Construção:** em sequência, sem teste no meio; cada tarefa fecha pelas provas automáticas. O único teste é a sessão final (SPEC-3-018).
- **Gravações no Omie:** construídas com a chave desligada e provadas no simulador; só ligam com a autorização do dono, uma por vez, com a condição do checklist cumprida.
- **Bloqueios localizados:** chave do Omie bloqueada por excesso de consultas desde 23/10 (CL-PEND-006); origem das notas de entrada em revisão (CL-PEND-007). Os dois deixam pendente só a parte afetada.
- **Ambiente:** projeto Skip 62774 (MCP do Skip e Skip Cloud); última versão registrada v0.0.187 (ref 0baa9a6).

**Andamento da fase 3 (28/10/2026):** SPEC-3-001 construída até onde o Omie permite — catálogo produto a produto, lista do que falta cadastrar e conversão dos 90 dias estão no ar (Skip v0.0.173, ref 94f5590). As 5 tarefas da SPEC seguem em andamento (`[/]`): a leitura real, a conferência de 3 produtos e o cálculo real das sugestões esperam o dono desbloquear a chave do Omie (CL-PEND-006). Detalhe: `06_notas/bloqueio-omie-leitura-real-2026-10-28.md`.

**SPEC-3-002 (28/10):** envio da produção com a chave desligada, simulador, autorização do dono e conferência no ar (Skip v0.0.175); falta só uma ordem real para autorizar, que depende das conferências reais.

**SPEC-3-003 (28/10):** ações de compras e recebimento, complemento de fornecedores, item fora do cadastro e conversões de unidade no ar (Skip v0.0.177); a lista de fornecedores do Omie espera a chave e nenhuma conta real recebeu ação nova (matriz CL-003).

**SPEC-3-004 (28/10):** histórico de preços por insumo e fornecedor, com classificação e tela, no ar (Skip v0.0.178); a carga dos pedidos reais espera a chave do Omie (os campos de preço ainda não foram conferidos numa amostra).

**SPEC-3-005 (28/10):** requisição por fornecedor, cotações com comparação ao histórico e aprovação por alçada no ar (Skip v0.0.179); a aprovação real fica parada até o dono informar as alçadas (CL-PEND-008) e a tolerância (CL-PEND-001).

**SPEC-3-006 (28/10):** entregas de compra, ligação do pedido pelo número e lançamento atrás da chave desligada (com simulador) no ar (Skip v0.0.180); a lista espera a leitura real do Omie e a primeira gravação só com o dono presente (CL-PEND-011).

**SPEC-3-007 (28/10):** recebimento conferido contra o pedido (várias ligações por linha), parcelas com aviso de compra já paga, exceção de item sem cadastro e pré-conferência só com nota de demonstração no ar (Skip v0.0.182); leitura de nota real e escrita do recebimento seguem em revisão (CL-PEND-007).

**SPEC-3-008 (28/10):** ações de faturamento e expedição, unidades com versões, nomes de canal a revisar, tabela de preço, subtotal recalculado e origem do pedido no ar (Skip v0.0.183); a leitura de clientes do Omie espera a chave, e nenhuma conta real recebeu ação nova (matriz CL-003).

**SPEC-3-009 (28/10):** frete por pedido, volumes da expedição, fila apto/bloqueado com liberação, pedido manual com checagem de duplicata e gravação no Omie atrás da chave desligada (com simulador) no ar (Skip v0.0.185); a primeira gravação real só com o dono presente (CL-PEND-011) e nenhuma conta real recebeu ação nova (matriz CL-003).

**SPEC-3-010 (28/10):** parâmetros de alerta por produto e família, seis regras de alerta com os números usados e rodada sem repetição no ar (Skip v0.0.186); estoque, produção, divergência e intenção da Nuvemshop reais esperam fonte (leitura do Omie, CL-PEND-006) e os parâmetros reais esperam o PCP (CL-PEND-001).

**SPEC-3-011 (29/10):** ciclo de tratamento dos alertas (aberto, em análise, tratado) com ação obrigatória, histórico só de inclusão, reabertura ligada ao anterior, alertas por área agrupados, contador no menu e regra desligável no ar (Skip v0.0.187); nenhuma conta real recebeu a ação nova (matriz CL-003).

Próxima ação: SPEC-3-012. Só o consultor encerra o projeto.

Publicação documental; sem alteração do código, do Skip, das integrações ou do portal.

---

## Histórico anterior (não é o estado atual)

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (21/10/2026): 24/29 concluídas** — 51356fad (matriz v1.2), 49327a88 (21 contas reais), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3), e57df8ff (visão de qualidade), a6bf06fb (adendos D5 — SPEC-2-001 100% no recorte do executor), 3cd404e5 (calendário e OP digital), be180fc1 (tela de apontamentos), 556da315 (duas telas de conferência), 0baec76e (sugestões com memória de cálculo), c44c11da (fila de envio com simulação), 8bb4ef77 (sugestão somente para rascunho), 4e9a1d0e (provas de recuperação antes do envio real), 87e4af63 (reprogramar sem perder os apontamentos), 30118f65 (revisar divergências e invalidar aprovações antigas), 16b8a592 (publicar a programação por área), d2a44349 (confirmar parâmetros e dias de produção — CL-006) e **bloco de 20/10 aceito em 21/10: 5d8793fb (reconciliar catálogo/unidades/fichas — piloto real M011001), a2a4ccf1 (contrato de produção no Omie — leitura provada, guarda CA-O1) e 64ac4f85 (registrar e encerrar produção por ponto — incrementos, hash de encerramento, 409 estado_congelado)** e **9318a299 (comprovar leituras CA-D3 — sondas provadas: ListarPedidos 5.501, PesquisarPedCompra pedido 1514, ListarNFe 0; contrato sintético pedidos-firmes.ts TDD 6/6; mapas em contratos-fase-2.md)** e **e6aa4afa (importação 90 dias — lote atômico com replay, página falha preserva lote anterior, restante a receber pedida−recebida com bloqueio de desconhecido; TDD 7/7; uso real pendente do mapa PCP + cadastro Omie)**. Produção: v0.0.143 (ref 7084d96, 21/10 15:22 UTC).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.143 (ref 7084d96).

**Emenda de 26/10/2026:** testes humanos retirados da fase 2 — as tasks fecham pela prova automática. d77447ab fechada (TDD 3/3, v0.0.169) e 0d876150 dispensada. Restam 3: 4e0fcf1c (catálogo real do Omie), 2ea1e7ab (sugestões com dados reais) e 6e38e5a3 (envio real ao Omie, que segue exigindo a autorização do dono por gravar no ERP).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente). Pontos da Keoma (2c4a9b7e): FECHADO 21/10 — matriz v2 (pontos produto_acabado + expedicao).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

**Contratos reais provados (20/10, sondas de leitura):** ListarOrdemProducao (1.114 OPs/112 páginas) e ConsultarOrdemProducao (OP 9858633368 do piloto M011001 completa, 14 componentes batendo com a ficha); produto teste do Omie existe por consulta dirigida, mas a listagem do cadastro segue vazia (4e0fcf1c).

Restantes (5), por bloqueio:

- **Ação do cliente (Omie)**: 4e0fcf1c povoar a listagem do cadastro de produtos — desbloqueia a cadeia de dados reais da e6aa4afa (importar 90 dias).
- **Aprovação do PCP**: mapa REAL em 07-sistemas/pcp/contratos-fase-2.md (status elegíveis + campo de data) — destrava o USO REAL da e6aa4afa (recorte sintético ✅). d77447ab (conferências reais — exige etapas encerradas e pontos definidos).
- **Autorização/decisão**: 6e38e5a3 (envio real ao Omie — caso expressamente autorizado). 2ea1e7ab: método baseline90-v1 APROVADO 21/10 (em_espera por dados reais). 2c4a9b7e: FECHADA 21/10 (matriz v2).
- **Fim da fase**: 0d876150 (validar o fluxo completo com a equipe — exige SPECs anteriores aceitas + caso transacional autorizado).

**Próxima ação:** ciclo sem task elegível — as 5 restantes exigem teste real com equipe (d77447ab), autorização do owner (6e38e5a3, 2ea1e7ab), fechamento de fase (0d876150); o USO REAL da e6aa4afa aguarda mapa PCP + cadastro Omie.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados e acesso (aceite humano retirado em 26/10).
