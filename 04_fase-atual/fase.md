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
| `@nome` | responsável (`@"Nome Composto"` com aspas) | fica **sem responsável** |
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

- [/] Aprovar a matriz nominal de acesso (CL-003) #projeto [interno] <!-- id:51356fad-e41a-47be-8f4b-2847f25115bc -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A1. Cliente confirma contas, áreas, ações e pontos com aprovador/data; organograma já recebido não equivale a aprovação. Pré-condições: aprovação administrativa do responsável; nenhuma concessão real por suposição. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Ativar e testar as contas aprovadas #projeto [interno] <!-- id:49327a88-b7db-42e6-a5bf-641e242848d4 -->
    > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A2/A3. Provisionar somente contas da matriz; provar permitir/negar, edição de perfil recusada e revogação com token antigo. Pré-condições: task de matriz aprovada e aceita; autorização administrativa comprovada. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Conciliar o card duplicado da base no Skip #projeto [interno] <!-- id:3def6d06-709a-43ff-b9b1-c54ec113c7c1 -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A4. Operador vincula o card à entrega original16a7a99b e sua prova; resolve duplicata pelo mecanismo oficial, sem excluir ou recriar sistema. Pré-condições: original homologado e evidência de fundamento; funcionalidade oficial do portal. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar. Card herdado: título anterior "Criar a base do sistema no Skip"; mesmo UUID, recorte agora é conciliação documental da duplicata, sem reexecutar a entrega homologada.

- [ ] Conciliar o card duplicado das telas #projeto [interno] <!-- id:45dc0e7d-36ef-4c2d-a333-54a667efa8ca -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A4. Vincular à entrega originaledb85ce0 e sua prova; registrar disposição oficial, sem marcar nova construção. Pré-condições: original homologado e evidência de telas; mecanismo oficial do portal. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar. Card herdado: título anterior "Montar as telas com dados de demonstração"; mesmo UUID, recorte agora é conciliação documental da duplicata, sem reexecutar a entrega homologada.

- [ ] Conciliar o card duplicado da conferência #projeto [interno] <!-- id:69ffd20a-d02b-4d23-b8b0-388eb426823b -->
  > SPEC-2-000 (spec-2-000-acessos-e-pendencias.md), CA-A4. Vincular à entrega original6209142d e prova; preservar UUIDs/histórico e resolver duplicata oficialmente. Pré-condições: original homologado e conferência histórica; mecanismo oficial do portal. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-000/ e obter teste humano explícito antes de concluir ou avançar. Card herdado: título anterior "Conferir o fundamento antes das conexões"; mesmo UUID, recorte agora é conciliação documental da duplicata, sem reexecutar a entrega homologada.

- [ ] Povoar o cadastro de produtos no ERP #projeto [interno] <!-- id:4e0fcf1c-1670-4cde-9dc9-693b3c7eee49 -->
  > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D1. Cliente cadastra/valida produto piloto e sua unidade no Omie; executor apenas registra e confere evidência real. Publicar a fase não conclui a pendência. Pré-condições: responsável do cliente autorizado a manter cadastro ERP; nenhum produto/receita inventado pelo agente. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Construir a visão de qualidade dos dados #projeto [interno] <!-- id:e57df8ff-99ae-4856-ac1f-53b713c8e99c -->
  > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D1/D2/D4, recorte sintético. Criar contrato/tela com produto, unidade/ficha desconhecida e cobertura incompleta usando demonstração isolada; bloquear cálculos afetados. Pré-condições: projeto Skip atual lido; dispensa cadastro/API real para fundamento. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Reconciliar catálogo, unidades e fichas #projeto [interno] <!-- id:5d8793fb-216f-4322-8fed-c5ec7a1a0b0d -->
    > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D1/D2/D3. Confirmar produto piloto, unidade/local e componentes/quantidades na fonte; retirar defaultUN como unidade oficial. Pré-condições: fundamento aceito, cadastro piloto, acesso nominal e contrato de leitura autorizados. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Comprovar as leituras de histórico e compras #projeto [interno] <!-- id:9318a299-f764-4dc7-8ec8-3cb7c86b7c79 -->
    > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D3. Registrar endpoint/request/campos/status/chaves/paginação e amostra autorizada de vendas90, produção90 e compras a receber; sem inventar campo/status. Pré-condições: catálogo/ficha conciliados, consulta autorizada e documentação oficial da conta. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar. Inclui mapa aprovado pelo PCP de pedidos firmes: status, data no horizonte e quantidade remanescente por linha/unidade, sem inferir regra empresarial.

  - [ ] Importar os 90 dias e recebimentos confirmados #projeto [interno] <!-- id:e6aa4afa-94fe-45e9-95d8-875df96a1cf1 -->
    > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D4. Construir atualização atômica; provar replay, cancelamentos/devoluções e página falha; conferir período/cobertura e quantidade restante a receber. Pré-condições: contratos de leitura comprovados e aceitos; unidades oficiais. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar. Reconciliar também o saldo dos pedidos oficiais firmes com o contrato homologado; desconhecido gera pendência, nunca zero.

- [ ] Reconciliar os documentos de operação #projeto [interno] <!-- id:a6bf06fb-20ee-497d-be63-69f03cad854a -->
  > SPEC-2-001 (spec-2-001-dados-oficiais-e-historico.md), CA-D5. Acrescentar adendos datados sobre44 vínculos/3344 pedidos e aceite final08/10; conservar relatórios anteriores. Pré-condições: evidências finais F1 e contratos intermediários disponíveis. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-001/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Construir o calendário e a OP digital #projeto [interno] <!-- id:3cd404e5-81b8-4ca4-96b5-b4dc73f4a805 -->
  > SPEC-2-002 (spec-2-002-planejamento-e-op-digital.md), CA-P1/P2/P3, recorte sintético. Montar calendário, capacidade e OP local com três dias de cookies e fixtures; sem chamada ERP. Pré-condições: projeto Skip atual e contratos internos lidos; fonte real não é pré-condição do fundamento. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-002/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Confirmar parâmetros e dias de produção #projeto [interno] <!-- id:d2a44349-f52e-4517-9ef8-7e004103b536 -->
    > SPEC-2-002 (spec-2-002-planejamento-e-op-digital.md), CA-P1/P2. PCP entrega/aprova CL-006 e valores/unidades de capacidade, calendário, margem, mínimos, lotes, horizonte, prazo e saldo utilizável; faltante bloqueia recorte. Pré-condições: tela/contrato de parâmetros demonstrados; validação do dono funcional. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-002/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Publicar a programação por área #projeto [interno] <!-- id:16b8a592-6038-440d-ba2a-1a668449739c -->
    > SPEC-2-002 (spec-2-002-planejamento-e-op-digital.md), CA-P3. Publicar versão/OP local atomicamente; provar ação/área, faltantes e corrida entre duas publicações. Pré-condições: parâmetros/matriz/dados reais aceitos para uso real; fundamento sintético pode ser verificado isoladamente. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-002/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Reprogramar sem perder os apontamentos #projeto [interno] <!-- id:87e4af63-740a-4fcf-8e00-ee8a7607cf09 -->
    > SPEC-2-002 (spec-2-002-planejamento-e-op-digital.md), CA-P4. Alterar apenas restante não executado com motivo, versão e trilha; provar estados/encerramentos por ponto. Pré-condições: publicação aceita e contrato de eventos da SPEC-2-003; prova de conservação com fixture. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-002/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Construir a tela de apontamentos #projeto [interno] <!-- id:be180fc1-4d67-4f2a-a3c5-e15b74e845b8 -->
  > SPEC-2-003 (spec-2-003-apontamentos-na-origem.md), CA-E1/E3, recorte sintético. Registrar tipos com unidade/ponto e mostrar consumo/diferença/perda separados; realizados são incrementos. Pré-condições: contratos documentais SPEC-2-002/003 disponíveis; fixture local da OP independente do card de programação; nenhum produto real necessário. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-003/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Registrar e encerrar a produção por ponto #projeto [interno] <!-- id:64ac4f85-84e8-45a9-97a9-df04377c9e47 -->
    > SPEC-2-003 (spec-2-003-apontamentos-na-origem.md), CA-E1/E3. Ligar eventos locais à OP publicada e acessos por ponto; provar cozinha40+60, encaixotamento separado e encerramento com hash. Pré-condições: tela aceita; OP, conta/ponto e unidade oficiais para teste real. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-003/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Retificar apontamentos sem duplicar eventos #projeto [interno] <!-- id:0096ab26-6eec-438f-b154-54513188fab5 -->
    > SPEC-2-003 (spec-2-003-apontamentos-na-origem.md), CA-E2/E4. Provar replay, timeout, retificação/substituição/anulação0 e proibição durante envio/incerto; preservar original. Pré-condições: registro/encerramento aceitos e guards de estados especificados. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-003/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Construir as duas telas de conferência #projeto [interno] <!-- id:556da315-88ca-41da-bd86-5322d86ede49 -->
  > SPEC-2-004 (spec-2-004-dupla-conferencia.md), CA-C1/C2, recorte sintético. Mostrar produzido/encaixotado/recebido/câmara separadamente; impedir segunda etapa sem primeira e ponto errado. Pré-condições: contratos documentais OP/eventos disponíveis; fixtures locais independentes da implantação dos cards anteriores. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-004/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Conferir expedição e entrada em câmara #projeto [interno] <!-- id:d77447ab-24eb-4982-984d-08645f11ae28 -->
    > SPEC-2-004 (spec-2-004-dupla-conferencia.md), CA-C1/C2/C3. Registrar ambas etapas em sequência, com unidade/local/autor e replay; divergência bloqueia consolidação. Pré-condições: telas aceitas, etapas de produção encerradas, acesso nominal e pontos definidos para teste real. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-004/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Revisar divergências e invalidar aprovações antigas #projeto [interno] <!-- id:30118f65-3dd5-4679-a1a2-8b301c6a8d46 -->
    > SPEC-2-004 (spec-2-004-dupla-conferencia.md), CA-C3/C4. PCP registra motivo/quantidade final; evento novo invalida hashes; provar corrida com aquisição e congelamento. Pré-condições: conferências aceitas; ação aprovar_consolidacao confirmada. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-004/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Construir a fila de envio com simulação #projeto [interno] <!-- id:c44c11da-c7e9-42ee-b54a-fb3fff997f68 -->
  > SPEC-2-005 (spec-2-005-consolidacao-omie.md), CA-O1/O3/O4, recorte mock. Criar fila/adapter isolado, identidade persistida e estados; provar trabalhador único e resposta perdida sem novoPOST. Pré-condições: contrato documental da consolidação e fixture local independente; mutantes reais desligados. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-005/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Comprovar o contrato de produção no Omie #projeto [interno] <!-- id:a2a4ccf1-3244-438c-9e92-39a75f7e2b85 -->
    > SPEC-2-005 (spec-2-005-consolidacao-omie.md), CA-O1. Confirmar campos/métodos/efeitos de consulta, inclusão e conclusão na conta; documentar concessão técnica sem executar mutante não autorizado. Pré-condições: fila simulada aceita; documentação/acesso autorizados; produto/ficha/local disponíveis. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-005/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Provar a recuperação antes do envio real #projeto [interno] <!-- id:4e9a1d0e-fd37-4225-86bd-54d08c1c924d -->
    > SPEC-2-005 (spec-2-005-consolidacao-omie.md), CA-O2/O3/O4. Provar revogação, reinício, lease/corrida e timeout no mock; deixar demonstrada a segurança dos guards antes de qualquer POST real; não fabricar falha/transação na produção. Pré-condições: fila mock e contrato documental aceitos; todos os casos de revogação/reinício/lease/corrida/timeout devem passar antes do primeiro envio real. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-005/ e obter teste humano explícito antes de concluir ou avançar. Título anterior do mesmo card: "Provar a recuperação sem concluir duas vezes"; UUID preservado. Ordem corrigida pela revisão: prova de recuperação antecede envio real.

  - [ ] Enviar uma produção conferida e autorizada #projeto [interno] <!-- id:6e38e5a3-72e4-4be7-ae21-a29b5fb5e7ab -->
    > SPEC-2-005 (spec-2-005-consolidacao-omie.md), CA-O2/O5. PCP revisa OP/payload/efeito; executar caso real expressamente autorizado e reconciliar identidade/quantidade/status/movimentos uma vez. Pré-condições: provas negativas da recuperação aceitas; contrato/concessão transacional, matriz e dupla conferência reais aceitos; autorização específica do caso e nenhuma divergência de consumo sem tratamento. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-005/ e obter teste humano explícito antes de concluir ou avançar.

- [ ] Construir as sugestões com memória de cálculo #projeto [interno] <!-- id:0baec76e-80af-412c-9554-9472f7928743 -->
  > SPEC-2-006 (spec-2-006-sugestoes-e-validacao.md), CA-S1/S2, recorte sintético. Cards por produto/insumo com entradas, fórmulas, lotes/limites e faltantes; método proposto não ativa cálculo empresarial. Pré-condições: contratos internos dados/parâmetros disponíveis; fixtures identificadas. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-006/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Aprovar o método e conferir as sugestões reais #projeto [interno] <!-- id:2ea1e7ab-5fe4-4e02-a7a1-901539bfdc8a -->
    > SPEC-2-006 (spec-2-006-sugestoes-e-validacao.md), CA-S1/S2. PCP aceita baseline90-v1 ou devolve regra para emenda; calcular só com dados completos; provar51→60, compras4,8→6, zero→zero e excedente. Pré-condições: documentos/valores de parâmetros e fontes disponíveis; aprovação do método é primeiro passo desta task e gate interno antes de qualquer cálculo real. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-006/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Levar a sugestão somente para rascunho #projeto [interno] <!-- id:8bb4ef77-1232-4f16-a7d6-ea2df09ad829 -->
    > SPEC-2-006 (spec-2-006-sugestoes-e-validacao.md), CA-S3. Aceitar sugestão abre rascunho e mantém gate de publicação; sugestão de compra não envia pedido. Pré-condições: sugestões aceitas e conta com ação de planejamento; nenhum acesso ampliado. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-006/ e obter teste humano explícito antes de concluir ou avançar.

  - [ ] Validar o fluxo completo com a equipe #projeto [interno] <!-- id:0d876150-60b6-46bb-ada4-722b90d870a3 -->
    > SPEC-2-006 (spec-2-006-sugestoes-e-validacao.md), CA-S4. Demonstrar90 dias→OP→eventos→dupla conferência→aprovação→uma conclusãoOmie; regressão F1 e prova de recuperação. Pré-condições: SPECs anteriores aceitas, caso transacional autorizado e pendências operacionais resolvidas no recorte; demonstração mock não conclui este aceite real. Prova: TDD/cenários nomeados desta SPEC; registrar em 05_entregas/fase-2/spec-2-006/ e obter teste humano explícito antes de concluir ou avançar.
