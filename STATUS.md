> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** leva de fundamento (SPEC-1-000) concluída e aceita; **leva de acesso (SPEC-1-001) concluída e aceita — 3/3 tasks** (CA-A1 parcial por desenho do Plano B: matriz nominal real pendente de aprovação); sistema protegido por área com perfis de teste (v0.0.17, QA completo); organograma CL-003 recebido (06_notas/organograma-2026-10.md); conexões Omie/Nuvemshop ainda não iniciadas.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie.

18 tasks: 6 concluídas (33,3%), 0 em andamento, 12 abertas. Seis SPECs com TDD acoplado. UUIDs: 15 recebidos; 3 pendentes. IDs e visibilidade recebidos do portal preservados.

## Antes da execução

Confirmar o projeto Skip existente, matriz de acesso por área e acessos autorizados Omie/Nuvemshop. Reutilizar conexões do agente executor. Não criar banco externo.

**Próxima ação:** ao novo pedido do cliente, abrir a leva de conexões — primeira task: "Conectar a leitura dos dados do Omie" (SPEC-1-002, CA-O1/O2), com pré-condições CL-001 (acesso Omie) e acessos autorizados. Alternativa em paralelo: aprovar a matriz nominal de acesso real a partir do organograma para concessão às contas definitivas.
