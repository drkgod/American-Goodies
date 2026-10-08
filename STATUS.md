> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** leva de fundamento (SPEC-1-000) concluída e aceita — CA-F1 a F4 provadas; leva de acesso (SPEC-1-001) em andamento — CA-A1 concluída via Plano B autorizado (mapa + perfis sintéticos registrados; matriz CL-003 pendente, acesso real bloqueado); CA-A2/A3 abertas; conexões Omie/Nuvemshop ainda não iniciadas.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fonte principal:** Omie.

18 tasks: 4 concluídas (22,2%), 0 em andamento, 14 abertas. Seis SPECs com TDD acoplado. UUIDs: 15 recebidos; 3 pendentes. IDs e visibilidade recebidos do portal preservados.

## Antes da execução

Confirmar o projeto Skip existente, matriz de acesso por área e acessos autorizados Omie/Nuvemshop. Reutilizar conexões do agente executor. Não criar banco externo.

**Próxima ação:** ao novo pedido do cliente, selecionar "Proteger as telas e os dados por área" (SPEC-1-001, CA-A2/A3) — primeira elegível da leva de acesso. A matriz nominal (CL-003) segue pendente para concessão real; os perfis sintéticos de teste já estão registrados em `07-sistemas/pcp/acessos.md`.
