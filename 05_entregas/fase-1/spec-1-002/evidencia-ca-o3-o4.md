# Evidência — SPEC-1-002 · CA-O3/O4 (Recuperar atualizações interrompidas do Omie)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: ce435e2a-d6ae-4124-9e1e-4e67528dd1e8
- Versões do projeto Skip 62774: 0.0.22–0.0.23 (QA nativo ok em ambas)

## Autorização

- Continuidade autorizada pelo owner ("continue e nao pergunte mais", 11:48), no recorte da SPEC.

## Implementado (v0.0.22)

Retry de falha **transitória** em **etapas separadas** (a SPEC proíbe dormir dentro de
hook/transação):

| Tentativa | Resposta | Efeito |
|---|---|---|
| 1 | `{ok:false, retry:true, tentativa:1, proxima_em_ms:2000}` | execução/cursor mantidos; lease renovado |
| 2 | `{ok:false, retry:true, tentativa:2, proxima_em_ms:5000}` | idem |
| 3 | `{ok:false, encerrada:true}` | execução → `falha`; lote anterior permanece ativo |

- 401/403 (`autenticacao_recusada`): **sem retry** — encerra na primeira (regra da SPEC).
- Execução em falha não avança mais (`400 Execucao_em_falha`).
- Lote anterior permanece **ATIVO** em todo o ciclo (id conferido antes/depois: `to90avkeim4weji`);
  `estado_tecnico=falha_pagina_2`; `total_itens=4` — **nenhum zero inventado, nenhum sucesso falso**.

## Prova executada (HTTP; injeção via secret temporário `PCP_SIMULAR_FALHA_PAGINA=2`, removido depois)

1. `lote_ativo` antes: `to90avkeim4weji` · execução 182kf0mumffur2k (geração 6)
2. pág1 ok → pág2 retry(1, 2000ms) → retry(2, 5000ms) → encerrada
3. pós-falha: `sync/pagina` → 400; estado: lote_ativo **igual ao anterior**, total 4, `falha_pagina_2`
4. **Recuperação (CA-O4)**: nova execução ow1c8ihphnlq981 (geração 7) → pág1(2) → pág2(2) →
   pág3(fim) → `lote_ativado=true`; estado final `ok`, total 4, lote novo `e3lfrjq66yotr3o`,
   `ultimo_sucesso` preenchido; chamada seguinte → `{ja_concluida:true}` (sem nova leitura);
   guarda de execução antiga/superada → 400.

## Regressão final (v0.0.23)

- Bateria de acesso T1–T8 + SYNC: **todos passaram** (contador 10/9 inclui pré-checagem T7);
- `/api/health` 200;
- QA nativo do Skip (0.0.22, 0.0.23): setup/staticAnalysis/build/integrations/test = ok;
- secrets não-sistema: apenas `PCP_TEST_PASSWORD` (injeção de falha removida após a prova);
- suíte `tests/pcp/spec-1-002.test.mjs` reescrita para os cenários de recuperação (env-gated).

## Teste humano (roteiro — sem pergunta bloqueante, conforme instrução do owner)

1. No preview, logado com usuario-teste-pcp@pcp.local, o Painel continua mostrando Estoque
   com 4 linhas do lote ativo (dados de demonstração).
2. O executor demonstra uma falha simulada: o painel mantém o lote anterior e o diagnóstico
   registra `falha_pagina_2` — nenhuma linha some, nenhum zero é inventado.
3. Integração real segue aguardando CL-001 (OMIE_APP_KEY/SECRET); hoje o modo é mock de
   homologação identificado.
