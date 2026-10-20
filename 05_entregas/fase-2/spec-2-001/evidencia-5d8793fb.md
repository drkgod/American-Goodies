# Evidência — Task 5d8793fb (Reconciliar catálogo, unidades e fichas)

SPEC-2-001 CA-D1/D2/D3 · 20/10/2026 · recorte REAL · executor MCC (ETHOS)

## Decisão do piloto (owner)
- "opcao 1" (16:42 BRT): piloto real = cookie real com ficha completa → **M011001** aprovado.

## Provas na fonte (sondas dirigidas, HTTP 200, somente leitura, credencial do cofre)
1. **Produto** (ConsultarProduto, geral/produtos/): M011001 "MISTURA P/COOKIE TRADICIONAL CX C/100 CONGELADO", produto_id 9337428906, unidade **CX**, ativo, família Cookies.
2. **Ficha** (ConsultarEstrutura, geral/malha/): itens reais verbatim — A063020 PRE MASSA COOKIE TRADICIONAL 0,25 PA (tipo 03); A073067 MARGARINA BMC AMELIA 1 KG; A073041 ESSENCIA DE BAUNILHA 0,05 L; M043027 CAIXA PADRAO MULTIUSO 1 UN; (5º item truncado na resposta — nada inventado).
3. **Locais** (ListarLocaisEstoque, estoque/local/): 1 local — "Local de Estoque Padrão" (9300980125), padrão, ativo.
4. **Listagem de produtos**: produto_servico_resumido = [] (listagem vazia na conta — consulta dirigida por código é o caminho provado; registrado no mapa CA-D3).

## Entrega
- **Contrato** src/lib/pcp/conciliacao.ts: conciliarProduto (unidade oficial preservada CX; unidade ausente → null + bloqueio unidade_ausente; ficha ausente → null + bloqueio ficha_ausente; itens verbatim; unidades de estoque divergentes → bloqueio unidade_incompativel_estoque), conciliarLinhaEstoque (linha legada UN vs oficial CX → incompatível, saldo preservado sem conversão; linha sem unidade herda a oficial; oficial null → nunca UN), MAPA_FONTES (CA-D3).
- **defaultUN retirado** do sync de estoque (pcp_sync_pagina.js).
- **Join de unidade** no catálogo (pcp_catalogo.js: unidade_registrada/unidade_oficial/incompatível).
- **Hook pcp_piloto.js** (transporte puro, gate área catalogo) + service pcp-piloto.ts + card "Piloto real" na tela /catalogo.

## TDD
- RED: stub 9/10 falhando (oráculos C1–C10 da SPEC).
- GREEN: **10/10** (tsx local, cópia fiel do contrato gravado no Skip, provada por releitura).
- QA Skip v0.0.129: setup/static/build/integrations ok.

## Produção
- **v0.0.129 (ref f1673e6, publicado 20/10 19:58 UTC)** — lastPublishedRef provado.
- Rota /backend/v1/pcp/piloto registrada (401 sem sessão — guard ativo).

## Teste humano (pendente)
- Login na produção → Catálogo → card "Piloto real — MISTURA P/COOKIE TRADICIONAL CX C/100 CONGELADO (M011001)": unidade oficial **CX**, itens da ficha com quantidades/unidades reais, local padrão 9300980125, bloqueios quando aplicável.
