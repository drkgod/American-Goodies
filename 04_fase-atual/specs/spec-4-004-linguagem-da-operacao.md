# SPEC-4-004 — Telas na língua da operação

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (todas as áreas) com o Maestro; conferência na sessão final  
**Origem no escopo:** P6 (acabamento do sistema, 03/11/2026)  
**Degrau da solução:** construção mínima — dicionário de rótulos e mensagens num módulo só, usado por todas as telas.

## Contexto e decisões fechadas

- **Estado atual:** as telas mostram a quem usa o bastidor da construção:
  - a tela de apontamentos, que é a da cozinha, mostra os resultados dos testes automáticos como cartões, por exemplo "oráculos da SPEC-2-003 (0096ab26)", "mesmo UUID com payload diferente", "replay" e "null (bloqueia)";
  - aparecem códigos de tarefa do portal, como "(9318a299)", e códigos do método, como "CL-006", "CA-D4" e "oráculo T4";
  - aparecem termos técnicos, como "Recorte MOCK: nenhum POST real ao ERP", "lease de trabalhador único", "registra hashes" e "gate";
  - as mensagens de permissão saem em linguagem de código, como "sem editar_parametros (403)";
  - aparece "saldo ausente (null ≠ zero)";
  - duas telas têm os títulos "LOOP-01 — alertas críticos tratados" e "LOOP-02 — perguntas prioritárias respondidas com fonte";
  - o topo de cada tela tem um parágrafo explicando a regra, e há 49 trechos em fonte de código.
- **Estado desejado:**
  - Nenhuma tela mostra resultado de teste, código interno ou termo técnico.
  - Títulos, botões, mensagens e estados usam as palavras da operação.
  - A explicação de cada regra fica numa ajuda "Como funciona", fechada por padrão.
- **Decisões já fechadas:**
  - **Resultados dos testes automáticos** saem das telas. A prova continua nos testes e na evidência em `05_entregas/`.
  - **Rótulos e mensagens** ficam num módulo só (`src/lib/pcp/textos.ts`), com:
    - o dicionário de estados (código do sistema → rótulo);
    - a função de mensagem de erro (status e código → frase).

    As telas usam esse módulo e não escrevem a mensagem de erro à mão.
  - **Mensagens de erro:**

    | Situação | Mensagem |
    |---|---|
    | 401 | "Sua sessão terminou. Entre de novo." |
    | 403 | "Você não tem acesso a esta ação. Fale com o gestor." |
    | 404 | "Não encontramos este registro." |
    | 409 de versão | "Alguém alterou isto antes de você. A tela foi atualizada; confira e salve de novo." |
    | 409 `pedido_alterado_apos_autorizacao` | "O pedido mudou depois da autorização. Peça a autorização de novo." |
    | 422 com motivo do servidor | O motivo, em português; sem motivo: "Confira os campos destacados." |
    | 422 `pedido_diferente` | "A quantidade não bate com o pedido do Omie." |
    | 423 | "O envio ao Omie está desligado. Só o dono liga." |
    | 425 ou bloqueio do Omie | "O Omie pediu uma pausa. Nova tentativa às HH:MM." |
    | Falha de rede ou 5xx | "Não foi possível falar com o servidor. Tente de novo em instantes." |
  - **Palavras:**

    | Na tela hoje | Passa a ser |
    |---|---|
    | null, ausente, sem dado | "sem informação" (com o motivo, quando houver) |
    | replay, já registrado | "já registrado" |
    | MOCK, demo, demonstração | "Dados de demonstração" |
    | gate, bloqueia | "bloqueado: [motivo]" |
    | payload, hash, lease, UUID, POST, endpoint | sai da tela |
    | nomes de ação com sublinhado (como `editar_parametros`) | o nome da ação em português ("editar parâmetros") ou a mensagem do 403 |
    | "Painel operacional da Fase 1" | "Início" |
    | "LOOP-01 — alertas críticos tratados" | "Alertas críticos tratados" |
    | "LOOP-02 — perguntas prioritárias respondidas com fonte" | "Perguntas respondidas com fonte" |
  - **Explicação da regra:**
    - cada tela fica com uma frase curta de subtítulo, de no máximo 140 caracteres;
    - o resto vai para "Como funciona" (componente `collapsible`), fechado por padrão;
    - fonte de código só para código de produto ou número de pedido.
  - **Textos que vêm de fora da tela:**
    - os textos de `src/lib/pcp/` e dos hooks não mudam, porque há testes da fase 3 que os conferem;
    - a tela nunca mostra direto o `motivo` do servidor nem a mensagem de um módulo de `src/lib/pcp/`;
    - ela passa tudo pela função de erro do `textos.ts`, que mostra o texto só se ele não tiver nenhum padrão proibido do CA-4-15; senão, usa a mensagem da tabela para o status, ou a genérica.
  - **Nenhuma regra muda.** Onde uma mensagem depende de um estado, só o texto muda.
- **Bloqueios:** nenhum.

## Resultado observável

A cozinha abre Apontamentos e vê só o que precisa para apontar. Quem não tem acesso lê "Você não tem acesso a esta ação. Fale com o gestor.". As telas dos loops se chamam "Alertas críticos tratados" e "Perguntas respondidas com fonte".

## Limites e dependências

- **Inclui:**
  - tirar os cartões de teste e os códigos;
  - o módulo `textos.ts`;
  - as mensagens de erro;
  - os títulos e subtítulos;
  - "Como funciona" em cada tela que hoje tem parágrafo de regra.
- **Fora de escopo:** mudar regra, cálculo, estado ou permissão; componentes e cores (SPEC-4-005).
- **Entradas e pré-condições:** nenhuma.
- **Saídas/artefatos:**
  - `src/lib/pcp/textos.ts`;
  - telas revisadas;
  - `tests/pcp/spec-4-004.excecoes.json`, se houver exceção;
  - evidência em `05_entregas/fase-4/spec-4-004/`;
  - arquivos espelhados.
- **Dependências e responsáveis:** Maestro constrói.
- **Atores e permissões mínimas:** nenhum perfil novo.
- **Superfícies/arquivos/configurações afetadas:** todas as telas de `src/pages/` e os componentes próprios de `src/components/` (fora de `src/components/ui/`).
- **Risco e plano B:** se um texto técnico for o único jeito de a pessoa agir (por exemplo, um código que ela copia para o Omie), ele fica e entra na lista de exceções com o motivo.
- **Rollback ou reversão:** voltar a versão do Skip.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Respostas das rotas → mensagem na tela | Status e código de erro de cada rota | `status`, `codigo`, `motivo`, `proxima_tentativa` | — | — | Código desconhecido: mensagem genérica de falha, sem mostrar o código |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Texto visível com padrão proibido | O teste falha | Lista de exceções com motivo | P6 |
| RN-02 | Estado do sistema sem rótulo no dicionário | Mostra "outro estado" e registra no console | — | P6 |

## Fluxo e regras

1. Criar `textos.ts` com o dicionário de estados e a função de erro, com testes.
2. Passar tela por tela:
   - tirar os cartões de teste e os códigos;
   - trocar as mensagens pelas do módulo;
   - reescrever o título e o subtítulo;
   - mover a explicação para "Como funciona".
3. Rodar a varredura de padrões proibidos até ficar limpa.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Tela de apontamentos | Sem cartão de teste nem código; "Como funciona" fechado | — |
| Limite | Resposta 425 com hora | "O Omie pediu uma pausa. Nova tentativa às 14:30." | — |
| Falha | Código de erro desconhecido | Mensagem genérica de falha | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC e todas as telas de `src/pages/`.
2. **Alterar somente:** textos, títulos, mensagens e a posição das explicações; criar `textos.ts`.
3. **Não alterar:** regras, estados, chamadas de rota e permissões.
4. **Executar nesta ordem:** `textos.ts` → telas da produção → compras e recebimento → pedidos e faturamento → gestão → varredura.
5. **Parar e pedir validação quando:** não há parada. Texto sem equivalente claro na tabela usa a palavra mais simples que a equipe da cozinha entenderia, e entra na evidência.
6. **Estado válido ao parar:** cada tela já revisada funciona igual, só com os textos novos.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. A conferência do cliente é na sessão final (SPEC-4-007). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] `textos.ts` com dicionário e mensagens, testado
- [ ] Cartões de teste fora de todas as telas
- [ ] Títulos dos loops e da tela inicial trocados
- [ ] "Como funciona" nas telas com regra explicada
- [ ] Varredura de padrões proibidos limpa
- [ ] Regressão de `tests/pcp/` passando; arquivos espelhados

## Critérios de aceite

- [ ] **CA-4-15:** a varredura percorre todas as strings literais e de template dos arquivos de `src/pages/` e de `src/components/` (fora de `ui/`), menos `import`, `className`, rotas e chamadas `pb.send`, e não acha nenhum destes padrões fora da lista de exceções:
  - `SPEC-`, `CA-`, `CL-`, `LOOP-`, `RQ-` e `RN-` seguidos de número;
  - id de 8 caracteres hexadecimais entre parênteses;
  - "oráculo", `null`, "payload", "hash", "lease", "replay", "MOCK", "gate", "UUID", "POST", "endpoint" e "fixture";
  - códigos HTTP, pela expressão `\((401|403|404|409|422|423|425|5\d\d)\)|HTTP \d{3}`;
  - "Fase" seguida de número;
  - nome de ação com sublinhado.
- [ ] **CA-4-16:** a função de erro devolve a mensagem da tabela para cada situação listada e a mensagem genérica para código desconhecido; um `motivo` com padrão proibido (por exemplo, `quantidade_final_zero` ou "(403)") nunca chega à tela.
- [ ] **CA-4-17:** todo estado usado pelas telas tem rótulo no dicionário.
- [ ] **CA-4-18:** um teste estático confere em cada tela de `src/pages/`:
  - um subtítulo de no máximo 140 caracteres;
  - nenhum parágrafo de texto fixo com mais de 140 caracteres fora do componente "Como funciona";
  - "Como funciona" fechado por padrão.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | Varredura do CA-4-15; teste estático do CA-4-18; testes de `textos.ts` | `node --test tests/pcp/spec-4-004.test.mjs` antes da mudança | Falha: acha os padrões e não há `textos.ts` | `05_entregas/fase-4/spec-4-004/red.txt` |
| GREEN | Mesmos testes | `node --test --test-name-pattern "<critérios da tarefa>" tests/pcp/spec-4-004.test.mjs` | Passam (CA-4-16 e 17 na primeira tarefa; CA-4-15 na segunda) | `05_entregas/fase-4/spec-4-004/green-CA-4-NN.txt` |
| REFACTOR/REGRESSÃO | Capturas das telas de apontamentos, alertas e dos dois loops; testes de `tests/pcp/` | Capturas; `node --test tests/pcp/` | Nenhuma regressão | `05_entregas/fase-4/spec-4-004/capturas/` e `regressao.txt` |

**Dados/fixtures:** respostas simuladas das rotas com cada status da tabela; lista dos estados usados pelas telas.  
**Caminhos de erro obrigatórios:** código desconhecido; 425 sem hora; estado sem rótulo.  
**Evidência exigida:** saídas, lista de exceções com motivo e capturas antes e depois.

## Teste humano do cliente

- **Origem:** CL-007 (sessão de validação final)
- **Quando:** na sessão final (SPEC-4-007)
- **Quem testa:** uma pessoa da cozinha ou do encaixotamento, uma de compras e uma do faturamento
- **Passos:**
  1. Cada pessoa abre as próprias telas.
  2. Lê o que está escrito em voz alta.
  3. Diz o que faria em cada uma.
- **Resultado esperado:** ninguém pergunta o que significa uma palavra da tela.
- **Evidência do aceite:** registro em `05_entregas/fase-4/validacao-final.md`, com as palavras que ainda geraram dúvida.

## Handoff e operação

- **Como demonstrar:** capturas antes e depois de Apontamentos e Alertas.
- **Como operar depois:** texto novo entra pelo `textos.ts`; a varredura roda a cada versão.
- **Como monitorar:** varredura e console ("outro estado").
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Reescrever títulos, mensagens de erro e explicações na língua da operação | American Goodies | SPEC-4-004 | CA-4-16 a CA-4-18 | `--test-name-pattern "CA-4-16\|CA-4-17\|CA-4-18"` | green-CA-4-16.txt, green-CA-4-17.txt, green-CA-4-18.txt | — | ☐ |
| id pendente | Tirar das telas os resultados de teste, os códigos internos e os termos técnicos | American Goodies | SPEC-4-004 | CA-4-15 | Varredura limpa | green-CA-4-15.txt | `textos.ts` pronto | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
