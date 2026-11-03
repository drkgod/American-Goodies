# SPEC-4-001 — Produção gravando no servidor

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (PCP, cozinha, encaixotamento, expedição e câmara fria) com o Maestro; conferência na sessão final  
**Origem no escopo:**
- RQ-002 (programar → apontar → conferir → aprovar).
- Tarefa "Usar programação, apontamentos e conferências com os produtos e as contas reais" da fase 3 (SPEC-3-001, CA-3-05), ainda não construída.
- SPEC-2-002 (calendário, capacidade e programação).
- Patch de correção de 02/11/2026, aplicado em 03/11 (Skip v0.0.197), com os limites registrados em `05_entregas/fase-3/patch-2026-11-02/evidencia-patch.md`.
- P6.

**Degrau da solução:** construção mínima — as rotas e a migration já existem (patch); falta separar teste e demonstração do real, ligar as telas às rotas, levar os dados aos relatórios, aos alertas e à exportação, e apagar os arquivos de diagnóstico.

## Contexto e decisões fechadas

- **Estado atual:**
  - A migration 0046 e as rotas `/backend/v1/pcp/producao/*` estão no ar desde a v0.0.197:
    - publicar a programação, com versão e 409 em conflito;
    - registrar o apontamento por ponto, com replay/409 e retificação;
    - registrar a conferência por ação e ponto;
    - aprovar a consolidação, que prepara a ordem (`concluir_op`) em `pcp_transacoes_omie` no estado `preparada`;
    - ler o estado.
  - O contrato puro está em `07-sistemas/pcp/codigo/producao-servidor.ts`.
  - **As telas não chamam essas rotas.** A demonstração está fixa no código (não fica guardada no navegador):
    - Planejamento passa ao `planejamento.ts` as constantes `CALENDARIO_DEMO`, `RECURSOS_DEMO` e `PARAMETROS_DEMO`;
    - a conferência usa `OP_CONFERENCIA_DEMO` e as sessões de demonstração da expedição e da câmara (`src/lib/pcp/conferencia`);
    - a área da tela de conferência é trocada para `painel` (o acesso de demonstração `DEMO_CONFERENCIA` que a CA-3-05 manda tirar);
    - as telas gravam pelas funções locais `publicarProgramacao`, `registrarEvento`, `registrarConferencia` e `aprovarConsolidacao`.
  - A aprovação do PCP fica na tela `/conferencias`, no bloco "Revisão do PCP".
  - `/consolidacoes` é uma "Fila de envio ao Omie (simulação)" que repete a `/envio-omie` real.
  - O relatório de produção, consumo e perdas (SPEC-3-014) mostra "sem dados no período".
  - A regra de produção atrasada (SPEC-3-010) está sem fonte ligada.
  - A exportação (SPEC-3-016) usa uma lista fixa de coleções (`COLECOES_COMPLEMENTARES` em `exportacao.ts`) sem as coleções da 0046.
  - As rotas novas exigem ação e ponto, mas não exigem área.
  - Dois hooks de diagnóstico (`pcp_diag_*`) guardam token de reserva ou consulta ao Omie.
  - Não existe marca que separe no servidor o que é teste ou demonstração do que é real, fora da produção.
- **Estado desejado:**
  - O servidor separa teste e demonstração do real em produção, compras e faturamento.
  - As quatro telas leem e gravam pelas rotas, sem nenhuma constante de demonstração, e o Planejamento calcula com os parâmetros aprovados.
  - `/consolidacoes` mostra o estado real.
  - Relatório, regra de produção atrasada e exportação usam a produção gravada.
  - Os diagnósticos com token não existem mais.
- **Decisões já fechadas:**
  - **Teste e demonstração no servidor:**
    - as coleções de produção (0046), compras e faturamento ganham o campo `demonstracao` (booleano), por migration aditiva;
    - o servidor marca `demonstracao = true` em todo registro gravado por conta marcada como de teste no perfil e em todo registro ligado a produto de demonstração;
    - registro marcado fica fora de relatório, alerta e exportação de dados reais;
    - as rotas de autorização e de envio ao Omie recusam registro marcado com 422 `registro_de_demonstracao`, com a chave ligada ou desligada;
    - uma consolidação marcada não prepara ordem;
    - a marca de conta de teste é um campo do perfil (`teste`, por migration aditiva se não existir). O Maestro marca as contas de teste que o dono criar (CL-PEND-016) e não cria conta nem senha.
  - **Área das rotas,** além da ação e do ponto:

    | Rota | Área exigida |
    |---|---|
    | Publicar a programação | `planejamento` |
    | Registrar o apontamento | `apontar_producao` |
    | Registrar a conferência | `conferir_expedicao` |
    | Aprovar a consolidação | `painel` |
    | Ler o estado | qualquer uma das quatro |

    A tela `/conferencias` e o item do menu "Conferências" passam a aceitar `conferir_expedicao` ou `painel`, e sai a troca fixa para `painel`. Quem tem só `conferir_expedicao` confere; quem tem `painel` revisa e aprova.
  - **Planejamento:**
    - passa ao `planejamento.ts` os parâmetros aprovados de `GET /backend/v1/pcp/parametros` (capacidade, lote, horizonte e recursos);
    - o calendário vem da mesma versão aprovada. Se os parâmetros ainda não tiverem calendário, acrescente por migration aditiva o campo `dias_producao` (dias da semana de cada recurso), editável na tela Parâmetros e aprovado junto com os outros;
    - sem versão aprovada, "Publicar" fica desabilitado, com a mensagem "Parâmetros e calendário de produção ainda não aprovados";
    - a tela não importa nenhuma constante `*_DEMO`.
  - **Leitura e escrita:** a tela grava e lê só pelo cliente que chama `pb.send('/backend/v1/pcp/producao/...')`. As funções locais de gravação deixam de ser chamadas pelas telas, mas continuam nos módulos, porque os testes da fase 2 as usam. Nenhuma coleção aceita gravação direta do navegador.
  - **Atualização entre aparelhos:** a tela relê o estado a cada 30 segundos e quando volta a ter foco.
  - **Mensagens:** as mensagens de 409, 422 e falta de acesso são provisórias nesta SPEC; a SPEC-4-004 centraliza no `textos.ts`.
  - **Consolidações:**
    - a aprovação continua em `/conferencias`;
    - `/consolidacoes` passa a listar, pela rota de leitura, a ordem, as conferências de expedição e câmara, a aprovação e o estado da ordem, sem botão de envio;
    - a simulação da fila sai.
  - **Ordem no Omie:** a ordem preparada vai ao Omie pela SPEC-3-002:
    - inclusão nova com o código de integração (`cCodIntOP`) e depois a conclusão;
    - ordem que já existe no Omie, só pelo número exato.

    Se a inclusão ainda não estiver construída, ela é completada pela tarefa da fase 3 "Ligar o envio da produção ao Omie com o envio desligado e provar no simulador", antes da sessão final, pela regra das tarefas da fase 3 da SPEC-4-007.
  - **Cálculo de capacidade e calendário:** continua no `planejamento.ts`. O servidor guarda o que a tela validou.
  - **Diagnóstico:**
    - os hooks `pcp_diag_*` são apagados e nunca restaurados;
    - se apagar um deles quebrar uma rota em uso, a rota passa a ler o segredo por `$secrets.get(...)`, ou é desligada e registrada;
    - o segredo do Omie continua só nos segredos do Skip. A troca da chave do Omie fica com o dono (CL-PEND-006).
- **Bloqueios:**
  - Exercitar as rotas contra o servidor exige o usuário de teste (CL-PEND-016). Até ele existir, a prova é a do módulo puro e a da tela com o servidor simulado. A prova no servidor é feita pela SPEC-4-007.
  - Produto real depende do catálogo do Omie (CL-PEND-006).
  - Publicar programação real depende dos parâmetros aprovados (CL-PEND-001).

## Resultado observável

- O PCP publica a programação em `/planejamento` com os parâmetros aprovados, e outra pessoa vê a mesma versão em até 30 segundos.
- A cozinha e o encaixotamento apontam em `/apontamentos`.
- A expedição e a câmara fria conferem em `/conferencias`, só com a área delas.
- O PCP aprova no mesmo lugar, e a ordem aparece "preparada" em "Envio ao Omie" e em `/consolidacoes`.
- O relatório de produção mostra o que foi apontado, e a exportação traz as coleções da produção.
- O que for teste ou demonstração nunca pode ser autorizado nem enviado.
- Nada é enviado ao Omie.

## Limites e dependências

- **Inclui:**
  - marca de demonstração e recusa no envio;
  - guarda por área nas rotas e na tela de conferência;
  - Planejamento com parâmetros e calendário aprovados;
  - as quatro telas ligadas às rotas, com releitura;
  - `/consolidacoes` só leitura;
  - coleções da 0046 na exportação e na recuperação;
  - fonte do bloco de produção do relatório e da regra de produção atrasada;
  - remoção dos diagnósticos com token.
- **Fora de escopo:**
  - mudar regra de programação, apontamento, conferência, aprovação, relatório ou alerta;
  - ligar `omie_op_escrita`;
  - o visual dessas telas, que vem nas SPECs 4-002 a 4-006.
- **Entradas e pré-condições:** v0.0.197 no ar; rotas e migration 0046 do patch.
- **Saídas/artefatos:**
  - migrations aditivas;
  - hooks com guarda e marca;
  - telas ligadas;
  - `05_entregas/fase-4/spec-4-001/` com a evidência;
  - espelho dos arquivos alterados em `07-sistemas/pcp/codigo/`.
- **Dependências e responsáveis:** Maestro constrói; o dono cria o usuário de teste (CL-PEND-016) e aprova os parâmetros (CL-PEND-001).
- **Atores e permissões mínimas:**
  - PCP: publica e aprova;
  - cozinha e encaixotamento: apontam;
  - expedição e câmara fria: conferem.

  Todos pelas ações e pontos da matriz aprovada (CL-003).
- **Superfícies/arquivos/configurações afetadas:**
  - telas `/planejamento`, `/parametros` (só o calendário, se faltar), `/apontamentos`, `/conferencias` e `/consolidacoes`;
  - item "Conferências" do menu e a guarda da rota `/conferencias` em `src/App.tsx`;
  - hooks `/backend/v1/pcp/producao/*`, de compras e de faturamento (só a marca);
  - rotas de autorização e envio ao Omie (só a recusa de demonstração);
  - `exportacao.ts` e a recuperação;
  - fonte do relatório de produção e da regra de produção atrasada;
  - hooks `pcp_diag_*`.
- **Risco e plano B:** se uma tela não conseguir ler o estado do servidor, ela mostra "não foi possível carregar" com o botão "tentar de novo". Nunca volta para dado fixo.
- **Rollback ou reversão:**
  - para desfazer uma tela, reverta só a tela;
  - nunca volte a versão do Skip para antes da remoção dos `pcp_diag_*`;
  - as gravações feitas ficam no servidor;
  - não apagar registro.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Tela → `/backend/v1/pcp/producao/*` | Skip Cloud (migration 0046) | Contrato de `producao-servidor.ts` (programação com versão; apontamento por ponto com id de evento; conferência por ação e ponto; aprovação com motivo) | Conta ativa, área da tabela, ação e ponto | Apontamento com id de evento gerado na tela; o reenvio do mesmo id devolve o registro já gravado (replay); releitura a cada 30 s | 409: "outra pessoa alterou, recarregue"; 422: motivo; sem acesso: sem pistas |
| `GET /backend/v1/pcp/parametros` → Planejamento | Skip Cloud | Versão aprovada: capacidade, lote, horizonte, recursos e calendário | Área `planejamento` | — | Sem versão aprovada: "Publicar" desabilitado |
| Coleções da 0046 → relatório, alerta e exportação | Skip Cloud | Programações, apontamentos, conferências e aprovações sem a marca de demonstração | Área de cada bloco, como hoje | — | Sem registro no período: "sem dados no período" |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Publicar programação com versão desatualizada | 409, e a tela recarrega a versão atual | — | Patch 02/11 |
| RN-02 | Mesmo apontamento reenviado (mesmo id de evento) | Não duplica; a tela mostra "já registrado" | Conteúdo diferente com o mesmo id: 409 | Patch 02/11 |
| RN-03 | Chamada sem a área da tabela | Negada, sem pistas | — | P6 |
| RN-04 | Aprovação da consolidação sem as conferências obrigatórias | Recusada com o motivo | — | Patch 02/11 |
| RN-05 | Registro de demonstração ou gravado por conta de teste | Marcado; fora de relatório, alerta e exportação de dados reais; autorização e envio recusados (422 `registro_de_demonstracao`) | — | P6; regra comum 7 |
| RN-06 | Sem parâmetros aprovados | "Publicar" desabilitado, com o motivo | — | SPEC-2-002 |

## Fluxo e regras

1. Ler as quatro telas, a tela Parâmetros, os módulos de `src/lib/pcp/` que elas usam, os hooks das rotas `/backend/v1/pcp/producao/*`, as rotas de autorização e envio, `exportacao.ts` e as fontes do relatório e da regra de produção atrasada.
2. Criar a marca de demonstração, a marcação automática por conta de teste e a recusa no envio.
3. Acrescentar a guarda de área da tabela e tirar a troca fixa de área da conferência.
4. Ligar o Planejamento aos parâmetros aprovados (com o calendário, se faltar) e à rota de publicar.
5. Ligar Apontamentos, Conferências e a aprovação às rotas, com releitura.
6. Trocar `/consolidacoes` pela lista só de leitura.
7. Ligar a exportação, a recuperação, o bloco de produção do relatório e a regra de produção atrasada às coleções da 0046.
8. Apagar os `pcp_diag_*` e rodar a busca de segredo.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | PCP publica; cozinha aponta; expedição confere; PCP aprova | Ordem "preparada" em Envio ao Omie e em Consolidações; apontamento no relatório | — |
| Limite | Duas pessoas publicam a mesma versão | A segunda recebe 409 e vê a versão nova | Recarregar e publicar de novo |
| Falha | Servidor fora do ar | "Não foi possível carregar", com "tentar de novo" | Tentar de novo |
| Permissão | Pessoa só com `conferir_expedicao` tenta aprovar | Negado, sem pistas | — |
| Demonstração | Conta de teste aprova uma consolidação | Registro marcado; nenhuma ordem preparada; fora do relatório | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:**
   - esta SPEC;
   - `05_entregas/fase-3/patch-2026-11-02/evidencia-patch.md`;
   - `05_entregas/fase-2/specs/spec-2-002-planejamento-e-op-digital.md`;
   - `07-sistemas/pcp/codigo/producao-servidor.ts` e `exportacao.ts`;
   - as telas e os hooks citados, no projeto Skip 62774.
2. **Alterar somente:** o que está em "Superfícies/arquivos/configurações afetadas".
3. **Não alterar:**
   - as regras de `producao-servidor.ts` e `planejamento.ts`;
   - as funções locais de gravação, que continuam para os testes da fase 2;
   - as fórmulas do relatório e da regra de alerta;
   - as chaves de gravação no Omie;
   - os testes das fases 1 a 3.
4. **Executar nesta ordem:** marca de demonstração → guarda de área → Planejamento → Apontamentos → Conferências e aprovação → Consolidações → relatório, alerta e exportação → diagnósticos.
5. **Parar e pedir validação quando:** não há parada. Se apagar um diagnóstico quebrar uma rota, siga a decisão "Diagnóstico".
6. **Estado válido ao parar:** as telas já ligadas funcionam pelo servidor; as que faltam continuam como estavam.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. A conferência do cliente é na sessão final (SPEC-4-007). Ponto de aprovação antes disso: nenhum.
8. **Ao terminar:** registre o resultado na linha `> ` da tarefa da fase 3 "Usar programação, apontamentos e conferências com os produtos e as contas reais", em `05_entregas/fase-3/fase.md`. Ela fecha quando o catálogo real existir (SPEC-4-007).

## Checklist de execução

- [ ] Marca de demonstração nas coleções de produção, compras e faturamento; recusa no envio
- [ ] Guarda de área nas rotas e na tela de conferência, com teste de negação
- [ ] Planejamento com parâmetros e calendário aprovados; "Publicar" desabilitado sem eles
- [ ] Quatro telas pelas rotas, com releitura; nenhuma constante `*_DEMO` importada
- [ ] `/consolidacoes` só leitura
- [ ] Exportação, recuperação, relatório e regra de produção atrasada com as coleções da 0046
- [ ] Hooks `pcp_diag_*` apagados; busca de segredo com zero achados
- [ ] Regressão de `tests/pcp/` passando; evidência registrada; arquivos espelhados

## Critérios de aceite

- [ ] **CA-4-34:** registro gravado por conta de teste, ou ligado a produto de demonstração, sai com `demonstracao = true` em produção, compras e faturamento; as rotas de autorização e de envio ao Omie o recusam com 422 `registro_de_demonstracao`, com a chave ligada ou desligada; uma consolidação marcada não prepara ordem.
- [ ] **CA-4-01:** a programação publicada numa sessão aparece igual em outra, com a mesma versão, em até 30 segundos; publicar sobre versão antiga devolve 409; sem parâmetros aprovados, "Publicar" fica desabilitado com o motivo.
- [ ] **CA-4-02:** um apontamento gravado continua visível depois de fechar e abrir o navegador; o reenvio do mesmo evento não duplica.
- [ ] **CA-4-03:** a aprovação na tela de conferências, com as conferências obrigatórias, cria a ordem `concluir_op` no estado `preparada`, sem nenhuma chamada ao Omie; sem as conferências, é recusada com o motivo; `/consolidacoes` mostra a ordem e o estado, sem botão de envio.
- [ ] **CA-4-04:** cada rota de produção nega sem pistas a chamada sem a área da tabela; quem tem só `conferir_expedicao` confere e não aprova.
- [ ] **CA-4-05:**
  - as quatro telas e a tela de Planejamento não importam nenhuma constante `*_DEMO`;
  - não chamam as funções locais `publicarProgramacao`, `registrarEvento`, `registrarConferencia` e `aprovarConsolidacao`;
  - leem e gravam só por `pb.send('/backend/v1/pcp/producao/...')`;
  - a troca fixa da área da conferência não existe mais.
- [ ] **CA-4-33:**
  - a exportação e a recuperação incluem as coleções da 0046 e as contagens batem;
  - o bloco de produção do relatório e a regra de produção atrasada usam as programações e os apontamentos do servidor;
  - registro marcado como demonstração não entra em nenhum dos três.
- [ ] **CA-4-35:** os hooks `pcp_diag_*` não existem; a busca por `app_key`, `app_secret`, `OMIE_APP`, `token`, `Bearer`, `senha` e `password` em `pb_hooks/`, `pb_migrations/` e `src/`, fora de `$secrets.get(` e de nome de variável sem valor, tem zero achados.

## TDD da SPEC

Cada teste leva o código do critério no nome, e cada tarefa roda só o seu recorte com `--test-name-pattern`.

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | Varredura das telas (acha `*_DEMO`, as funções locais de gravação e nenhuma chamada a `/producao/`); guarda de área (perfil com ação e ponto, sem a área); recusa de registro de demonstração; lista de coleções da exportação; busca de segredo | `node --test tests/pcp/spec-4-001.test.mjs` antes da mudança | Falha nos CA-4-34, 04, 05, 33 e 35 | `05_entregas/fase-4/spec-4-001/red.txt` |
| GREEN | Cliente de rotas e telas testados com o servidor simulado: publicar, 409, sem parâmetros, apontar, replay, conferir, aprovar → `preparada`, consolidação de teste sem ordem, envio recusado; guarda; varredura limpa; exportação e relatório com a 0046; busca de segredo zerada | `node --test --test-name-pattern "CA-4-NN" tests/pcp/spec-4-001.test.mjs`, com o critério de cada tarefa | Passa o recorte da tarefa | `05_entregas/fase-4/spec-4-001/green-CA-4-NN.txt` |
| REFACTOR/REGRESSÃO | Testes da fase 3, do patch e da fase 4 | `node --test tests/pcp/` | Nenhuma regressão | `05_entregas/fase-4/spec-4-001/regressao.txt` |

**Dados/fixtures:**
- programação com 2 linhas;
- versão de parâmetros aprovada e outra sem aprovação;
- perfis de teste PCP, cozinha e expedição, com e sem a área, e um perfil marcado como de teste;
- uma consolidação feita por conta de teste.

**Caminhos de erro obrigatórios:** 409 de versão, replay com conteúdo diferente, 422 de validação, falta de área, servidor fora do ar, envio de registro de demonstração e sem parâmetros aprovados.  
**Evidência exigida:** saídas dos testes, versão do Skip, lista dos hooks antes e depois (sem conteúdo), saída da busca de segredo e capturas das telas com dado de demonstração.

## Teste humano do cliente

- **Origem:** CL-007 (sessão de validação final)
- **Quando:** na sessão final (SPEC-4-007), com todas as SPECs da fase no ar
- **Quem testa:** PCP, cozinha e encaixotamento, expedição e câmara fria
- **Passos:**
  1. O PCP publica uma programação.
  2. A cozinha aponta num celular.
  3. A expedição confere em outro aparelho.
  4. O PCP aprova e abre Consolidações e o relatório de produção.
- **Resultado esperado:** em até 30 segundos cada pessoa vê o que a outra fez; a ordem aparece "preparada"; o apontamento aparece no relatório.
- **Evidência do aceite:** registro em `05_entregas/fase-4/validacao-final.md`.

## Handoff e operação

- **Como demonstrar:** publicar, apontar, conferir e aprovar com dado de demonstração.
- **Como operar depois:** o PCP publica e aprova; as áreas apontam e conferem.
- **Como monitorar:** Consolidações, Envio ao Omie e o bloco de produção do relatório.
- **Pendência conhecida:** prova no servidor depende do usuário de teste (CL-PEND-016); programação real depende dos parâmetros (CL-PEND-001).

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Separar no servidor os registros de teste e de demonstração dos reais | American Goodies | SPEC-4-001 | CA-4-34 | `--test-name-pattern "CA-4-34"` | green-CA-4-34.txt | v0.0.197 | ☐ |
| id pendente | Gravar no servidor a programação publicada na tela de Planejamento | American Goodies | SPEC-4-001 | CA-4-01, CA-4-04 | `--test-name-pattern "CA-4-01\|CA-4-04"` | green-CA-4-01.txt, green-CA-4-04.txt | — | ☐ |
| id pendente | Gravar no servidor os apontamentos da cozinha e do encaixotamento | American Goodies | SPEC-4-001 | CA-4-02 | `--test-name-pattern "CA-4-02"` | green-CA-4-02.txt | — | ☐ |
| id pendente | Gravar no servidor as conferências e a aprovação da consolidação | American Goodies | SPEC-4-001 | CA-4-03, CA-4-05 | `--test-name-pattern "CA-4-03\|CA-4-05"` | green-CA-4-03.txt, green-CA-4-05.txt | — | ☐ |
| id pendente | Levar a produção gravada no servidor para os relatórios, os alertas e a exportação | American Goodies | SPEC-4-001 | CA-4-33 | `--test-name-pattern "CA-4-33"` | green-CA-4-33.txt | Tarefas anteriores desta SPEC | ☐ |
| id pendente | Tirar do sistema os arquivos de diagnóstico que guardam chave de acesso ao Omie | American Goodies | SPEC-4-001 | CA-4-35 | `--test-name-pattern "CA-4-35"` | green-CA-4-35.txt | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
