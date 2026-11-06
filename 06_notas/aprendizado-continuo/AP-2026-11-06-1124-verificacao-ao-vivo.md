# AP-2026-11-06-1124 — versão do ar só por leitura ao vivo; cache local esconde mudança de produção

- Status: candidato
- Escopo: projeto do cliente
- Task/SPEC: recuperação agendada (cron 54adb5a240eee48b) · SPEC-4-001
- Sinal: o estado no GitHub e o cache `state/skip-versao-verificada.json` diziam v0.0.197 (ref 32917f0), mas a
  produção já servia a v0.0.203 (ref dc69d76, publicada). O cache tinha 21,4 h — dentro do limite de 24 h do
  script —, então o verificador de drift não acusou nada.
- Evidência: `skip_project_status` do projeto 62774 em 06/11/2026 11:24 UTC: version 0.0.203, versionHash dc69d76,
  lastPublishedRef dc69d76, isPublished true; commit 392407ad documenta a entrega anterior em v0.0.199.
- Regra reutilizável: em recuperação, a versão publicada é conferida por leitura ao vivo (`skip_project_status`) e
  comparada ao estado do GitHub; o cache local só serve para saber que algo mudou, nunca para afirmar o que está no ar.
- Quando aplicar: toda rodada de recuperação, antes de qualquer conclusão sobre drift, publicação ou pendência de envio.
- Quando não aplicar: se a leitura ao vivo não estiver disponível — registrar "sem conclusão" em vez de herdar o valor antigo.
- Confiança: alta — duas fontes independentes (status ao vivo e commits do GitHub) divergiam do cache.
- Privacidade: sem segredo, dado pessoal ou conteúdo bruto
