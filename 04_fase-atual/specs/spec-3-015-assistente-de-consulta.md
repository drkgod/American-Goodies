# SPEC-3-015 — Assistente de consulta, somente leitura

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (gestão) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 5 (assistente dentro da plataforma, somente leitura; respostas e sugestões contextuais com período, fonte, atualização e limites; "dados e ferramentas autorizadas por papel; perguntas não ampliam acesso"; "sem base histórica, resposta declara insuficiência"; "sugestão não executa decisão"); decisão de controle humano ("IA consulta e sugere; não pratica transações"); decisão P2 (Skip e recursos nativos); RQ-006/007  
**Degrau da solução:** nativo da plataforma — usa a IA do próprio Skip (`$ai.chat`, conferir em `skip_cloud_ai_guide`) com ferramentas de consulta que chamam as rotas de leitura já existentes, com a permissão de quem pergunta.

## Contexto e decisões fechadas

- **Estado atual:** a gestão consulta painel, sugestões, alertas e relatórios em telas separadas; não há assistente.
- **Estado desejado:** em `/assistente`, quem tem a ação `consultar_assistente` pergunta em português e recebe resposta com período, fonte, hora da atualização e limites; pergunta fora da área de quem pergunta recebe "sem acesso"; pedido de ação recebe a orientação da tela certa.
- **Decisões já fechadas:**
  - Provedor: a IA nativa do Skip; nenhum provedor externo. Se o plano do projeto não tiver IA, parar e registrar ao consultor.
  - As ferramentas do assistente só leem, pelas rotas existentes, com a sessão de quem pergunta; não há conta de serviço com acesso amplo.
  - O assistente não compra, não publica, não aprova, não libera e não grava no Omie; só sugere e aponta a tela.
  - Sem dado suficiente, a resposta diz que não há dados suficientes e qual falta.
  - Cada pergunta fica registrada (pessoa, pergunta, fontes usadas, resposta, hora) para o LOOP-02, sem segredo.
- **Bloqueios:** nenhum para construir. Uso com dados reais é leitura e pode começar logo depois de construído.

## Resultado observável

A gestão pergunta "quanto produzimos de cookie M011001 na última semana e quanto foi conferido?" e recebe os números com "fonte: apontamentos e conferências, período 19 a 25/10, atualizado às 10h12". A pessoa de Compras pergunta sobre faturamento e recebe "sem acesso". Pedido "compre 10 KG de farinha" recebe "o assistente não compra; abra Compras > Requisições".

## Limites e dependências

- **Inclui:** tela; ferramentas de leitura (painel, catálogo, sugestões, alertas, relatórios, compras, entregas, pedidos); resposta com fonte, período, hora e limites; recusa de ação; registro das perguntas; ação `consultar_assistente`.
- **Fora de escopo:** executar qualquer ação; ler dados fora das rotas; responder com dado pessoal; treinar modelo.
- **Entradas e pré-condições:** rotas de leitura das fases 1 a 3; IA nativa disponível no plano do Skip.
- **Saídas/artefatos:** rota `/backend/v1/pcp/assistente`; coleção `pcp_assistente_perguntas`; tela; evidências em `05_entregas/fase-3/spec-3-015/`.
- **Dependências e responsáveis:** dono aprova quem usa o assistente na matriz (CL-003); se a IA tiver custo à parte no plano, o dono informa o limite mensal (CL-PEND-014); Maestro constrói.
- **Atores e permissões mínimas:** `consultar_assistente`; cada ferramenta exige a área do dado.
- **Superfícies/arquivos/configurações afetadas:** `/assistente`.
- **Risco e plano B:** resposta sem fonte é descartada e substituída por "não consegui responder com fonte"; IA indisponível mostra a mensagem e as telas seguem funcionando.
- **Rollback ou reversão:** desligar a rota; nada é gravado além do registro de perguntas.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Pergunta → IA nativa | Skip | Pergunta, lista de ferramentas de leitura, instrução fixa (só leitura, citar fonte e período, declarar insuficiência) | `consultar_assistente` | Timeout de resposta com mensagem; sem repetição automática | Erro da IA: mensagem e nenhuma resposta inventada |
| Ferramentas → rotas | Rotas existentes | Mesmas rotas e filtros das telas | Sessão de quem pergunta | Só leitura | 403 vira "sem acesso" na resposta |
| Registro | Skip Cloud | Pessoa, pergunta, ferramentas usadas, fontes, resposta, hora | Servidor | Só inclusão | Sem segredo nem dado pessoal |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Resposta sem fonte ou período | Descartada; "não consegui responder com fonte" | — | Escopo, antiga fase 5 |
| RN-02 | Dado fora da área de quem pergunta | "Sem acesso", sem pistas | — | Escopo |
| RN-03 | Pedido de ação | Recusa e indica a tela | — | Decisão de controle humano |
| RN-04 | Período sem dados | "Não há dados suficientes" e o que falta | — | Escopo |
| RN-05 | Sugestão do assistente | Texto marcado como sugestão; nada é executado | — | Escopo |

## Fluxo e regras

1. A pessoa pergunta; o servidor chama a IA nativa com as ferramentas de leitura.
2. As ferramentas chamam as rotas com a sessão da pessoa.
3. O servidor confere se a resposta cita fonte e período (RN-01) e grava o registro.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Pergunta de produção da semana pela gestão | Números com fonte, período e hora | — |
| Limite | Pergunta de dezembro do ano passado sem histórico | "Não há dados suficientes" | — |
| Falha | Pessoa de Compras pergunta sobre faturamento | "Sem acesso" | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `skip_cloud_ai_guide`; as rotas de leitura existentes.
2. **Alterar somente:** rota, ferramentas, tela e registro do assistente.
3. **Não alterar:** as rotas de leitura (só chamá-las).
4. **Executar nesta ordem:** rota com a IA nativa e as ferramentas; conferência de fonte; acesso por área e recusa de ação.
5. **Parar e pedir validação quando:** o plano do Skip não tiver IA nativa; registrar em `06_notas/` e levar ao consultor.
6. **Estado válido ao parar:** telas de consulta funcionando sem o assistente.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] IA nativa conferida no plano do projeto.
- [ ] Ferramentas só de leitura com a sessão de quem pergunta.
- [ ] Resposta com fonte, período, hora e limites; descarte sem fonte.
- [ ] "Sem acesso" e recusa de ação.
- [ ] Registro das perguntas.
- [ ] Evidências em `05_entregas/fase-3/spec-3-015/`.

## Critérios de aceite

- [ ] **CA-3-41:** o assistente responde dentro da plataforma com período, fonte, hora da atualização e limites; sem dado suficiente, diz que não há e o que falta; resposta sem fonte é descartada; cada pergunta fica registrada.
- [ ] **CA-3-42:** pergunta sobre dado fora da área de quem pergunta recebe "sem acesso" sem pistas; pedido para comprar, publicar, aprovar, liberar ou enviar ao Omie recebe a orientação da tela certa; nenhuma ferramenta grava nada.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.15-01: perfil de Compras pergunta sobre faturamento | `node --test tests/pcp/spec-3-015.test.mjs` com a IA simulada | "Sem acesso" | `05_entregas/fase-3/spec-3-015/` |
| RED | P3.15-02: "compre 10 KG de farinha" | Idem | Recusa e tela indicada; zero gravação | Idem |
| RED | P3.15-03: resposta da IA sem fonte | Idem | Descartada | Idem |
| GREEN | P3.15-04: produção da semana | IA nativa no Skip com dados de demonstração | Números com fonte, período e hora | Idem |
| REFACTOR/REGRESSÃO | P3.15-05: rotas de leitura e acessos | Testes das SPECs de origem | Verdes | Idem |

**Dados/fixtures:** perguntas de demonstração por área; IA simulada nos testes locais; IA nativa no Skip para o GREEN.  
**Caminhos de erro obrigatórios:** sem acesso, pedido de ação, sem fonte, sem dados, IA indisponível.  
**Evidência exigida:** saída dos testes e registros das perguntas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** gestão e uma pessoa de outra área
- **O que confere:** três perguntas reais da gestão com fonte e período; uma pergunta fora da área de outra pessoa; um pedido de ação recusado.
- **Resultado esperado:** respostas com fonte e período que batem com as telas; acesso respeitado; nada executado.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/assistente` com uma pergunta de produção.
- **Como operar depois:** a gestão consulta no dia a dia.
- **Como monitorar:** perguntas sem fonte e erros da IA.
- **Pendência conhecida:** quem usa o assistente na matriz (CL-003) e limite de gasto, se houver (CL-PEND-014).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Abrir o assistente de consulta, só leitura, com a fonte em cada resposta | American Goodies | SPEC-3-015 | CA-3-41 | P3.15-03, P3.15-04 | 05_entregas/fase-3/spec-3-015/ | — | ☐ |
| pendente | Fazer o assistente respeitar o acesso de cada área e não executar nada | American Goodies | SPEC-3-015 | CA-3-42 | P3.15-01, P3.15-02, P3.15-05 | 05_entregas/fase-3/spec-3-015/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
