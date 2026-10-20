# Fase 2 — Tarefas

<!-- fase-format:2 -->

Cada linha é uma tarefa da Jornada de Execução. **Tudo que cabe num card cabe nesta linha** — se um
campo não estiver aqui, ele não tem como ser preenchido, porque é este arquivo que cria a tarefa.

```text
- [ ] Título da tarefa @responsável !30/09/2026 #projeto [interno] <!-- id:… -->
  > descrição da tarefa, uma ou mais linhas
  - [ ] subtarefa (basta indentar 2 espaços) <!-- id:… -->
    - [ ] sub-subtarefa (indente mais 2) <!-- id:… -->
```

| marcador | o que define | se você não escrever |
|---|---|---|
| `- [ ]` / `- [/]` / `- [x]` | a fazer / em andamento / concluída | a fazer |
| @nome | responsável (`@"Nome Composto"` com aspas) | fica **sem responsável** |
| `!dd/mm/aaaa` | prazo | fica **sem prazo** |
| `#projeto` / `#aculturamento` | tipo | Projeto de IA |
| `[interno]` | o cliente **não** vê esta tarefa | o cliente vê |
| `> texto` na linha de baixo | descrição (aparece ao abrir o card) | sem descrição |
| indentar 2 espaços | vira subtarefa da tarefa acima (vale em qualquer profundidade) | tarefa de topo |

Os marcadores só valem **no fim da linha** — `Revisar #3 do contrato` continua sendo um título.
Um título que TERMINA na forma de um marcador sai escapado com `\` (`Ligar para \@joao`); a barra é
só para o parser e nunca aparece no card. Você não precisa escrever isso à mão.

Marque `[x]` para concluir e adicione linhas novas à vontade: elas entram no quadro na próxima
sincronização e voltam aqui com o `<!-- id:… -->` preenchido. **Não apague o marcador de id** das
tarefas que já têm um.

## Ordem, gates e pendências transferidas

Liberação autorizada pelo consultor em 09/10/2026. Todos os29 UUIDs foram recebidos do portal e preservados, incluindo os 5 herdados. Visibilidade recebida do portal foi preservada; não há responsável/prazo presumido.

Topo: regularização ou fundamento com fixtures locais dos contratos documentais, sem exigir implantação prévia de outros cards. Subtasks: cadeia dependente na ordem indicada, uma task por sessão e teste humano explícito antes da seguinte. Aprovação do pai não aprova filhos.

Uso real: programação→apontamentos→conferência→envio. Aprovação de método é primeiro passo e gate interno antes de cálculo. Recuperação em mock, revogação, reinício e concorrência devem passar ANTES do envio real. Transação ERP exige contrato/concessão e autorização do caso. Dependência humana bloqueia somente recorte afetado.

## Fora desta fase

Cotação/aprovação financeira, recebimento fiscal, faturamento, IA e loops.

- [x] Aprovar a matriz nominal de acesso (CL-003) #projeto [interno] <!-- id:51356fad-e41a-47be-8f4b-2847f25115bc -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A1. Cliente confirma contas, áreas, ações e pontos com aprovador/data; organograma já recebido anchored não equivale a aprovação. Pré-condições: aprovação administrativa do responsável; nenhuma concessão real por suposição. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar.

  - [x] Ativar e testar as contas aprovadas #projeto [ interno] <!-- id:49327a88-b7db-42e6-a5bf-641e242848d4 -->
    > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A2/A3. Provisionar somente contas da matriz; provar permitir/negar, edição de perfil recusada e revogação com token antigo. Pré-condições: task de matriz aprovada e aceita; autorização administrativa comprovada. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar.

- [x] Conciliar o card duplicado da base no Skip #projeto [interno] <!-- id:3def6d06-709a-43ff-b9b1-c54ec113c7c1 -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A4. Operador vincula o card à entrega original16a7a99b e sua prova; resolve duplicata pelo mecanismo oficial, sem excluir ou recriar sistema. Pré-condições: original homologado e evidência de fundamento; funcionalidade oficial do portal. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar. Card herdado: título anterior "Criar a base do sistema no Skip"; mesmo UUID, recorte agora é conciliação documental da duplicata, sem reexecutar a entrega homologada.
  > Disposição (14/10/2026): duplicata conciliada com a entrega original 16a7a99b (homologada na F1 em 01/10, conferência 4/4); registro completo em 05_entregas/fase-2/spec-2-000/conciliacao-3def6d06.md; sem reimplementação; UUIDs preservados.

- [x] Conciliar o card duplicado das telas #projeto [interno] <!-- id:45dc0e7d-36ef-4c2d-a333-54a667eca8ca -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A4. Vincular à entrega originaledb85ce0 e sua prova; registrar disposição oficial, sem marcar nova construção. Pré-condições: original homologado e evidência de telas; mecanismo oficial do portal. Prova: T_FILE... registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar. Card herdado: título anterior "Montar as telas com dados de demonstração"; mesmo UUID, recorte agora é conciliação documental da duplicata, sem reexecutar a entrega homologada.
  > Disposição (14/10/2026): duplicata conciliada with a entrega original edb85ce0 (homologada na F1 em 01/10, testes GREEN + QA, aceite do owner 15:13); registro completo em 05_entregas/fase-2/...; sem reimplementação; UUIDs preservados.

- [x] Conciliar o card duplicado da conferência #projeto [interno] <!-- id:69ffd20a-d02b-4d23-b8b0-388eb426823b -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A4. Vincular à entrega original6209142d e prova; preservar UUIDs/histórico e resolver duplicata oficialmente. Pré-condições: original homologado e conferência histórica; mecanismo oficial do portal. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ boilerplate... e obter teste humano explícito antes de concluir ou avançar. Card herdado: título anterior "Conferir o fundamento antes das conexões"; mesmo UUID, recorte agora é conciliação documental da duplicata, sem reexecutar a entrega homologada.
  > Disposição (15/10/2026): duplicata conciliada com a entrega original 6209142d (homologada na F1 em 01/10, conferência 4/4, aceite do owner 15:23); registro completo em 05_entregas/fase-2/spec-2-000/conciliacao-69ffd20a.md; sem reimplementação; UUIDs preservados.

- [/] Povoar o cadastro de produtos no ERP #projeto [interno] <!-- id:4e0fcf1c-1670-4cde-9dc9-693b3c7eee49 -->
  > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D1. Cliente cadastra/valida produto piloto e sua unidade oficial no Omie; executor apenas registra e confere evidência real. Publicar a fase não conclui a pendência. Pré-condições: responsável do cliente autorizado a manter cadastro ERP; nenhum produto/receita inventado pelo agente. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.
  > Disposição (20/10/2026): recorte do executor em construção — diagnóstico executado após o aviso do owner ("Cadastrei"): sonda comparativa na conta da credencial retorna 0 registros em AMBOS os métodos (ListarProdutosResumido e ListarProdutos, HTTP 200, sem fault); hook temporário removido (v0.0.111, ref a65ca39); re-checagem 15:56 BRT após "continue": ainda 0 produtos; sonda ampliada provou credencial saudável (endpoint de serviços responde com mensagem oficial do Omie, também vazio); diagnóstico fechado (3 sondas): conta única (CNPJ 45.521.506/0001-84, não multi-empresa), credencial savery, estoque 1069 itens reais; produto teste PRD513892905525504 existe e é consultável por código, mas a listagem do catálogo segue vazia; piloto real da cadeia definido como M011001 (ficha real provada); pendência do cliente: povoar a listagem do cadastro (ou uso por consulta dirigida).

- [x] Construir a visão de qualidade dos dados #projeto [interno] <!-- id:e57df8ff-99ae-4856-ac1f-53b713c8e99c -->
  > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D1/D2/D4, recorte sintético. Criar contrato/tela com produto, unidade/ficha desconhecida e cobertura incompleta usando demonstração isolada; bloquear cálculos afetados. Pré-condições: projeto Skip v0.0.129 lido; dispensa cadastro/API real para fundamento. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.
  > Disposição (15/10/2026): entregue e provada — contrato+fixtures (src/lib/pcp/qualidade.ts), tela /qualidade (área painel) e TDD 12/12; Skip v0.0.80–0.0.81, produção v0.0.81 ref 4d45315 provada (lastPublishedRef=versionHash); evidência em 05_entregas/fase-2/spec-2-001/evidencia-e57df8ff.md; teste humano aprovado pelo owner 15:39 BRT ("testei e aprovado").

  - [/] Reconciliar catálogo, unidades e fichas #projeto [interno] <!-- id:5d8793fb-216f-4322-8fed-c5ec7a1a0b0d -->
    > SPEC-2-001 (spec-2-001-dados-oficia-001...e-historico.md), CA-D1/D2/D3. Confirmar produto piloto, unidade/local e componentes/quantidades na fonte; retirar defaultUN como unidade oficial. Pré-condições: fundamento aceito, cadastro piloto, acesso nominal e contrato de leitura autorizados. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.
    > Disposição (20/10/2026): implementada e publicada — piloto real M011001 aprovado pelo owner ("opcao 1"); produto (CX) + ficha real (malha: pré-massa 0,25 PA, margarina 1 KG, baunilha 0,05 L, caixa 1 UN) + local padrão 9300980125 provados na fonte; contrato conciliacao.ts (unidade oficial preservada, null nunca vira UN, ficha verbatim, linha legada UN incompatível sem conversão, mapa CA-D3); defaultUN retirado do sync; join no catálogo; hook pcp_piloto + card "Piloto real" na /catalogo; TDD 10/10 (RED 9/10 provado); Skip v0.0.129, produção ref f1673e6 provada; evidência em 05_entregas/fase-2/spec-2-001/evidencia-5d8793fb.md; aguardando teste humano.

  - [ ] Comprovar as leituras de histórico e compras a receber #projeto [interno] [interno] <!-- id:9318a duplicated id marker... -->
    > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D3. Registrar endpoint/request/campos/status/chaves/paginação e amostra autorizada de vendas90, produção90 e compras a receber; sem inventar campo/status. Pré-interno... Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar. Inclui mapa aprovado pelo PCP de pedidos firmes: status, data no horizonte e quantidade remanescente por linha/unidade, sem inferir regra empresarial.

  - [ ] Importar os 90 dias e recebimentos confirmados #projeto [interno] <!-- id:e6aa4afa-94fe-45e9-95d8-875df96a1cf1 -->
    > SPEC-2-001 (spec-2-001-dhall-...-historico.md), CA-D4. Construir atualização atômica; provar replay, cancelamentos/devoluções e página falha; conferir período/cobertura e quantidade restante a receber. Pré-condições: contratos de leitura comprovados e aceitos; unidades oficiais. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-006/ e obter teste humano explícito antes de concluir or avançar. Reconciliar também o saldo executável dos pedidos firmes com o contrato homologado; desconhecido gera pendência, nunca zero.

- [x] Reconciliar os documentos de operação #projeto [interno] <!-- id:a6bf06fb-20ee-497d-be63-69f03cad854a -->
  > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D5. Acrescentar adendos datados sobre44 vínculos/3344 pedidos e aceite final08/10; conservar relatórios anteriores. Pré-condições: evidências finais F1 e contratos intermediários disponíveis. Prova: TDD/cenários nomeados oficiais desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.
  > Disposição (16/10/2026): entregue e provada — adendos datados na SPEC-1-003 (8fb54a2c) e no relatório integrado (e corrigido); registro de reconciliação (c377da71); originais preservados byte a byte; zero Skip; teste humano aprovado pelo owner 09:02 BRT ("testei e aprovado").

- [x] parent task #projeto [interno] <!-- id:3cd404e5-81b8-4ca4-96b5-b4dc73f4a805 -->
  > SPEC-2-002 (spec-2-002-planejamento-e-op-digital.md), CA-P1/P2/P3, recorte sintético. Montar calendário, capacidade e OP local com três dias de cookies e fixtures; sem chamada ERP. Pré-condições: projeto Skip atual e contratos internos lidos; fonte real não é pré-condição do fundamento. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-002/ e obter teste humano explícito antes de concluir ou avançar.
  > Disposição (16/10/202Construir o calendário e a OP digital — entregue e provada — contrato planejamento.ts + tela /planejamento (área planejamento) + TDD 10/10; Skip v0.0.82–0.00.83, produção ref f2c1bdb provada; evidência mangled; teste do bloco approved pelo owner 09:02 BRT ("testei e aprovado").

- [x] parent task 2 #projeto [interno] <!-- id:be180fc1-4d67-4f2a-a3c5-e15b74e845b8 -->
  > SPEC-2-003 (spec-2-003-apontamentos-na-origem.js), CA-E1/E3, recorte sintético. Registrar tipos com unidade/ponto e mostrar consumo/diferença/perda separados; realizados são incrementos. Pré-condições: contratos documentais SPEC-2-002/003 disponíveis; fixture local da OP independente do card de programação; nenhum produto real necessário. Prova: TDD/cenários nomeados desta SPEC; mangled... desta SPEC; registrar em 05_entregas/fave-2/spec-2-003/ e obter teste humano explícito antes de concluir ou avançar.
  > Disposição (16/10/2026): entregue e provada — contrato apontamento.ts + tela /apontamentos (área apontar_producao) + TDD 10/10; Skip v0.0.84–0.0.85, produção ref fe6114f provada; evidência em 05_entregas/fase-2/spec-2-003/evidencia-be180fc1.md; teste do bloco aprovado pelo owner 09:02 BRT ("testei retelling..." testei e aprovado").

  - [ ] Registrar e encerrar a produção por ponto #projeto [interno] <!-- id:64ac4f85-84e8-45a9-97a9-df04377c9e47 -->
    > SPEC-2-003 (spec-2-003-apontamentos-na-origem.js), CA-E1/E3. Ligar eventos locais à OP publicada e acessos por ponto; provar cozinha40+60, encaixotamento separado e encerramento com hash. Pré-condições: tela aceita; OP, conta/ponto e unidade oficiais para teste real. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-00 injected... e obter teste humano explícito before concluir ou avançar.

  - [ ] Retificar apontamentos without duplicating events #projeto [interno] <!-- id:0096ab26-6eec-438f-b154-54513188fab5 -->
    > SPEC-2-003 (spec-2-003-apontamentos-na-origem.md), CA-E2/E4. Provar replay, timeout, retificação/substituição/anulação0 e proibição durante envio/incerto; preservar original. Pré-condições: registro/encerramento aceitos e guards de estados especificados. Prova: TDD/centros nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-003/ e obter teste humano explícito antes de concluir ou avançar.

- [x] Construir as duas telas de conferência #projeto [interno] <!-- id:556da315-36ef-4c2d-a333-54a667eca8ca -->...