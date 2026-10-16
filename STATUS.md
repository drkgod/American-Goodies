# Status operacional

Fase atual: 2 — Programação e apontamento com conferência.

**Estado (16/10/2026):** 14/29 concluídas — 51356fad (matriz v1.2), 49327a88 (21 contas reais), 3def6d06 + 45dc0e7d + 69ffd20a (duplicatas CA-A4 3/3), e57df8ff (visão de qualidade), a6bf06fb (adendos D5 — SPEC-2-001 100% no recorte do executor), 3cd404e5 (calendário e OP digital), be180fc1 (tela de apontamentos), 556da315 (duas telas de conferência), 0baec76e (sugestões com memória de cálculo), c44c11da (fila de envio com simulação), 8bb4ef77 (sugestão somente para rascunho) e **4e9a1d0e (provas de recuperação antes do envio real)**. Produção: v0.0.96 (ref 4f34817, 16/10 13:45). Demais 15 tasks abertas; ciclo contínuo ativo (plugin 0.8.0).

**Ambiente:** projeto Skip 62774, MCP do Skip e Skip Cloud; fonte oficial Omie e complemento Nuvemshop. Produção: https://mcc-automacao-fabrica-98125.goskip.app — v0.0.96 (ref 4f34817, publicado 16/10 13:45).

## Transição e pendências

Fase 1 encerrada no recorte homologado: 18 entregas, aceite explícito do owner em 08/10 às 18:23. Transferidos ainda abertos: cadastro de produtos no ERP (4e0fcf1c — ação do cliente, bloqueia conexão real) e pontos da Keoma na matriz (2c4a9b7e).

## Execução da fase

Ler 04_fase-atual/specs/00-INDICE.md e selecionar task elegível em 04_fase-atual/fase.md. Fundamento sintético com fixtures antes de dados reais. Uso real: programação→apontamentos→conferência→envio autorizado.

**Todas as tasks de construção com recorte sintético/mock estão fechadas (14/29).** O ciclo contínuo não tem mais task elegível sem dependência externa. Restantes (15), por bloqueio:

- **Ação do cliente (Omie)**: 4e0fcf1c cadastro do produto piloto e unidade oficial — desbloqueia 5d8793fb (reconciliar catálogo/fichas), 9318a299 (leituras de histórico/compras), e6aa4afa (importar 90 dias), a2a4ccf1 (contrato de produção no Omie) e, por cadeia, o caso real 6e38e5a3.
- **Dados do PCP (CL-006)**: d2a44349 parâmetros e dias de produção — desbloqueia 16b8a592 (publicar por área), 87e4af63 (reprogramar) e 2ea1e7ab (aprovar método/sugestões reais).
- **Acesso nominal/pontos**: 2c4a9b7e (pontos da Keoma), d77447ab (conferências reais — exige etapas encerradas e pontos definidos), 30118f65 (revisão de divergências — exige aprovar_consolidacao confirmada), 64ac4f85/0096ab26 (apontamentos reais — exige OP/conta/ponto/unidade oficiais).
- **Fim da fase**: 0d876150 (validar o fluxo completo com a equipe — exige SPECs anteriores aceitas + caso transacional autorizado).

**Próxima ação:** aguardar o cliente (cadastro Omie e/ou parâmetros CL-006) para liberar a cadeia de dados reais; sem isso, não há task elegível no ciclo contínuo.

## Revisão documental — 13/10/2026

As sete SPECs e 29 tasks foram revisadas, com contratos/TDD/roteiros embutidos. IDs e critérios preservados. Seguir o índice e a SPEC da task elegível, respeitando os gates de dados, acesso e aceite humano.
