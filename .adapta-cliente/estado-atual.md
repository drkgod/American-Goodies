# Estado atual — Adapta Cliente

- schema_version: adapta-cliente-state/v2
- task_id: db079721-3633-4a14-8143-2be82cedd333 (task "Testar login e restrições de acesso", SPEC-1-001, CA-A2–A4)
- executor: MCC (ETHOS)
- owner_informativo: desconhecido
- spec: 04_fase-atual/specs/spec-1-001-acesso-por-area.md
- analise: .adapta-cliente/analises/spec-1-001-ca-a2-a4.md
- etapa: aguardando_teste_humano
- autorizacao_implementacao: confirmada — 2026-10-08 11:37, "Pode implementar"
- teste_humano: pendente
- verificacao_automatica: passou — T1–T8 reexecutados 8/8; CA-A4: logout na UI limpa sessão (browser real), revogação durante a sessão → 403 na próxima consulta (token emitido antes, usado depois), health/admin 200; migrations temporárias com down reversível; estado final restaurado (perfil ativo); QA 0.0.14–0.0.17 ok
- aprendizado: sem_sinal:provas sobre mecanismos já implementados, sem causa raiz nova
- ultima_acao: provas CA-A2–A4 executadas e evidência gravada (evidencia-ca-a2-a4.md)
- proxima_acao: aguardar teste humano (roteiro na evidência: 5 passos + botão voltar pós-logout)
- atualizado_em: 2026-10-08T11:37:00-03:00
