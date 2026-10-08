> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** as cinco SPECs (fundamento, acesso, Omie, canais, catálogo) implementadas, provadas com dados REAIS e aceitas; painel diário completo com regressão integrada 8/8 (incl. amostra autorizada M043055 = 53 UN, idêntica ao aceite da SPEC-1-002). **Resta a validação integrada com a equipe (roteiro pronto) para declarar a Fase 1 concluída.**  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).

18 tasks: 15 concluídas (83,3%), 3 em andamento (CA-P1–P4 implementadas aguardando teste; validação integrada em execução).

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Validação integrada com a equipe** — roteiro pronto em 05_entregas/fase-1/spec-1-005/relatorio-validacao-integrada.md | Fecha a Fase 1 (task 0b045738) | **Cliente/equipe** |
| **Cadastro Omie vazio** | Catálogo explicita estado; lista quando povoado (sem mudança de código) | **Cliente** |
| **Matriz nominal** (CL-003) | Concessão de acesso real por pessoa | **Cliente** |

## O que já está pronto e provado (regressão integrada 8/8)

- Fundamento, acesso por área, leitura Omie, pedidos de canais e catálogo — todos com evidência e aceite.
- Painel diário por área: estoque (resumo por unidade, null≠zero), oficiais por ID único, canal com vínculo comprovado, produção/compras explicitamente não integrados, lote antigo com aviso, permissão por bloco sem pistas.
- Conferências reconciliadas com o Omie: estoque 1057=1057, produtos 0=0.

**Próxima ação:** demonstração com a equipe (roteiro de ~15 min) e registro do aceite explícito — último gate da Fase 1.
