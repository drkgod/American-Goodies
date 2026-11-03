# SPEC-3-017 — LOOP-02: perguntas prioritárias respondidas com fonte

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (validador do loop a definir) com o Maestro; ativação só na validação final ou quando as condições forem cumpridas  
**Origem no escopo:** antiga fase 5, LOOP-02 ("proporção de perguntas prioritárias respondidas com fonte/período e aceitas pelo validador, em ciclo de revisão operacional"; "um assistente pode operar ambos os loops"); critério global "loops aguardam métrica e veredito"; RQ-014; CL-PEND-005  
**Degrau da solução:** construção mínima — mede sobre o registro de perguntas da SPEC-3-015 e configura o loop no Maestro, desligado.

## Contexto e decisões fechadas

- **Estado atual:** depois da SPEC-3-015, as perguntas ao assistente ficam registradas com fontes e resposta, mas não há lista de perguntas prioritárias nem revisão do validador.
- **Estado desejado:** a gestão cadastra as perguntas prioritárias; o validador revisa as respostas do ciclo; a medida do LOOP-02 aparece por ciclo; a configuração do loop está pronta no Maestro, desligada.
- **Decisões já fechadas:**
  - Medida = perguntas prioritárias respondidas com fonte e período e aceitas pelo validador ÷ perguntas prioritárias feitas no ciclo.
  - Ciclo sem pergunta prioritária = "não aplicável", nunca 100%.
  - Pergunta prioritária é a cadastrada pela gestão; o sistema liga a pergunta feita à prioritária pela escolha da pessoa ou do validador, não por adivinhação.
  - O loop só mede, lembra e registra o veredito; não responde no lugar do assistente.
- **Condição para ligar:** perguntas prioritárias, linha de base, alvo, janela e validador definidos pelo cliente (CL-PEND-005).
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/assistente/loop`, a gestão vê as perguntas prioritárias, as perguntas do ciclo ligadas a elas, a decisão do validador (aceita ou não, com motivo) e a proporção do ciclo. No Maestro, o LOOP-02 aparece configurado e desligado.

## Limites e dependências

- **Inclui:** cadastro das perguntas prioritárias; ligação da pergunta feita à prioritária; revisão do validador; medida por ciclo; configuração do loop.
- **Fora de escopo:** ativar sem as condições; responder pelo loop; ampliar o acesso do assistente.
- **Entradas e pré-condições:** SPEC-3-015.
- **Saídas/artefatos:** coleções `pcp_perguntas_prioritarias` e medições em `pcp_loop_medicoes`; tela; ficha do loop em `07-sistemas/pcp/loops.md`; evidências em `05_entregas/fase-3/spec-3-017/`.
- **Dependências e responsáveis:** cliente define as perguntas, a linha de base, o alvo, a janela e o validador (CL-PEND-005); Maestro constrói e configura.
- **Atores e permissões mínimas:** gestão cadastra perguntas; validador revisa (`validar_loop`).
- **Superfícies/arquivos/configurações afetadas:** `/assistente/loop`; configuração de loops do Maestro.
- **Risco e plano B:** sem as condições, o loop fica desligado e a medida segue visível com perguntas de demonstração.
- **Rollback ou reversão:** desligar o loop; histórico mantido.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Perguntas prioritárias | Skip Cloud | Texto, área, ativa, versão | Gestão | Versão por alteração | — |
| Revisão | Skip Cloud | Pergunta feita, prioritária ligada, tem fonte e período (sim/não), aceita (sim/não), motivo, validador, hora | `validar_loop` | Uma revisão por pergunta | Sem motivo na recusa: recusado |
| Medição | Skip Cloud | Ciclo, prioritárias feitas, aceitas, proporção ou "não aplicável", veredito | Servidor | Uma por ciclo | Fonte incompleta: pendente |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Zero perguntas prioritárias no ciclo | "Não aplicável" | — | Escopo |
| RN-02 | Resposta sem fonte ou período | Não conta como aceita | — | Escopo |
| RN-03 | Sem as condições do CL-PEND-005 | Loop desligado | — | Escopo |

## Configuração no Maestro

- **Tipo:** loop
- **Sistemas usados:** SPEC-3-015
- **Agente responsável:** assistente principal do cliente no Maestro (o mesmo do LOOP-01, se a missão e as permissões forem compatíveis)

### Meta

- **Nome curto:** LOOP-02 perguntas respondidas com fonte
- **O que atingir:** aumentar a proporção de perguntas prioritárias respondidas com fonte e período e aceitas pelo validador
- **Prazo do ciclo:** a janela definida pelo cliente (CL-PEND-005)
- **Valor estimado:** não informado

### Validação

- **Como saber que foi atingido:** proporção do ciclo igual ou acima do alvo
- **Modo:** humano valida
- **Fonte independente:** registro das perguntas e revisões
- **Baseline / alvo / unidade:** definidos pelo cliente; unidade = proporção do ciclo
- **Cadência:** uma medição por janela
- **Responsável pelo veredito:** validador indicado pelo cliente

### Conectores e skills

| Item | Tipo | Uso | Permissão/entrada | Saída | Plano B |
|---|---|---|---|---|---|
| Rota de medição do loop | Rota do sistema | Ler a medição do ciclo | Conta de serviço só de leitura da medição | Proporção ou "não aplicável" | Ler a tela à mão |

### Arranque

- **Instruções permanentes:** "No fim de cada janela, liste ao validador as perguntas prioritárias do ciclo ainda sem revisão, leia a medição do LOOP-02 e registre o veredito. Não responda perguntas no lugar do assistente."
- **Primeiras tarefas:** medir o primeiro ciclo depois da ativação e pedir o veredito.
- **Autonomia:** não
- **Limites e aprovações:** só leitura e registro do veredito
- **Teto de créditos:** não definido
- **Condição de pausa/recuperação:** fonte incompleta pausa a medição até a próxima rodada

## Fluxo e regras

1. A gestão cadastra as perguntas prioritárias.
2. As perguntas feitas são ligadas às prioritárias e revisadas pelo validador.
3. A medida é calculada por ciclo; o loop fica configurado e desligado.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | 5 prioritárias feitas, 4 aceitas | 80% | — |
| Limite | Nenhuma prioritária no ciclo | "Não aplicável" | — |
| Falha | Resposta aceita sem fonte | Não conta | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; SPECs 3-013 e 3-015.
2. **Alterar somente:** perguntas prioritárias, revisão, medição e configuração do loop.
3. **Não alterar:** o assistente (SPEC-3-015).
4. **Executar nesta ordem:** perguntas e revisão; medição; configuração desligada.
5. **Parar e pedir validação quando:** nunca para construir; ativar só com as condições do CL-PEND-005.
6. **Estado válido ao parar:** loop desligado.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Perguntas prioritárias e revisão do validador.
- [ ] Medida por ciclo com "não aplicável".
- [ ] Loop configurado e desligado.
- [ ] Evidências em `05_entregas/fase-3/spec-3-017/`.

## Critérios de aceite

- [ ] **CA-3-45:** a medida do ciclo é prioritárias aceitas com fonte e período ÷ prioritárias feitas (5 e 4 = 80%); resposta sem fonte não conta; ciclo sem prioritária mostra "não aplicável"; o validador registra aceite ou recusa com motivo.
- [ ] **CA-3-46:** o LOOP-02 está configurado no Maestro com meta, medida, fonte e limites e fica desligado; só liga com as perguntas prioritárias, a linha de base, o alvo, a janela e o validador definidos pelo cliente.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.17-01: ciclo sem prioritárias | `node --test tests/pcp/spec-3-017.test.mjs` | "Não aplicável" | `05_entregas/fase-3/spec-3-017/` |
| RED | P3.17-02: aceita sem fonte | Fixture | Não conta | Idem |
| GREEN | P3.17-03: 5 feitas, 4 aceitas | Fixture | 80% | Idem |
| GREEN | P3.17-04: ativar sem condições | Configuração | Recusado; desligado | Idem |
| REFACTOR/REGRESSÃO | P3.17-05: provas das SPECs 3-013 e 3-015 | Testes | Verdes | Idem |

**Dados/fixtures:** perguntas prioritárias e revisões de demonstração.  
**Caminhos de erro obrigatórios:** zero prioritárias, sem fonte, sem condições, recusa sem motivo.  
**Evidência exigida:** saída dos testes e captura da configuração desligada.

## Prova específica

Ciclo controlado com perguntas de demonstração: revisar, medir, registrar o veredito e conferir o congelamento; falha de leitura da medição pausa e retoma; pergunta repetida no mesmo ciclo conta uma vez por revisão.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final) e CL-PEND-005 (condições do loop)
- **Quem confere:** gestão e validador
- **O que confere:** as perguntas prioritárias cadastradas, a revisão das respostas da sessão e a medida; se as condições estiverem definidas, o loop é ligado.
- **Resultado esperado:** medida certa; loop ligado só com as condições.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/assistente/loop` e a configuração no Maestro.
- **Como operar depois:** o validador revisa as respostas a cada janela.
- **Como monitorar:** proporção por ciclo.
- **Pendência conhecida:** condições do loop (CL-PEND-005).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Medir as perguntas prioritárias respondidas com fonte e período | American Goodies | SPEC-3-017 | CA-3-45 | P3.17-01, P3.17-02, P3.17-03 | 05_entregas/fase-3/spec-3-017/ | — | ☐ |
| pendente | Deixar o loop do assistente configurado e desligado no Maestro | American Goodies | SPEC-3-017 | CA-3-46 | P3.17-04, P3.17-05 | 05_entregas/fase-3/spec-3-017/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
