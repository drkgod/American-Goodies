# Análise — SPEC-1-000, CA-F1: Criar a base do sistema no Skip

Data: 2026-10-01 · Executor: MCC (ETHOS) · Etapa: aguardando autorização

## Objetivo e resultado observável

Criar a base nativa do painel operacional no projeto Skip conectado: coleções
`pcp_execucoes`, `pcp_lotes`, `pcp_dados`, `pcp_fontes` (contrato da SPEC-1-002), serviços
internos com interface de leitura estável e provider de demonstração explícito — sem chamada a
ERP ou canal externo. A base abre na prévia do projeto Skip.

## Estado atual do projeto (inspecionado via MCP do Skip, projeto 62774)

- Template React/Vite/TS/Shadcn com PocketBase SDK 0.26.9; página única `Index.tsx` de exemplo.
- 1 migration aplicada (`updated_users`, versão 1790875123) — nenhuma coleção pcp_* existe.
- Schema atual: apenas `users` (auth) com regras restritivas. Nada a reutilizar além do template.
- Runner de teste: `npm test` é placeholder ("there are no tests for this project").
- Rotas: `/` e `*` (NotFound). Sem navegação Catálogo/Painel.
- Projeto não publicado; prévia disponível para demonstração.

## Plano concreto de implementação

1. **Migrations** (up/down, ordinal livre, created/updated): criar as 4 coleções pcp_* conforme
   o contrato da SPEC-1-002 (campos, chaves, índice único lote+chave_origem, geração/lease em
   pcp_fontes), com as cinco regras declaradas e acesso direto de cliente negado.
2. **Serviços internos**: interface de leitura estável + provider de demonstração explícito
   (fixtures isoladas em código/ambiente de homologação); provider real fica para SPEC-1-002.
3. **Navegação e telas**: Catálogo e Painel (4 blocos: estoque, produção, compras, pedidos) com
   fixtures da SPEC (P1=10 UN/local A, P2=2 KG/local B, OP-1, C-1, OM-11/OM-L1, NS-10) e banner
   permanente "Dados de demonstração — fontes ainda não conectadas".
4. **Estados**: vazio, indisponível e falha distintos em cada bloco.
5. **Testes**: harness mínimo autorizado `node --test tests/pcp/spec-1-000.test.mjs` (sem nova
   dependência), cenários de contrato/provider/navegação.
6. **Evidência**: `05_entregas/fase-1/spec-1-000/` + `07-sistemas/pcp/fundamento.md` (projeto e
   contrato, sem segredo).

## Matriz critério → prova

| Critério | Prova |
|---|---|
| CA-F1 | Migrations aplicadas sem duplicar coleção/migration; schema inspecionado antes |
| CA-F2 | Prévia abre Catálogo/Painel com fixtures + banner (captura) |
| CA-F3 | Provider vazio/erro mostra estados distintos; zero chamadas externas (relatório de rede) |
| CA-F4 | Contrato de provider substituível documentado; QA + teste humano registrados |

## Riscos e pontos de parada

- **Mapeamento do projeto**: o link do builder informado (UUID ae74f8dc-…) não é visível via MCP;
  a org tem um único projeto ("mcc automação fabrica", id 62774). Assumo que é este; se houver
  outro projeto destino, paro antes de criar qualquer recurso.
- Nenhuma credencial Omie/Nuvemshop é necessária nem usada nesta task.
- Rollback: reverter migrations/componentes ainda sem dados reais, preservando recursos
  anteriores do projeto.

## Verificação automática e teste humano

- Automática: `node --test tests/pcp/spec-1-000.test.mjs` (RED → GREEN), lint do projeto.
- Humano (Keoma): navegar na prévia, reconhecer telas + banner de demonstração, verificar
  estados vazio/erro, confirmar o fundamento.

## Perguntas bloqueantes

Nenhuma bloqueante para esta task. A confirmação do mapeamento do projeto Skip é o único ponto
de atenção declarado.
