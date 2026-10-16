# Evidência — Task 556da315: Construir as duas telas de conferência (SPEC-2-004, CA-C1/C2, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo (bloco anterior aprovado 09:02)
- **Versões Skip**: 0.0.86 (contrato+testes, QA ok) → **0.0.87** (tela /conferencias, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.87, ref e5eb8bd** (12:07 UTC; status: lastPublishedRef = e5eb8bd = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/conferencia.ts`: registrarConferencia (ponto sem acesso nega sem pistas; quantidade finita ≥0; conferência 0 exige motivo; câmara sem expedição eficaz da OP é bloqueada — C2; replay UUID+hash idempotente, hash diferente = 409), montarFila (quatro quantidades independentes: produzido/encaixotado/recebido/câmara; deltas preservados; ausência NUNCA vira 0 — null explícito; divergência bloqueia; igualdade decimal exata libera fila revisável SEM transação/envio — envio é gate da SPEC-2-005).
2. **Tela** `/conferencias` (área conferir_expedicao): registro das duas etapas com motivo obrigatório para 0, fila de consolidação com 4 quantidades/deltas/pendências e tabela de conferências registradas. Banner "Tela de demonstração" permanente.
3. **Testes TDD** `tests/pcp/spec-2-004-conferencia.test.mjs`: 8 testes (T0–T5, oráculos T1/T2/T3/T5 da SPEC; C4/T4 fica na task 30118f65).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.87, ref e5eb8bd) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false |
| TDD local (tsx --test) | **8/8 pass** — T1: 100/98/97/96 com deltas −2/−1/−1 e fila bloqueada; T2a: câmara sem expedição bloqueada; T2b: ponto errado nega; T2c: replay idempotente + 409; T3: tudo 100 → revisável/coincidente; T5a: 0 sem motivo negado, com motivo registra, ausência não vira 0; T5b: recebimento 1 vs produzido 0 é divergência |
| Publicação | skip_project_publish → publishedRef **e5eb8bd** (12:07:37Z); status confirma lastPublishedRef=e5eb8bd |
| Isolamento | fixtures sintéticas (OP-S-2-001 v2); nenhuma chamada de rede |

## Observação de escopo

Conferências REAIS (etapas encerradas, pontos nominais, replay em produção) são a task d77447ab; revisão de divergências e invalidação de aprovações (CA-C4, T4) é a 30118f65. Esta task entrega as duas telas com o fundamento sintético (CA-C1/C2 no recorte).

## Teste humano — roteiro (bloco: conferências sintéticas)

1. Entrar com conta da área conferir_expedicao (ex.: angela.silva@mccfranchising.com.br).
2. Menu **Conferências**: ver a fila com produzido 100 / encaixotado 98 e as duas conferências ausentes (nada preenchido com 0).
3. Tentar conferir a CÂMARA primeiro → bloqueado com explicação (a expedição precisa vir antes).
4. Conferir expedição 97 → fila mostra delta −1 e divergência; conferir câmara 96 → delta −1; fila bloqueada com pendências.
5. Conferir 0 sem motivo → negado; conferir 0 com motivo → registra e aparece como 0 explícito.
6. Confirmar que Painel/Catálogo/Qualidade/Planejamento/Apontamentos continuam funcionando.

Estado da task: no ar, aguardando teste do bloco.
