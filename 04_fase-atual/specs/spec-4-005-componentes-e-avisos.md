# SPEC-4-005 — Tabelas, campos, confirmações, selos e avisos do kit

**Fase:** 4  
**Status:** planejada  
**Dono:** American Goodies (todas as áreas) com o Maestro; conferência na sessão final  
**Origem no escopo:** P6 (acabamento do sistema, 03/11/2026)  
**Degrau da solução:** nativo da plataforma — componentes do kit shadcn/ui (`table`, `select`, `dialog`, `alert-dialog`, `skeleton`, `sonner`, `badge`, `alert`) e ícones `lucide-react`.

## Contexto e decisões fechadas

- **Estado atual:**
  - Há 19 tabelas em HTML puro e 11 seletores nativos do navegador.
  - Do kit, o sistema usa 1 cartão e 1 selo, e tem só 2 ícones.
  - Depois de salvar, o resultado sai como uma linha de texto, às vezes com o estado cru (`registrado`, `replay`, `negado:`).
  - A correção de um apontamento abre duas janelinhas do navegador (`window.prompt`).
  - O carregamento aparece como "Carregando…" em texto.
  - Há cerca de 55 caixas coloridas de aviso, cada uma num estilo, e avisos de "demonstração" em várias telas.
- **Estado desejado:**
  - Tabelas e campos do kit, com números no formato brasileiro e a unidade junto.
  - Confirmação visual ao salvar; janela no lugar das janelinhas do navegador.
  - Esqueleto no carregamento.
  - Selos de estado com cor e ícone.
  - Um padrão só de aviso.
- **Decisões já fechadas:**
  - **Tabelas:** componente `table` do kit:
    - números alinhados à direita, com algarismos de largura fixa;
    - unidade junto do valor ("12,5 kg");
    - estado vazio com uma frase do que fazer (por exemplo, "Nenhuma requisição ainda. Crie a primeira pelo botão Nova requisição.");
    - paginação de 50 em 50 linhas quando houver mais de 50;
    - no celular, a tabela rola dentro do próprio quadro, nunca a página. As telas do chão de fábrica viram cartões na SPEC-4-006.
  - **Formato:** um módulo só (`src/lib/pcp/formato.ts`), com:
    - número: decimal com vírgula e milhar com ponto, sem casas inúteis;
    - moeda: R$ com 2 casas;
    - data: dd/mm/aaaa;
    - hora: HH:MM, no horário de São Paulo;
    - quantidade com unidade.

    Valor sem informação mostra "—" e a dica "sem informação", nunca 0.
  - **Campos:**
    - todo seletor nativo vira `select` do kit, ou busca com lista (`command` em `popover`) quando houver mais de 15 opções;
    - erro de campo aparece embaixo do campo, em vermelho, com a mensagem do `textos.ts` (SPEC-4-004);
    - campo numérico usa `inputmode="decimal"`.
  - **Ao salvar:** aviso flutuante (`sonner`):
    - verde "Salvo" ou o rótulo do estado (por exemplo, "Apontamento registrado");
    - vermelho com a mensagem de erro.

    Some sozinho em 4 segundos; o erro fica até ser fechado.
  - **Janelas:**
    - as duas `window.prompt` da correção de apontamento viram um `dialog` com os campos, a validação e os botões "Salvar correção" e "Cancelar";
    - nenhuma `window.alert`, `window.confirm` ou `window.prompt` fica no sistema;
    - quatro ações passam a pedir confirmação num `alert-dialog`, com o resumo do que vai acontecer: "Autorizar" o envio ao Omie, "Liberar para faturar", "Aprovar" a compra e "Aprovar" a consolidação. A regra de quem pode e do que é conferido não muda.
  - **Carregamento:** `skeleton` no lugar do conteúdo, nunca o texto "Carregando…".
  - **Selos de estado** (componente `badge` com ícone e o rótulo do `textos.ts`):

    | Grupo de estados | Cor | Ícone |
    |---|---|---|
    | Pronto, apto, aprovado, conferido, tratado, registrado | verde | `CircleCheck` |
    | Pendente, em análise, aguardando, preparada | amarelo | `Clock` |
    | Bloqueado, recusado, negado, falhou | vermelho | `CircleX` |
    | Liberado, enviado, publicado | azul | `Send` |
    | Demonstração | cinza | `FlaskConical` |
    | Estado sem grupo | cinza | `Circle` |

    A tabela que diz o grupo de cada estado fica no `textos.ts`.
  - **Avisos:** componente `alert` do kit, em três níveis:
    - informação: azul, `Info`;
    - atenção: amarelo, `TriangleAlert`;
    - bloqueio: vermelho, `OctagonX`.

    O aviso do topo da tela usa a propriedade `topo` do componente, e cada tela tem no máximo um. Os outros vão para perto do campo ou do botão que afetam, ou para "Como funciona".
  - **Cores de estado:** o tema ganha os tokens `--success`, `--warning` e `--info`, cada um com o seu `-foreground`, com valores padrão que cumprem 4,5:1. A SPEC-4-002 ajusta esses valores junto com a marca. Selos e avisos usam só esses tokens e os do kit (`--destructive`, `--muted`), nunca classes de cor fixa como `bg-amber-*`.
  - **Demonstração:** onde ainda houver dado de demonstração, só um selo "Dados de demonstração" no título da tela. Onde já há dado real, o selo sai.
- **Bloqueios:** as capturas com sessão aberta usam os usuários de teste (CL-PEND-016). Até eles existirem, as tarefas ficam em `[/]` com os testes puros verdes.

## Resultado observável

As tabelas se leem bem e mostram "—" onde falta informação. Ao salvar, aparece "Salvo" no canto da tela. A correção de apontamento abre uma janela de verdade. Cada estado tem um selo colorido com ícone. Cada tela tem no máximo um aviso no topo.

## Limites e dependências

- **Inclui:**
  - trocar as 19 tabelas e todos os seletores nativos;
  - `formato.ts`;
  - avisos ao salvar;
  - `dialog` e `alert-dialog`;
  - `skeleton`;
  - selos;
  - avisos em três níveis;
  - o selo de demonstração.
- **Fora de escopo:** cores da marca (SPEC-4-002); textos (SPEC-4-004); celular das telas do chão de fábrica (SPEC-4-006); regra de permissão.
- **Entradas e pré-condições:** `textos.ts` da SPEC-4-004.
- **Saídas/artefatos:**
  - `formato.ts`;
  - componentes `Selo` e `Aviso` sobre o kit;
  - telas revisadas;
  - evidência em `05_entregas/fase-4/spec-4-005/`;
  - arquivos espelhados.
- **Dependências e responsáveis:** Maestro constrói.
- **Atores e permissões mínimas:** nenhum perfil novo.
- **Superfícies/arquivos/configurações afetadas:** telas de `src/pages/`, componentes próprios e os componentes do kit adicionados.
- **Risco e plano B:** se trocar uma tabela quebrar uma ação da linha, volte essa tabela, registre e siga com as outras.
- **Rollback ou reversão:** voltar a versão do Skip.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Valores das rotas → `formato.ts` | Respostas das rotas existentes | Número, unidade, moeda, data | — | — | `null` ou vazio: "—" com "sem informação" |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Valor desconhecido | "—", nunca 0 | — | Regra comum 7 |
| RN-02 | Unidades diferentes na mesma coluna | Cada linha com a sua unidade; total só se a unidade for a mesma | — | Regra de dados da fase 3 |
| RN-03 | Mais de um aviso para o topo | Fica o de maior nível; os outros descem para perto do que afetam | — | P6 |

## Fluxo e regras

1. Adicionar os componentes do kit que faltam e criar `formato.ts`, `Selo` e `Aviso`, com testes.
2. Trocar tabelas e seletores tela por tela.
3. Trocar os textos de resultado por avisos ao salvar, as janelinhas por `dialog` e "Carregando…" por `skeleton`.
4. Reduzir os avisos a um por tela e aplicar o selo de demonstração.
5. Rodar a varredura.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Requisição salva | Aviso "Requisição registrada"; selo verde na lista | — |
| Limite | Tabela com 120 linhas | 3 páginas de no máximo 50 | — |
| Falha | Salvar com campo inválido | Erro embaixo do campo e aviso vermelho | Corrigir e salvar |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC, `src/components/ui/`, as telas de `src/pages/` e o `textos.ts`.
2. **Alterar somente:** componentes e formatação nas telas; criar `formato.ts`, `Selo` e `Aviso`; adicionar os componentes do kit que faltam.
3. **Não alterar:** regras, chamadas de rota, permissões e os textos já definidos no `textos.ts`. Nele, só acrescente o mapa de grupos de selo.
4. **Executar nesta ordem:** base (kit, `formato.ts`, `Selo`, `Aviso`) → tabelas e seletores → salvar, janelas e carregamento → avisos e demonstração → varredura.
5. **Parar e pedir validação quando:** não há parada.
6. **Estado válido ao parar:** cada tela trocada funciona igual; as que faltam continuam como estavam.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. A conferência do cliente é na sessão final (SPEC-4-007). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] `formato.ts`, `Selo` e `Aviso` com testes
- [ ] 19 tabelas e todos os seletores nativos trocados
- [ ] Nenhuma `window.alert`, `window.confirm` ou `window.prompt`
- [ ] "Carregando…" trocado por `skeleton`
- [ ] No máximo um aviso no topo por tela; selo de demonstração só onde há demonstração
- [ ] Regressão de `tests/pcp/` passando; arquivos espelhados

## Critérios de aceite

- [ ] **CA-4-19:** `formato.ts` formata número, moeda, data, hora e quantidade com unidade no padrão brasileiro e mostra "—" para valor desconhecido.
- [ ] **CA-4-20:** a varredura não acha em `src/pages/` nem nos componentes próprios:
  - `<table`, `<select`;
  - classes de cor fixa (`bg-`, `text-` ou `border-` seguidas de `red`, `amber`, `yellow`, `green`, `blue` ou `emerald`);
  - `window.alert`, `window.confirm`, `window.prompt`;
  - o texto "Carregando" como conteúdo visível (no `aria-label` do esqueleto ele é permitido, para leitor de tela).
- [ ] **CA-4-21:** todo estado do dicionário tem um grupo de selo, e estado sem grupo mostra o selo cinza neutro.
- [ ] **CA-4-22:** nenhuma tela de `src/pages/` tem mais de um `Aviso` com a propriedade `topo`, e o selo "Dados de demonstração" só aparece em tela que mostra registro marcado como demonstração.
- [ ] **CA-4-23:** salvar com sucesso e com erro mostra o aviso flutuante certo em cada tela que grava.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | Testes de `formato.ts` e do mapa de selos; varredura de `<table`, `<select`, `window.*` e "Carregando" | `node --test tests/pcp/spec-4-005.test.mjs` antes da mudança | Falha: módulo ausente e a varredura acha os padrões | `05_entregas/fase-4/spec-4-005/red.txt` |
| GREEN | Mesmos testes, mais a contagem de `Aviso` com `topo` por tela e a dos tokens de estado no tema | `node --test --test-name-pattern "<critérios da tarefa>" tests/pcp/spec-4-005.test.mjs` | Passam (CA-4-19 a 22) | `05_entregas/fase-4/spec-4-005/green-CA-4-NN.txt` |
| REFACTOR/REGRESSÃO | Capturas de salvar com sucesso e com erro em Requisições, Apontamentos e Preparação de pedidos; testes de `tests/pcp/` | Capturas; `node --test tests/pcp/` | CA-4-23; nenhuma regressão | `05_entregas/fase-4/spec-4-005/capturas/` e `regressao.txt` |

**Dados/fixtures:** valores com decimais, nulos, unidades diferentes e datas na virada do dia em São Paulo; lista dos estados do dicionário.  
**Caminhos de erro obrigatórios:** valor nulo; estado sem grupo; tabela vazia; erro de validação ao salvar.  
**Evidência exigida:** saídas dos testes e capturas antes e depois.

## Teste humano do cliente

- **Origem:** CL-007 (sessão de validação final)
- **Quando:** na sessão final (SPEC-4-007)
- **Quem testa:** uma pessoa de cada área
- **Passos:**
  1. Cada pessoa salva um registro de demonstração.
  2. Erra um campo de propósito.
  3. Procura um valor numa tabela.
- **Resultado esperado:** a pessoa sabe que salvou, entende o erro e acha o valor sem esforço.
- **Evidência do aceite:** registro em `05_entregas/fase-4/validacao-final.md`.

## Handoff e operação

- **Como demonstrar:** capturas antes e depois de três telas.
- **Como operar depois:** tela nova usa `table`, `select`, `Selo`, `Aviso` e `formato.ts`; a varredura roda a cada versão.
- **Como monitorar:** varredura e console.
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| id pendente | Trocar as tabelas e os seletores pelos do kit, com números no formato brasileiro | American Goodies | SPEC-4-005 | CA-4-19, CA-4-20 | `formato.ts` e varredura de `<table` e `<select` | green-CA-4-19.txt, green-CA-4-20-tabelas.txt | `textos.ts` (SPEC-4-004) | ☐ |
| id pendente | Dar retorno visual ao salvar, ao corrigir um apontamento e ao carregar as telas | American Goodies | SPEC-4-005 | CA-4-20, CA-4-23 | Varredura de `window.*` e "Carregando"; capturas | green-CA-4-20-janelas.txt e capturas | — | ☐ |
| id pendente | Padronizar os avisos em três níveis e os selos de estado com cor e ícone | American Goodies | SPEC-4-005 | CA-4-21, CA-4-22 | Mapa de selos e contagem de avisos | green-CA-4-21.txt, green-CA-4-22.txt | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
