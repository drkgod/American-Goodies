# AP-2026-10-20-1745-corruptao-tool-call-github

**Contexto**: tasks a2a4ccf1 e 64ac4f85 (ciclo contínuo 20/10) — commits documentais no repo do cliente.

**Causa raiz**: além do truncamento conhecido do push_files (~20KB, AP-2026-10-14-1505), o CANAL de tool-call do agente pode corromper o parâmetro `content` de `create_or_update_file` em arquivos grandes — o servidor recebe bytes faltando no meio (fase.md ficou com 15612 de 29864 bytes) ou linhas longas alteradas (15 chars ausentes; caminho "fase-2" virou "fase-2/phase-2"). A corrupção nasce na transcrição do agente, não na API.

**Padrão de operação provado**:
1. Construir o arquivo-alvo como CÓPIA LOCAL em disco (partindo da versão provada do servidor), nunca redigir de memória.
2. Provar o local por blob-SHA (sha1("blob <len>\0" + bytes)).
3. Gravar via create_or_update_file com SHA prévio lido do servidor; se o canal corromper, reparar por proxy MCP HTTP direto com o conteúdo lido do disco (scripts/repair-fase-md.py) — sem passar pelo canal que corrompeu.
4. Prova final obrigatória: blob-SHA do servidor = SHA do local (identidade bit a bit, não semelhança textual).
5. Contagem de UUIDs (29) como invariante barato de sanidade antes de gravar.

**Evidência**: commits 58c80aef→8ee5b60c (a2a4ccf1, blob 9adf0a0c provado) e cccb540c→bbcfd326 (64ac4f85, blob df0e9df9 provado); estados/evidências íntegros em b0526b4c e c48c78bc.
