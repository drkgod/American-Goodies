# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (19/10/2026):** 18/29 concluídas — 51356fad (matriz v1.2), 49327a88 (21 contas reais), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3), e57df8ff (visão de qualidade), a6bf06fb (adendos D5 — SPEC-2-001 100% no recorte do executor), 3cd404e5 (calendário e OP digital), be180fc1 (tela de apontamentos), 556da315 (duas telas de conferência), 0baec76e (sugestões com memória de cálculo), c44c11da (fila de envio com simulação), 8bb4ef77 (sugestão somente para rascunho), 4e9a1d0e (provas de recuperação antes do envio real), 87e4af63 (reprogramar sem perder os apontamentos), 30118f65 (revisar divergências e invalidar aprovações antigas), 16b8a592 (publicar a programação por área) e **d2a44349 (confirmar parâmetros e dias de produção — tela/contrato CL-006)**. Produção: v0.0.102 (ref bcd1676, 19/10 13:18 UTC). Demais 11 tasks abertas; ciclo contínuo ativo (plugin 0.8.0).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.102 (ref bcd1676, publicado 19/10 13:18 UTC).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente, bloqueia conexão real) e pontos da Keoma na matriz (2c4a9b7e).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

**Parâmetros oficiais CL-006: infraestrutura pronta e aceita (d2a44349, 19/10)** — tela /parametros com aprovação versionada (versão/aprovador/hora/hash), gate editar_parametros, replay idempotente e 409 em divergência. A aprovação dos VALORES reais pelo PCP registra a versão oficial e destrava o consumo pela publicação real.

Restantes (11), por bloqueio:

- **Ação do cliente (Omie)**: 4e0fcf1c cadastro do produto piloto e unidade oficial — desbloqueia 5d8793fb (reconciliar catálogo/fichas), 9318a299 (leituras de histórico/compras), e6aa4afa (importar 90 dias), a2a4ccf1 (contrato de produção no Omie) e, por cadeia, o caso real 6e38e5a3.
- **Aprovação de método (SPEC-2-006)**: 2ea1e7ab aprovar baseline90-v1 e conferir sugestões reais — exige documentos/valores de parâmetros e fontes disponíveis (com d2a44349 fechada, falta a fonte de dados reais — cadeia do cadastro Omie).
- **Acesso nominal/pontos**: 2c4a9b7e (pontos da Keoma), d77447ab (conferências reais — exige etapas encerradas e pontos definidos), 64ac4f85/0096ab26 (apontamentos reais — exige OP/conta/ponto/unidade oficiais).
- **Fim da fase**: 0d876150 (validar o fluxo completo com a equipe — exige SPECs anteriores aceitas + caso transacional autorizado).

**Próxima ação:** aguardar o cliente (cadastro Omie) para liberar a cadeia de dados reais; sem isso, não há task elegível no ciclo contínuo.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
