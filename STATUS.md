> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** leva de fundamento (SPEC-1-000) concluída e aceita — CA-F1 a F4 provadas; leva de acesso (SPEC-1-001) liberada; conexões Omie/Nuvemshop ainda não iniciadas.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie.

18 tasks: 3 concluídas (16,7%), 15 abertas. Seis SPECs com TDD acoplado. UUIDs: 15 recebidos; 3 pendentes. IDs e visibilidade recebidos do portal preservados.

## Antes da execução

Confirmar o projeto Skip existente, matriz de acesso por área e acessos autorizados Omie/Nuvemshop. Reutilizar conexões do agente executor. Não criar banco externo.

**Próxima ação:** executar a task "Confirmar acessos e papéis" (SPEC-1-001, CA-A1) — primeira da leva de acesso. Pré-condições: CL-003 e CL-004 (acessos/papéis aprovados pelo cliente).
