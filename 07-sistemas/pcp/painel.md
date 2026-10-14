# Contrato do painel diário (SPEC-1-005)

Atualizado em 2026-10-09 · Consome os lotes ativos das SPECs 1-002/1-003/1-004 — sem nova
integração, sem coleção bruta no navegador, sem segredo no cliente.

## Rota

`GET /backend/v1/pcp/painel?item=&status=&local=&data_ini=&data_fim=` — área `painel`
autoriza abrir; CADA BLOCO exige a sua área (bloco sem área devolve só `{autorizado:false}`,
sem linhas/contagem/pistas). Filtros validados no servidor (formato AAAA-MM-DD; intervalo
invertido = erro de campo).

## Blocos

| Bloco | Fonte | Estado na Fase 1 |
|---|---|---|
| Estoque | omie/estoque (posição atual do último lote) | ativo — resumo POR UNIDADE (nunca soma KG com UN), saldo ausente = null≠zero, nota "a fonte não expõe histórico diário" |
| Produção | — | `fonte_nao_integrada_na_fase_1` (explícito, nunca "integrado") |
| Compras | — | `fonte_nao_integrada_na_fase_1` (explícito) |
| Pedidos | omie/pedidos + nuvemshop/pedidos | oficiais por ID único (5393) com etapas originais; canal classificado na precedência da SPEC-1-003 com vínculo por referência comprovada (44 pares por `numero_origem`); intenção NÃO soma ao oficial |

## Estados por bloco (CA-P3)

- **ok**: lote ativo com leitura válida (zero legítimo permitido);
- **lote antigo**: `estado_tecnico ≠ ok` → pendência "Última tentativa FALHOU — exibindo dado
  do último sucesso (horário)";
- **indisponível**: sem lote ativo (motivo explícito + orientação);
- **sem acesso**: `{autorizado:false}` sem pistas.

## UI

`src/pages/Painel.tsx` + `src/services/pcp-painel.ts`; conteúdo externo renderiza via JSX
(escapado — sem HTML arbitrário); banner de demonstração removido; home com atalhos (v0.0.59).
