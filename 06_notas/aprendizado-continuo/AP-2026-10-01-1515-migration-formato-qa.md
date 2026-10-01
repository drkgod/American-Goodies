# AP-2026-10-01-1515 — Migration em formato errado passa no QA sem ser aplicada

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: SPEC-1-000 (fundamento Skip), CA-F2/F3
- Sinal: uma migration escrita em formato SQL-like (arquivo `.skip` com CREATE COLLECTION) commitou com o pipeline QA inteiro verde, mas nunca foi aplicada — a listagem de migrations continuava só com `updated_users`. O erro só apareceu quando a migration foi reescrita no formato nativo (JS goja em `pocketbase/migrations/`), que o QA valida de verdade (reprovou índice sobre coluna inexistente até a correção).
- Evidência: listagem do MCP sem a migration após builds 0.0.4/0.0.5; migration `0002_pcp_fundamento` applied após reescrita (build 0.0.7, 18:07 UTC); QA reprovando índice antes da correção.
- Regra reutilizável: migrations do Skip Cloud são SEMPRE JavaScript goja em `pocketbase/migrations/NNNN_descricao.js` com `migrate(up, down)`; após qualquer apply com migration nova, confirmar status `applied` em `skip_cloud_list_migrations` antes de considerar o schema pronto.
- Quando aplicar: qualquer task que crie ou altere coleções no Skip Cloud.
- Quando não aplicar: mudanças somente de frontend.
- Confiança: alta — erro reproduzido e corrigido com evidência nas duas direções.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto
