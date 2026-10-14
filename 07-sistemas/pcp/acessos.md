# Acessos e papéis — PCP American Goodies

Registro do mapa do projeto Skip e do estado da matriz de acesso por área (SPEC-1-001).
Este arquivo NÃO contém credenciais, senhas, tokens ou dados pessoais — apenas estrutura,
estado de decisão e perfis de teste.

## Mapa do projeto Skip

| Campo | Valor |
|---|---|
| Projeto | mcc automação fabrica |
| ID | 62774 |
| Organização | Org de Lindolfo (slug `financeiro-94b2f`) |
| Hostname Skip Cloud | `mcc-automacao-fabrica-98125` |
| Preview | https://mcc-automacao-fabrica-98125--preview.goskip.app |
| Produção | https://mcc-automacao-fabrica-98125.goskip.app (não publicada em 08/10/2026) |
| Rotas | `/` (Index), `/catalogo`, `/painel`, `*` (NotFound) |
| Coleções | users (auth), pcp_execucoes, pcp_lotes, pcp_dados, pcp_fontes |
| Migrations aplicadas | updated_users (v1790875123), 0002_pcp_fundamento (v1790878036) |

Fonte da conferência: MCP do Skip, 2026-10-08. Contrato interno: `07-sistemas/pcp/fundamento.md`.

## Matriz nominal de acesso (CL-003)

**Estado: v1 APROVADA em 14/10/2026** — aprovador: Mr Cheney; confirmação do conteúdo por
formulário em 14/10/2026 11:54 BRT. Registro integral: `05_entregas/fase-2/spec-2-000/matriz-nominal-v1.md`.

- Áreas previstas pela SPEC-1-001: catalogo, estoque, producao, compras, pedidos, painel
  (+ campo `pode_atualizar_fontes`, somente se aprovado).
- A SPEC proíbe atribuir gestor, administrador ou acesso global por suposição — a matriz v1
  registra conta, áreas, ações e pontos por pessoa; área/cargo não concede ação por implicação.
- Contas seguem padrão `nome.sobrenome` e serão criadas na task de ativação (49327a88);
  nesta task nenhuma conta foi criada e nenhum perfil Skip foi alterado.
- Pendências da v1: escopo zero do motorista (Renato) a definir; domínio das contas padrão;
  revogação dos perfis sintéticos @pcp.local na task 49327a88.

## Perfis sintéticos de teste — Plano B (autorizado)

Decisão do cliente (Mr Cheney, 2026-10-08 10:41 BRT): Rota B — Plano B previsto na SPEC-1-001
("sem organograma, construir apenas ambiente de teste com perfis sintéticos, sem concessão real").

| Perfil sintético | Áreas | Cenário da SPEC |
|---|---|---|
| usuário-teste-PCP | estoque, painel | Permitido (CA-A2) |
| usuário-teste-Compras | compras, painel | Proibido para pedidos (CA-A2) |
| usuário sem perfil | — | Sem papel: acesso pendente, API nega (CA-A3) |
| perfil inativo | — | Inativo/revogação: nega e limpa sessão (CA-A3/A4) |

⚠️ Estes perfis são fixtures de teste definidos pela SPEC — **não são cargos aprovados** e não
concedem acesso real a ninguém. O provisionamento das contas e da coleção `pcp_perfis` é escopo
da task seguinte (CA-A2/A3), não deste registro.
