# Análise — SPEC-1-001, CA-A2/A3: Proteger as telas e os dados por área

Data: 2026-10-08 · Executor: MCC (ETHOS) · Etapa: aguardando autorização

## Objetivo e resultado observável

Usuário autorizado entra e vê apenas as áreas permitidas; usuário sem perfil, inativo ou fora
da área não obtém dados — nem pela tela, nem chamando a API diretamente. Implementado com os
**perfis sintéticos de teste** já registrados em `07-sistemas/pcp/acessos.md` (Plano B); a
concessão real continua bloqueada até a matriz CL-003.

## Estado real do projeto (inspecionado agora)

- Coleções: `users` (auth; list/view/update/delete = dono, create público), `pcp_execucoes`,
  `pcp_lotes`, `pcp_dados`, `pcp_fontes` — **todas as pcp_* com as 5 regras vazias ("")**, ou
  seja, atualmente **qualquer um lê os dados de integração pela API direta** (estado pré-proteção).
- Migrations aplicadas: `updated_users`, `0002_pcp_fundamento`. Próximo ordinal livre: **0003**.
- Frontend: `App.tsx` com rotas públicas `/catalogo` e `/painel`; `Layout.tsx` com menu fixo;
  `provider.ts` (interface `ResultadoLeitura` + fixtures locais); telas com banner de
demonstração; `client.ts` auto-gerado (pocketbase ~0.26.9, `VITE_POCKETBASE_URL`).
- Sem `use-auth`, sem login, sem guarda de rota, sem `src/services/` — a leva de acesso não existe
  ainda no código.
- `package.json`: `test` é um echo (runner = node:test já usado em `tests/pcp/spec-1-000.test.mjs`,
  que importa o provider .ts diretamente — type stripping funcionando no QA).

## Recorte (menor recorte completo)

**Entra:** coleção `pcp_perfis` (SPEC), perfis sintéticos + contas de teste, regras RLS nas
cinco coleções `pcp_*` (vazias → `null`/superuser), autenticação nativa no frontend (login,
sessão, guarda de rota), menu por área, rota autorizada `/backend/v1/pcp/dados` e
`/backend/v1/pcp/perfil` com verificação no servidor, testes TDD (RED→GREEN→regressão).

**Não entra:** concessão real (CL-003 pendente), rota de escrita de perfil (só superuser via
painel), dados reais (SPEC-1-002), validação do painel completo (CA-A4 / task 3), mudança de
autenticação administrativa do Skip.

## Plano de implementação

1. **Secret de teste**: criar `PCP_TEST_PASSWORD` (valor aleatório forte) antes da migration;
   senha nunca vai para código/relatório — só para o chat, para o teste humano.
2. **Migration 0003** (`0003_seed_usuarios_teste.js`): cria as 4 contas sintéticas no auth
   (usuario-teste-pcp / -compras / -sem-perfil / -inativo @pcp.local, verificados, senha do
   secret), idempotente. Sem perfil ainda — permite o RED.
3. **RED**: `tests/pcp/spec-1-001.test.mjs` (node:test) — integração contra o backend com
   credenciais via variáveis de ambiente (`PCP_TEST_URL`, `PCP_TEST_*_EMAIL/PASSWORD`), pulando
   quando ausentes (QA roda sem elas; eu executo com elas para provar RED e GREEN):
   login teste-pcp → leitura DIRETA de `pcp_dados` deve ser NEGADA (hoje passa = RED);
   `GET /backend/v1/pcp/dados` deve responder 200 com estoque e sem pedidos (hoje 404 = RED).
4. **Migration 0004** (`0004_pcp_perfis.js`): cria `pcp_perfis` — usuario (relation única →
   users, cascadeDelete), ativo (bool), areas (select múltiplo: catalogo, estoque, producao,
   compras, pedidos, painel), pode_atualizar_fontes (bool), created/updated; **as 5 regras
   `null` (superuser-only)**; índice único em usuario. Semeia 3 perfis: PCP (estoque, painel),
   Compras (compras, painel), inativo (ativo=false). Usuário sem perfil fica sem perfil.
5. **Migração das regras das coleções existentes**: `pcp_execucoes`, `pcp_lotes`, `pcp_dados`,
   `pcp_fontes` — as 5 regras de `""` para `null` (superuser-only; dados brutos de integração
   ficam inacessíveis ao usuário). Reversível na mesma migration (down restaura `""`).
6. **Hooks** (um por arquivo, lógica inline, `e.next()`/erros explícitos, superuser tratado):
   - `pcp_perfil_atual.js` — `GET /backend/v1/pcp/perfil` (`requireAuth`): perfil ativo do
     usuário (áreas + pode_atualizar_fontes) ou `perfil: null`; sem perfil → motivo.
   - `pcp_dados_area.js` — `GET /backend/v1/pcp/dados` (`requireAuth`): **não aceita área do
     navegador**; deriva as áreas do perfil ativo no servidor, devolve apenas os blocos
     permitidos (fixtures de demonstração no servidor, fonte `demonstracao`) + `areas_permitidas`;
     sem perfil/inativo → 403 com código (`perfil_ausente`/`perfil_inativo`).
7. **Frontend** (padrão do projeto: serviços em `src/services/`, componentes nunca chamam o SDK):
   - `src/services/pcp-access.ts`: `obterPerfil()` e `obterDados()` via `pb.send`;
   - `src/hooks/use-auth.tsx`: AuthProvider (padrão do guia: `isAuthenticated` por
     `authStore.isValid`, refresh no boot, clear na falha, signOut);
   - `src/pages/Login.tsx` + rota `/login`;
   - `src/components/ProtectedArea.tsx`: guarda por autenticação e por área (sem perfil →
     "acesso pendente"; fora da área → "acesso não autorizado"); 401 → limpa sessão e volta ao login;
   - `Layout.tsx`: menu renderiza só áreas permitidas; e-mail do usuário + Sair;
   - `App.tsx`: `/catalogo` e `/painel` protegidas por área; `/login` pública;
   - `Painel.tsx`: dados passam a vir da rota autorizada (service), blocos sem permissão exibem
     "Sem permissão para esta área" (nenhuma linha/total exposto); remove o simulador de estados
     (o caminho dos dados passa a ser a rota protegida); banner permanece;
   - `Catalogo.tsx`: permanece com conteúdo de demonstração, agora atrás da guarda de área.
8. **GREEN + regressão**: testes da SPEC-1-001 GREEN (integração) + `spec-1-000.test.mjs` segue
   GREEN (regressão); QA nativo do Skip (build/lint/test) via apply_changes.

## Matriz critério → prova

| Critério | Prova |
|---|---|
| CA-A2: perfil obtém somente sua área | Integração: teste-pcp recebe `estoque` e NÃO recebe `pedidos` em `/pcp/dados`; teste-compras idem invertido |
| CA-A2: sem autorização não recebe dados pela API | Leitura direta de `pcp_dados`/`pcp_fontes` com token de teste → negada (regras `null`) |
| CA-A3: sem perfil / inativo | `/pcp/dados` → 403 `perfil_ausente` / `perfil_inativo`; tela mostra mensagem, sem dado |
| CA-A3: token expirado/inválido | Chamada com token inválido → 401; UI limpa sessão e pede login |
| CA-A3: alteração do próprio perfil negada | `PATCH /api/collections/pcp_perfis/{id}` com token do usuário → negado |
| Menu por área | Estrutura: Layout renderiza itens condicionados às áreas; humano confere com 2 perfis |
| Regressão do fundamento | `spec-1-000.test.mjs` segue GREEN |

## Riscos e cuidados (linha vermelha)

- **Segurança**: regras vazias = dados públicos hoje — este é exatamente o defeito que a task
  corrige; nenhuma regra pode ficar em branco ao final. Superuser nunca bloqueado (plataforma).
- **Validação de entrada**: área NUNCA vem do navegador (rota deriva do perfil); `pb.filter`
  para qualquer valor de usuário.
- **LGPD**: contas sintéticas `@pcp.local`, sem dado pessoal real; senha só em secret/chat.
- **Acessibilidade**: login e mensagens de bloqueio com `role`/labels (banner já usa `role=status`).
- **Risco de lockout**: nenhum hook de autenticação nesta leva (não tocar em `onRecordAuth*`).
- **Dívida deliberada**: nenhuma. A pendência CL-003 é trava de SPEC (registrada), não dívida
  de código — a autorização lê `pcp_perfis`, então a matriz real entra sem mudar código.

## Dependências e perguntas

- Nenhuma pergunta bloqueante: a SPEC + Plano B autorizado definem o recorte. Contas de teste
  sintéticas (`@pcp.local`) estão previstas como "massa sintética sem senhas publicadas".
- Credenciais dos usuários de teste serão entregues no chat no momento do teste humano (nunca no
  repositório).

## Roteiro de verificação e teste humano

1. Automatizado: RED documentado → implementação → GREEN dos cenários A2/A3 → regressão 1-000 →
   QA nativo (build/lint/test). Evidência em `05_entregas/fase-1/spec-1-001/`, sem tokens.
2. Humano (Keoma/Mr Cheney): entrar com usuário-teste-PCP (vê Catálogo+Painel no menu, Painel
   mostra só Estoque); sair; entrar com usuário-teste-Compras (vê Catálogo+Painel, Painel mostra
   só Compras, sem qualquer linha de pedidos); tentar URL direta `/painel` com usuário sem
   perfil → mensagem de acesso pendente; sair e confirmar que nenhum dado permanece.
