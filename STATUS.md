> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000) e acesso (SPEC-1-001) concluídos e aceitos; **SPEC-1-002 (Omie) toda implementada com leitura REAL** — CA-O1/O2 (conexão, 1055 itens reconciliados), CA-O3/O4 (recuperação, retry em etapas separadas) e CA-O1–O4 (conferência: contagem 1055=1055 confirmada, credencial inválida sem retry, DEFECT-1 da janela REDUNDANT corrigido) — **aguardando teste humano**; tasks restantes bloqueadas por insumos externos.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie (CL-001 ✓ conectado).

18 tasks: 6 concluídas (33,3%), 3 em andamento (implementadas com leitura real, aguardando teste humano), 9 abertas.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Teste humano** — 3 evidências em 05_entregas/fase-1/spec-1-002/ | Conclusão da SPEC-1-002 (fecha a leva de conexões Omie) | **Cliente/champion** |
| **CL-002** — acesso Nuvemshop | SPEC-1-003 (pedidos da loja) | **Cliente** |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real por pessoa | **Cliente** |

~~CL-001~~ **RESOLVIDO 2026-10-08**: credenciais Omie como secrets do projeto; integração real provada e reconciliada (contratos-omie.md com a conta real).

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL**: sync/iniciar·pagina·estado + conferir-fonte; allowlist de consulta, lease 5min + geração, upsert idempotente por chave de origem, ativação atômica por lote, fim por metadatagem, retry transitório em etapas separadas (2s/5s, máx. 3), 401/403 sem retry, lote anterior intacto em falha, recuperação conclui uma vez, conferência com contagem reconciliada (1055=1055).

**Próxima ação:** teste humano da leitura real (Painel → Estoque, comparar item com o Omie; conferência 1055=1055) e/ou fornecer CL-002 — o cron de recuperação (4h, silencioso) retoma a fila sozinho quando o insumo chegar.
