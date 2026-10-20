# Evidência — Task 64ac4f85 (Registrar e encerrar a produção por ponto)

SPEC-2-003 CA-E1/E3 · 20/10/2026 · recorte do executor (OP publicada local + acessos por ponto) · executor MCC (ETHOS)

## Oráculos provados (TDD 8/8 — RED 7/8 antes)
- **cozinha 40+60=100**: realizado é INCREMENTO por execução do ponto (somaRealizadoPonto); retificação substitui o valor eficaz de exatamente um evento.
- **encaixotamento 98 independente**: projetarOP mantém 98; consumo previsto NUNCA usa encaixotamento.
- **ficha 100 UN→5 KG**: previsto = 100/100×5 = 5 KG (só realizado_cozinha na unidade-base da ficha congelada); retirada 6 KG → líquido 6, diferença +1, perda declarada separada.
- **anulação**: retificação 0 com motivo anula lançamento errôneo de 6 KG → líquido 0 (original preservado).
- **encerramento**: exige realizado eficaz >0 ou declaração 0 com motivo; hash determinístico da projeção; replay idempotente (mesmo hash).
- **invalidação/congelamento**: evento após encerramento invalida encerramento+conferência+aprovação; durante envio/incerto/sincronizada → 409 estado_congelado.
- **acessos**: ponto fora da sessão nega sem pistas; OP cancelada nega.

## Entrega
- **Contrato** src/lib/pcp/ponto.ts (somaRealizadoPonto, projetarOP, encerrarPonto, podeRegistrarAposEncerramento).
- **Card visível** na tela /apontamentos com os oráculos em exibição.
- Skip v0.0.136, produção ref 9c155d8 provada (lastPublishedRef).
- Nota: gravação inicial do contrato veio corrompida do MCP (tokens mutilados) — pegada por releitura e reparada por patch mínimo antes do apply; releitura final byte a byte.

## Teste humano (pendente)
- Login na produção → Apontamentos → card "Produção por ponto — oráculos da SPEC-2-003 (64ac4f85)": cozinha 100, encaixotamento 98, previsto 5 KG, diferença +1, encerramento "encerrado" com hash, invalidação encerramento + conferencia + aprovacao, congelamento 409.
