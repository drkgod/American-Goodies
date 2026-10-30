# Bloqueio localizado — leitura real do Omie (28/10/2026)

A chave do Omie está bloqueada por excesso de consultas desde 23/10 (CL-PEND-006). A decisão de desbloqueio é do dono.
Nenhuma chamada foi feita ao Omie nesta rodada, para não renovar o bloqueio.

## O que ficou construído e no ar (Skip v0.0.173)
- Catálogo produto a produto com cursor e parada no 425 (CA-3-01): `/backend/v1/pcp/catalogo/sync`.
- Lista do que falta cadastrar (CA-3-02): `/backend/v1/pcp/faltantes` e card em `/qualidade`.
- Borda de leitura dos 90 dias (CA-3-03): `omie-90d-mapa.ts` converte pedido de venda e pedido de compra do Omie nas linhas que a
  importação da fase 2 já usa; dado ausente é descartado e listado, nunca zero.

## O que espera o Omie liberar
- Conferir 3 produtos do catálogo com a consulta dirigida (CA-3-01).
- Rodar a leitura dos 90 dias, incluindo o filtro de datas de `ListarPedidos` e os parâmetros de paginação de
  `PesquisarPedCompra`, que só se confirmam com uma chamada real (CA-3-03). Ordens de produção: o mapa de campos de
  `ListarOrdemProducao` já existe em `contrato-op.ts`; falta ligar a leitura.
- Cálculo real das sugestões (CA-3-04), que depende do catálogo e dos 90 dias reais.

## Quando o dono desbloquear
1. Rodar a sincronização do catálogo até o fim (sub-lotes, uma chamada por vez).
2. Abrir `/qualidade` e conferir a lista de faltantes; o PCP cadastra no Omie o que faltar.
3. Ligar a leitura dos 90 dias e, depois, as sugestões.

## Atualização 30/10/2026 — dono pediu o desbloqueio
O dono disse "Desbloqueie" no chat. O bloqueio (HTTP 425 por excesso de consultas) é do lado do Omie: o sistema não o levanta. Falta ele acionar o suporte do Omie ou revisar a chave e dizer se outro sistema usa a mesma chave (CL-PEND-006). O executor não tem conta de teste para chamar as rotas de sincronização e não repete chamada em laço; ao liberar, a leitura segue pelos passos acima, um sub-lote por vez.
