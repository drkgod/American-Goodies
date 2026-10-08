# AP-2026-10-08-1300 — fim de paginação por metadatagem, nunca por contagem de itens

- Status: candidato
- Escopo: projeto do cliente (Skip Cloud)
- Task/SPEC: SPEC-1-002 CA-O1/O2 (task f39ced9b)
- Sinal: a última página da conta real tem 5 itens (50 por página, 1055 registros, 22 páginas).
  Encerrar por "itens.length < tamanho_de_pagina" inventaria fim; a resposta do Omie expõe
  nTotPaginas — o fim correto é nPagina >= nTotPaginas (metadatagem da própria resposta).
- Evidência: leitura real das 22 páginas com ativação em 1055 itens (= nTotRegistros); com a
  regra antiga a última página não teria ativado o lote.
- Regra reutilizável: término de paginação deve usar metadado de total/páginas da fonte quando
  existir; contagem de itens só quando a fonte não expõe metadado — e nesse caso a última página
  parcial ainda precisa ativar.
- Quando aplicar: qualquer integração paginada com metadado de total (Omie nTotPaginas/nTotRegistros).
- Quando não aplicar: fontes sem metadado (aí a regra é itens < página, com o risco documentado).
- Confiança: alta — provado em conta real com contagem exata.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
