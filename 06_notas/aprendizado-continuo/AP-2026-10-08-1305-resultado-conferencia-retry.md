# AP-2026-10-08-1305 — resultado de conferência não pode ser queimado por janela de rate-limit

- Status: candidato
- Escopo: projeto do cliente (Skip Cloud)
- Task/SPEC: SPEC-1-002 task a5b75aca (CA-O1–O4)
- Sinal: a conferência registrava o resultado na 1ª chamada; quando o Omie responde HTTP 500
  "Consumo redundante detectado. Aguarde N segundos" (REDUNDANT), a conferência ficava gravada
  como falha_http_500 com esperado=0 — um falso negativo permanente até nova leitura.
- Correção: falha transitória → retry_N com etapas separadas (2s/5s, máx. 3), igual ao
  sync/pagina; só grava resultado quando concluída (conferido/divergencia/credencial_recusada).
- Evidência: 0.0.36 gravava falha_http_500; 0.0.38 devolve retry_1 (proxima_em_ms=2000) e
  registra conferido 1055=1055 quando a janela passa.
- Regra reutilizável: rotinas de AUDITORIA/conferência seguem a mesma política de retry das
  rotinas de carga — resultado final só com resposta concluída; janela de rate-limit é
  transitória, não é veredito.
- Quando aplicar: qualquer rotina que compare estado local vs fonte externa (contadores,
  checksums, amostras).
- Quando não aplicar: erros definitivos (401/403, contrato) — esses encerram na primeira.
- Confiança: alta — reproduzido e corrigido com prova.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
