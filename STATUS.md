> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000) 3/3 aceito; acesso (SPEC-1-001) 3/3 aceito; conexões Omie (SPEC-1-002) **3/3 implementadas e provadas com leitura REAL** (v0.0.18–0.0.37, QA ok) — **aguardando teste humano**; demais tasks bloqueadas por insumos externos (CL-002, matriz nominal) ou por próximo degrau (SPEC-1-004 parcialmente executável).  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie.

18 tasks: 6 concluídas (33,3%), 3 em andamento (implementadas, aguardando teste humano), 9 abertas — todas com insumo externo pendente.

## Integração Omie — estado real

- **Leitura real funcionando**: `ListarPosEstoque` reconciliado na conta (1055 registros/22 páginas); lote ativo com **1055 itens = nTotRegistros exato** (conferência provada).
- Credenciais em secrets do servidor (`OMIE_APP_KEY/SECRET`); nunca em repo/UI/log.
- Rate limit do Omie: HTTP 500 REDUNDANT (janela ~60s) — retry em etapas separadas cobre.
- Recurso `produtos`: conta com 0 produtos — reconciliar quando o cadastro do ERP tiver itens (SPEC-1-004).

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Teste humano pendente** — CA-O1/O2, CA-O3/O4 e conferência (a5b75aca) | Conclusão da SPEC-1-002 (3 tasks) | **Cliente/champion** (roteiros nas evidências) |
| **CL-002** — acesso Nuvemshop | SPEC-1-003 (pedidos) | **Cliente** |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real | **Cliente** |
| Cadastro de produtos vazio no Omie | SPEC-1-004 (catálogo/fichas) | **Cliente** (povoar ERP) |

**Próxima ação:** testes humanos das 3 tasks da SPEC-1-002 e/ou fornecer CL-002; a fila segue sozinha quando o insumo chegar (cron de recuperação a cada 4h verifica secrets).
