# Instruções — American Goodies

Antes de trabalhar, leia `README.md`, `04_fase-atual/specs/00-INDICE.md` (com as regras comuns), o card e a SPEC dele. Preserve id, estado, responsável, prazo e edições do cliente. O escopo que vale é o recorte das SPECs e do índice da fase atual.

## Fase 4 — P6 (03/11/2026)

- A fase 4 tem 7 SPECs (4-001 a 4-007) e 21 tarefas:
  - separa no servidor o que é teste ou demonstração do real e liga as telas de produção ao servidor;
  - dá ao sistema o acabamento visual da American Goodies (identidade, menu, linguagem, componentes, celular e tablet);
  - faz as leituras reais do Omie e a sessão de validação final.

  A fase 5 não tem tarefas. Só o consultor publica `04_fase-atual/`, libera fase ou encerra o projeto.
- A fase 3 está guardada em `05_entregas/fase-3/` (`fase.md` e `specs/`).
  - As 46 tarefas dela continuam em andamento.
  - As SPECs 3-001 a 3-017 continuam valendo como contrato do que foi construído. A SPEC-3-018 foi substituída pela SPEC-4-007; não a execute.
  - Quando chegar a entrada que segurava uma tarefa da fase 3, complete a parte pendente pela SPEC de origem, registre na linha `> ` da tarefa em `05_entregas/fase-3/fase.md` e marque `[x]` quando as provas passarem.
- Construa as tarefas em sequência, na ordem do `fase.md`, sem teste no meio e sem pedir autorização antes de cada uma. Cada tarefa fecha quando as provas automáticas da sua SPEC passam e a evidência fica em `05_entregas/fase-4/spec-4-NNN/`.
- A SPEC-4-002 (identidade visual) vem depois da 4-006, porque as propostas mostram o menu novo e os componentes do kit. Há um único ponto de aprovação antes da sessão final: o dono escolhe uma das 3 propostas. Enquanto ele não responde, siga com as tarefas da SPEC-4-007 que não dependem do visual.
- O teste com o cliente é a sessão de validação final (SPEC-4-007). "Pode continuar", "pode seguir", "passou" ou "testei" do dono durante a construção significam seguir para a próxima tarefa. O aceite só vale na sessão final.
- Nas SPECs de acabamento (4-002 a 4-006), não mude regra, cálculo, permissão, rota do servidor nem gravação no Omie. Se a mudança visual parecer exigir isso, registre em `06_notas/` e siga.
- Bloqueio localizado: se uma tarefa depender do Omie bloqueado, de um dado do cliente ou de uma resposta do checklist, construa o que não depende, registre o motivo em `06_notas/` e no `STATUS.md`, deixe a tarefa em `[/]` e siga para a próxima. Volte quando a entrada chegar. Não invente dado, parâmetro, alçada, fator nem regra.
- Ao terminar cada tarefa, espelhe em `07-sistemas/pcp/codigo/` os arquivos que ela criou ou alterou (telas, componentes, tema, hooks e migrations), sem segredo. O código vivo está no projeto Skip 62774. O submódulo `07-sistemas/mcc-automacao-fabrica` parou em 01/10 e não é referência.

## O que o Maestro não faz

- Não cria, renomeia, apaga nem reescreve tarefa, SPEC, critério, emenda, índice ou checklist. Não cria id de tarefa (`<!-- id -->`) nem de checklist (`CL-…`). Pedido novo, divergência entre SPEC e pedido do dono ou lacuna que muda o aceite vão para o consultor: registre em `06_notas/` e siga com o que a SPEC já fecha.
- Em `04_fase-atual/` só marca o estado das tarefas (`[ ]`, `[/]`, `[x]`), registra o resultado numa linha `> ` embaixo da tarefa e preenche o checklist de execução das SPECs.
- Não marca `[x]` sem as provas da SPEC e a evidência registrada.

## Arquivo de tarefas lido pelo portal

O portal mostra os cartões a partir do arquivo de tarefas do plano; o `04_fase-atual/fase.md` é a cópia do executor e precisa ficar compatível:

- Não escreva nada no título depois do responsável ou do prazo; resultado vai na linha `> `.
- Mantenha `@"American Goodies"` em todas as tarefas e o prazo quando houver; não acrescente `[interno]`.
- Não apague o `<!-- id:… -->`. Linha sem id vira cartão novo, duplicado.

## Escrita no Omie

- Toda gravação no Omie tem chave própria, desligada:
  - `omie_op_escrita` (ordem de produção);
  - `omie_pedido_compra_escrita` (pedido de compra);
  - `omie_pedido_venda_escrita` (pedido de venda, volumes e frete);
  - `omie_recebimento_escrita` (recebimento, em revisão: não construir).
- Construa e prove tudo com o simulador do Omie. Com a chave desligada, nada é gravado.
- A chave só liga com a autorização explícita do dono, na sessão final ou quando ele autorizar, uma por vez e com a condição do checklist cumprida. A primeira gravação de cada tipo é feita com o dono presente e conferida no Omie logo depois.
- Ter a credencial cadastrada não liga nada. Não crie, copie, imprima nem cadastre credencial ou segredo.
- Antes de qualquer repetição, consulte o Omie. Nunca reverta automaticamente um efeito gravado.
- O sistema não emite nota fiscal nem lança nada no financeiro.

## Leitura do Omie

- A chave do Omie está bloqueada desde 22/10 (MISUSE_API_PROCESS); o desbloqueio é pelo suporte do Omie, com o dono (checklist CL-PEND-006).
- Não chame o Omie até o dono avisar que a chave foi liberada. Depois do aviso, a primeira chamada é uma consulta leve, de um produto. Se vier bloqueio, pare e registre a hora.
- Um sub-lote por vez, com pausa entre chamadas e retomada pelo ponto em que parou. Espere 60 segundos antes de repetir a mesma consulta.
- Resposta de bloqueio por excesso de consultas (HTTP 425) ou "consumo redundante" para a rotina, registra a hora da próxima tentativa e mantém o último dado válido. Nunca repita em laço.
- Não agende rotina que consulte o Omie.
- Notas fiscais de entrada: a origem está em revisão (CL-PEND-007). Não especifique fonte, não construa leitura de notas reais e não peça a nota em formato novo.

## Ao terminar

- Quando a última tarefa de construção (até a SPEC-4-006) estiver pronta, registre `etapa: validacao_final_pronta` no `.adapta-cliente/estado-atual.md`, diga ao dono "a construção terminou; falta marcar a sessão de validação final" e liste as condições do checklist cumpridas e pendentes para cada gravação e loop.
- Depois da sessão, registre o aceite e as pendências em `05_entregas/fase-4/validacao-final.md`, registre `etapa: projeto_aguardando_encerramento`, diga ao dono que o encerramento é com o consultor e pare.

## Dados e privacidade

- Não escreva no repositório segredo, senha, chave, telefone, e-mail, CPF ou CNPJ de pessoa, contato de fornecedor ou dado de cliente. Use o papel ("PCP", "comprador", "dono") ou o id interno do sistema.
- Dados de demonstração, e tudo o que os usuários de teste gravarem, ficam marcados e separados dos reais. Registro marcado nunca é autorizado nem enviado ao Omie.
- Capturas de tela da evidência usam dado de demonstração, ou cobrem nome de cliente, contato de fornecedor e valor financeiro.
- Antes de pedir uma entrada ao cliente, confira o que já foi recebido (06_notas, 07-sistemas, evidências). Peça só o que falta, dizendo para qual tela e SPEC.
