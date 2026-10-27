# SPEC-3-013 — LOOP-01: alertas críticos tratados

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (validador do loop a definir) com o Maestro; ativação só na validação final ou quando as condições forem cumpridas  
**Origem no escopo:** antiga fase 4, loop adicional LOOP-01 ("aumentar a proporção de alertas críticos tratados com ação humana registrada, medindo tratados/gerados no ciclo; baseline, alvo, janela e validador confirmados antes da ativação; sem alertas no período, resultado é não aplicável, não 100%"); demonstração "loop calcula a métrica e aguarda veredito"; RQ-014; CL-PEND-005  
**Degrau da solução:** construção mínima — mede sobre o ciclo da SPEC-3-011 e configura o loop no Maestro, desligado.

## Contexto e decisões fechadas

- **Estado atual:** depois das SPECs 3-010 e 3-011, os alertas têm gravidade e ciclo de tratamento, mas ninguém mede se os críticos são tratados.
- **Estado desejado:** a medida do LOOP-01 é calculada por ciclo e fica visível; a configuração do loop está pronta no Maestro, desligada, esperando linha de base, alvo, janela e validador.
- **Decisões já fechadas:**
  - Medida = alertas críticos tratados com ação registrada no ciclo ÷ alertas críticos gerados no ciclo.
  - Ciclo sem alerta crítico = "não aplicável", nunca 100%.
  - O loop não trata alerta, não compra, não reprograma; só mede, lembra e registra o veredito do validador.
  - O mesmo assistente pode operar o LOOP-01 e o LOOP-02 (SPEC-3-017).
- **Condição para ligar:** linha de base, alvo, janela e validador definidos pelo cliente (CL-PEND-005).
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/alertas/loop`, a gestão vê, por ciclo: críticos gerados, tratados com ação, a proporção (ou "não aplicável") e o veredito do validador. No Maestro, o LOOP-01 aparece configurado e desligado.

## Limites e dependências

- **Inclui:** cálculo da medida por ciclo; tela; registro do veredito; configuração do loop no Maestro.
- **Fora de escopo:** ativar o loop sem as condições; tratar alertas pelo loop; metas inventadas.
- **Entradas e pré-condições:** SPECs 3-010 e 3-011.
- **Saídas/artefatos:** coleção `pcp_loop_medicoes`; tela; ficha do loop em `07-sistemas/pcp/loops.md`; evidências em `05_entregas/fase-3/spec-3-013/`.
- **Dependências e responsáveis:** cliente define linha de base, alvo, janela e validador (CL-PEND-005); Maestro constrói e configura.
- **Atores e permissões mínimas:** gestão consulta; validador registra o veredito (ação `validar_loop`).
- **Superfícies/arquivos/configurações afetadas:** `/alertas/loop`; configuração de loops do Maestro.
- **Risco e plano B:** sem as condições, o loop fica desligado e a medida segue visível.
- **Rollback ou reversão:** desligar o loop; medições ficam como histórico.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Medição | Skip Cloud | Ciclo (início e fim), críticos gerados, críticos tratados com ação, proporção ou "não aplicável", veredito, validador, hora | Servidor; `validar_loop` | Uma medição por ciclo; recálculo substitui a do mesmo ciclo antes do veredito | Fonte incompleta: medição pendente |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Zero críticos no ciclo | "Não aplicável" | — | Escopo |
| RN-02 | Tratado sem ação registrada | Não conta como tratado | — | Escopo |
| RN-03 | Sem linha de base, alvo, janela ou validador | Loop desligado | — | Escopo |
| RN-04 | Veredito registrado | Medição do ciclo congelada | — | Decisão desta SPEC |

## Configuração no Maestro

- **Tipo:** loop
- **Sistemas usados:** SPEC-3-010 e SPEC-3-011
- **Agente responsável:** assistente principal do cliente no Maestro

### Meta

- **Nome curto:** LOOP-01 alertas críticos tratados
- **O que atingir:** aumentar a proporção de alertas críticos tratados com ação registrada no ciclo
- **Prazo do ciclo:** a janela definida pelo cliente (CL-PEND-005)
- **Valor estimado:** não informado

### Validação

- **Como saber que foi atingido:** proporção do ciclo igual ou acima do alvo
- **Modo:** assistente mede; humano valida
- **Fonte independente:** histórico de tratamento em `/alertas`
- **Baseline / alvo / unidade:** definidos pelo cliente; unidade = proporção do ciclo
- **Cadência:** uma medição por janela
- **Responsável pelo veredito:** validador indicado pelo cliente

### Conectores e skills

| Item | Tipo | Uso | Permissão/entrada | Saída | Plano B |
|---|---|---|---|---|---|
| Rota de medição do loop | Rota do sistema | Ler a medição do ciclo | Conta de serviço só de leitura da medição | Proporção ou "não aplicável" | Ler a tela à mão |

### Arranque

- **Instruções permanentes:** "No fim de cada janela, leia a medição do LOOP-01, mostre ao validador os alertas críticos ainda abertos e registre o veredito dele. Não trate alerta, não compre e não reprograme."
- **Primeiras tarefas:** medir o primeiro ciclo depois da ativação e pedir o veredito.
- **Autonomia:** não
- **Limites e aprovações:** só leitura e registro do veredito
- **Teto de créditos:** não definido
- **Condição de pausa/recuperação:** fonte incompleta pausa a medição até a próxima rodada

## Fluxo e regras

1. Calcular a medida por ciclo a partir do histórico de tratamento.
2. Mostrar na tela e permitir o veredito do validador.
3. Configurar o loop no Maestro, desligado.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | 10 críticos gerados, 7 tratados com ação | 70% | — |
| Limite | Zero críticos | "Não aplicável" | — |
| Falha | Alerta marcado tratado sem ação | Não conta | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; SPECs 3-010 e 3-011.
2. **Alterar somente:** medição, tela, veredito e configuração do loop.
3. **Não alterar:** regras e ciclo dos alertas.
4. **Executar nesta ordem:** medição; tela e veredito; configuração desligada.
5. **Parar e pedir validação quando:** nunca para construir; ativar só com as condições do CL-PEND-005.
6. **Estado válido ao parar:** loop desligado.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Medida por ciclo com "não aplicável".
- [ ] Tela e veredito do validador.
- [ ] Loop configurado e desligado no Maestro.
- [ ] Evidências em `05_entregas/fase-3/spec-3-013/`.

## Critérios de aceite

- [ ] **CA-3-37:** a medida do ciclo é críticos tratados com ação ÷ críticos gerados (10 e 7 = 70%); tratado sem ação não conta; ciclo sem crítico mostra "não aplicável", nunca 100%.
- [ ] **CA-3-38:** o LOOP-01 está configurado no Maestro com meta, medida, fonte e limites e fica desligado; só liga com linha de base, alvo, janela e validador definidos pelo cliente; o veredito do validador fica registrado.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.13-01: ciclo sem críticos | `node --test tests/pcp/spec-3-013.test.mjs` | "Não aplicável" | `05_entregas/fase-3/spec-3-013/` |
| RED | P3.13-02: tratado sem ação | Fixture | Não conta | Idem |
| GREEN | P3.13-03: 10 gerados, 7 tratados | Fixture | 70% | Idem |
| GREEN | P3.13-04: ativar sem condições | Configuração | Recusado; loop desligado | Idem |
| REFACTOR/REGRESSÃO | P3.13-05: provas das SPECs 3-010 e 3-011 | Testes | Verdes | Idem |

**Dados/fixtures:** ciclos de demonstração com zero, poucos e muitos críticos.  
**Caminhos de erro obrigatórios:** zero críticos, sem ação, sem condições, fonte incompleta.  
**Evidência exigida:** saída dos testes e captura da configuração desligada.

## Prova específica

Ciclo controlado com linha de base de demonstração: medir, registrar veredito e conferir o congelamento; falha de leitura da medição pausa e retoma na rodada seguinte; dado repetido não conta duas vezes.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final) e CL-PEND-005 (condições do loop)
- **Quem confere:** gestão e validador
- **O que confere:** a medida de um ciclo com os alertas do período; se as condições estiverem definidas, o loop é ligado e o primeiro veredito registrado.
- **Resultado esperado:** medida certa; loop ligado só com as condições.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/alertas/loop` e a configuração no Maestro.
- **Como operar depois:** o validador registra o veredito a cada janela.
- **Como monitorar:** proporção por ciclo.
- **Pendência conhecida:** condições do loop (CL-PEND-005).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Medir quantos alertas críticos foram tratados no ciclo | American Goodies | SPEC-3-013 | CA-3-37 | P3.13-01, P3.13-02, P3.13-03 | 05_entregas/fase-3/spec-3-013/ | — | ☐ |
| pendente | Deixar o loop dos alertas configurado e desligado no Maestro | American Goodies | SPEC-3-013 | CA-3-38 | P3.13-04, P3.13-05 | 05_entregas/fase-3/spec-3-013/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
