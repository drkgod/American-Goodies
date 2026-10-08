# Evidência — SPEC-1-002 · Conferência da integração (task a5b75aca, CA-O1–O4)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: a5b75aca-a22e-43bd-805b-e38ffc91f304
- Versões do projeto Skip 62774: 0.0.35–0.0.38 (QA nativo ok)

## Escopo desta task (fecha a SPEC-1-002)

Reconciliar amostra e contagens com o Omie, validar credencial inválida/timeout e conferir
ausência de segredos e de escrita no ERP — com credencial REAL (CL-001 recebido 13:19).

## 1. Reconciliação real (CA-O1) — CONFERIDA

- **Contagem**: lote ativo tem **1055 chaves** = **nTotRegistros 1055** do Omie
  (`conferir-fonte` → `resultado: conferido`, detalhe com os dois números).
- **Amostra 3/3** (banco × PosicaoEstoque direto): 9337429506 saldo 10=10; 9356970899 saldo
  0=0; 9450836386 saldo 0=0 — locais idênticos, IDs de 10 dígitos como texto, zero válido
  preservado (≠ null).
- **Fim de paginação por metadatagem** (`nTotPaginas`) — a última página real tem 5 itens e a
  regra "itens < página" a ignoraria (corrigido na v0.0.25; AP-2026-10-08-1300).

## 2. Credencial inválida e timeout (validação pedida)

- **Credencial inválida** (secret trocado por valor ruim, depois restaurado): 1ª página →
  `{ok:false, erro:autenticacao_recusada, encerrada:true}` **sem retry**; lote anterior
  permaneceu ativo (1055 itens intactos); recuperação completa confirmada depois (geração 14).
- **Timeout**: `$http.send` respeita 15s (prova com host que não responde: exceção exatamente
  em 15000ms — diag 0.0.33, removido). Falha de transporte → `falha_transporte` transitória
  (retry em etapas separadas).

## 3. Ausência de segredos e de escrita no ERP (validação pedida)

- Secrets só no servidor (`OMIE_APP_KEY/SECRET` via `$secrets`); nenhuma credencial em repo,
  UI, log ou evidência (revisão manual — scan de segredos do MCP indisponível neste repo).
- Allowlist de **consulta** (`ListarPosEstoque`, `ListarProdutosResumido`): nenhuma operação
  mutante é chamada; nenhuma transação externa realizada.

## 4. Defeito encontrado e corrigido nesta task (DEFECT-1)

A primeira versão do `conferir-fonte` (0.0.36) registrava a falha do Omie como **resultado
final** da conferência (`falha_http_500` com `esperado:0`) — a janela de consumo redundante do
Omie (HTTP 500 + "Aguarde N segundos") derrubava a conferência em vez de aguardar. Corrigido
(0.0.38): falha transitória → `retry_N` com **etapas separadas** (2s/5s, máx. 3), só registra
resultado quando concluída; lote anterior preservado em todo o ciclo. Prova: conferência
direta **conferido 1055=1055**; nova chamada durante janela ativa → `retry_1` (sem queimar
resultado) e estado anterior intacto.

## 5. Regressão final (v0.0.38)

- T1–T8 de acesso: **todos passaram**; CONF: `conferido` (1055=1055) na primeira oportunidade
  sem janela ativa; ESTADO-CONF ok; `/api/health` 200; QA nativo ok.
- Hook de diagnóstico temporário removido; secrets não-sistema: PCP_TEST_PASSWORD,
  OMIE_APP_KEY, OMIE_APP_SECRET (somente servidor).

## Teste humano (roteiro)

1. Painel → Estoque: dados reais com fonte/horário (ex.: M043055, saldo 53 — conferir no Omie).
2. Botão/ação de conferência (ou pedir ao executor): relatório deve dizer **conferido 1055=1055**.
3. Confirmar aceite da SPEC-1-002 completa (CA-O1–O4).
