# SPECs da Fase 1 — Fundamento e painel integrado

**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Regra:** fundamento primeiro, conexões depois.  
**Estado:** seis contratos com TDD especificado; implementação, testes de produto e aceite pendentes.

| Ordem | SPEC | Resultado |
|---|---|---|
| 1 | [SPEC-1-000](spec-1-000-fundamento-skip.md) | Fundamento da plataforma antes das conexões |
| 2 | [SPEC-1-001](spec-1-001-acesso-por-area.md) | Acesso ao sistema por área |
| 3 | [SPEC-1-002](spec-1-002-leitura-omie.md) | Leitura rastreável do Omie |
| 4 | [SPEC-1-003](spec-1-003-pedidos-nuvemshop.md) | Pedidos complementares e vínculo entre canais |
| 5 | [SPEC-1-004](spec-1-004-catalogo-operacional.md) | Catálogo de produtos, unidades e fichas |
| 6 | [SPEC-1-005](spec-1-005-painel-diario.md) | Painel diário com origem, filtros e pendências |

Construir e demonstrar primeiro a SPEC-1-000 com dados sintéticos identificados. Depois proteger acesso por área, integrar fontes e reutilizar a base para catálogo/painel reais. Credenciais externas não bloqueiam o fundamento; fixture não comprova integração.

As tasks vivem em fase.md, no diretório pai do pacote operacional. Uma task elegível por vez; próxima task/leva só após prova e confirmação explícita do teste humano. IDs do portal ficam pendentes até retorno.

Cada SPEC contém critérios, fixtures, RED/GREEN/regressão, preflight e comandos de testes. QA nativo do Skip complementa as provas. Somente esta fase está liberada.
