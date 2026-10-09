# Análise — SPEC-1-001, CA-A1: Confirmar acessos e papéis

Data: 2026-10-01 · Executor: MCC (ETHOS) · Etapa: aguardando autorização

## Objetivo e resultado observável

Registrar o mapa do projeto Skip e a matriz nominal de acesso aprovada (usuário→áreas), sem
segredo, em 07-sistemas/pcp/acessos.md — insumo obrigatório para as tasks seguintes da leva
de acesso. Nenhum papel real inventado.

## Pré-condições da SPEC e estado real

| Pré-condição | Estado |
|---|---|
| Fundamento SPEC-1-000 aceito | ✅ Concluída e aceita (3/3 tasks, teste humano aprovado) |
| CL-003 — organograma/papéis aprovados | ❌ **Não recebido** — verificado: 06_notas/ vazio, 07-sistemas/pcp/acessos.md não existe |
| CL-004 — acesso do executor | ✅ Executor com acesso MCP ao projeto Skip 62774 confirmado |
| Projeto Skip inequívoco | ✅ Projeto 62774 confirmado (mesmo do fundamento) |

## Bloqueio declarado pela SPEC

> "Bloqueios de execução: verificar a referência do projeto Skip conectado; receber/aprovar
> CL-003 (organograma/papéis) e acesso do executor via CL-004. **Não atribuir gestor,
> administrador ou acesso global por suposição.**"

E o handoff reforça: "Até receber a matriz, manter acesso real bloqueado."

## Plano B previsto na própria SPEC

> "Risco/plano B: sem organograma, construir apenas ambiente de teste com perfis sintéticos,
> sem concessão real."

Ou seja: sem a matriz, a SPEC autoriza apenas o ambiente de teste (perfis sintéticos:
usuário-teste-PCP com estoque/painel; usuário-teste-Compras com compras/painel; usuário sem
perfil; perfil inativo) — sem conceder acesso real a ninguém.

## Recomendação

Duas rotas possíveis, decisão do cliente:

**A) Fornecer a matriz agora** — lista nominal (nome/e-mail da conta Skip → áreas:
catalogo, estoque, producao, compras, pedidos, painel + quem pode_atualizar_fontes) e quem
aprovou. Com isso a task CA-A1 fecha completa e as tasks seguintes implementam acesso real.

**B) Executar o Plano B** — registrar o mapa do projeto e construir somente os perfis
sintéticos de teste (CA-A1 parcial: mapa registrado, matriz pendente). As tasks seguintes
protegem as telas/API com base nos perfis de teste; concessão real fica para quando a matriz
chegar.

## Pergunta bloqueante

Qual rota? A SPEC proíbe inventar papéis reais — sem a matriz, não há o que registrar como
"aprovado".

---

## Resolução (2026-10-08)

Cliente escolheu a **Rota B — Plano B** (formulário de 2026-10-08 10:41 BRT, autorização posterior
ao relatório). Executado conforme a SPEC: mapa do projeto Skip 62774 e os quatro perfis sintéticos
de teste registrados em `07-sistemas/pcp/acessos.md`; matriz CL-003 permanece **PENDENTE** e acesso
real bloqueado. Evidência: `05_entregas/fase-1/spec-1-001/evidencia-ca-a1-plano-b.md`. Task em
`aguardando_teste_humano`.
