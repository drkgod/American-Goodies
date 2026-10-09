# AP-2026-10-08-1130 — goja: findFirstRecordByFilter exige params como objeto

- Status: candidato
- Escopo: projeto do cliente (Skip Cloud)
- Task/SPEC: SPEC-1-001 CA-A2/A3 (task f79b943e)
- Sinal: em hooks Skip Cloud (runtime goja), `$app.findFirstRecordByFilter("col", "campo = {:u}", auth.id)` lança `TypeError: could not convert ... to dbx.Params` em runtime — o hook compila e o deploy passa; o erro só aparece na primeira chamada real, e a rota responde como "dado ausente" em vez de falhar.
- Evidência: logs de runtime do projeto 62774 (source hooks, 2026-10-08 14:25 UTC) com o TypeError; correção nos hooks pcp_perfil_atual.js e pcp_dados_area.js (params `{u: id}`) e GREEN 8/8 na sequência.
- Regra reutilizável: em hooks Skip Cloud, filtros parametrizados de finders `$app` levam SEMPRE um objeto de params (ex.: `{ u: auth.id }`) como argumento adicional — nunca o valor solto.
- Quando aplicar: qualquer hook/route com consulta filtrada por valor de runtime.
- Quando não aplicar: migrações (usar findRecordsByFilter com mesma regra) não exibem o mesmo erro da mesma forma; consultas sem parâmetro não se aplicam.
- Confiança: alta — erro observado em log, correção verificada por bateria 8/8.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto.
