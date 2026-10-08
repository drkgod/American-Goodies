> **Ordem obrigatória:** primeiro construir e aceitar o fundamento no Skip; depois proteger acesso, conectar fontes e validar o painel real. Dados de demonstração são identificados e não provam integração.

# Status operacional

**Fase atual:** 1 — Painel operacional integrado.  
**Estado:** fundamento (SPEC-1-000), acesso (SPEC-1-001), leitura Omie (SPEC-1-002) e pedidos de canais (SPEC-1-003) **concluídos e validados pelo owner** — integrações REAIS reconciliadas (estoque 1055 itens; pedidos oficiais 5393; canal 3344; 44 vínculos comprovados por referência; duplicados 0). **SPEC-1-004 (catálogo) é a próxima** — estrutura de consulta/UI sobre snapshots, com estados explícitos enquanto o cadastro do Omie estiver vazio; SPEC-1-005 (painel diário) fecha a fase.  
**Repositório:** [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), privado, branch `main`.  
**Ambiente:** Skip + MCP do Skip + Skip Cloud. **Fontes:** Omie (CL-001 ✓) + Nuvemshop (CL-002 ✓).

18 tasks: 12 concluídas (66,7%), 0 em andamento, 6 abertas.

## Bloqueios ativos (com dono da resolução)

| Bloqueio | Afeta | Quem resolve |
|---|---|---|
| **Cadastro Omie vazio** — recurso produtos com 0 registros na conta | SPEC-1-004 (catálogo/fichas) — implementação segue plano B da SPEC (estados explícitos, sem dado inventado) | **Cliente** (povoar cadastro no ERP) |
| **Matriz nominal** (CL-003) — aprovar contas Skip → áreas | Concessão de acesso real por pessoa | **Cliente** |

~~Referência de vínculo~~ **RESOLVIDA 2026-10-08 16:30** — lote oficial completo provou 2.589 referências (44 pares Nuvemshop comprovados; OH… = loja própria via Lunet).  
~~CL-001~~ **RESOLVIDO 2026-10-08 13:19** · ~~CL-002~~ **RESOLVIDO 2026-10-08 13:40** — credenciais como secrets do projeto; integrações reais provadas e reconciliadas.

## O que já está pronto e provado

- Fundamento no Skip (coleções, provider, telas com fixtures e banner).
- Acesso por área: login nativo, guarda de rotas, menu por perfil, autorização no servidor, revogação em sessão, logout limpo (T1–T8, 8/8).
- **Sync Omie REAL**: sync/iniciar·pagina·estado + conferir-fonte; allowlist de consulta (estoque, pedidos de venda), lease 5min + geração, upsert idempotente por chave de origem, ativação atômica por lote, fim por metadatagem, retry em etapas separadas com janela "Aguarde N segundos" respeitada, 401/403 sem retry, lote anterior intacto em falha, recuperação conclui uma vez, conferência com contagem reconciliada (1055=1055).
- **Pedidos de canais (SPEC-1-003) REAL**: canal Nuvemshop 3344 pedidos (geração 2) com transições reais provadas entre gerações (idempotente); lote oficial Omie 5393 pedidos (geração 9) completo; 44 vínculos comprovados por `codigo_pedido_integracao` = `numero_origem` (amostra de pares na evidência); `duplicados_oficiais 0` nos 5393; visão por área com aviso de total não consolidável; sem escrita nos canais.

**Próxima ação:** implementar SPEC-1-004 (catálogo sobre snapshots com estados explícitos de cadastro vazio) — amostra/ficha só reconciliam quando o cadastro de produtos for povoado no ERP; SPEC-1-005 fecha a fase.
