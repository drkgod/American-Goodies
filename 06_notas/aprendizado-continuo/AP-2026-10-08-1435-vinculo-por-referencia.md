# AP-2026-10-08-1435 — vínculo entre canais só por referência comprovada; duplicação é sinal, não veredito

- Status: candidato
- Escopo: projeto do cliente (Skip Cloud / integração Omie↔Nuvemshop)
- Task/SPEC: SPEC-1-003 b0502049 (CA-N3)
- Sinal: o owner informou "não teve duplicação no Omie"; a prova confirmou (duplicados_oficiais=0
  no índice por codigo_pedido). Mas o vínculo real fica 0 porque a integração atual não grava
  codigo_pedido_integracao — sem referência, NÃO se mescla por cliente/valor/data (regra da SPEC).
- Regra reutilizável: (1) vínculo entre sistemas só por chave de integração comprovada em amostra;
  (2) ausência de duplicação é propriedade do fluxo de origem, não da cópia — a cópia deve
  DETECTAR duplicados (upsert por chave + índice) e sinalizar, nunca presumir;
  (3) lote oficial parcial (leitura interrompida) não invalida o índice — ele lê o lote quando ativo.
- Quando aplicar: qualquer crosswalk entre canal e ERP (Nuvemshop, Lunet, futuros).
- Quando não aplicar: fontes que expõem a referência de forma confiável desde a origem.
- Confiança: alta — fixtures GREEN 4/4 + visão real 3.343 pedidos.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
