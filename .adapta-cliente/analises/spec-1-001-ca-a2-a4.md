# Análise — SPEC-1-001, CA-A2–A4: Testar login e restrições de acesso

Data: 2026-10-08 · Executor: MCC (ETHOS) · Etapa: aguardando autorização

## Objetivo e resultado observável

Registrar prova formal e completa dos quatro cenários exigidos pela SPEC (acesso permitido,
usuário sem papel, sessão expirada e tentativa de alteração do próprio perfil) incluindo o
**CA-A4 (saída/revogação)** — não exercido na task anterior —, com saída limpa (nenhum dado de
sessão anterior) e login/administração nativa do Skip funcionais.

## Estado real do projeto (inspecionado agora)

- Versão 0.0.13 (última), sem mudanças pendentes além do `.skip.config.json` (delta de infra).
- CA-A2/A3 concluída com bateria T1–T8 provada via HTTP (revalidada 8/8 na conclusão).
- Cenários já provados: permitido (T1/T2), API direta (T3), sem papel (T4), inativo (T5),
  token inválido (T6), autoelevação (T7), área forjada (T8).
- **Lacuna da SPEC (CA-A4, parcialmente provado):** revogação *durante* a sessão (perfil
  desativado → próxima consulta negada), limpeza de dados no logout (UI), refresh com token
  revogado, e login/admin nativos preservados (health + superuser).

## Recorte (menor recorte completo)

**Entra:** prova formal e registrada de CA-A2 (permitido/proibido), CA-A3 (sem papel, expiração,
autoelevação) e **CA-A4 (revogação durante a sessão, limpeza de logout, login/admin nativos)**;
roteiro de teste humano expandido; evidência em 05_entregas/fase-1/spec-1-001/.

**Não entra:** concessão real (matriz pendente), novos recursos de produto, dados reais do Omie,
mudança de código além do necessário para o teste de revogação (nenhum previsto).

## Plano de prova (TDD da SPEC — REFACTOR/REGRESSÃO)

1. **Reexecutar** T1–T8 (bateria completa) contra o backend atual — confirma CA-A2/A3.
2. **CA-A4 (novo):**
   a. Login do usuário inativo ainda antes da desativação? (já provado: inativo é recusado).
   b. **Revogação durante a sessão:** superuser alterna `ativo=false` no perfil do PCP →
      próxima chamada `/pcp/dados` → 403 `perfil_inativo`; reativar depois (estado final = original).
   c. **Logout na UI:** sessão limpa (`authStore.clear()`), navegação direta a `/painel` volta ao
      login; nenhum dado permanece (inspeção do DOM/fluxo no preview).
   d. **Login/admin nativos:** `/api/health` 200; login de superuser funcional (sem hook de auth
      tocado — verificar via health + fluidez do painel Skip).
3. **Regressão:** `spec-1-000` e `spec-1-001` (QA nativo test ok).
4. Evidência consolidada com tabela critério → prova.

## Matriz critério → prova

| Critério | Prova |
|---|---|
| CA-A2 permitido/proibido | Reexecução T1/T2/T3 (8/8) |
| CA-A3 sem papel/expiração/autoelevação | T4/T5/T6/T7 |
| CA-A4 revogação elimina acesso | teste (b) com superuser toggle ativo |
| CA-A4 dados de sessão limpos | logout na UI + navegação direta (c) |
| CA-A4 login/admin nativos | health + painel do Skip (d) |
| Regressão | QA nativo (test ok) + preview 200 |

## Riscos

- O toggle de revogação usa credenciais de superuser via API administrativa — apenas em
  homologação, com estado final restaurado (reativar o perfil inativo-teste).
- Nenhum hook de autenticação será tocado; risco de lockout inalterado.

## Roteiro de teste humano

1. Repetir os 5 passos da task anterior (perfis PCP/Compras/sem-perfil/inativo).
2. **Novo:** com o perfil PCP logado, sair e tentar voltar com o botão do navegador — deve
   permanecer no login (sem dado anterior); confirmar que o menu some após o logout.
