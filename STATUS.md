> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado. **CONCLUÍDA e VALIDADA pelo owner ("validado", 18:23).**  
**Ambiente:** Skip + MCP do Skip + Skip Cloud (projeto 62774, versão 0.0.59). **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.

**18/18 tasks concluídas (100%)** — 5 SPECs com evidência e aceite; regressão integrada R1–R8 8/8; ensaio de UI em navegador real aprovado; amostra autorizada M043055 = 53 UN idêntica ao aceite original da SPEC-1-002.

## Resumo do que foi entregue

- **Fundamento** (SPEC-1-000): coleções, contratos internos, telas com fixtures e banner.
- **Acesso por área** (SPEC-1-001): login nativo, guarda de rotas, autorização no servidor, revogação em sessão, logout limpo (T1–T8 8/8).
- **Leitura Omie** (SPEC-1-002): sync real com allowlist de consulta, lease/geração, ativação atômica, retry com janela de rate-limit, recuperação por cursor, conferência reconciliada (estoque 1057=1057).
- **Pedidos de canais** (SPEC-1-003): canal Nuvemshop 3344 (transições reais provadas); oficiais 5393 por ID único; 44 vínculos comprovados por referência; duplicados 0/5393; correção honesta da tese "referência ausente" (lote completo: 2.589 refs, maioria OH… = loja própria via Lunet).
- **Catálogo** (SPEC-1-004): sobre snapshots, com estados explícitos (cadastro vazio, ficha indisponível, saldo só com área estoque), conferência 0=0 válida, divergência real de estoque detectada e reconciliada.
- **Painel diário** (SPEC-1-005): 4 blocos por área com filtros, origem/horário/lote, lote antigo com aviso, permissão por bloco sem pistas, produção/compras explicitamente não integrados na Fase 1.

## Pendências herdadas (não bloqueiam a fase concluída)

| Pendência | Dono | Efeito quando resolvida |
|---|---|---|
| Povoar cadastro de produtos no Omie | Cliente | Catálogo e saldos por produto listam automaticamente (sem mudança de código); cenários de incompletude reprovados com dados reais |
| Matriz nominal (CL-003) | Cliente | Contas Skip reais por pessoa/área substituem os perfis sintéticos de teste |
| Ficha técnica do Omie | Consultor/cliente | Quando a API expuser o contrato, ficha entra no catálogo (hoje: estado explícito) |
| Publicar em produção | Cliente/consultor | Preview aprovado; produção ainda não publicada |

**Próxima fase:** não iniciada automaticamente — passagem exige tasks, evidência e teste humano da nova fase (regra do handoff da SPEC-1-005).
