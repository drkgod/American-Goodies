# Evidência — SPEC-1-005 · Task ee794334: Publicar o painel diário por área (CA-P1, CA-P2)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: ee794334-224f-4066-9d75-8c42e7fc2306
- Versões do projeto Skip 62774: 0.0.54–0.0.56 (QA nativo ok)

## Implementação

- **Endpoint `GET /backend/v1/pcp/painel`** (`pocketbase/hooks/pcp_painel.js`): consome os
  lotes ativos das SPECs anteriores (pcp_fontes/pcp_lotes/pcp_dados — sem nova integração,
  sem coleção bruta no navegador); área `painel` autoriza abrir; CADA BLOCO exige a sua área
  (CA-P4); filtros validados no servidor (intervalo invertido e formato inválido = erro de
  campo, provado).
- **Página Painel real** (`src/pages/Painel.tsx` + `src/services/pcp-painel.ts`): substitui a
  de demonstração; filtros (item/status/local), origem/horário/lote/estado por bloco,
  pendências por bloco; banner de demonstração removido.
- **Bloco Estoque**: posição atual do último lote (nota explícita: "a fonte não expõe
  histórico diário" — CA-P3); resumo POR UNIDADE (nunca soma KG com UN — CA-P2); saldo
  ausente exibido como "null ≠ zero" (nunca zero inventado).
- **Bloco Pedidos**: oficiais (Omie) contados por **ID único** (5393 — não por linhas de
  item, CA-P2) com etapas originais; complementares (canal) classificados na precedência da
  SPEC-1-003 com o MESMO vínculo comprovado da visão (44 pares por `numero_origem`); aviso
  "intenção NÃO soma ao oficial".
- **Blocos Produção e Compras**: SEM fonte na Fase 1 → `fonte_nao_integrada_na_fase_1`
  explícito (autorizado + indisponível com pendência) — nunca declarados integrados
  (plano B da SPEC).

## BUG-3 corrigido na prova (honesto)

- goja NÃO suporta object spread (`{...x, campo}`): `ReferenceError: __spreadValues is not
  defined` (log do pod 20:52) — hook reescrito com construção explícita de objetos;
  3ª particularidade do goja nesta fase (bool+required, JSON.parse(''), spread).

## Prova real (conta do cliente, usuário de teste com áreas painel+estoque+pedidos+catalogo+producao+compras)

| Bloco | Resultado |
|---|---|
| Estoque | disponível: **1057 linhas**, resumo `{UN: 1057}`, lote/último sucesso/estado visíveis |
| Produção | autorizado, **indisponível explícito** (`fonte_nao_integrada_na_fase_1`) |
| Compras | autorizado, **indisponível explícito** (`fonte_nao_integrada_na_fase_1`) |
| Pedidos oficiais | **5393 por ID único**, etapas: 80→5139, 70→239, 60→10, 50→2, 20→3 |
| Pedidos canal | 270 pendentes · 2647 pagos sem vínculo · **44 vinculados** · 373 cancelados · 10 não mapeados · conflito 0 — **idêntico à visão da SPEC-1-003** ✓ |

- Filtro `item=105` (estoque): 15 linhas na mesma janela/lote (linhas e totais da mesma
  fonte — CA-P2).
- Filtro invertido (`data_ini > data_fim`): 400 "Filtro_invalido: intervalo invertido" (erro
  de campo, CA-P4).
- health 200; fontes estáveis (3344/1057/5393/0).

## Nota de prova CA-P4

- Usuário de teste COM área painel: 200 com blocos por área.
- Perfis restantes (usuario-teste-compras → 200 mas com blocos dele; usuario-sem-perfil →
  login indisponível nesta conta) serão reprovados no roteiro integrado (task 0b045738) —
  a autorização por bloco no SERVIDOR já está provada pelas rotas anteriores (403 sem área
  em catálogo/pedidos/estoque).

## Teste humano (roteiro)

1. Login → Painel: 4 blocos visíveis (estoque com 1057; produção/compras explicitamente
   bloqueados; pedidos com oficiais 5393 + canal 270/2647/44/373/10).
2. Filtrar item=105 no estoque → 15 linhas; limpar → 1057.
3. Conferir origem/horário em cada bloco (fonte, lote, último sucesso).
