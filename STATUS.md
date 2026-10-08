> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000) e acesso (SPEC-1-001) concluídos e aceitos; **SPEC-1-002 (Omie) toda implementada com leitura REAL** (1055 itens reconciliados, conferência 1055=1055, credencial inválida sem retry, recuperação provada) e **SPEC-1-003 (Nuvemshop) task 1 implementada com dados REAIS** (3343 pedidos reais classificados: 277 pendentes, 369 cancelados, 2687 pagos sem vínculo, 10 não mapeados) — **tudo aguardando teste humano**; tasks restantes bloqueadas por insumos externos.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).

18 tasks: 6 concluídas (33,3%), 4 em andamento (implementadas com dados reais, aguardando teste humano), 8 abertas.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Teste humano** — 4 evidências (3 da SPEC-1-002 + 1 da SPEC-1-003) | Conclusão das levas de conexão | **Cliente/champion** |
| **Referência de vínculo** — integração atual Nuvemshop→Omie não grava `codigo_pedido_integracao` | CA-N3 (vínculo/crosswalk, task b0502049) | **Consultor** (decidir origem da referência; lacuna registrada) |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real por pessoa | **Cliente** |
| **Cadastro Omie vazio** — recurso produtos com 0 registros na conta | SPEC-1-004 (catálogo/fichas) | **Cliente** (povoar cadastro no ERP) |

~~CL-001~~ **RESOLVIDO 2026-10-08 13:19** · ~~CL-002~~ **RESOLVIDO 2026-10-08 13:40** — credenciais como secrets do projeto; integrações reais provadas e reconciliadas.

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL**: sync/iniciar·pagina·estado + conferir-fonte; allowlist de consulta, lease 5min + geração, upsert idempotente por chave de origem, ativação atômica por lote, fim por metadatagem, retry transitório em etapas separadas (2s/5s, máx. 3), 401/403 sem retry, lote anterior intacto em falha, recuperação conclui uma vez, conferência com contagem reconciliada (1055=1055).
- **Sync Nuvemshop REAL**: 3343 pedidos reais; classificação na precedência da SPEC (pendente/pago sem vínculo/cancelado/não mapeado); visão por área com aviso de total não consolidável; sem escrita nos canais.

**Próxima ação:** teste humano das 4 evidências (roteiros em 05_entregas/) — o cron de recuperação (4h, silencioso) retoma a fila sozinho quando os insumos chegarem.
