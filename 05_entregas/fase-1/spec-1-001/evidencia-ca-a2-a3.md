# Evidência — SPEC-1-001 · CA-A2/A3 (Plano B — perfis sintéticos)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: f79b943e-452f-4950-a694-891779eacc66 — "Proteger as telas e os dados por área"
- Versão final do projeto Skip 62774: **0.0.13** (QA nativo completo ok)

## Autorização

- Análise entregue em 2026-10-08 (`.adapta-cliente/analises/spec-1-001-ca-a2-a3.md`, commit 661ebc1e).
- Cliente autorizou: "Pode implementar" (mensagem posterior ao relatório).

## O que foi implementado

1. **Migration 0003** — 4 contas sintéticas de teste (usuario-teste-pcp/-compras/-sem-perfil/-inativo @pcp.local, verificados; senha comum via secret `PCP_TEST_PASSWORD`).
2. **Migration 0004** — coleção `pcp_perfis` (usuario relation única + índice único, ativo, areas select múltiplo das 6 áreas, pode_atualizar_fontes; **as 5 regras null = superuser-only**); perfis sintéticos semeados (PCP: estoque+painel; Compras: compras+painel; inativo: ativo=false); **fechamento das 5 regras das 4 coleções de dados** (vazias→null; down reversível).
3. **Hooks** (1 rota por arquivo, params do filtro como objeto — runtime goja): `pcp_perfil_atual.js` e `pcp_dados_area.js` sob `/backend/v1/pcp/*` com `requireAuth`; autorização derivada **no servidor** do perfil ativo; sem perfil/inativo → 403 `perfil_ausente`/`perfil_inativo`; superuser preservado; **área enviada pelo navegador é sempre ignorada**.
4. **Frontend** — `src/services/pcp-access.ts` (único ponto de acesso, `pb.send`); `use-auth` (padrão do guia: gate por `authStore.isValid`, refresh no boot, clear na falha); `/login`; guarda `ProtectedArea` por área (401 → limpa sessão → login; sem perfil → "acesso pendente"; fora da área → "acesso não autorizado"); menu do Layout renderiza só áreas permitidas; Painel consume a rota autorizada e exibe "Sem permissão para esta área" nos blocos negados; banner de demonstração preservado; simulador de estados removido.

## TDD — RED → GREEN → regressão

- **RED (build 0.0.8, backend ainda desprotegido):** leitura direta de `pcp_dados` com usuário comum → **200** (vulnerabilidade real pré-existente — regras "" públicas); `GET /backend/v1/pcp/dados` → **404**.
- **GREEN (v0.0.12/13, prova executada via HTTP contra o backend, 8/8 PASSARAM):**

| # | Cenário (SPEC) | Resultado |
|---|---|---|
| T1 | PCP: estoque permitido | 200, `dados.estoque` presente, pedidos/compras ausentes, `areas_permitidas=[estoque,painel]` |
| T2 | Proibido: Compras sem pedidos | 200, `dados.compras` presente, pedidos e estoque ausentes |
| T3 | API direta negada | `pcp_dados`, `pcp_fontes`, `pcp_lotes`, `pcp_execucoes`, `pcp_perfis` → **403** em todas |
| T4 | Sem papel | 403 `perfil_ausente` |
| T5 | Perfil inativo | 403 `perfil_inativo` |
| T6 | Token expirado/inválido | **401** |
| T7 | Autoelevação (PATCH próprio perfil) | **403** |
| T8 | Área forjada pelo navegador (`?area=pedidos`) | 200 **sem** pedidos — query ignorada |

- **Regressão:** `tests/pcp/spec-1-000.test.mjs` restaurado e executado no QA nativo (test ok); preview responde 200 em `/`, `/catalogo` e `/painel`.
- **QA nativo do Skip (0.0.8→0.0.13):** setup ok, static analysis ok, build ok, integrations ok, test ok em todas as versões.

## Correções durante o ciclo (registradas com prova)

1. `bool required` rejeita `false` (zero-value) no PocketBase → campo sem required; segurança garantida por `ativo = true` nos hooks.
2. `findFirstRecordByFilter` em goja exige **params como objeto** (`{u: id}`), não string → diagnosticado por log de runtime, corrigido nos dois hooks.

## Segurança e limitações

- Nenhuma credencial/token em código, migration, relatório ou repositório; senha de teste via secret `PCP_TEST_PASSWORD` e comunicada ao cliente apenas no chat.
- Nenhum hook de autenticação tocado (sem risco de lockout); administração nativa do Skip preservada (superuser tratado nos hooks).
- **Limitação:** o QA nativo executa a suíte sem as env de teste (a SPEC proíbe credenciais no projeto), pulando os testes de integração; a prova GREEN cobre os mesmos 8 cenários via HTTP com credenciais reais (arquivo `spec-1-001-prova-green.txt`).
- CL-003: organograma/aprovador ainda não registrados no repo — **matriz real pendente**; concessão real bloqueada.

## Teste humano solicitado (v0.0.13, preview)

1. Login com usuario-teste-pcp@pcp.local → menu mostra Catálogo+Painel; Painel mostra só Estoque (Compras/Pedidos/Produção: "Sem permissão").
2. Sair; login com usuario-teste-compras@pcp.local → Painel mostra só Compras; **nenhuma linha de pedidos**.
3. Sair; login com usuario-teste-sem-perfil@pcp.local → "Acesso pendente" e menu vazio.
4. Sair; login com usuario-teste-inativo@pcp.local → "Acesso pendente — perfil inativo".
5. Sair e confirmar que nenhum dado permanece em tela.
