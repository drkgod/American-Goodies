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
| `#projeto` | projeto no portal | fica **sem projeto** |
| `[interno]` | tarefa do executor/consultoria (não do cliente) | fica visível ao cliente |
| `<!-- id:… -->` | identidade estável do card | — nunca remova/regenere — |

A hierarquia por indentação define o que é tarefa e o que é subtarefa. O `id` é a identidade do card
e nunca é removido ou regenerado. Ao mudar o estado, altere somente o checkbox e os registros
operacionais exigidos.

---

## SPEC-2-000 — Acessos e pendências (Fase 2)

- [x] Aprovar a matriz nominal de acesso (CL-003) #projeto [interno] <!-- id:51356fad-e41a-47be-8f4b-2847f25115bc -->
  > Registrar a matriz nominal de acesso aprovada — por pessoa: conta, áreas, pontos, ações, ativo,
  > aprovador_ref, aprovado_em (versão v1). O organograma informa; a matriz decide (CA-A1).
  > Pré-condição da task 49327a88. Substitui, para concessão real, os perfis sintéticos @pcp.local.
- [x] Ativar e testar as contas aprovadas #projeto [interno] <!-- id:49327a88-b7db-42e6-a5bf-641e242848d4 -->
  > Criar as contas reais das 21 pessoas da matriz v1.2 (nome.sobrenome@mccfranchising.com.br),
  > com perfis exatos (áreas, ações, pontos), ativação das contas e revogação dos perfis de teste
  > @pcp.local após as provas. Troca obrigatória de senha no 1º login. Teste humano na conta da
  > Keoma aprovado pelo owner em 14/10 (troca executada + login + áreas corretas).
- [ ] Conciliar as duplicatas a partir do mecanismo oficial #projeto [interno] <!-- id:3def6d06 -->
  > Resolver os três cards duplicados do fundamento (base→16a7a99b, telas→edb85ce0,
  > conferência→6209142d) pelo mecanismo oficial do portal, preservando os UUIDs originais e sem
  > reexecutar entrega homologada.
- [ ] Povoar o cadastro de produtos no ERP (Omie) #projeto [interno] <!-- id:4e0fcf1c -->
  > Pendência herdada da F1: bloqueia cenários de catálogo/ficha técnica (SPEC-2-004/006).
  > Cadastro real do Omie ainda com 0 registros (conferido 09/10).
- [ ] Definir os pontos da Keoma na matriz #projeto [interno] <!-- id:2c4a9b7e -->
  > Pendência da matriz v1.2: Keoma sem pontos definidos (gerente geral). Registrar na matriz e
  > aplicar no perfil Skip da conta real.

## SPEC-2-001 — Dados oficiais e histórico (Fase 2)

- [ ] Reconciliar o histórico de produção com a fonte oficial #projeto [interno] <!-- id:e57df8ff -->
  > Visão de qualidade da base histórica (fundamento com fixtures). Cadastro real vazio é a task
  > 4e0fcf1c do cliente; esta task é o fundamento.

## SPEC-2-002 — Calendário e ordens de produção (Fase 2)

- [ ] Programação semanal com calendário e OPs #projeto [interno] <!-- id:3cd404e5 -->
  > Calendário de programação, OPs por ponto, saldo reprogramado, resultado 0 auditável sem
  > autorização ERP, pedidos firmes com mapa aprovado pelo PCP.

## SPEC-2-003 — Apontamentos (Fase 2)

- [ ] Apontamentos de produção por ponto #projeto [interno] <!-- id:be180fc1 -->
  > Apontamento por pessoa/ponto com guarda de perfil e prova negativa de revogação.

## SPEC-2-004 — Dupla conferência (Fase 2)

- [ ] Dupla conferência de expedição e câmara fria #projeto [interno] <!-- id:556da315 -->
  > Dupla conferência com pontos expedicao/camara_fria, guarda por ação e prova negativa.

## SPEC-2-005 — Fila e envio Omie (Fase 2)

- [ ] Fila de envio autorizado ao Omie #projeto [interno] <!-- id:c44c11da -->
  > Fila transacional com autorização por OP/efeito antes do primeiro POST real (gate do consultor).

## SPEC-2-006 — Sugestões (Fase 2)

- [ ] Sugestões de programação com método aprovado #projeto [interno] <!-- id:0baec76e -->
  > Sugestões com método/parâmetros aprovados pelo PCP; histórico e recebimentos completos como
  > fonte (gates de dados).

---

## Registro operacional

- 09/10: pacote liberado pelo consultor (7 SPECs, 29 tasks, 29 UUIDs, TDD embutido; revisão 13/10).
- 14/10: 51356fad concluída (matriz nominal v1.2, aceite do owner); 49327a88 implementada e em
  teste humano (21 contas reais, troca obrigatória, revogação dos sintéticos).
