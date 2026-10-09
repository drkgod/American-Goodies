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

**Estado: PENDENTE — não recebida nem aprovada.**

- Áreas previstas pela SPEC-1-001: catalogo, estoque, producao, compras, pedidos, painel
  (+ campo `pode_atualizar_fontes`, somente se aprovado).
- A SPEC proíbe atribuir gestor, administrador ou acesso global por suposição.
- **Até a matriz nominal (conta → áreas) ser fornecida e aprovada, acesso real permanece
  bloqueado.** Quem aprovou e quando serão registrados aqui, fora das credenciais.

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
