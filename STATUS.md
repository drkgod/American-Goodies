> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** leva de fundamento (SPEC-1-000) concluída e aceita (3/3); leva de acesso (SPEC-1-001) concluída e aceita (3/3, CA-A1 parcial por desenho do Plano B); leva de conexões (SPEC-1-002) com CA-O1/O2 e CA-O3/O4 **implementadas e provadas** (v0.0.18–0.0.23, QA ok) — aguardando teste humano; **todas as tasks restantes bloqueadas por insumos externos** (CL-001, CL-002, matriz nominal).  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie.

18 tasks: 6 concluídas (33,3%), 2 em andamento (implementadas, aguardando teste humano), 10 abertas — **todas as 10 dependem de insumos externos**.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **CL-001** — credenciais Omie (OMIE_APP_KEY/SECRET) | CA-O1–O4 (reconciliação real), SPEC-1-004 (catálogo), SPEC-1-003 (pedidos Omie) | **Cliente** (fornecer keys no Omie → registrar como secrets do projeto) |
| **CL-002** — acesso Nuvemshop | SPEC-1-003 (pedidos Nuvemshop) | **Cliente** |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas a partir do organograma (06_notas/organograma-2026-10.md) | Concessão de acesso real (hoje só perfis sintéticos) | **Cliente** (aprovar e indicar quem aprovou) |
| **Teste humano pendente** — CA-O1/O2 e CA-O3/O4 implementados | Conclusão das duas tasks da SPEC-1-002 | **Cliente/champion** (roteiro nas evidências) |

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- Sync Omie (modo mock de homologação identificado; adapter real pronto atrás dos secrets): rotas sync/iniciar·pagina·estado, allowlist de consulta, lease 5min + geração, upsert idempotente por chave de origem, ativação atômica por lote, retry transitório em etapas separadas (2s/5s, máx. 3), falha nunca ativa nem inventa zero, recuperação conclui uma vez.

**Próxima ação:** fornecer os insumos externos (CL-001, CL-002, matriz nominal) e/ou executar os testes humanos pendentes — não há task implementável sem eles.
