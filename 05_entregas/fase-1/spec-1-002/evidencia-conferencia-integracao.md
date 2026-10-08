# Evidência — SPEC-1-002 · Task a5b75aca: Conferir a integração Omie com dados autorizados (CA-O1–O4)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: a5b75aca-a22e-43bd-805b-e38ffc91f304
- Versões do projeto Skip 62774: 0.0.29–0.0.37 (QA nativo ok em todas)

## Gaps encontrados nesta conferência e corrigidos

1. **Credencial inválida** — Omie devolve **HTTP 403** + `faultstring` "A chave de acesso não está
   preenchida ou não é válida" (probes com secret errado e key inexistente). Já coberto:
   `autenticacao_recusada` sem retry.
2. **Rate limit real** — repetição rápida → **HTTP 500** + `faultcode SOAP-ENV:Client-6`
   "Consumo redundante detectado. Aguarde N segundos (REDUNDANT)". Como 5xx, tratada como
   transitória → retry em etapas separadas — comportamento observado em produção real:
   conferência → `retry_1` → reconferência → **conferido**.
3. **Allowlist divergente** — `sync/iniciar` ainda usava `ConsultaEstoque`; unificada para
   `ListarPosEstoque` (contrato real). Recurso `produtos` marcado **NÃO reconciliado** (amostra
   vazia na conta: 0 produtos — cadastro do ERP pendente de povoamento); execução recusada com
   `recurso_nao_reconciliado` (400), sem falso sucesso.
4. **Campo `conferencia`** não existia em `pcp_lotes` (set silenciosamente ignorado) → migration 0010.

## Nova rota: POST /backend/v1/pcp/conferir-fonte

- Exige `pode_atualizar_fontes`; 1 chamada real (`ListarPosEstoque` pág. 1, 1 registro) reconcilia
  a contagem do lote ativo × `nTotRegistros`;
- registra `{esperado, conferido, resultado, detalhe, conferido_em}` no lote ativo;
- resultado ∈ {conferido, divergencia, credencial_recusada, falha_http_N, falha_transporte, retry_N};
- **lote anterior nunca alterado por falha de conferência**; sem segredo na resposta.

## Provas executadas (reais)

| Prova | Resultado |
|---|---|
| Contagem reconciliada | lote `bu8rlk4r0tpyznt` (geração 15) = **1055 itens = nTotRegistros 1055 do Omie** → `conferido` |
| Credencial inválida | 403 sem retry ✓ |
| Timeout 15s | `$http.send` respeita (prova com host blackhole: exceção em 15.04s) ✓ |
| Segredo | nenhum valor em resposta/log/repo; secrets só no servidor ✓ |
| Escrita no ERP | nenhuma operação mutante (allowlist só Listar/Consulta) ✓ |
| Lease/geração | execução retomada devolveu a MESMA execução (geração 15) e concluiu págs 3–22 do lote interrompido; replay não duplicou (1055 constante) ✓ |
| Regressão | T1–T8 (8/8) + SYNC (páginas reais de 50 itens) + ESTADO-CONF — todos passaram; health 200 |

Nota honesta: a conferência falhou 1x na regressão por rate-limit auto-infligido pelos probes de
prova (REDUNDANT); o comportamento de retry provou-se correto e a reconferência CONFERIU — a falha
era do ambiente de teste, não do código.

## Estado final do sistema

`lote_ativo bu8rlk4r0tpyznt` · `total_itens 1055` · `estado_tecnico ok` · `geracao 15` ·
`conferencia {esperado:1055, conferido:1055, resultado:"conferido"}` · sem execução em andamento.

## Pendências (próximas SPECs)

- `produtos` (ListarProdutosResumido): 0 registros na conta — reconciliar quando o cadastro do ERP
  tiver produtos (SPEC-1-004);
- Unidade não vem na posição de estoque → virá do cadastro de produtos (SPEC-1-004).

## Teste humano (roteiro)

1. No Painel, Estoque com dados reais do Omie (ex.: M043055, saldo 53, local 9300980125).
2. Conferência: `conferencia.resultado = "conferido"` com 1055 = 1055.
3. Aceite explícito da integração com dados autorizados (CA-O1–O4).
