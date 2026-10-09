> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado. **CONCLUÍDA e VALIDADA pelo owner ("validado", 18:23) e PUBLICADA EM PRODUÇÃO.**  
**Produção:** https://mcc-automacao-fabrica-98125.goskip.app (v0.0.61, ref 4306849; backend gerenciado shrd00.internal.goskip.dev).  
**Ambiente:** Skip + MCP do Skip + Skip Cloud (projeto 62774). **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.

**18/18 tasks concluídas (100%)** — 5 SPECs com evidência e aceite; regressão integrada R1–R8 8/8; ensaio de UI aprovado (preview e produção); amostra autorizada M043055 = 53 UN consistente do início ao fim.

## Resumo do que foi entregue

- **Fundamento** (SPEC-1-000): coleções, contratos internos, telas com fixtures e banner.
- **Acesso por área** (SPEC-1-001): login nativo, guarda de rotas, autorização no servidor, revogação em sessão, logout limpo (T1–T8 8/8).
- **Leitura Omie** (SPEC-1-002): sync real com allowlist de consulta, lease/geração, ativação atômica, retry com janela de rate-limit, recuperação por cursor, conferência reconciliada (estoque 1057=1057).
- **Pedidos de canais** (SPEC-1-003): canal 3344 (transições reais provadas); oficiais 5393 por ID único; 44 vínculos comprovados por referência; duplicados 0/5393.
- **Catálogo** (SPEC-1-004): sobre snapshots, com estados explícitos, conferência 0=0 válida, divergência real de estoque detectada e reconciliada.
- **Painel diário** (SPEC-1-005): 4 blocos por área com filtros, origem/horário/lote, lote antigo com aviso, permissão por bloco sem pistas, produção/compras explicitamente não integrados na Fase 1.

## Pendências / próxima leva (não bloqueiam a fase concluída)

| Pendência | Dono | Efeito quando resolvida |
|---|---|---|
| Povoar cadastro de produtos no Omie | Cliente | Catálogo e saldos por produto listam automaticamente (sem mudança de código) |
| Matriz nominal (CL-003) | Cliente | Contas Skip reais por pessoa/área substituem os perfis sintéticos de teste (@pcp.local) |
| Ficha técnica do Omie | Consultor/cliente | Quando a API expuser o contrato, ficha entra no catálogo (hoje: estado explícito) |
| **Escopo da Fase 2** | Consultor | Nenhum pacote de Fase 2 existe no repositório — SPECs/tasks precisam ser definidas antes de implementar |

**Próxima fase:** aguardando pacote de Fase 2 do consultor (regra do handoff — não iniciada por conta própria).
