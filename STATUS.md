# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (21/10/2026): 24/29 concluídas** — 51356fad (matriz v1.2), 49327a88 (21 contas reais), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3), e57df8ff (visão de qualidade), a6bf06fb (adendos D5 — SPEC-2-001 100% no recorte do executor), 3cd404e5 (calendário e OP digital), be180fc1 (tela de apontamentos), 556da315 (duas telas de conferência), 0baec76e (sugestões com memória de cálculo), c44c11da (fila de envio com simulação), 8bb4ef77 (sugestão somente para rascunho), 4e9a1d0e (provas de recuperação antes do envio real), 87e4af63 (reprogramar sem perder os apontamentos), 30118f65 (revisar divergências e invalidar aprovações antigas), 16b8a592 (publicar a programação por área), d2a44349 (confirmar parâmetros e dias de produção — CL-006) e **bloco de 20/10 aceito em 21/10: 5d8793fb (reconciliar catálogo/unidades/fichas — piloto real M011001), a2a4ccf1 (contrato de produção no Omie — leitura provada, guarda CA-O1) e 64ac4f85 (registrar e encerrar produção por ponto — incrementos, hash de encerramento, 409 estado_congelado)** e **9318a299 (comprovar leituras CA-D3 — sondas provadas: ListarPedidos 5.501, PesquisarPedCompra pedido 1514, ListarNFe 0; contrato sintético pedidos-firmes.ts TDD 6/6; mapas em contratos-fase-2.md)** e **e6aa4afa (importação 90 dias — lote atômico com replay, página falha preserva lote anterior, restante a receber pedida−recebida com bloqueio de desconhecido; TDD 7/7; uso real pendente do mapa PCP + cadastro Omie)**. Produção: v0.0.143 (ref 7084d96, 21/10 15:22 UTC).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.143 (ref 7084d96).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente) e pontos da Keoma na matriz (2c4a9b7e).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

**Contratos reais provados (20/10, sondas de leitura):** ListarOrdemProducao (1.114 OPs/112 páginas) e ConsultarOrdemProducao (OP 9858633368 do piloto M011001 completa, 14 componentes batendo com a ficha); produto teste do Omie existe por consulta dirigida, mas a listagem do cadastro segue vazia (4e0fcf1c).

Restantes (5), por bloqueio:

- **Ação do cliente (Omie)**: 4e0fcf1c povoar a listagem do cadastro de produtos — desbloqueia a cadeia de dados reais da e6aa4afa (importar 90 dias).
- **Aprovação do PCP**: mapa REAL em 07-sistemas/pcp/contratos-fase-2.md (status elegíveis + campo de data) — destrava o USO REAL da e6aa4afa (recorte sintético ✅). d77447ab (conferências reais — exige etapas encerradas e pontos definidos).
- **Autorização/decisão**: 6e38e5a3 (envio real ao Omie — caso expressamente autorizado), 2ea1e7ab (aprovar baseline90-v1 e conferir sugestões reais), 2c4a9b7e (pontos da Keoma).
- **Fim da fase**: 0d876150 (validar o fluxo completo com a equipe — exige SPECs anteriores aceitas + caso transacional autorizado).

**Próxima ação:** ciclo sem task elegível — as 5 restantes exigem teste real com equipe (d77447ab), autorização do owner (6e38e5a3, 2ea1e7ab), pontos da Keoma (2c4a9b7e) e fechamento de fase (0d876150); o USO REAL da e6aa4afa aguarda mapa PCP + cadastro Omie.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
