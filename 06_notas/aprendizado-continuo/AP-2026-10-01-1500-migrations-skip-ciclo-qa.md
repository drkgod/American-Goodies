# AP-2026-10-01-1500 — Migrations do Skip aplicam no próximo ciclo de build/QA

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: SPEC-1-000 (fundamento Skip), CA-F1
- Sinal: a migration `0002_pcp_fundamento.skip` foi commitada junto com o build 0.0.4 e o pipeline QA passou, mas a listagem do MCP (`skip_cloud_list_migrations`) continuou mostrando apenas a migration `updated_users` imediatamente após o apply. A aplicação efetiva da migration no banco pode ser assíncrona ao pipeline ou exigir novo ciclo de build.
- Evidência: listagem do MCP após apply_changes (2026-10-01 17:44 UTC) com 1 migration; pipeline QA ok em todas as etapas (run 6f17a3e4).
- Regra reutilizável: após apply_changes com migration nova, reconsultar `skip_cloud_list_migrations` em um ciclo posterior antes de assumir que as coleções existem; a SPEC de conexão (SPEC-1-002) deve inspecionar o schema antes de reutilizar as coleções pcp_*.
- Quando aplicar: qualquer task que crie migrations no Skip e a seguinte que dependa delas.
- Quando não aplicar: alterações somente de frontend (telas/rotas), que não dependem de schema.
- Confiança: média — o pipeline passou e as rotas registraram, mas a listagem de migrations não foi reconsultada após novo ciclo.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto
