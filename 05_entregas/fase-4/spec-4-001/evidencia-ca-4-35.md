# SPEC-4-001 · CA-4-35 — diagnósticos com token (06/11/2026, Skip v0.0.202)

- Apagados e publicados (ref 9e6da11): `pcp_catalogo_dirigido_run.js` (v0.0.197), `pcp_diag_omie_bruto.js` e `pcp_diag_prod4.js`. A primeira aplicação acusa "file not found on pod" e a segunda passa (mesmo comportamento da v0.0.197). Uma tentativa anterior (05/11) caiu com a conexão e o apagamento tinha voltado; refeito em 06/11.
- Lista dos hooks antes e depois (só nomes): antes 3 `diag/dirigido_run`; depois 0.
- A chave do Omie antiga ainda está no histórico do Git do Skip; a troca da chave no Omie é do dono (CL-PEND-006).

## Em aberto (CA-4-35 incompleto)
Busca por `app_key`, `app_secret`, `OMIE_APP`, `token`, `Bearer`, `senha` e `password` em todo o projeto: não executada. O Skip não oferece busca no conteúdo e ler cada arquivo não cabe. Conferi só as migrations 0003 e 0022: usam `$secrets.get(...)`, sem valor escrito. Plano: tentar de novo na SPEC-4-007 (exportação do projeto ou leitura por lotes dos hooks que usam o Omie).
