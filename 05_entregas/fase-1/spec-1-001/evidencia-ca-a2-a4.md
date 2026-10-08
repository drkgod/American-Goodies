# Evidência — SPEC-1-001 · CA-A2–A4 (Testar login e restrições de acesso)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: db079721-3633-4a14-8143-2be82cedd333
- Versões do projeto Skip 62774: 0.0.14–0.0.17 sobre a base 0.0.13 (todas com QA nativo ok)

## Autorização

- Análise entregue em 2026-10-08 (`.adapta-cliente/analises/spec-1-001-ca-a2-a4.md`, commit 69939b20).
- Cliente autorizou: "Pode implementar".

## Provas executadas

### 1. Reexecução da bateria T1–T8 (CA-A2/A3) — base 0.0.13

**8/8 PASSARAM** — permitido/proibido por perfil, API direta negada em todas as coleções,
perfil_ausente, perfil_inativo, token inválido 401, autoelevação negada, área forjada ignorada.

### 2. CA-A4 — saída, revogação e administração nativa

**(c) Logout limpa a sessão (navegador real no preview):**
- login do teste-PCP ok; painel com Estoque visível e blocos negados com "Sem permissão para esta área";
- clique em **Sair** → URL volta a `/login`;
- navegação direta a `/painel` pós-logout → redireciona a `/login`, **nenhum dado renderizado**;
- screenshot: ca-a4-logout-login.png.

**(b) Revogação elimina o acesso na próxima consulta (migrations temporárias com down reversível):**

| Passo | Versão | Ação | Resultado |
|---|---|---|---|
| 0005 | 0.0.14 | perfil teste-PCP → ativo=false | token pós-revogação → **403 perfil_inativo** |
| 0006 | 0.0.15 | reativa | novo token com perfil ativo → **200** (baseline) |
| 0007 | 0.0.16 | desativa de novo | — |
| prova central | — | **mesmo token emitido ANTES da revogação, usado DEPOIS** | **403 perfil_inativo** ✅ |
| 0008 | 0.0.17 | restaura estado original | perfil ativo → **200** |

**(d) Login/administração nativos preservados:**
- `/api/health` = 200 em todas as versões;
- nenhum hook `onRecordAuth*` tocado; superuser autorizado explicitamente nos hooks;
- plataforma operacional durante todo o ciclo (deploys e QA passaram).
- **Limitação honesta:** o login do painel de administração não foi exercitado com credencial real
  de superuser (nenhuma credencial disponível ao executor); preservação inferida pelos itens acima.

### 3. Regressão

QA nativo do Skip em todas as versões (0.0.14→0.0.17): setup, static analysis, build,
integrations e test = ok. Estado final do banco: perfil teste-PCP **ativo** (idêntico ao original).

## Segurança

Nenhuma credencial/token em código ou repositório; migrations de prova alteram apenas o campo
`ativo` de um perfil sintético, com down reversível; estado final restaurado e conferido.

## Teste humano solicitado

1. Repetir os 5 passos da task anterior (perfis PCP/Compras/sem-perfil/inativo).
2. **Novo (CA-A4):** logado com o teste-PCP, clicar em Sair e tentar voltar com o botão "voltar"
   do navegador — deve permanecer fora (sem dado anterior); o menu some após o logout.
