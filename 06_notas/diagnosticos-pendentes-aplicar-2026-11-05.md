# Diagnósticos com token: remoção pendente de aplicar (05/11/2026)

Na tarefa "Tirar do sistema os arquivos de diagnóstico que guardam chave de acesso ao Omie" (SPEC-4-001, CA-4-35), apaguei no projeto Skip 62774 os hooks `pcp_diag_omie_bruto.js` e `pcp_diag_prod4.js`. A conexão com o Skip caiu antes de `apply_changes`: a remoção está na área de trabalho do Skip, mas NÃO foi aplicada nem publicada, então os dois hooks ainda estão no ar na v0.0.199.

Próximo passo (quando o Skip responder): conferir `skip_project_status`; se a remoção não aparecer como pendente, apagar de novo; aplicar (se o QA acusar "file not found on pod", aplicar uma segunda vez, como na v0.0.197), publicar e rodar a busca de segredo (CA-4-35). A tarefa continua `[ ]`.

## Conferido na recuperação de 06/11/2026 11:24 UTC

`skip_file_list` do projeto 62774 não lista mais `pcp_diag_omie_bruto.js` nem `pcp_diag_prod4.js`, e a produção serve a v0.0.203 (ref dc69d76, publicada). A remoção, portanto, saiu do working tree. O que resta da tarefa é a busca de segredo (CA-4-35) e a marcação dela no fase.md, que não são desta recuperação.
