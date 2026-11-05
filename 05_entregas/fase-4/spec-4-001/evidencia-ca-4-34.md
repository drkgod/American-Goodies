# SPEC-4-001 · CA-4-34 — teste e demonstração separados do real (05/11/2026, Skip v0.0.199)

- RED: `red.txt` (módulo ausente). GREEN: `green-CA-4-34.txt` (5 testes). Regressão da fase 3, do patch e da fase 4: `regressao.txt` (211 de 211).
- Skip: v0.0.199 (ref 6e93652), publicada. QA sem erro; o Skip não roda testes.
- Migration 0047: `demonstracao` (bool) em 15 coleções de produção, compras e faturamento e `teste` (bool) em `pcp_perfis`. Aditiva e reversível; não cria conta nem senha.
- Hook `pcp_demonstracao_marca`: marca todo registro novo quando o autor é conta com `teste` ou quando o produto/item é de demonstração (código com DEMO, COOKIE-1 ou INS-n).
- Recusa 422 `registro_de_demonstracao`, antes de olhar a chave: autorizar e enviar a ordem de produção, autorizar e lançar o pedido de compra, autorizar e gravar o pedido de venda e volumes/frete.
- Aprovação da consolidação por conta de teste (ou ordem de produto de demonstração): registra, marca e não prepara ordem.

## Limites
- O hook de marcação lê o autor pelos campos de nome comum (`autor`, `ligado_por`, `gravado_por`, `publicada_por`, `aprovador` e semelhantes). Não consegui ler o esquema das coleções de compras e faturamento (Skip Cloud indisponível em 05/11), então a cobertura desses campos está por conferir na SPEC-4-007 com o usuário de teste.
- Rotas e hook não foram exercitados contra o servidor (sem usuário de teste, CL-PEND-016). Quando o dono entregar as contas, marco `teste` nos dois perfis.
- Espelho em `07-sistemas/pcp/codigo/`: módulos, testes e migration 0047. Os hooks desta tarefa e do patch de 02/11 estão só no projeto Skip e no repositório que o Skip sincroniza; o espelho dos hooks entra na tarefa de fechamento da SPEC.
