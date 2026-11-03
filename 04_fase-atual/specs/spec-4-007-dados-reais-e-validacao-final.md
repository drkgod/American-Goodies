# SPEC-4-007 — Dados reais do Omie, rotas provadas no servidor e validação final com a equipe

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (aceite do dono) com o Maestro; encerramento pelo consultor  
**Origem no escopo:** SPEC-3-018 (validação final ponta a ponta), que vem da fase 3 com as duas tarefas da sessão final (P6). Pendências de uso real das SPECs 3-001 a 3-017. RQ-014; CL-007; CL-PEND-006; CL-PEND-011; CL-PEND-016. O contrato da SPEC-3-018 está em `05_entregas/fase-3/specs/spec-3-018-validacao-final-ponta-a-ponta.md` e esta SPEC o substitui, acrescentando o que a fase 4 mudou.  
**Degrau da solução:** validação — não cria capacidade nova; usa os dados reais no que já foi construído, prova as rotas no servidor e colhe o aceite.

## Contexto e decisões fechadas

- **Estado atual:**
  - As SPECs 3-001 a 3-017 estão construídas, com as gravações no Omie desligadas. As 46 tarefas delas estão em andamento em `05_entregas/fase-3/fase.md`.
  - O que falta nelas é quase todo dado real:
    - a chave do Omie está bloqueada desde 22/10 (CL-PEND-006);
    - nenhuma rota foi chamada no servidor, porque não há usuário de teste;
    - faltam os parâmetros, as alçadas, as unidades e a matriz de acesso do cliente.
- **Estado desejado:**
  - As leituras reais do Omie rodam uma por vez, quando o dono avisar que a chave foi liberada.
  - As rotas das fases 3 e 4 são exercitadas no servidor com o usuário de teste.
  - Numa sessão com a equipe, o fluxo inteiro é feito com dados reais, no sistema já com o acabamento da fase 4.
  - O dono liga as gravações cuja condição estiver cumprida e registra o aceite.
- **Decisões já fechadas:**
  - Esta é a única sessão de teste com a equipe. A escolha do visual (SPEC-4-002) é o único ponto de aprovação antes dela.
  - **Leituras reais do Omie:** só depois de o dono avisar que o Omie liberou a chave.
    - A primeira chamada é uma consulta leve, de um produto.
    - Se vier bloqueio, a rotina para, registra a hora e não tenta de novo em laço.
    - Depois, uma leitura por vez, nesta ordem, cada uma com a conferência da sua SPEC de origem em `05_entregas/fase-3/specs/`:
      1. catálogo e lista do que falta cadastrar (3-001);
      2. 90 dias de vendas, produção e compras a receber, e as sugestões reais (3-001);
      3. fornecedores (3-003);
      4. pedidos de compra e histórico de preços (3-004);
      5. entregas (3-006);
      6. clientes e unidades (3-008);
      7. fontes dos alertas (3-010);
      8. histórico de vendas para a sazonalidade (3-012).
  - **Escritas ligadas na sessão,** pelo dono, uma por vez, na ordem, com a condição do checklist cumprida:
    1. conclusão da ordem de produção (`omie_op_escrita`, CL-PEND-011), só se a inclusão da ordem no Omie pela SPEC-3-002 estiver construída e provada no simulador; senão, fica pendente com o motivo;
    2. pedido de compra (`omie_pedido_compra_escrita`, CL-PEND-011, 008 e 013);
    3. pedido de venda (`omie_pedido_venda_escrita`, CL-PEND-011 e 010);
    4. recebimento, só se a SPEC-3-007 tiver saído da revisão (CL-PEND-007);
    5. LOOP-01 e LOOP-02, um por vez (CL-PEND-005).

    Falha numa ativação desliga só aquela chave.
  - **Tarefas da fase 3:**
    - Quando chegar a entrada que segurava uma tarefa da fase 3 (Omie liberado, parâmetro, alçada, unidade, matriz), complete a parte pendente pela SPEC de origem, em `05_entregas/fase-3/specs/`. Por exemplo, a lista do que falta cadastrar passa a cobrir ficha e pedido quando a leitura deles existir.
    - Registre o resultado na linha `> ` da tarefa em `05_entregas/fase-3/fase.md` e marque `[x]` quando as provas da SPEC de origem passarem.
    - Na sessão, cada tarefa da fase 3 que continuar `[/]` fica em `validacao-final.md` com a pendência e o responsável.
  - **Usuário de teste:**
    - tudo o que ele gravar no servidor leva a marca de demonstração e usa produto e ponto de teste;
    - nenhuma ordem ou gravação criada por ele pode ser autorizada;
    - os ids criados ficam listados na evidência.

    Para provar as negações, use o segundo usuário de teste, que tem uma área só, ou tire uma área do primeiro durante o teste e devolva depois.
  - **Contas reais:** na preparação, aplique às contas reais as ações novas da matriz aprovada (CL-003) e confira por perfil. O Maestro não cria senha nem troca a senha de ninguém.
  - "Pode continuar", "passou" ou "testei" fora da sessão não valem como aceite.
  - Só o consultor encerra o projeto, inclusive com pendências registradas.
- **Bloqueios:**
  - as leituras reais esperam CL-PEND-006;
  - a prova no servidor espera o usuário de teste (CL-PEND-016);
  - a sessão espera a data (CL-007) e as contas reais com a matriz aprovada (CL-003).

  Cada bloqueio deixa pendente só a sua parte.

## Resultado observável

O registro da sessão (`05_entregas/fase-4/validacao-final.md`) mostra:
- as leituras reais feitas, com as conferências;
- as provas verdes antes e depois das ativações;
- o fluxo integrado feito com dados reais;
- cada gravação ligada, ou pendente com o motivo;
- o que cada área conferiu, inclusive o visual e o celular;
- o aceite do dono e as pendências com responsável.

## Limites e dependências

- **Inclui:**
  - leituras reais na ordem;
  - prova das rotas no servidor;
  - espelho dos hooks e migrations;
  - regressão das fases 1 a 4;
  - fluxo integrado real;
  - permissões;
  - ativações na ordem;
  - listas "o que confere" das SPECs 3-001 a 3-017 e 4-001 a 4-006;
  - exportação e recuperação com dados reais;
  - medida dos loops;
  - aceite.
- **Fora de escopo:** construção nova fora do contrato das SPECs 3-001 a 3-017 e 4-001 a 4-006 (vai ao consultor); encerrar o projeto (consultor). O que faltar construir dessas SPECs é feito pela tarefa de origem, pela regra das tarefas da fase 3 — por exemplo, Sugestões e Qualidade ligadas aos dados reais (SPEC-3-001).
- **Entradas e pré-condições:** SPECs 4-001 a 4-006 no ar; CL-PEND-006, CL-PEND-016, CL-003 e CL-007 conforme a parte.
- **Saídas/artefatos:**
  - `05_entregas/fase-4/spec-4-007/` com as conferências das leituras e a prova das rotas;
  - `05_entregas/fase-4/validacao-final.md`;
  - registro das chaves ligadas, com autor e hora.
- **Dependências e responsáveis:**
  - o cliente libera o Omie, cria o usuário de teste, aprova a matriz e marca a sessão;
  - o dono aceita;
  - o consultor encerra;
  - o Maestro prepara e conduz.
- **Atores e permissões mínimas:** o dono liga as gravações (`autorizar_escrita_omie`); cada área opera a sua parte.
- **Superfícies/arquivos/configurações afetadas:** todas as telas; as chaves; as rotinas de leitura.
- **Risco e plano B:**
  - Bloqueio do Omie de novo: parar e registrar, e a sessão segue com o que já foi lido.
  - Falha numa ativação: desligar a chave, registrar e corrigir na SPEC de origem.
- **Rollback ou reversão:** cada chave desliga sozinha. Efeito gravado no Omie exige decisão humana.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → leituras | Omie | Contratos em `07-sistemas/pcp/contratos-fase-3.md` | Segredo só no backend | Um sub-lote por vez, com pausa e retomada; espera de 60 s antes de repetir a mesma consulta | Bloqueio: para, registra a hora e mantém o último dado |
| Chaves | Skip Cloud | Chave, estado, condição, ligada por, ligada em | Só o dono | Uma ativação por vez | Falha: desliga e registra |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Condição da gravação não cumprida | Chave desligada; pendência no aceite | — | AC-26-01 |
| RN-02 | Falha sem aceite explícito de risco | Pendente | — | Escopo, antiga fase 5 |
| RN-03 | Ausência de relato | Não aprova | — | Escopo, antiga fase 5 |
| RN-04 | Aceite | Só do dono, na sessão | — | AC-26-01 |
| RN-05 | Omie sem o aviso de liberação do dono | Nenhuma chamada ao Omie | — | Patch 02/11; CL-PEND-006 |

## Cobertura das fases 1 a 5 do escopo

| Fase do escopo | Sistema/loop | SPEC de origem | Cenário integrado | Evidência anterior | Prova nesta SPEC |
|---|---|---|---|---|---|
| 1 | Acesso por área, leitura do Omie e da Nuvemshop, catálogo, painel | SPEC-1-000 a 1-005 (homologadas em 08/10) | Painel e filtros com dados reais; acesso permitido e negado | `05_entregas/fase-1/` | VF-00, VF-01, VF-03 |
| 2 | Calendário, programação, apontamentos, conferência, sugestões, envio ao Omie | SPEC-2-000 a 2-006, SPECs 3-001, 3-002 e 4-001 | Programar → apontar → conferir → aprovar → concluir no Omie | `05_entregas/fase-2/` | VF-01, VF-02, VF-05 |
| 3 (antiga) | Fornecedores, conversões, histórico, requisição, cotação, aprovação, entregas, recebimento, unidades, tabela, frete, volumes, fila de faturamento | SPECs 3-003 a 3-009 | Necessidade → compra → recebimento; pedido → apto → liberado | `05_entregas/fase-3/` | VF-00, VF-02, VF-04, VF-05, VF-06 |
| 4 (antiga) | Parâmetros, alertas, tratamento, sazonalidade, LOOP-01 | SPECs 3-010 a 3-013 | Alerta real tratado; medida do ciclo | `05_entregas/fase-3/` | VF-00, VF-06, VF-08 |
| 5 (antiga) | Relatórios, assistente, exportação, recuperação, LOOP-02 | SPECs 3-014 a 3-017 | Pergunta com fonte; exportação e restauração | `05_entregas/fase-3/` | VF-03, VF-07, VF-08 |
| 4 (P6) | Produção no servidor e acabamento | SPECs 4-001 a 4-006 | Cada área no aparelho que usa | `05_entregas/fase-4/` | VF-01, VF-02, VF-09 |

## Matriz de validação ponta a ponta

| ID | Pré-condição | Procedimento exato | Resultado esperado | Evidência | Responsável | Ação se falhar |
|---|---|---|---|---|---|---|
| VF-00 | Aviso do dono de que o Omie liberou a chave | Leituras reais na ordem da decisão fechada, cada uma com a conferência da SPEC de origem | Cada leitura conferida, ou pendente com o motivo | `spec-4-007/leituras.md` | Maestro | Parar a leitura; pendência |
| VF-01 | SPECs no ar e os dois usuários de teste | Rodar as provas das fases 1 a 4 e exercitar no servidor cada rota das fases 3 e 4, com os casos de negação; tudo gravado com a marca de demonstração. As rotas que mudam configuração oficial (`/parametros/aprovar`, `/alertas/regra`, `/faturamento/tabela-preco`, `/faturamento/unidade`, `/faturamento/nome-canal/decidir`) são exercitadas só no caso de negação | Todas verdes; nenhum registro de teste sem a marca, autorizável ou visto como real em Envio ao Omie, Requisições ou Preparação de pedidos | Saída das provas, lista de rotas exercitadas e ids criados | Maestro | Corrigir na SPEC de origem |
| VF-02 | VF-01 verde | Fluxo integrado com um produto real, em três trechos: pedido → sugestão → programação → apontamento → conferência → aprovação do PCP; necessidade de insumo → requisição → cotação → aprovação → entrega → recebimento; pedido de venda → unidade, tabela, frete e volumes → apto → liberado. Se Sugestões ainda não estiver ligada aos dados reais, o primeiro trecho começa na programação e a sugestão fica pendente com o motivo | Cada passo registrado, sem repetir nem perder registro | `validacao-final.md` | Equipe | Pendência na SPEC |
| VF-03 | Contas reais | Cada área tenta abrir uma tela de outra área e fazer ao assistente uma pergunta dela | Negado sem pistas; o menu não mostra a tela | Registro | Equipe | Corrigir a matriz ou a guarda |
| VF-04 | Simulador | Clique duplo, timeout e resposta perdida nas três gravações; pedido alterado depois da autorização (409 `pedido_alterado_apos_autorizacao`); nova tentativa depois de `falhou_sem_efeito`; desligar uma chave | Uma gravação por documento; pedido alterado recusado; nova tentativa só com nova autorização; chave desligada não grava | Saída das provas | Maestro | Corrigir na SPEC de origem |
| VF-05 | VF-01 a VF-04 | Ligar as gravações na ordem, com a condição cumprida; a primeira de cada tipo com o dono, conferida no Omie | Cada gravação ligada grava uma vez e confere; as outras seguem desligadas com o motivo | Registro das chaves | Dono e Maestro | Desligar a chave; pendência |
| VF-06 | VF-02 | Cada área percorre a lista "o que confere" das SPECs 3-001 a 3-017; cada tarefa da fase 3 recebe `[x]` com evidência ou continua `[/]` com a pendência e o responsável | Pontos conferidos ou problemas registrados; nenhuma tarefa da fase 3 sem destino | `validacao-final.md` e `05_entregas/fase-3/fase.md` | Equipe e Maestro | Corrigir na SPEC de origem |
| VF-07 | — | Exportar o pacote com os dados reais e conferir o relatório de recuperação | Contagens batem | Resumo e relatório | Gestão | Corrigir na SPEC-3-016 |
| VF-08 | Condições dos loops | Cadastrar no Maestro o LOOP-01 e o LOOP-02, desligados, se ainda não estiverem; medir os dois e, com as condições cumpridas, ligar um por vez | Medida calculada; loop ligado só com as condições | Configuração e medida | Gestão e validador | Loop desligado; pendência |
| VF-09 | SPECs 4-002 a 4-006 no ar | Cada área, no aparelho que usa, segue o "Teste humano do cliente" das SPECs 4-001 a 4-006 | Cada pessoa acha as suas telas, entende as palavras e registra no celular sem zoom nem rolagem lateral | `validacao-final.md` | Equipe | Corrigir na SPEC de origem |
| VF-10 | VF-00 a VF-09 | Rodar VF-01 de novo e registrar o aceite e as pendências | Provas verdes; aceite do dono; cada pendência com responsável; falha sem aceite de risco segue pendente | `validacao-final.md` | Dono | Consultor decide |

## Fluxo e regras

1. **Leituras reais:** quando o dono avisar que o Omie liberou a chave, rodar VF-00.
2. **Prova no servidor:** quando o usuário de teste existir:
   - exercitar as rotas;
   - rodar as provas das fases 1 a 4;
   - espelhar em `07-sistemas/pcp/codigo/` os hooks e as migrations ainda sem espelho (VF-01).
3. **Preparação da sessão:**
   - aplicar às contas reais as ações da matriz aprovada e conferir por perfil;
   - rodar VF-01 e VF-04;
   - preparar o roteiro por área e a lista das condições cumpridas e pendentes;
   - avisar o dono que está tudo pronto e pedir a data.
4. **Sessão:** VF-02, VF-03, VF-05 na ordem, VF-06, VF-07, VF-08, VF-09 e VF-10.
5. **Depois:** registrar `projeto_aguardando_encerramento`, avisar o dono que o encerramento é com o consultor e parar.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Omie liberado, usuário de teste, matriz aprovada | Leituras conferidas; gravações ligadas; fluxo real; aceite | — |
| Limite | Omie ainda bloqueado na data da sessão | Sessão com o que não depende do Omie; leituras e gravações pendentes | Nova sessão curta depois da liberação |
| Falha | Gravação do pedido de compra falha | Chave desligada; lançamento manual | Correção na SPEC-3-006 |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:**
   - esta SPEC;
   - as SPECs da fase 4;
   - as SPECs da fase 3 em `05_entregas/fase-3/specs/`;
   - o checklist do cliente em `04_fase-atual/`.
2. **Alterar somente:**
   - o estado das chaves, na sessão e com o dono;
   - as leituras reais na ordem;
   - a parte pendente das SPECs da fase 3 cuja entrada chegou, pela SPEC de origem;
   - o estado e a linha `> ` das tarefas em `05_entregas/fase-3/fase.md`;
   - as ações das contas reais pela matriz aprovada;
   - o espelho dos hooks e migrations;
   - os registros da validação, atualizando `05_entregas/fase-3/spec-3-018/preparacao-validacao-final.md` em vez de começar outro documento de preparação.
3. **Não alterar:** regras e código durante a sessão. Correção vai para a SPEC de origem.
4. **Executar nesta ordem:** VF-00 (quando houver a liberação) → VF-01 (quando houver o usuário de teste) → preparação → sessão.
5. **Parar e pedir validação quando:**
   - qualquer ativação estiver sem a condição cumprida: não ligar;
   - o Omie responder com bloqueio: parar as leituras.
6. **Estado válido ao parar:** chaves ligadas só onde o dono autorizou com a condição cumprida; leituras paradas mantêm o último dado válido.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta é a sessão de teste da fase inteira, quando todas as SPECs estiverem no ar. Ponto de aprovação antes disso: nenhum nesta SPEC.

## Checklist de execução

- [ ] Leituras reais feitas na ordem, cada uma conferida ou pendente com o motivo
- [ ] Rotas das fases 3 e 4 exercitadas no servidor com o usuário de teste
- [ ] Provas das fases 1 a 4 verdes na véspera
- [ ] Roteiro por área e lista de condições prontos; dono avisado
- [ ] Fluxo integrado feito com dados reais
- [ ] Gravações ligadas na ordem, com condição; pendências registradas
- [ ] Listas "o que confere", visual e celular conferidos
- [ ] Aceite e pendências; Maestro parado

## Critérios de aceite

- [ ] **CA-4-27:** cada leitura real da ordem foi feita uma vez, com a conferência da SPEC de origem registrada, ou ficou pendente com o motivo; nenhuma chamada ao Omie aconteceu antes do aviso do dono, e nenhum bloqueio gerou repetição em laço.
- [ ] **CA-4-28:**
  - todas as rotas das fases 3 e 4 foram chamadas no servidor com os usuários de teste, inclusive os casos de negação;
  - tudo o que eles gravaram tem a marca de demonstração e nada é autorizável;
  - os ids criados estão listados na evidência;
  - as provas das fases 1 a 4 passaram.
- [ ] **CA-4-29:** na véspera:
  - VF-01 e VF-04 estavam verdes;
  - as contas reais tinham as ações da matriz aprovada, conferidas por perfil;
  - cada área tinha o roteiro;
  - o dono tinha a lista das condições cumpridas e pendentes de cada gravação e loop.
- [ ] **CA-4-30:** o fluxo integrado foi feito com dados reais, sem registro repetido nem perdido; cada gravação com a condição cumprida foi ligada pelo dono, uma por vez, gravou uma vez e foi conferida no Omie; as provas passaram de novo depois das ativações.
- [ ] **CA-4-31:**
  - cada área conferiu a sua lista, o visual e o uso no aparelho;
  - cada tarefa da fase 3 ficou `[x]` com evidência ou `[/]` com a pendência e o responsável;
  - o acesso foi negado fora da área;
  - exportação e recuperação conferiram as contagens;
  - os loops só ligaram com as condições.
- [ ] **CA-4-32:** o dono registrou o aceite na sessão, com as pendências e seus responsáveis; falha sem aceite explícito de risco ficou pendente; o Maestro registrou `projeto_aguardando_encerramento` e parou.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P4.07-01: (a) ligar uma chave com conta sem `autorizar_escrita_omie` → 403; (b) com o bloqueio do Omie registrado na fonte, nenhuma chamada sai (guarda do patch). O aviso do dono e a condição cumprida são registrados pelo Maestro em `leituras.md` e `validacao-final.md` | Teste da rota da chave e da guarda; logs do Skip (`skip_cloud_list_logs`) sem chamada ao Omie antes do registro do aviso | Recusado; nenhuma chamada | `05_entregas/fase-4/spec-4-007/red.txt` |
| GREEN | P4.07-02: rotas no servidor e regressão das fases 1 a 4 | Usuário de teste; `node --test tests/pcp/` | Verdes (CA-4-28) | `05_entregas/fase-4/spec-4-007/green.txt` |
| GREEN | P4.07-03: fluxo integrado real | VF-02 | Cada passo registrado | `validacao-final.md` |
| REFACTOR/REGRESSÃO | P4.07-04: regressão depois das ativações | Mesmas provas | Verdes | `validacao-final.md` |

**Dados/fixtures:** massa de teste de todas as SPECs; dados reais do dia; usuário de teste.  
**Caminhos de erro obrigatórios:** condição não cumprida, falha de ativação, bloqueio do Omie, falha sem aceite de risco e ausência de relato.  
**Evidência exigida:** `leituras.md`, saída das provas, lista de rotas exercitadas e `validacao-final.md`.

## Aceite global

- **Roteiro do champion:** a matriz VF-00 a VF-10. Cada área segue o seu roteiro e as listas "o que confere" das SPECs 3-001 a 3-017 e 4-001 a 4-006.
- **Aprovadores:** o dono.
- **Critério de encerramento:** CA-4-27 a CA-4-32 cumpridos. O encerramento do projeto é decisão do consultor.
- **Pendências e riscos residuais:** registrados no aceite, com responsável.
- **Decisão quando houver falha:** corrigir na SPEC de origem, ou aceite explícito de risco pelo dono. Sem isso, fica pendente.

## Teste humano do cliente

- **Origem:** CL-007
- **Quando:** quando todas as SPECs da fase 4 estiverem no ar
- **Quem testa:** dono, PCP, cozinha e encaixotamento, expedição e câmara fria, Compras, almoxarifado, financeiro e faturamento
- **Passos:** a matriz VF-02 a VF-10. Cada área segue o seu roteiro, no aparelho que usa no trabalho.
- **Resultado esperado:** o fluxo inteiro funciona com dados reais, no sistema já com a cara da American Goodies. O que estiver pendente fica registrado com responsável.
- **Evidência do aceite:** aceite do dono registrado na sessão, em `validacao-final.md`.

## Handoff e operação

- **Como demonstrar:** `validacao-final.md`.
- **Como operar depois:** cada área usa as suas telas; as gravações seguem como o dono decidiu na sessão.
- **Como monitorar:** alertas, gravações em "resultado incerto" e medidas dos loops.
- **Pendência conhecida:** as que ficarem registradas no aceite.

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Rodar as leituras reais do Omie, uma por vez, quando a chave for liberada | American Goodies | SPEC-4-007 | CA-4-27 | VF-00 | spec-4-007/leituras.md | Aviso do dono (CL-PEND-006) | ☐ |
| id pendente | Conferir no servidor todas as telas e rotas com o usuário de teste | American Goodies | SPEC-4-007 | CA-4-28 | VF-01, P4.07-02 | spec-4-007/green-CA-4-28.txt | Usuários de teste (CL-PEND-016) | ☐ |
| id pendente | Preparar a sessão final: provas de ponta a ponta e roteiro de cada área | American Goodies | SPEC-4-007 | CA-4-29 | VF-01 e VF-04 na véspera; contas pela matriz | preparacao-validacao-final.md atualizado | SPECs 4-001 a 4-006 no ar; tarefa de telas e rotas no servidor concluída; matriz aprovada (CL-003) | ☐ |
| id pendente | Fazer a sessão de validação final com a equipe | American Goodies | SPEC-4-007 | CA-4-30 a CA-4-32 | VF-02 a VF-10 | validacao-final.md | Sessão marcada (CL-007) | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
