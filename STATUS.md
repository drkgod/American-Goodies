> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000) e acesso (SPEC-1-001) concluídos e aceitos; conexões Omie (SPEC-1-002) com **leitura REAL reconciliada** (v0.0.25–0.0.35): 22 páginas → lote ativo com **1055 produtos/locais reais** (= nTotRegistros do Omie), reconciliação de amostra 3/3, credencial inválida sem retry provada, recuperação de falha real confirmada — **aguardando teste humano**; tasks restantes bloqueadas por insumos externos.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie (CL-001 ✓ conectado).

18 tasks: 6 concluídas (33,3%), 2 em andamento (implementadas com leitura real, aguardando teste humano), 10 abertas.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Teste humano** — CA-O1/O2 + CA-O3/O4 (roteiro em 05_entregas/fase-1/spec-1-002/) | Conclusão da SPEC-1-002 e liberação da task de conferência (a5b75aca) | **Cliente/champion** |
| **CL-002** — acesso Nuvemshop | SPEC-1-003 (pedidos da loja) | **Cliente** |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real por pessoa | **Cliente** |

~~CL-001~~ **RESOLVIDO 2026-10-08**: credenciais Omie registradas como secrets do projeto; integração real provada (contratos-omie.md atualizado com a conta real).

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL**: rotas sync/iniciar·pagina·estado, allowlist de consulta, lease 5min + geração, upsert idempotente por chave de origem, ativação atômica por lote, fim por metadatagem (nTotPaginas), retry transitório em etapas separadas (2s/5s, máx. 3), 401/403 sem retry, lote anterior intacto em falha, recuperação conclui uma vez. Lote real: 1055 itens reconciliados.

**Próxima ação:** teste humano da leitura real (Painel → Estoque, comparar item com o Omie) e/ou fornecer CL-002 — o cron de recuperação (4h, silencioso) retoma a fila sozinho quando o insumo chegar.
