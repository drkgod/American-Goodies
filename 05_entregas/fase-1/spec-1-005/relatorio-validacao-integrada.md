# Relatório — SPEC-1-005 · Task 0b045738: Validar o painel com a equipe (CA-P1–P5)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: 0b045738-b6a1-4188-8f22-9bc230fa2cd3 — **em andamento**: regressão integrada CONCLUÍDA (8/8); demonstração com a equipe + aceite humano pendentes (gate final da Fase 1)
- Versão do projeto Skip 62774: 0.0.58

## Bateria de regressão integrada (R1–R8, 8/8, executada em runtime contra o backend 0.0.58)

| # | Prova | Resultado |
|---|---|---|
| R1 | Health do backend | 200 |
| R2 | Autenticação + perfil (áreas no servidor) | 6 áreas, `pode_atualizar_fontes: true` |
| R3 | Fontes/lotes ativos | NS 3344 (ok) · estoque 1057 (ok) · oficiais 5393 (ok) · produtos 0 (ok) |
| R4 | Visão de pedidos (SPEC-1-003) | 270 pendentes · 2647 pagos sem vínculo · **44 vinculados** · 373 cancelados · 10 não mapeados; duplicados_oficiais **0**; total 3344 (soma exata) |
| R5 | Catálogo (SPEC-1-004) | disponível com estado explícito de cadastro vazio (nada inventado) |
| R6 | Conferência com o Omie | estoque **1057=1057** · produtos **0=0** (zero legítimo) |
| R7 | Painel completo (SPEC-1-005) | estoque 1057 (resumo por UNIDADE) · oficiais 5393 por ID único · canal idêntico à R4 ✓ |
| R8 | Amostra autorizada **M043055** | **saldo 53 UN** — idêntica à amostra do aceite da SPEC-1-002 (14:20) ✓ |

**Conclusão da regressão**: os números aceitos em cada SPEC permanecem idênticos após todas as
implementações subsequentes — zero-regressão da Fase 1.

## Roteiro de demonstração integrada (para a equipe — ~15 min)

1. **Login** (usuário do teste) → menu por área.
2. **Painel**: 4 blocos — Estoque 1.057 linhas (resumo por UN); Produção/Compras bloqueados
   com aviso "fonte não integrada na Fase 1"; Pedidos (oficiais 5.393 por ID + canal
   270/2.647/44/373/10). Conferir fonte/lote/último sucesso em cada bloco.
3. **Filtros**: item `105` no estoque → 15 linhas; `M043055` → saldo 53 UN (amostra
   autorizada); limpar → 1.057. Data invertida → erro de campo.
4. **Catálogo**: estado explícito de cadastro vazio; busca sem resultado; detalhe inexistente
   com estado específico.
5. **Pedidos (visão)**: contagens da R4; nenhuma duplicação no oficial (duplicados 0).
6. **Permissões**: entrar com o perfil de Compras → só o bloco de Compras com conteúdo;
   demais sem pistas.
7. **Falha/recuperação** (opcional, com executor): falhar uma fonte → painel mantém dado
   anterior COM aviso de lote antigo; recuperação devolve estado ok.
8. **Logout**: sessão limpa.

## Pendências conhecidas (registradas, não bloqueiam a demonstração)

- Cadastro de produtos do Omie vazio (catálogo lista quando povoado — sem mudança de código);
- Ficha técnica sem contrato exposto pela API (estado explícito);
- Matriz nominal (CL-003) para concessão de acesso real por pessoa;
- Lunet/canal da loja própria fora do escopo da Fase 1.

## Gate

**Aceite humano da equipe PENDENTE** (regra da SPEC: sem marcar por silêncio). Executar o
roteiro acima; registrar mensagem explícita de aceite ou demonstração acompanhada. Com o
aceite, a Fase 1 é declarada concluída (18/18).
