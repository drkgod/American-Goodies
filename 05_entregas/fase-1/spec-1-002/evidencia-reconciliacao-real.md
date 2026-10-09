# Evidência — SPEC-1-002 · Reconciliação real com o Omie (CL-001 recebido)

- Data: 2026-10-08 · Executor: MCC (ETHOS) · Task a5b75aca-a22e-43bd-805b-e38ffc91f304
- Versões do projeto Skip 62774: 0.0.25–0.0.32 (QA nativo ok)
- Credenciais: `OMIE_APP_KEY`/`OMIE_APP_SECRET` registradas como **secrets do projeto** (nunca em repo, log ou evidência)

## Mapeamento real confirmado na conta (probes com a credencial da conta)

| Chamada | Resultado |
|---|---|
| `ListarMovimentoEstoque` (estoque/consulta) | **10.254 movimentos em 90 dias, 206 páginas**; campos confirmados: `idProd`, `codigo_local_estoque`, `qtde`, `saldo`, `tipo`, `dtMov` |
| `PosicaoEstoque` | saldo/físico/local por produto — usado na reconciliação |
| `ListarProdutosResumido` | OK, **conta sem produtos cadastrados** nesse módulo (resposta vazia legítima — não é erro) |
| `ConsultaEstoque` | **não existe** (nome da SPEC ajustado para o real; registrado) |
| Secret inválido | 403 real: "A chave de acesso não está preenchida ou não é válida." → mapeado para `autenticacao_recusada` (sem retry) |
| Rate-limit real | "Consumo redundante detectado. Aguarde 54 segundos" — o retry em etapas separadas da SPEC cobre exatamente isso |

## Atualização REAL executada (recurso piloto: estoque)

- 22 páginas reais lidas (janela de 90 dias) → lote ativado com **1055 chaves distintas** (produto+local), IDs de 10 dígitos preservados como texto;
- segunda atualização completa (v0.0.32, geração 14): lote novo ativado, total segue 1055 — **sem duplicação**;
- posição de estoque reconstruída do último movimento por produto+local — **sem inventar local** (só chaves vistas na fonte).

## Reconciliação (CA-O1) — 3/3 bateu

| Produto/local | Lote ativo (banco) | PosicaoEstoque (Omie direto) |
|---|---|---|
| 9337429506 / 9300980125 | 10 | 10 ✓ |
| 9356970899 / 9300980125 | 0 | 0 ✓ (zero válido ≠ null) |
| 9450836386 / 9300980125 | 0 | 0 ✓ |

Locais idênticos; IDs como texto; nenhuma coerção de tipo.

## Credencial inválida (prova pedida pela task)

Secret trocado por valor inválido → 1ª página: `{ok:false, erro:autenticacao_recusada, encerrada:true}`
**sem retry** (correto). Lote anterior permaneceu ativo (1055 itens intactos). Secret restaurado;
nova execução completa confirmou recuperação (geração 14, estado ok).

## Regressão final (v0.0.32)

- T1–T7 de acesso: **7/7** · `/api/health` 200 · QA nativo ok;
- hook de diagnóstico temporário removido (v0.0.31/32);
- secrets não-sistema: `PCP_TEST_PASSWORD`, `OMIE_APP_KEY`, `OMIE_APP_SECRET` — somente servidor.

## Panes reais encontradas e corrigidas

1. `ConsultaEstoque` não existe → `ListarMovimentoEstoque` (posição reconstruída do último movimento por produto+local).
2. "produtos" na conta real está vazio — recurso aparece com lote vazio/indisponível em vez de falhar; catálogo entra na SPEC-1-004 com provedor próprio.

## Teste humano sugerido

No preview, logado com usuario-teste-pcp@pcp.local: o Estoque do painel passa a exibir os 1055
produtos/locais reais do Omie (fonte/horário em cada bloco), e uma falha simulada de credencial
mantém o painel com o lote anterior.
