# Evidência — SPEC-1-000, CA-F2/F3: Montar as telas com dados de demonstração

Data: 2026-10-01 · Executor: MCC (ETHOS) · Task autorizada por Mr Cheney ("pode", 15:04)

## O que foi feito (projeto Skip 62774, versões 0.0.5 → 0.0.7)

1. **Testes GREEN** (`tests/pcp/spec-1-000.test.mjs`, versão 0.0.5, hash 3fc4522):
   - fixtures exatas da SPEC no estado ok (P1=10 UN/A; P2=2 KG/B; OP-1; C-1; OM-11/OM-L1
     oficiais Omie; NS-10 intenção Nuvemshop separada);
   - estados vazio/indisponivel/falha retornam `dados: null` com mensagens distintas;
   - varredura estática: provider e telas sem `fetch`/`XMLHttpRequest`/`axios`/`WebSocket`/
     referência a `omie.com`/`nuvemshop` (zero chamada externa — CA-F3);
   - rotas `/catalogo` e `/painel` registradas em `App.tsx` (CA-F2);
   - banner permanente "Dados de demonstração — fontes ainda não conectadas" nas duas telas (CA-F2).
2. **Correção do fundamento descoberta nesta task** (versões 0.0.6/0.0.7): a migration
   `0002_pcp_fundamento.js` foi reescrita no formato nativo do Skip Cloud (goja,
   `pocketbase/migrations/`) — o arquivo anterior em formato SQL-like não era aplicado. O índice
   único `idx_pcp_dados_lote_chave` foi movido para depois da criação da relação `lote`
   (o QA reprova índice sobre coluna inexistente). QA final ok em todas as etapas
   (build run `7874626c-7551-4bf0-b0b0-6c41dc60bb7a`).

## Verificação automática

- QA nativo do Skip (setup → static analysis → build → integrations → test): **ok em todas as
  etapas, zero erros** (versão 0.0.7, hash `d5ca5ce`).
- Migration `0002_pcp_fundamento` com status **applied** (confirmado em
  `skip_cloud_list_migrations`, 18:07 UTC).
- Coleções confirmadas no banco via `skip_cloud_get_collections`: `pcp_execucoes`,
  `pcp_lotes`, `pcp_dados`, `pcp_fontes` — todas `base`, com as cinco regras vazias
  (acesso direto de cliente negado) e índices únicos conforme contrato (verificado em
  `pcp_dados` e `pcp_fontes`).
- Prévia re-verificada após o build: painel com fixtures corretas e banner visível.

## Prova visual

- Prévia: https://mcc-automacao-fabrica-98125--preview.goskip.app/painel
- Estado ok com fixtures exatas; estados vazio/indisponivel/falha alternáveis pelo seletor
  (mensagens distintas verificadas na task anterior e re-verificadas neste build).

## CA-F3 — ausência de chamadas externas

- Varredura estática automatizada nos três arquivos do fundamento: nenhuma referência de rede
  ou a Omie/Nuvemshop (teste GREEN).
- O provider de demonstração não faz I/O; fixtures em memória.
- Rastreio completo de requisições da prévia fica na terceira task ("Conferir o fundamento
  antes das conexões"), conforme recorte declarado na análise.
