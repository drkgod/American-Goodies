# American Goodies — pacote operacional

**Atualizado:** 03/11/2026 · **Fase atual:** 4 (P6) · **Pacote:** 7 SPECs e 21 tarefas (os ids vêm do portal). A sessão de validação final é a última tarefa e não tem data marcada.

- [Tarefas da fase 4](04_fase-atual/fase.md)
- [Índice das SPECs e regras comuns](04_fase-atual/specs/00-INDICE.md)
- [Checklist do cliente](04_fase-atual/checklist-do-cliente.md)
- [Instruções do executor](AGENTS.md)
- [Status](STATUS.md)

A fase 4 tem três partes:
- **Produção no servidor:** o que é teste ou demonstração fica separado do real, e planejamento, apontamentos, conferências e aprovação passam a gravar no servidor, usando as rotas criadas pelo patch de 02/11.
- **Acabamento:**
  - identidade visual da American Goodies;
  - menu por área e tela inicial de cada pessoa;
  - telas na língua da operação;
  - componentes do kit;
  - uso no celular e no tablet.
- **Validação:** leituras reais do Omie quando a chave for liberada, rotas provadas no servidor e a sessão final com a equipe.

A fase 3 (compras, recebimento, pedidos, alertas, relatórios, assistente, exportação e loops) está construída e guardada em `05_entregas/fase-3/`. O uso com dados reais e o aceite dela acontecem na sessão final da fase 4. A fase 5 não tem tarefas.

## Como começar

1. Leia `AGENTS.md`, o índice das SPECs, o card e a SPEC dele.
2. Comece por **Separar no servidor os registros de teste e de demonstração dos reais** (SPEC-4-001).
3. Construa as tarefas em sequência, SPEC por SPEC, sem teste no meio. Cada tarefa fecha pelas provas automáticas da sua SPEC, com a evidência em `05_entregas/fase-4/`.
4. A SPEC-4-002 (identidade visual) vem depois da 4-006. As propostas de visual são o único ponto em que o dono escolhe algo antes da sessão final.
5. O teste com o cliente é a sessão de validação final (SPEC-4-007), com o dono e as áreas, quando todas as SPECs estiverem no ar.

## Dados e regras

O Omie é a fonte oficial; o Skip Cloud guarda só a camada complementar. A chave do Omie está bloqueada; não chame o Omie até o dono avisar que foi liberada. Toda gravação no Omie (ordem de produção, pedido de compra, pedido de venda) continua desligada e só liga com a autorização do dono, uma por vez, com a condição do checklist cumprida. A nota fiscal continua sendo emitida por uma pessoa no Omie.

## Organização

- `04_fase-atual/`: 21 tarefas, checklist do cliente e 7 SPECs da fase 4.
- `05_entregas/fase-1/`, `fase-2/` e `fase-3/`: tarefas, SPECs e evidências das fases anteriores.
- `05_entregas/fase-4/`: evidências da fase 4.
- `06_notas/`: aprendizados, dúvidas e registros.
- `07-sistemas/`: contratos de integração e o espelho do código do sistema.

Só o consultor libera e encerra; veja `AGENTS.md`. Repositório: `drkgod/American-Goodies`.

## Onde está o código do sistema

- **Código vivo:** projeto Skip 62774 (mcc automação fabrica).
- **Espelho dos módulos, telas e hooks alterados:** `07-sistemas/pcp/codigo/`.
- **Submódulo `07-sistemas/mcc-automacao-fabrica`:** parou em 01/10 (v0.0.1) e não é referência.
