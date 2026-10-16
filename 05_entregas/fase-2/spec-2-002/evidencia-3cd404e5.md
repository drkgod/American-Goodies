# Evidência — Task 3cd404e5: Construir o calendário e a OP digital (SPEC-2-002, CA-P1/P2/P3, recorte sintético)

- **Data**: 2026-10-16 · Executor: MCC (ETHOS) · Ciclo contínuo autorizado pelo owner ("continue", 08:40 BRT)
- **Versões Skip**: 0.0.82 (contrato+testes, QA ok) → **0.0.83** (tela /planejamento, QA ok)
- **Produção**: https://mcc-automacao-fabrica-98125.goskip.app — **publicada v0.0.83, ref f2c1bdb** (11:46 UTC; skip_project_status: lastPublishedRef = f2c1bdb = versionHash)

## Escopo entregue (recorte sintético — zero chamada a ERP)

1. **Contrato** `src/lib/pcp/planejamento.ts`: criarCalendario (semana sintética: 3 dias cookies + 2 exclusivos, banner permanente), avaliarLinha (capacidade por produto/dia; fração do RECURSO acumula todos os produtos no mesmo recurso|data — T2: A 0,5 + B 0,5 = 1,0 aceito, 1,02 recusado; sem somar unidades diferentes), validarRascunho (capacidade null/lote ≤0/rascunho vazio bloqueiam publicação; rascunho permanece), publicarProgramacao (exige ação publica_programacao → negado sem pistas; conflito de versão 409 sem sobrescrever; publicação atômica gera OPs fatiadas por capacidade diária, todas vinculadas à mesma versão e contexto 'sintetico').
2. **Tela** `/planejamento` (área planejamento): calendário da semana, formulário de linha com avaliação em tempo real, rascunho com bloqueios explícitos, botão publicar (demonstração) e tabela da OP digital versionada. Banner "Tela de demonstração" permanente.
3. **Testes TDD** `tests/pcp/spec-2-002-planejamento.test.mjs`: 10 testes (T0, T1a-c, T2a-b, T3a-d — oráculos T1/T2/T3 da SPEC; T4/reprogramação fica na task 87e4af63).

## Provas

| Prova | Resultado |
|---|---|
| QA Skip (apply v0.0.83, ref f2c1bdb) | setup ok · staticAnalysis ok · build ok · integrations ok · test ran=false (sem runner na plataforma) |
| TDD local (tsx --test, cópia fiel provada por releitura) | **10/10 pass** — T1a: 100/dia ok; T1b: 400 excede; T1c: dia exclusivo recusa; T2a: fração 1,0 ok; T2b: 1,02 recusa; T3a: capacidade null bloqueia; T3b: sem ação nega; T3c: concorrência → 1 publicado v2 + 1 conflito 409; T3d: 300 UN = 3 OPs de 100 na mesma versão; T0: calendário 3+2 com banner |
| Publicação | skip_project_publish → publishedRef **f2c1bdb** (11:46:08Z); status confirma lastPublishedRef=f2c1bdb |
| Isolamento | fixtures sintéticas em planejamento.ts; nenhuma chamada de rede; contexto 'sintetico' em toda OP |
| Correção no ciclo | 1ª versão do teste tinha semântica de fração por produto — corrigida para fração por recurso|data (regra P1 da SPEC) e T1a/T3d alinhados ao oráculo "300 em 3×100"; contrato e teste regravados com patch cirúrgico e provados por releitura |

## Observação de escopo

A publicação REAL (parâmetros aprovados pelo PCP, dados reais, corrida entre duas publicações) é a task 16b8a592; a reprogramação com apontamentos (CA-P4, T4) é a task 87e4af63. Esta task entrega o fundamento sintético completo (CA-P1/P2/P3 no recorte).

## Teste humano — roteiro (bloco: planejamento sintético)

1. Abrir https://mcc-automacao-fabrica-98125.goskip.app e entrar com conta da área planejamento (ex.: keoma.targino@mccfranchising.com.br — tem consultar/editar/publicar).
2. Menu **Planejamento**: ver o calendário (3 dias cookies + 2 exclusivos) e o banner de demonstração.
3. Adicionar linha COOKIE-1 100 UN em 2026-10-13 → aceita; tentar 400 em um dia → recusa com explicação de capacidade; tentar COOKIE-1 em 2026-10-16 (exclusivo) → recusa explicando o calendário.
4. Publicar → OP digital versionada (v2) com OPs de 100 UN, todas na mesma versão; confirmar que Catálogo/Painel/Qualidade continuam funcionando.

Estado da task: no ar, aguardando teste do bloco (regra do ciclo contínuo: teste no momento certo).
