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

## Registro operacional

- 09/10: pacote liberado pelo consultor (7 SPECs, 29 tasks, 29 UUIDs, TDD embutido; revisão 13/10).
- 14/10: 51356fad concluída (matriz nominal v1.2, aceite do owner); 49327a88 implementada e em
  teste humano (21 contas reais, troca obrigatória, revogação dos sintéticos).
