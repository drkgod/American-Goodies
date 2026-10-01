# Fundamento PCP no Skip — SPEC-1-000

Projeto Skip: **mcc automação fabrica** (id 62774, org "Org de Lindolfo" / slug `financeiro-94b2f`,
hostname `mcc-automacao-fabrica-98125`). Prévia: https://mcc-automacao-fabrica-98125--preview.goskip.app

## Contrato interno da aplicação

Coleções nativas (criadas pela migration `0002_pcp_fundamento.skip`, contrato definido na
SPEC-1-002; acesso direto de cliente negado em todas):

- **pcp_execucoes** — fonte, aplicativo_ref, inicio, fim, estado, recurso, pagina, cursor,
  erro_codigo, erro_mensagem, created, updated.
- **pcp_lotes** — fonte, recurso, aplicativo_ref, execucao (→pcp_execucoes), estado
  (staging|completo|substituido), total_itens, concluido_em, created, updated.
- **pcp_dados** — lote (→pcp_lotes), chave_origem, conteudo (JSON), created, updated.
  Índice único: (lote, chave_origem).
- **pcp_fontes** — fonte, recurso, aplicativo_ref, lote_ativo, execucao_ativa, geracao,
  lease_ate, ultima_tentativa, ultimo_sucesso, estado_tecnico, created, updated.
  Índice único: (fonte, recurso, aplicativo_ref).

Interface de leitura da aplicação: `src/lib/pcp/provider.ts` — `ResultadoLeitura<T>` com
estado `ok|vazio|indisponivel|falha`, fonte e `observado_em`. Provider de demonstração ativo;
provider real (Omie) entra na SPEC-1-002 sem mudar as telas.

Nenhum secret ou credencial externa neste fundamento.
