# Fase 2 — Programação e apontamento com conferência

Revisão: 13/10/2026; liberação original:09/10/2026. Sete SPECs de sistema; somente F2 ativa. F1 homologada com pendências transferidas pelo consultor.

## Ordem e gates

1. Acesso/conciliação000 e fundamento de dados/planejamento001/002 podem ser preparados com fixtures. Uma task por sessão.
2. Fontes reais precisam cadastro/unidade/ficha/contrato001; uso nominal precisa matriz/contas000.
3. Programação/OP002 → eventos003 → dupla conferência004 → envio autorizado005. Cada leva aguarda prova/aceite anterior.
4. Sugestões006 após dados/parâmetros; prova integrada real depois das demais levas e autorização do caso transacional.

## Documentação embutida e ponto de partida

Cada SPEC contém modelo/guardas, pré-condições, erros/recuperação, exemplos com resultado, RED/GREEN/regressão, comandos e roteiro humano. Ler a SPEC da task elegível e seu bloco de execução no Skip. Documento em 07-sistemas/pcp ainda ausente é saída das tasks de homologação/configuração, não insumo exigido para começar o fundamento sintético; seu conteúdo aprovado passa a ser pré-condição do uso real dependente.

Pode começar pela visão de qualidade (e57df8ff), calendário/OP (3cd404e5) ou outro fundamento independente com fixture isolada, um por sessão, conforme seus critérios. Cadastro/matriz/contratos reais continuam gates localizados. Antes de importar a quantidade firme, PCP confirma status/data/saldo; antes de rascunho nominal, editar_programacao precisa aprovação. Recuperação mock antecede envio real.

## SPECs

- [Acesso nominal e conciliação dos cards herdados](spec-2-000-acessos-e-pendencias.md) — RQ-007; P4; CL-003
- [Catálogo, fichas, unidades e histórico oficial](spec-2-001-dados-oficiais-e-historico.md) — RQ-003/008/012; P4; CL-001
- [Calendário, capacidade e programação com OP digital](spec-2-002-planejamento-e-op-digital.md) — RQ-002/008; CL-006; CL-PEND-001
- [Apontamentos de insumos e produção na origem](spec-2-003-apontamentos-na-origem.md) — RQ-002/009; CL-PEND-002
- [Conferência da expedição e entrada em câmara fria](spec-2-004-dupla-conferencia.md) — RQ-002/009; CL-PEND-002
- [Envio autorizado ao Omie e recuperação](spec-2-005-consolidacao-omie.md) — RQ-002/012; CL-001
- [Sugestões explicadas e demonstração integrada](spec-2-006-sugestoes-e-validacao.md) — RQ-003/008/009; CL-006; CL-PEND-001

## Fora desta fase

Cotação/aprovação financeira, recebimento fiscal, emissão/pagamento, preparação final de faturamento, IA e loops. Este pacote não autoriza acesso/transação sem os gates específicos.
