> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000), acesso (SPEC-1-001), leitura Omie (SPEC-1-002), pedidos de canais (SPEC-1-003) e catálogo (SPEC-1-004) **concluídos e validados pelo owner** — integrações REAIS reconciliadas (estoque 1057 itens; pedidos oficiais 5393; canal 3344; 44 vínculos comprovados; produtos 0 = cadastro vazio explicitado). **SPEC-1-005 (painel diário) é a última da fase** — em implementação.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).

18 tasks: 15 concluídas (83,3%), 0 em andamento, 3 abertas (todas da SPEC-1-005).

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Cadastro Omie vazio** — recurso produtos com 0 registros na conta | Catálogo exibe estado explícito; cenários de incompletude serão reprovados quando povoado | **Cliente** (povoar cadastro no ERP) |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real por pessoa | **Cliente** |

~~Referência de vínculo~~ **RESOLVIDA 2026-10-08 16:30** (2.589 referências; 44 pares Nuvemshop).  
~~CL-001~~ **RESOLVIDO 13:19** · ~~CL-002~~ **RESOLVIDO 13:40** — credenciais como secrets do projeto.

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL**: sync/iniciar·pagina·estado + conferir-fonte (estoque, pedidos, produtos); allowlist de consulta, lease 5min + geração, upsert idempotente, ativação atômica, fim por metadatagem OU página incompleta, retry com janela "Aguarde N segundos", 401/403 sem retry, lote anterior intacto em falha, conferência reconciliada.
- **Pedidos de canais (SPEC-1-003) REAL**: canal 3344 (gen2, transições reais provadas); oficiais 5393 (gen9); 44 vínculos comprovados; duplicados_oficiais 0/5393.
- **Catálogo (SPEC-1-004) REAL**: rotas /pcp/catalogo com área catalogo; página real com estados explícitos (cadastro vazio, ficha indisponível, saldo só com estoque); conferência 0=0 válida; divergência real de estoque (1055→1057) detectada e reconciliada com resync.

**Próxima ação:** implementar SPEC-1-005 (painel diário por área — endpoint /pcp/painel + página com filtros, origem/horário e pendências por bloco); demonstração integrada fecha a Fase 1.
