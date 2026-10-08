> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000) 3/3 aceito; acesso (SPEC-1-001) 3/3 aceito; conexões (SPEC-1-002): CA-O1/O2 e CA-O3/O4 implementadas e provadas + **reconciliação REAL com o Omie executada** (CL-001 recebido 13:19 — lote real de 1055 chaves ativo, amostra 3/3 batendo com PosicaoEstoque, credencial inválida sem retry provada; v0.0.18–0.0.32, QA ok) — **aguardando teste humano das três evidências**. Tasks restantes: SPEC-1-003 aguarda CL-002; SPEC-1-004/005 seguem após aceite da 002.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie (conectada em modo leitura).

18 tasks: 6 concluídas (33,3%), 3 em andamento (implementadas/provadas, aguardando teste humano), 9 abertas.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Teste humano pendente** — CA-O1/O2, CA-O3/O4 e reconciliação real (roteiros nas evidências) | Conclusão da SPEC-1-002 (3 tasks) | **Cliente/champion** |
| **CL-002** — acesso Nuvemshop | SPEC-1-003 (pedidos da loja) | **Cliente** |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real (hoje só perfis sintéticos) | **Cliente** |

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL (leitura)**: rotas sync/iniciar·pagina·estado, allowlist de consulta, lease 5min + geração, upsert idempotente, ativação atômica por lote, retry transitório em etapas separadas (2s/5s, máx. 3), 401/403 sem retry, falha nunca ativa nem inventa zero; **lote real de 1055 produtos/locais reconciliado 3/3 com o Omie**; contrato em 07-sistemas/pcp/contratos-omie.md.

**Próxima ação:** teste humano das evidências da SPEC-1-002 (05_entregas/fase-1/spec-1-002/) e fornecimento do CL-002 para a leva de pedidos.
