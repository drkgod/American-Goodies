# SPEC-3-018 — Validação final ponta a ponta com a equipe

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (aceite do dono) com o Maestro; encerramento pelo consultor  
**Origem no escopo:** AC-26-01 (um único teste, no fim, com a equipe); antiga fase 5 (matriz de validação transversal; fluxo integrado pedido → programação → produção e conferência → necessidade e compra → recebimento → preparação para faturamento; permissões, falha, timeout, duplicidade e rollback; "falha permanece pendente ou recebe aceite explícito de risco; ausência de relato não aprova"); validação final da fase 2 (tarefa 0d876150, dispensada em 26/10 e absorvida aqui); RQ-014; CL-007; CL-PEND-011  
**Degrau da solução:** validação — não cria capacidade nova; roda tudo de novo, liga as escritas autorizadas uma por vez e colhe o aceite.

## Contexto e decisões fechadas

- **Estado atual:** ao chegar aqui, as SPECs 3-001 a 3-017 estão no ar com as escritas no Omie desligadas e as provas automáticas verdes. Nenhuma SPEC teve teste humano próprio.
- **Estado desejado:** numa sessão com o dono, o PCP, a produção (cozinha e encaixotamento), a expedição e a câmara fria, Compras, o almoxarifado, o financeiro e o faturamento, as provas rodam de novo; o fluxo inteiro é feito com dados reais; o dono autoriza, uma por vez, as escritas no Omie cuja condição estiver cumprida; cada área confere a lista "o que confere" das SPECs; o aceite e as pendências ficam registrados.
- **Decisões já fechadas:**
  - Este é o único teste humano do projeto.
  - Escrita sem condição cumprida fica desligada e vira pendência; não trava o resto.
  - Uma ativação por vez, na ordem abaixo; falha numa ativação desliga só aquela chave.
  - A parte da nota de entrada só entra se tiver saído da revisão por emenda do consultor; senão, fica pendente.
  - "Pode continuar", "passou" ou "testei" fora da sessão não valem como aceite.
  - Só o consultor encerra o projeto, inclusive com pendências registradas.
- **Condição para ligar:** a de cada escrita e loop, no checklist do cliente.
- **Bloqueios:** nenhum para preparar; a sessão é marcada pelo cliente (CL-007).

### Ordem das ativações

| Ordem | O que liga | Condição (checklist) | SPEC |
|---|---|---|---|
| 1 | Conclusão da ordem de produção no Omie (`omie_op_escrita`) | Autorização do dono e ordem conferida escolhida por ele (CL-PEND-011) | 3-002 |
| 2 | Pedido de compra no Omie (`omie_pedido_compra_escrita`) | Autorização do dono; alçadas (CL-PEND-008); fornecedor e itens cadastrados no Omie (CL-PEND-013) | 3-006 |
| 3 | Pedido de venda no Omie (`omie_pedido_venda_escrita`) | Autorização do dono; unidades, tabela e frete (CL-PEND-010) | 3-009 |
| 4 | Recebimento no Omie (`omie_recebimento_escrita`) | Só se a SPEC-3-007 tiver saído da revisão (CL-PEND-007) e com autorização do dono | 3-007 |
| 5 | LOOP-01 e LOOP-02, um por vez | Linha de base, alvo, janela, validador e perguntas prioritárias (CL-PEND-005) | 3-013 e 3-017 |

## Resultado observável

O registro da sessão (`05_entregas/fase-3/validacao-final.md`) mostra: provas verdes antes e depois das ativações; o fluxo integrado feito com dados reais; cada escrita ligada ou pendente com o motivo; o que cada área conferiu; o aceite do dono e as pendências com responsável.

## Limites e dependências

- **Inclui:** regressão de todas as provas; fluxo integrado real; permissões; falha, timeout, duplicidade e reversão; ativações na ordem; listas "o que confere"; exportação e recuperação; medida dos loops; aceite global.
- **Fora de escopo:** construir o que faltar (volta para a SPEC de origem); encerrar o projeto (consultor).
- **Entradas e pré-condições:** SPECs 3-001 a 3-017 no ar; contas reais com as ações da matriz aprovada (CL-003); sessão marcada (CL-007).
- **Saídas/artefatos:** `05_entregas/fase-3/validacao-final.md`; registro das chaves ligadas com autor e hora.
- **Dependências e responsáveis:** cliente marca a sessão e cumpre as condições; dono aceita; consultor encerra; Maestro prepara e conduz.
- **Atores e permissões mínimas:** dono liga as escritas (`autorizar_escrita_omie`); cada área opera a sua parte.
- **Superfícies/arquivos/configurações afetadas:** todas as telas; chaves.
- **Risco e plano B:** falha numa ativação: desligar aquela chave, registrar e corrigir na SPEC de origem; o resto da sessão segue.
- **Rollback ou reversão:** cada chave desliga sozinha; efeito gravado no Omie exige decisão humana.

## Cobertura das fases 1 a 5 do escopo

| Fase do escopo | Sistema/loop | SPEC de origem | Cenário integrado | Evidência anterior | Prova nesta SPEC |
|---|---|---|---|---|---|
| 1 | Acesso por área, leitura do Omie e da Nuvemshop, catálogo, painel | SPEC-1-000 a 1-005 (homologadas em 08/10) | Painel e filtros com dados reais; acesso permitido e negado | `05_entregas/fase-1/` | VF-01, VF-03 |
| 2 | Calendário, programação, apontamentos, conferência, sugestões, envio ao Omie | SPEC-2-000 a 2-006 e SPECs 3-001 e 3-002 | Programar → apontar → conferir → aprovar → concluir no Omie | `05_entregas/fase-2/` | VF-01, VF-02, VF-05 |
| 3 (antiga) | Fornecedores, conversões, histórico, requisição, cotação, aprovação, entregas, recebimento, unidades, tabela, frete, volumes, fila de faturamento | SPECs 3-003 a 3-009 | Necessidade → compra → recebimento; pedido → apto → liberado | `05_entregas/fase-3/` | VF-01, VF-02, VF-04, VF-05, VF-06 |
| 4 (antiga) | Parâmetros, alertas, tratamento, sazonalidade, LOOP-01 | SPECs 3-010 a 3-013 | Alerta real tratado; medida do ciclo | `05_entregas/fase-3/` | VF-01, VF-06, VF-08 |
| 5 (antiga) | Relatórios, assistente, exportação, recuperação, LOOP-02 | SPECs 3-014 a 3-017 | Pergunta com fonte; exportação e restauração | `05_entregas/fase-3/` | VF-01, VF-03, VF-07, VF-08 |

## Matriz de validação ponta a ponta

| ID | Pré-condição | Procedimento exato | Resultado esperado | Evidência | Responsável | Ação se falhar |
|---|---|---|---|---|---|---|
| VF-01 | SPECs no ar | Rodar todas as provas das fases 1, 2 e 3 | Todas verdes | Saída das provas | Maestro | Corrigir na SPEC de origem |
| VF-02 | VF-01 verde | Fluxo integrado com um produto real: pedido → sugestão → programação → apontamento → conferência → aprovação do PCP; necessidade de insumo → requisição → cotação → aprovação → entrega → recebimento; pedido de venda → unidade, tabela, frete e volumes → apto → liberado | Cada passo registrado, sem repetir nem perder registro | `validacao-final.md` | Equipe | Pendência na SPEC de origem |
| VF-03 | Contas reais | Cada área tenta abrir uma tela e uma pergunta ao assistente de outra área | Negado sem pistas | Registro | Equipe | Corrigir a matriz ou a guarda |
| VF-04 | Simulador | Clique duplo, timeout e resposta perdida nas três escritas; desligar uma chave | Uma gravação por documento; chave desligada não grava | Saída das provas | Maestro | Corrigir na SPEC de origem |
| VF-05 | VF-01 a VF-04 | Ligar as escritas na ordem, com a condição cumprida; a primeira de cada tipo com o dono, conferida no Omie | Cada escrita ligada grava uma vez e confere; as outras seguem desligadas com o motivo | Registro das chaves | Dono e Maestro | Desligar a chave; pendência |
| VF-06 | VF-02 | Cada área percorre a lista "o que confere" das SPECs, inclusive o PCP com os números das sugestões e o catálogo | Pontos conferidos ou problemas registrados | `validacao-final.md` | Equipe | Corrigir na SPEC de origem |
| VF-07 | — | Exportar o pacote e conferir o relatório de recuperação | Contagens batem | Resumo e relatório | Gestão | Corrigir na SPEC-3-016 |
| VF-08 | Condições dos loops | Medir LOOP-01 e LOOP-02 e, com as condições cumpridas, ligar um por vez | Medida calculada; loop ligado só com as condições | Configuração e medida | Gestão e validador | Loop desligado; pendência |
| VF-09 | VF-01 a VF-08 | Registrar o aceite e as pendências | Aceite do dono; cada pendência com responsável; falha sem aceite de risco segue pendente | `validacao-final.md` | Dono | Consultor decide |

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Chaves | Skip Cloud | Chave, estado, condição, ligada por, ligada em | Só o dono | Uma ativação por vez | Falha: desliga e registra |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Condição da escrita não cumprida | Chave desligada; pendência no aceite | — | AC-26-01 |
| RN-02 | Falha sem aceite explícito de risco | Pendente | — | Escopo, antiga fase 5 |
| RN-03 | Ausência de relato | Não aprova | — | Escopo, antiga fase 5 |
| RN-04 | Aceite | Só do dono, na sessão | — | AC-26-01 |

## Fluxo e regras

1. Preparação: o Maestro roda VF-01 e VF-04, prepara o roteiro por área e a lista das condições cumpridas e pendentes, avisa o dono que a construção terminou e pede a data da sessão.
2. Sessão: VF-02, VF-03, VF-05 na ordem, VF-06, VF-07, VF-08, VF-01 de novo depois das ativações e VF-09.
3. Depois: o Maestro registra `projeto_aguardando_encerramento`, avisa o dono que o encerramento é com o consultor e para.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Condições cumpridas | Escritas ligadas; fluxo real; aceite | — |
| Limite | Notas de entrada ainda em revisão | Recebimento no Omie desligado; resto validado | Pendência |
| Falha | Gravação do pedido de compra falha | Chave desligada; lançamento manual | Correção na SPEC-3-006 |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; todas as SPECs da fase; o checklist do cliente em `04_fase-atual/`.
2. **Alterar somente:** estado das chaves, na sessão e com o dono; o registro da validação.
3. **Não alterar:** regras e código durante a sessão; correção vai para a SPEC de origem.
4. **Executar nesta ordem:** preparação (VF-01, VF-04, roteiro); sessão (VF-02 a VF-09).
5. **Parar e pedir validação quando:** qualquer ativação estiver sem a condição cumprida; não ligar.
6. **Estado válido ao parar:** chaves ligadas só onde o dono autorizou com a condição cumprida.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta é a sessão de teste da fase inteira, quando todas as SPECs estiverem no ar. Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Provas das fases 1, 2 e 3 verdes na véspera.
- [ ] Roteiro por área e lista de condições prontos.
- [ ] Fluxo integrado feito com dados reais.
- [ ] Escritas ligadas na ordem, com condição; pendências registradas.
- [ ] Listas "o que confere" percorridas.
- [ ] Exportação, recuperação e loops conferidos.
- [ ] Aceite e pendências; Maestro parado.

## Critérios de aceite

- [ ] **CA-3-47:** na véspera, todas as provas das fases 1, 2 e 3 passaram; cada área tem o roteiro do que vai conferir; a lista de condições cumpridas e pendentes de cada escrita e loop está pronta e o dono foi avisado.
- [ ] **CA-3-48:** o fluxo integrado foi feito com dados reais, do pedido à preparação para faturar, passando por programação, apontamento, conferência, compra e recebimento, sem registro repetido nem perdido.
- [ ] **CA-3-49:** cada escrita com a condição cumprida foi ligada pelo dono, uma por vez, gravou uma vez e foi conferida no Omie; escrita sem condição ficou desligada com o motivo; as provas passaram de novo depois das ativações.
- [ ] **CA-3-50:** cada área conferiu a sua lista; acesso negado fora da área; exportação e recuperação conferiram as contagens; os loops mostraram a medida e só ligaram com as condições.
- [ ] **CA-3-51:** o dono registrou o aceite na sessão, com as pendências e seus responsáveis; falha sem aceite explícito de risco ficou pendente; o Maestro registrou `projeto_aguardando_encerramento` e parou.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.18-01: ligar chave sem condição ou por outra pessoa que não o dono | Configuração | Recusado com o motivo | `validacao-final.md` |
| GREEN | P3.18-02: regressão integrada | Todas as provas das fases 1, 2 e 3 | Verdes | Idem |
| GREEN | P3.18-03: fluxo integrado real | VF-02 | Cada passo registrado | Idem |
| REFACTOR/REGRESSÃO | P3.18-04: regressão depois das ativações | Mesmas provas | Verdes | Idem |

**Dados/fixtures:** massa de teste de todas as SPECs; dados reais do dia da sessão.  
**Caminhos de erro obrigatórios:** condição não cumprida, falha de ativação, falha sem aceite de risco, ausência de relato.  
**Evidência exigida:** `validacao-final.md` e saída das provas.

## Aceite global

- **Roteiro do champion:** a matriz VF-01 a VF-09; cada área segue o seu roteiro e as listas "o que confere" das SPECs 3-001 a 3-017.
- **Aprovadores:** o dono.
- **Critério de encerramento:** CA-3-47 a CA-3-51 cumpridos; o encerramento do projeto é decisão do consultor.
- **Pendências e riscos residuais:** registrados no aceite, com responsável.
- **Decisão quando houver falha:** corrigir na SPEC de origem, ou aceite explícito de risco pelo dono; sem isso, pendente.

## Teste humano do cliente

- **Origem:** CL-007
- **Quando:** quando todas as SPECs da fase 3 estiverem no ar
- **Quem testa:** dono, PCP, cozinha e encaixotamento, expedição e câmara fria, Compras, almoxarifado, financeiro e faturamento
- **Passos:** a matriz VF-01 a VF-09; cada área segue o seu roteiro e as listas "o que confere" das SPECs 3-001 a 3-017.
- **Resultado esperado:** o fluxo inteiro funciona com dados reais; o que estiver pendente fica registrado com responsável.
- **Evidência do aceite:** aceite do dono registrado na sessão, em `validacao-final.md`.

## Handoff e operação

- **Como demonstrar:** `validacao-final.md`.
- **Como operar depois:** cada área usa as suas telas; as escritas seguem como o dono decidiu na sessão.
- **Como monitorar:** alertas, escritas em "resultado incerto" e medidas dos loops.
- **Pendência conhecida:** as que ficarem registradas no aceite.

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Preparar a sessão final: provas de ponta a ponta e roteiro de cada área | American Goodies | SPEC-3-018 | CA-3-47 | P3.18-01, P3.18-02 (VF-01, VF-04) | 05_entregas/fase-3/spec-3-018/ | SPECs 3-001 a 3-017 no ar | ☐ |
| pendente | Fazer a sessão de validação final com a equipe | American Goodies | SPEC-3-018 | CA-3-48, CA-3-49, CA-3-50, CA-3-51 | P3.18-03, P3.18-04 (VF-02 a VF-09) | 05_entregas/fase-3/spec-3-018/ | Sessão marcada pelo cliente (CL-007) | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
