# Evidência — SPEC-1-000, CA-F1: Criar a base do sistema no Skip

Data: 2026-10-01 · Executor: MCC (ETHOS) · Task autorizada por Mr Cheney ("sim", 14:40)

## O que foi implementado (projeto Skip 62774, versão 0.0.4, hash 872c11e)

- `src/lib/pcp/provider.ts` — provider de demonstração com interface de leitura estável
  (`ResultadoLeitura<T>` com estado `ok|vazio|indisponivel|falha`, fonte e `observado_em` UTC/ISO).
  Fixtures isoladas no módulo; troca pelo provider real (SPEC-1-002) sem alterar telas (CA-F4).
- `src/pages/Painel.tsx` — 4 blocos (Estoque, Produção, Compras, Pedidos) com fixtures da SPEC
  (P1=10 UN/local A; P2=2 KG/local B; OP-1 aberta; C-1 aberta; OM-11/OM-L1 oficiais Omie;
  NS-10 intenção Nuvemshop separada) e banner permanente de demonstração (CA-F2).
- `src/pages/Catalogo.tsx` — catálogo de demonstração com banner permanente (CA-F2).
- `src/components/Layout.tsx` + `src/App.tsx` — navegação Catálogo/Painel; rotas `/catalogo` e `/painel`.
- `migrations/0002_pcp_fundamento.skip` — coleções `pcp_execucoes`, `pcp_lotes`, `pcp_dados`
  (índice único lote+chave_origem), `pcp_fontes` (identidade única fonte+recurso+aplicativo_ref,
  geração/lease), created/updated, up/down, acesso direto de cliente negado (CA-F1).
- `tests/pcp/spec-1-000.test.mjs` — testes de contrato/provider/navegação (RED registrado antes
  da implementação).

## Verificação automática

- QA nativo do Skip (pipeline setup → static analysis → build → integrations → test):
  **todas as etapas ok, zero erros** (build run `6f17a3e4-3efa-423e-9e72-06f627437e4a`).
- Rotas registradas no projeto: `/`, `/catalogo`, `/painel`, `*`.
- Limitação registrada: o runner `npm test` do projeto é placeholder; o harness autorizado
  `node --test tests/pcp/spec-1-000.test.mjs` está no projeto e será executado pelo runner nativo
  na etapa de QA; a prova de navegação/estados foi feita por inspeção da prévia (abaixo).

## Prova visual (prévia autorizada, não publicada)

- Prévia: https://mcc-automacao-fabrica-98125--preview.goskip.app/painel
- Estado `ok`: 4 blocos com fixtures corretas e banner visível (captura verificada).
- Estado `vazio`: "Nenhum registro no momento." em todos os blocos.
- Estado `indisponivel`: "Fonte indisponível no momento." em todos os blocos.
- Estado `falha`: "Falha na leitura da fonte de demonstração" em todos os blocos.
- Os três estados são visualmente distintos (CA-F3).
- Catálogo (`/catalogo`): P1/UN e P2/KG com banner (captura verificada).

## CA-F3 — ausência de chamadas externas

- Nenhum módulo do fundamento referencia Omie ou Nuvemshop; o provider de demonstração não faz
  I/O de rede (fixtures em memória). Nenhuma credencial ou secret externo foi criado.
- A prova de rede completa (rastreio de requisições) fica registrada na conferência da task
  "Conferir o fundamento antes das conexões" (CA-F1–F4), que exige esse recorte.

## Pendências conhecidas

- Migrations `0002_pcp_fundamento.skip` escritas no working tree e commitadas com o build
  0.0.4; a listagem do MCP ainda mostra apenas `updated_users` aplicada — confirmar aplicação
  no próximo ciclo de build/QA antes da task de conexão (SPEC-1-002 reutiliza as coleções).
- UUIDs das 3 tasks de fundamento continuam pendentes no portal (não bloqueia execução).
