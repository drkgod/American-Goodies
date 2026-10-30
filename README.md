# American Goodies — pacote operacional

**Atualizado:** 26/10/2026 · **Fase atual:** 3, a última, com tudo o que falta do projeto (AC-26-01) · **Pacote:** 18 SPECs e 48 tarefas (os ids vêm do portal), com a sessão de validação final sem data marcada (o dono marca ao fim da construção). Fase 2 fechada; as três tarefas abertas dela passaram para a fase 3.

- [Tarefas da fase 3](04_fase-atual/fase.md)
- [Índice das SPECs e regras comuns](04_fase-atual/specs/00-INDICE.md)
- [Checklist do cliente](04_fase-atual/checklist-do-cliente.md)
- [Instruções do executor](AGENTS.md)
- [Status](STATUS.md)

A fase 3 junta o que antes estava nas fases 3, 4 e 5:
- dados reais da fase 2: catálogo, 90 dias, sugestões e a conclusão da ordem de produção no Omie;
- compras e recebimento: fornecedores, conversões, histórico de preços, requisição, cotação, aprovação, entregas e recebimento;
- preparação de pedidos e faturamento: unidades, tabela de preço, frete, volumes, fila apto/bloqueado e pedidos manuais;
- alertas, tratamento, sazonalidade e LOOP-01;
- relatórios, assistente de consulta, exportação, recuperação e LOOP-02;
- validação final com a equipe.

As fases 4 e 5 não têm tarefas.

## Como começar

1. Leia `AGENTS.md`, o índice das SPECs, o card e a SPEC dele.
2. Comece por **Trazer o catálogo real do Omie produto a produto, sem estourar o limite de consultas** (SPEC-3-001).
3. Construa as tarefas em sequência, SPEC por SPEC, sem teste no meio. Cada tarefa fecha pelas provas automáticas da sua SPEC, com a evidência em `05_entregas/fase-3/`.
4. Se uma tarefa depender do Omie bloqueado ou de um dado do cliente, construa o que não depende, registre e siga para a próxima.
5. O único teste com o cliente é a sessão de validação final (SPEC-3-018), com o dono e as áreas, quando todas as SPECs estiverem no ar.

## Dados e regras

O Omie é a fonte oficial; o Skip Cloud guarda só a camada complementar. Leitura real do Omie e da Nuvemshop pode ser usada logo depois de construída, respeitando o limite de consultas do Omie. Toda gravação no Omie (ordem de produção, pedido de compra, pedido de venda) é construída com a chave desligada e provada no simulador; só liga com a autorização do dono, uma por vez, quando a condição do checklist estiver cumprida. A nota fiscal continua sendo emitida por uma pessoa no Omie. A leitura das notas de entrada e a gravação do recebimento estão em revisão.

## Organização

- `04_fase-atual/`: 48 tarefas, checklist do cliente e 18 SPECs da fase 3.
- `05_entregas/fase-1/`: contratos homologados e evidências da fase 1.
- `05_entregas/fase-2/`: tarefas, SPECs e evidências da fase 2, fechada por AC-26-01.
- `05_entregas/fase-3/`: evidências da fase 3.
- `06_notas/`: aprendizados, dúvidas e registros.
- `07-sistemas/`: contratos de integração e o código do sistema.

Só o consultor libera e encerra; veja `AGENTS.md`. Repositório: `drkgod/American-Goodies` (privado).

## Repositório do sistema

O código do sistema está vinculado como submódulo em `07-sistemas/mcc-automacao-fabrica`. Para baixar a pasta com o sistema:

```sh
git clone --recurse-submodules https://github.com/drkgod/American-Goodies.git
```

Em um clone existente, execute `git submodule update --init --recursive`.
