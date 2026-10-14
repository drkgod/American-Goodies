# AP-2026-10-14-1505 — push_files trunca silenciosamente perto de 20 KB; prova por blob-SHA

- Status: candidato
- Escopo: projeto do cliente (American Goodies)
- Task/SPEC: 51356fad (SPEC-2-000 CA-A1); histórico: fase.md F1 (08/10), acessos.md (08/10)
- Sinal: mcp_github_push_files gravou 04_fase-atual/fase.md (20.476 B) sem a última frase (-81 B), sem erro na resposta da ferramenta; segunda ocorrência do mesmo modo de falha. create_or_update_file (API de conteúdo, com SHA prévio) gravou o mesmo arquivo íntegro.
- Evidência: commit 4c67e43b (truncado, blob 41b1c5c2) vs commit 1d7d9571 (reparado, blob 063d64a3); comparação byte-a-byte contra conteúdo local.
- Regra reutilizável: para arquivo >= ~15 KB ou crítico, gravar via create_or_update_file (SHA prévio via get_file_contents) e provar com git blob-SHA: blob = sha1("blob <tamanho>\0" + bytes); o artefato do get_file_contents descarta a quebra de linha final — comparar com conteúdo + "\n".
- Quando aplicar: qualquer commit de documentação/código no repo do cliente via MCP do GitHub.
- Quando não aplicar: arquivos novos pequenos (<8 KB) com releitura de cauda podem usar push_files.
- Confiança: alta — duas ocorrências independentes com prova criptográfica de ambos os estados.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
