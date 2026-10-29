# Evidência — Exportação dos dados e recuperação (SPEC-3-016)

Data: 29/10/2026 · Skip v0.0.194 (ref e1519bd), aplicada com QA verde e publicada (v0.0.193 aplicada antes só para acertar o texto de versão do resumo). Nenhuma migration; nenhuma chamada ao Omie.

## Construído
- **CA-3-43 exportação:** `GET /backend/v1/pcp/exportacao` (resumo: coleção, registros, no pacote, observação, data, versão e identificação "Dados da American Goodies") e `?colecao=<nome>` (CSV daquela coleção). Exige `exportar_dados` (403 sem pistas). 38 coleções complementares; as cópias das leituras (`pcp_dados`, `pcp_lotes`, `pcp_fontes`, `pcp_execucoes`) entram só como contagem. Colunas sensíveis (senha, token, chave, segredo) saem do CSV; uma varredura procura os valores dos segredos do projeto e padrões de credencial e, se achar, retira a coleção e a marca no resumo sem repetir o valor. Coleção vazia aparece com zero. Tela `/exportacao`: baixa um ZIP único (um CSV por coleção + `resumo.csv`), montado no navegador sem biblioteca externa; o pacote é marcado incompleto se alguma coleção ficar de fora.
- **CA-3-44 conferência:** `exportacao.ts` traz `conferirRestauracao` (contagens da origem × ambiente separado, apontando a coleção faltante) e `destinoPermitido` (nunca por cima da produção).

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-016, **172 de 172 passaram** (7 novos em `spec-3-016.test.mjs`).
  P3.16-01 (sem a ação: 403 idêntico para perfil ausente, inativo e sem a ação), P3.16-02 (varredura: nada de segredo; coluna de senha sai; segredo num campo livre retira a coleção; padrões de credencial), P3.16-03 (resumo: contagens, coleção vazia com zero, leituras só como contagem, pacote incompleto com o motivo),
  P3.16-04 (lógica de conferência: igual passa; coleção faltando ou diferente reprova apontando-a; destino igual à origem recusado),
  P3.16-05 (rotina real de leitura do catálogo, SPEC-3-001: falha mantém o lote anterior; retomada pelo cursor sem reler nem duplicar; bloqueio 425 respeita a guarda de 12 h).

## Limites e pendências
- **P3.16-04 real (restauração num ambiente separado) NÃO feita:** exige criar um projeto de teste no Skip e um importador de CSV; sem autorização para isso, registrei o pedido em `06_notas/restauracao-ambiente-separado-2026-10-29.md`. O Skip não expõe backup nativo nas ferramentas deste executor. A segunda tarefa segue em `[/]` e `recuperacao.md` não foi gerado.
- **Recuperação das leituras provada só em parte:** a prova usa a rotina do catálogo (SPEC-3-001, Omie). A retomada da Nuvemshop e das demais leituras da fase 1 são provadas por testes de integração que exigem conta de teste e rodam contra o servidor; não foram reexecutados aqui.
- Coleção acima de 20.000 registros sai do pacote com aviso (exportar em partes não foi construído); hoje nenhuma chega perto.
- A rota e a tela não foram exercitadas contra o servidor (sem conta de teste); a varredura de segredos do servidor usa uma lista de nomes de segredo prováveis (Omie e Nuvemshop) porque a listagem de segredos do Skip estava indisponível; confirmar na sessão final.
- Nenhuma conta real recebeu `exportar_dados` (matriz CL-003). O arquivo tem dados de clientes e fornecedores e não vai para o Git.
