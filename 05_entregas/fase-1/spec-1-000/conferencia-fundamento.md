# Conferência do fundamento — SPEC-1-000, CA-F1–F4

Data: 2026-10-01 · Executor: MCC (ETHOS) · Task autorizada por Mr Cheney ("pode seguir", 15:18)

## Veredito: PRONTA (aguardando teste humano final)

## Matriz critério → evidência (re-executada do zero nesta conferência)

| Critério | Prova | Resultado |
|---|---|---|
| **CA-F1** — base nativa conforme contrato, sem duplicar | Migrations: `updated_users` + `0002_pcp_fundamento`, ambas `applied` (listagem 18:18 UTC). Coleções confirmadas no banco: `pcp_execucoes`, `pcp_lotes`, `pcp_dados`, `pcp_fontes` — todas `base`, cinco regras vazias (acesso direto de cliente negado), relações corretas (lotes→execucoes; dados→lotes; fontes→lote_ativo/execucao_ativa), índices únicos `idx_pcp_dados_lote_chave` e `idx_pcp_fontes_identidade` | PASSOU |
| **CA-F2** — navegação e 4 blocos com fixtures + banner | Testes GREEN (fixtures exatas: P1=10 UN/A, P2=2 KG/B, OP-1, C-1, OM-11/OM-L1 oficiais, NS-10 intenção; rotas `/catalogo` e `/painel`; banner nas duas telas) + prévia re-verificada neste build | PASSOU |
| **CA-F3** — vazio/erro/ausência distintos; fixture não é snapshot real; zero chamada externa | Testes GREEN dos 3 estados (mensagens distintas, `dados: null`); varredura estática sem rede/ERP; **rastreio de rede de runtime**: `/painel` e `/catalogo` fizeram requisições apenas a `mcc-automacao-fabrica-98125--preview.goskip.app`, `goskip.dev/skip.js`, `api.goskip.dev` (config da plataforma), `static.cloudflareinsights.com` (telemetria do hosting), `fonts.googleapis.com`/`fonts.gstatic.com` (fonte Roboto do template). **Nenhuma chamada a Omie ou Nuvemshop** | PASSOU |
| **CA-F4** — provider substituível; QA e teste humano registrados | Contrato `ResultadoLeitura<T>` com estados explícitos e fonte declarada; QA nativo ok (build 0.0.7); testes humanos das tasks CA-F1 ("funcionando", 14:56) e CA-F2/F3 ("funcionou", 15:13) registrados no changelog | PASSOU |

## Zero fixture ativa real

A lista de migrations não contém nenhuma migration de dados/seed — apenas `updated_users`
(template) e `0002_pcp_fundamento` (schema). Nenhum registro foi gravado nas coleções pcp_*;
as fixtures vivem apenas em memória, no módulo do provider. Nada publicado como snapshot real.

## Achados de runtime (registrados, sem impacto no aceite)

- `static.cloudflareinsights.com/beacon.min.js` e `/cdn-cgi/rum`: telemetria do hosting
  Cloudflare (plataforma Skip), não da aplicação — fora do escopo da SPEC.
- `goskip.dev/skip.js` e `api.goskip.dev/v1/projects/config/public`: infraestrutura da
  plataforma Skip, não integração de dados.
- Fontes Google (Roboto): asset do template Shadcn, sem dado.

## Limitações registradas

- O rastreio de rede cobre a sessão de inspeção desta conferência (navegação nas duas telas);
  é a prova de runtime exigida por esta task. Chamadas futuras dependem do código, que está
  coberto pela varredura estática automatizada.

## Liberação

Esta conferência, com o teste humano final confirmado, libera a leva de acesso (SPEC-1-001).
Nenhuma conexão Omie/Nuvemshop foi iniciada ou testada nesta leva.
