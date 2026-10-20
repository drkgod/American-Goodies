# Evidência — Task a2a4ccf1 (Comprovar o contrato de produção no Omie)

SPEC-2-005 CA-O1 · 20/10/2026 · recorte REAL (sondas de LEITURA) · executor MCC (ETHOS)

## Provas na conta (sondas dirigidas, somente leitura, credencial do cofre)
1. **ListarOrdemProducao** (produtos/op/, HTTP 200): 1.114 OPs / 112 páginas; campos de request (pagina, registros_por_pagina, apenas_importado_api, ordenar_por, ordem_decrescente, nCodProjeto, nIdProd, lExibirItens, dDtConclusaoDe/Ate, cConcluida) e resposta (cadastros…). "ListarOPs" NÃO existe (provado 500 "Method not exists").
2. **ConsultarOrdemProducao** (HTTP 200): OP 9858633368 (cNumOP 2026/00003) do piloto M011001 — nQtde 24, local 9300980125, concluída (cConcluida S, dConclusao 23/03/2026), 14 componentes em itensDetalhes com nIdProdutoMalha idêntico aos da ficha (baunilha 9337429648: 0,05 L × 24 = 1,2 ✓; margarina 9337429814: 1 × 24 = 24 ✓). Fault oficial de validação sem parâmetros: SOAP-ENV:Client-101.
3. **Mutantes**: Incluir/Alterar/Upsert/Excluir/Concluir/Reverter — documentados com campos de request e executado:false. NENHUM executado (CA-O1; T5/caso real é da 6e38e5a3 com autorização específica do owner).

## Entrega
- **Contrato** src/lib/pcp/contrato-op.ts: MAPA_OP (listar/consultar/amostra/mutantes) + guarda mutanteAutorizado (exige casoAutorizado + autorizadoPor + revisao_hash — nega null/vazio/parcial).
- **Card visível** na tela /consolidacoes: métodos provados, amostra real, guarda CA-O1 em exibição.
- TDD 6/6 (RED 5/6 provado; tsx local, cópia fiel do contrato gravado no Skip, provada por releitura).
- Skip v0.0.134 (implantação) e v0.0.135 (higiene — sonda temporária e secret de diagnóstico removidos); produção ref 5630477 provada (lastPublishedRef).

## Teste humano (pendente)
- Login na produção → Consolidações → card "Contrato de produção no Omie — comprovado na conta (a2a4ccf1, leitura)": ListarOrdemProducao, 1.114 OPs, amostra OP 2026/00003 (24 CX, M011001, local padrão, concluída), guarda CA-O1 negando pedido vazio, 6 mutantes documentados sem execução.
