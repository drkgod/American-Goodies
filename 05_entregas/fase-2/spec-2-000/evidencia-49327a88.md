# Evidência — Task 49327a88: Ativar e testar as contas aprovadas (SPEC-2-000, CA-A2/A3)

- Data: 2026-10-14 · Executor: MCC (ETHOS) · Projeto Skip 62774 (v0.0.73, commit 016df6c)
- Matriz v1.2 aplicada EXATAMENTE (task 51356fad concluída): 21 contas reais criadas
  (nome.sobrenome@mccfranchising.com.br), Hellene e Renato sem conta (sem acesso na v1).

## Provas executadas (HTTP real contra o backend gerenciado shrd00)

| # | Prova | Resultado |
|---|---|---|
| T1 | Migration 0018 (acoes/pontos em pcp_perfis) | PASSOU — campos json criados (conf. get_collection_details) |
| T2a | Perfil do sintético (usuario-teste-pcp@pcp.local) | PASSOU — compatibilidade (sem acoes no payload antigo); revogado em T9 |
| T2b | Perfil de Keoma (conta real) — acoes exatas da matriz v1.2 | PASSOU — 6 ações, pontos=[], pode_atualizar_fontes=true |
| T2c | Perfil de Angela — acoes conferir_expedicao/conferir_camara, pontos expedicao/camara_fria | PASSOU — exatamente a matriz v1.2 |
| T3 | primeira-senha ANTES da troca | PASSOU — exige_troca=true |
| T4 | trocar-senha (senha inicial → nova) | PASSOU — {ok:true} |
| T5 | login com a NOVA senha | PASSOU — HTTP 200 |
| T6 | login com a senha INICIAL após troca | PASSOU — HTTP 400 |
| T7 | primeira-senha DEPOIS da troca | PASSOU — exige_troca=false (flag persistida, migration 0020) |
| T8 | perfil de conta real inativa (antes da 0021) | PASSOU — motivo perfil_inativo, sem dados |
| T9 | Revogação dos sintéticos @pcp.local (PCP_REVOGAR_SINTETICOS=1) | PASSOU — login sintético recusado HTTP 400 |
| T10 | Plataforma operacional (painel/logs/deploy) | PASSOU — superuser sempre passa (guia de hooks) |
| T11 | Troca de senha por 2ª conta real (Angela) | PASSOU — fluxo independente de perfil |
| T12 | Teste TDD executável (node --test tests/pcp/spec-2-000.test.mjs) | PASSOU — 8/8 (matriz por ação, não por área; troca obrigatória) |

## Arquivos alterados (recorte da task)

- pocketbase/migrations/0018_perfis_acoes_pontos.js — campos acoes/pontos (json) em pcp_perfis
- pocketbase/migrations/0019_usuarios_reais_matriz.js — 21 contas + perfis exatos (idempotente)
- pocketbase/migrations/0020_users_primeira_senha_trocada.js — bool em users + updateRule trava a edição do próprio flag
- pocketbase/migrations/0021_ativa_contas_reais.js — ativa os perfis reais
- pocketbase/hooks/pcp_perfil_v2.js — perfil com acoes/pontos (substitui pcp_perfil_atual.js)
- pocketbase/hooks/pcp_login_guard.js — recusa sintético revogado; superuser sempre passa
- pocketbase/hooks/pcp_trocar_senha.js — troca obrigatória (valida senha atual)
- pocketbase/hooks/pcp_primeira_senha.js — consulta exige_troca
- src/pages/TrocarSenha.tsx + src/components/ProtectedArea.tsx + src/services/pcp-access.ts + src/App.tsx — fluxo de troca obrigatória no frontend
- tests/pcp/spec-2-000.test.mjs — 8 testes node --test

## Histórico de versões Skip (v0.0.62 → v0.0.73)

- 0.0.62: primeiro apply (lint/build corrigidos em 0.0.63) · 0.0.64–65: hook de troca renomeado (slug sem underscore) · 0.0.66–67: migration 0020 · 0.0.68–69: migration 0021 · 0.0.70: guarda de login corrigido (getString('email')) · 0.0.71–72: hook de perfil recriado (pcp_perfil_v2) após conflito de rota com o hook antigo · 0.0.73: teste TDD

## Pendências conhecidas (não bloqueiam o aceite)

1. 19 de 21 contas ainda têm a senha inicial — troca individual obrigatória no 1º login de cada pessoa.
2. Keoma: pontos=[] (sem pontos definidos na matriz v1.2 — pendência registrada).
3. Ação editar_programacao ainda não tem rota de rascunho (SPEC-2-002/003 — guarda de ação pronto no servidor).
4. Revogação controlada pelo secret PCP_REVOGAR_SINTETICOS (sem redeploy) — valor atual: 1.
5. Publicação em produção (lastPublishedRef ainda é a F1 v0.0.61) — após o aceite humano.
