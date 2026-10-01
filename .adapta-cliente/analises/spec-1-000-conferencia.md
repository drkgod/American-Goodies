# Análise — SPEC-1-000, CA-F1–F4: Conferir o fundamento antes das conexões

Data: 2026-10-01 · Executor: MCC (ETHOS) · Etapa: aguardando autorização

## Objetivo e resultado observável

Prova consolidada do fundamento (CA-F1 a CA-F4): navegação, contratos internos, estados
vazio/erro e isolamento das fixtures — com rastreio de rede de runtime e confirmação de que
nenhuma fixture foi gravada como lote ativo. Libera as próximas levas somente após teste
humano explícito.

## Estado atual (herdado das tasks CA-F1 e CA-F2/F3, concluídas)

- Provider, telas, navegação e banner implementados e testados (testes GREEN, QA 0.0.7 ok).
- Migration `0002_pcp_fundamento` applied; 4 coleções pcp_* confirmadas no banco com regras
  vazias e índices únicos.
- Provas existentes, porém espalhadas em duas evidências; falta a prova de runtime de rede e
  o relatório consolidado desta conferência.

## Plano concreto

1. Re-executar do zero: testes GREEN (QA nativo), listagem de migrations e detalhe das
   coleções pcp_* (regras e índices).
2. Rastreio de rede da prévia: abrir `/painel` e `/catalogo` no browser e registrar as
   requisições observadas — provar que nenhuma vai a domínio externo (ERP/canal); chamadas
   internas da própria prévia (assets goskip.app) são esperadas e registradas.
3. Zero fixture ativa real: a lista de migrations prova ausência de seed nas coleções pcp_*
   (nenhuma migration de dados além do schema).
4. Relatório consolidado `05_entregas/fase-1/spec-1-000/conferencia-fundamento.md` com matriz
   CA-F1→F4, cada critério com evidência observável e PASSOU/FALHOU.
5. Atualizar estado e parar no teste humano final do fundamento.

## Matriz critério → prova

| Critério | Prova nesta task |
|---|---|
| CA-F1 | Re-execução: migrations applied + coleções com regras/índices corretos |
| CA-F2 | Re-execução dos testes + prévia (fixtures e banner) |
| CA-F3 | Rastreio de rede de runtime + varredura estática re-executada |
| CA-F4 | Contrato do provider re-verificado + QA + teste humano registrado |

## Riscos e limites

- Se o rastreio mostrar chamada inesperada (ex.: telemetria do template), registro como achado
  e avalio contra o CA-F3 antes de qualquer marcação — sem consertar silenciosamente.
- Recorte: somente verificação e relatório; nenhuma mudança de produto prevista.

## Verificação automática e teste humano

- Automática: re-execução completa das provas + rastreio de rede.
- Humano (Keoma): teste final do fundamento — navegar nas duas telas, alternar os três
  estados, reconhecer o banner e confirmar que nada sugere dado real. Esta aprovação libera
  a leva de acesso (SPEC-1-001).
