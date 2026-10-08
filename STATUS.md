> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000) e acesso (SPEC-1-001) concluídos e aceitos; **SPEC-1-002 (Omie) concluída e validada pelo owner** (leitura real 1055 itens reconciliados, conferência 1055=1055, credencial inválida sem retry, recuperação provada); **SPEC-1-003 (Nuvemshop) 3/3 tasks implementadas com dados REAIS** — CA-N1/N2 validada; CA-N3 (vínculo só por referência comprovada, `duplicados_oficiais=0`) e CA-N1–N4 (transições reais provadas entre gerações) aguardando teste humano; SPEC-1-004 aguarda cadastro de produtos no ERP; SPEC-1-005 por último.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).

18 tasks: 10 concluídas (55,6%), 2 em andamento (implementadas com dados reais, aguardando teste humano), 6 abertas.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Teste humano** — 2 evidências da SPEC-1-003 (CA-N3 e CA-N1–N4; roteiros em 05_entregas/fase-1/spec-1-003/) | Conclusão da leva de pedidos | **Cliente/champion** |
| **Referência de vínculo** — integração atual Nuvemshop→Omie não grava `codigo_pedido_integracao` | Vínculo consolidado (quando a referência existir, o índice liga sozinho, sem mudança de código) | **Consultor** (lacuna registrada) |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real por pessoa | **Cliente** |
| **Cadastro Omie vazio** — recurso produtos com 0 registros na conta | SPEC-1-004 (catálogo/fichas) | **Cliente** (povoar cadastro no ERP) |

~~CL-001~~ **RESOLVIDO 2026-10-08 13:19** · ~~CL-002~~ **RESOLVIDO 2026-10-08 13:40** — credenciais como secrets do projeto; integrações reais provadas e reconciliadas.

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL**: sync/iniciar·pagina·estado + conferir-fonte; allowlist de consulta, lease 5min + geração, upsert idempotente por chave de origem, ativação atômica por lote, fim por metadatagem, retry transitório em etapas separadas com janela "Aguarde N segundos" respeitada, 401/403 sem retry, lote anterior intacto em falha, recuperação conclui uma vez, conferência com contagem reconciliada (1055=1055).
- **Sync Nuvemshop REAL**: 3344 pedidos (geração 2); classificação na precedência da SPEC; **transições reais provadas** (4 pendentes→cancelados, 1 pendente→pago entre gerações, atualização única idempotente, `duplicados_oficiais=0`); falha do Omie (pág. 29/54 do lote oficial de pedidos) não ocultou listas nem lotes anteriores; visão por área com aviso de total não consolidável; sem escrita nos canais.

**Próxima ação:** teste humano das 2 evidências da SPEC-1-003 (roteiros em 05_entregas/fase-1/spec-1-003/) — o lote oficial omie:pedidos (págs. 30–54) é retomado pelo cursor no próximo ciclo/cron; SPEC-1-004 destrava com o cadastro de produtos no ERP.
