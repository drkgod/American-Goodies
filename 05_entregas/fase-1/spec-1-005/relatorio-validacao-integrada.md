# Relatório — SPEC-1-005 · Task 0b045738: Validar o painel com a equipe (CA-P1–P5)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: 0b045738-b6a1-4188-8f22-9bc230fa2cd3 — **em andamento**: regressão integrada 8/8 + ensaio de UI em navegador real CONCLUÍDOS; demonstração com a equipe + aceite humano pendentes (gate final da Fase 1)
- Versão do projeto Skip 62774: 0.0.59

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

## Ensaio de UI em navegador real (preview 0.0.59)

- Login nativo com usuário de teste → menu por área ✓
- **Painel**: 4 blocos renderizados — estoque 1057 linhas com M043055 = 53 UN visível na
  tabela; produção/compras com bloqueio explícito; pedidos (oficiais 5393 + canal
  270/2647/44/373/10) com fonte/lote/último sucesso em cada bloco ✓
- **Filtro pela UI**: item M043055 → "Estoque — 1 linha(s)" com saldo 53 UN ✓
- **Catálogo**: estado explícito de cadastro vazio ("Lote ativo sem produtos (cadastro vazio
  na origem)") ✓
- **Home**: placeholder do template substituído por página de entrada com atalhos (v0.0.59) ✓
- **Logout**: sessão limpa, retorno ao login ✓

## Roteiro de demonstração integrada (para a equipe — ~15 min)

1. **Login** (usuário do teste) → home com atalhos e menu por área.
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

## Adendo (15/10/2026) — reconciliação D5 (task a6bf06fb)

**Natureza:** adendo datado ao relatório de validação integrada, exigido pela regra D5 da
SPEC-2-001 (documento intermediário contraditório → adendo cita a prova final; contagem histórica
não é valor eterno). O relatório original acima é preservado byte a byte — nada foi editado ou
removido, incluindo a linha do Gate que registra o aceite como PENDENTE **naquele momento**.

**Fechamento do gate registrado acima:** o aceite humano foi dado em **08/10/2026 às 18:23** pelo
owner — mensagem explícita **"validado"** — após a demonstração integrada e a regressão R1–R8 8/8.
Com esse aceite, a Fase 1 foi declarada **CONCLUÍDA (18/18, 100%)** e publicada em produção
(versões 0.0.59→0.0.61, ref 4306849; hoje v0.0.77 ref 6e05dac com as contas reais da Fase 2).

**Contagens deste relatório:** os valores registrados acima (NS 3344 · estoque 1057 · oficiais 5393
· 270/2647/44/373/10 · duplicados 0 · M043055 = 53 UN) são a prova da validação de 08/10 e
permanecem consistentes com o aceite final; não são valores eternos — leituras posteriores da Fase 2
usam as regras da SPEC-2-001 (visão de qualidade) para interpretar cobertura e completude.

**Pendências listadas acima:** a matriz nominal (CL-003) foi resolvida na Fase 2 (task 51356fad,
matriz v1.2, 14/10) e as contas reais estão ativas (task 49327a88, 21 contas com troca obrigatória).
O cadastro de produtos do Omie segue vazio como pendência do cliente (task 4e0fcf1c da Fase 2).

**Fonte:** changelog operacional de 08/10 (conclusão da Fase 1) e de 14/10 (51356fad, 49327a88).