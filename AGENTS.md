# Instruções — American Goodies

Antes de trabalhar, leia `README.md`, `04_fase-atual/specs/00-INDICE.md` (com as regras comuns), o card e a SPEC dele. Preserve id, estado, responsável, prazo e edições do cliente. O escopo que vale é o recorte das SPECs e do índice da fase 3.

## Fase 3 única — AC-26-01 (26/10/2026)

- A fase 3 é a última fase do projeto. Ela contém todas as SPECs que faltam (3-001 a 3-018); as fases 4 e 5 não têm tarefas. Só o consultor publica `04_fase-atual/`, libera fase ou encerra o projeto.
- Construa as tarefas em sequência, na ordem do `fase.md`, sem teste no meio e sem pedir autorização antes de cada uma. Cada tarefa fecha quando as provas automáticas da sua SPEC passam e a evidência fica em `05_entregas/fase-3/spec-3-NNN/`.
- O único teste com o cliente é a sessão de validação final (SPEC-3-018), depois de todas as SPECs. As outras SPECs dizem o que o cliente confere nessa sessão.
- "Pode continuar", "pode seguir", "passou" ou "testei" do dono durante a construção significam seguir para a próxima tarefa. O aceite só vale na sessão final.
- Bloqueio localizado: se uma tarefa depender do Omie bloqueado, de um dado do cliente ou de uma resposta do checklist, construa o que não depende, registre o motivo em `06_notas/` e no `STATUS.md`, deixe a tarefa em `[/]` e siga para a próxima. Volte quando a entrada chegar. Não invente dado, parâmetro, alçada, fator nem regra.
- Compras e recebimento (SPECs 3-003 a 3-007) e preparação de pedidos e faturamento (SPECs 3-008 e 3-009) são independentes: um bloqueio num bloco não para o outro.

## O que o Maestro não faz

- Não cria, renomeia, apaga nem reescreve tarefa, SPEC, critério, emenda, índice ou checklist. Não cria id de tarefa (`<!-- id -->`) nem de checklist (`CL-…`). Pedido novo, divergência entre SPEC e pedido do dono ou lacuna que muda o aceite vão para o consultor: registre em `06_notas/` e siga com o que a SPEC já fecha.
- Em `04_fase-atual/` só marca o estado das tarefas (`[ ]`, `[/]`, `[x]`), registra o resultado numa linha `> ` embaixo da tarefa e preenche o checklist de execução das SPECs.
- Não marca `[x]` sem as provas da SPEC e a evidência registrada.

## Arquivo de tarefas lido pelo portal

O portal mostra os cartões a partir do arquivo de tarefas do plano; o `04_fase-atual/fase.md` é a cópia do executor e precisa ficar compatível:

- Não escreva nada no título depois do prazo `!dd/mm/aaaa`; resultado vai na linha `> `.
- Mantenha `@"American Goodies"` e o prazo em todas as tarefas; não acrescente `[interno]`.
- Não apague o `<!-- id:… -->`. Linha sem id vira cartão novo, duplicado.

## Escrita no Omie

- Toda gravação no Omie tem chave própria, desligada: `omie_op_escrita` (ordem de produção), `omie_pedido_compra_escrita` (pedido de compra), `omie_pedido_venda_escrita` (pedido de venda, volumes e frete) e `omie_recebimento_escrita` (recebimento, em revisão: não construir).
- Construa e prove tudo com o simulador do Omie. Com a chave desligada, nada é gravado.
- A chave só liga com a autorização explícita do dono, na sessão final ou quando ele autorizar, uma por vez e com a condição do checklist cumprida. A primeira gravação de cada tipo é feita com o dono presente e conferida no Omie logo depois.
- Ter a credencial cadastrada não liga nada. Não crie, copie, imprima nem cadastre credencial ou segredo.
- Antes de qualquer repetição, consulte o Omie. Nunca reverta automaticamente um efeito gravado.
- O sistema não emite nota fiscal nem lança nada no financeiro.

## Leitura do Omie

- Leitura real pode ser usada logo depois de construída.
- Um sub-lote por vez, com pausa entre chamadas e retomada pelo ponto em que parou.
- Resposta de bloqueio por excesso de consultas (HTTP 425) ou "consumo redundante" para a rotina, registra a hora da próxima tentativa e mantém o último dado válido. Nunca repita em laço.
- A chave do Omie está bloqueada desde 23/10; a decisão de desbloqueio é do dono (checklist CL-PEND-006).
- Notas fiscais de entrada: a origem está em revisão (CL-PEND-007). Não especifique fonte, não construa leitura de notas reais e não peça a nota em formato novo.

## Ao terminar

- Quando a última tarefa de construção (até a SPEC-3-017) estiver pronta, registre `etapa: validacao_final_pronta` no `.adapta-cliente/estado-atual.md`, diga ao dono "a construção terminou; falta marcar a sessão de validação final" e liste as condições do checklist cumpridas e pendentes para cada gravação e loop.
- Depois da sessão, registre o aceite e as pendências em `05_entregas/fase-3/validacao-final.md`, registre `etapa: projeto_aguardando_encerramento`, diga ao dono que o encerramento é com o consultor e pare.

## Dados e privacidade

- Não escreva no repositório segredo, senha, chave, telefone, e-mail, CPF ou CNPJ de pessoa, contato de fornecedor ou dado de cliente. Use o papel ("PCP", "comprador", "dono") ou o id interno do sistema.
- Dados de demonstração ficam marcados e separados dos reais.
- Antes de pedir uma entrada ao cliente, confira o que já foi recebido (06_notas, 07-sistemas, evidências). Peça só o que falta, dizendo para qual tela e SPEC.
