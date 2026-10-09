# AP-2026-10-08-1400 — JSON.parse('') devolve undefined em goja (não {})

- Status: candidato
- Escopo: projeto do cliente (Skip Cloud)
- Task/SPEC: SPEC-1-002 a5b75aca (revalidação pós-aceite)
- Sinal: hook de conferência quebrava com 400 genérico em lote novo SEM conferência anterior:
  `JSON.parse('' || '{}')` — o devolveu undefined quando a string era vazia, e `x.resultado`
  explodia (TypeError: Cannot read property 'resultado' of undefined, log 17:27:11).
- Correção: `JSON.parse(s || '{}') || {}` + guarda `(x && x.resultado)` (v0.0.43).
- Evidência: logs do pod (source hooks/requests); conferência voltou a funcionar: conferido
  1055=1055 no lote kmlikeftsu429sj (geração 17).
- Regra reutilizável: em goja, TUDO que vem de JSON.parse precisa de fallback explícito
  (`|| {}`) e acesso defensivo — o campo pode estar vazio (registro novo) além de inválido.
- Quando aplicar: qualquer leitura de campo JSON opcional em hooks (conteudo, conferencia, etc.).
- Quando não aplicar: campos obrigatórios com default garantido na migração.
- Confiança: alta — erro em log de produção e correção provada.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
