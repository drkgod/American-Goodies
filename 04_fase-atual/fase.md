# Fase 4 — Tarefas

<!-- fase-format:2 -->

Cada linha é uma tarefa da Jornada de Execução. **Tudo que cabe num card cabe nesta linha** — se um
campo não estiver aqui, ele não tem como ser preenchido, porque é este arquivo que cria a tarefa.

```
- [ ] Título da tarefa @responsável !30/09/2026 #projeto [interno]   <!-- id:… -->
      > descrição da tarefa, uma ou mais linhas
  - [ ] subtarefa (basta indentar 2 espaços)                         <!-- id:… -->
    - [ ] sub-subtarefa (indente mais 2)                             <!-- id:… -->
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
Um título que TERMINA na forma de um marcador sai escapado com `\\` (`Ligar para \\@joao`); a barra é
só para o parser e nunca aparece no card. Você não precisa escrever isso à mão.
Marque `[x]` para concluir e adicione linhas novas à vontade: elas entram no quadro na próxima
sincronização e voltam aqui com o `<!-- id:… -->` preenchido. **Não apague o marcador de id** das
tarefas que já têm um.

- [x] Separar no servidor os registros de teste e de demonstração dos reais @"American Goodies"
  > Tudo o que for gravado por conta de teste ou com produto de demonstração fica marcado, fora dos relatórios e da exportação, e nunca pode ser autorizado nem enviado ao Omie. SPEC-4-001 · CA-4-34.
  > Resultado (05/11/2026, Skip v0.0.199, ref 6e93652): marca `demonstracao` nas coleções de produção, compras e faturamento (migration 0047, campo `teste` no perfil) e hook de marcação; as rotas de autorização e de envio da ordem, do pedido de compra e do pedido de venda recusam registro marcado (422); consolidação marcada não prepara ordem. Provas do módulo: 5 testes CA-4-34 e regressão 211 de 211. Rotas só provadas no servidor na SPEC-4-007 (falta o usuário de teste).
- [ ] Gravar no servidor a programação publicada na tela de Planejamento @"American Goodies"
  > A programação passa a ficar no servidor, com versão e com os parâmetros aprovados; outra pessoa vê a mesma, e publicar sobre versão antiga avisa. As rotas de produção passam a exigir a área. SPEC-4-001 · CA-4-01 e CA-4-04.
- [ ] Gravar no servidor os apontamentos da cozinha e do encaixotamento @"American Goodies"
  > O apontamento fica guardado no servidor, não na tela, e o reenvio do mesmo apontamento não duplica. SPEC-4-001 · CA-4-02.
- [ ] Gravar no servidor as conferências e a aprovação da consolidação @"American Goodies"
  > Conferência e aprovação passam a ser gravadas no servidor, sem dado fixo de demonstração; a aprovação prepara a ordem de produção para o Omie, sem enviar nada, e Consolidações mostra o estado. SPEC-4-001 · CA-4-03 e CA-4-05.
- [ ] Levar a produção gravada no servidor para os relatórios, os alertas e a exportação @"American Goodies"
  > O relatório de produção, o alerta de produção atrasada e a exportação passam a usar o que foi programado e apontado; registro de demonstração fica de fora. SPEC-4-001 · CA-4-33.
- [ ] Tirar do sistema os arquivos de diagnóstico que guardam chave de acesso ao Omie @"American Goodies"
  > Os arquivos de diagnóstico com chave são apagados e nenhum outro arquivo do sistema guarda chave ou senha. SPEC-4-001 · CA-4-35.
- [ ] Organizar o menu lateral por área, com ícones e versão para celular @"American Goodies"
  > O menu passa a ter 6 grupos com ícones, recolhe no computador e abre por um botão no celular; o cabeçalho mostra a tela, os alertas e o menu da pessoa. Cada pessoa vê só as telas das suas áreas. SPEC-4-003 · CA-4-11 a CA-4-13.
- [ ] Montar a tela inicial com os atalhos e os alertas de cada pessoa @"American Goodies"
  > A tela inicial mostra a saudação, a data, os alertas abertos e os atalhos de quem entrou. SPEC-4-003 · CA-4-14.
- [ ] Reescrever títulos, mensagens de erro e explicações na língua da operação @"American Goodies"
  > Mensagens de erro e estados ficam em português simples, num lugar só; a explicação de cada regra vai para "Como funciona". SPEC-4-004 · CA-4-16 a CA-4-18.
- [ ] Tirar das telas os resultados de teste, os códigos internos e os termos técnicos @"American Goodies"
  > Saem das telas os cartões de teste, os códigos do método e do portal e termos como null, payload e replay. SPEC-4-004 · CA-4-15.
- [ ] Trocar as tabelas e os seletores pelos do kit, com números no formato brasileiro @"American Goodies"
  > Tabelas e campos do kit, com números alinhados, unidade junto, "—" onde falta informação e paginação. SPEC-4-005 · CA-4-19 e CA-4-20.
- [ ] Dar retorno visual ao salvar, ao corrigir um apontamento e ao carregar as telas @"American Goodies"
  > Ao salvar aparece "Salvo" ou o erro; a correção de apontamento abre uma janela de verdade; o carregamento mostra o esqueleto da tela. SPEC-4-005 · CA-4-20 e CA-4-23.
- [ ] Padronizar os avisos em três níveis e os selos de estado com cor e ícone @"American Goodies"
  > Um aviso no máximo no topo de cada tela, em três níveis; cada estado com selo colorido e ícone; "Dados de demonstração" só onde houver. SPEC-4-005 · CA-4-21 e CA-4-22.
- [ ] Adaptar apontamentos, conferências, recebimentos e preparação de pedidos para o celular @"American Goodies"
  > Nas quatro telas, no celular, cada item vira um cartão, o botão principal fica fixo embaixo e o teclado abre em números; no tablet, só as colunas essenciais. SPEC-4-006 · CA-4-24 e CA-4-25.
- [ ] Tirar a rolagem para o lado de todas as telas no celular e no tablet @"American Goodies"
  > Nenhuma tela passa da largura do celular, do tablet ou do computador. SPEC-4-006 · CA-4-26.
- [ ] Montar 3 propostas de visual com o logo e as cores da American Goodies @"American Goodies"
  > Com o logo e as cores recebidos, o Maestro mostra 3 propostas (login, início e uma tabela, no computador e no celular) e o dono escolhe uma. É o único ponto de aprovação antes da sessão final. SPEC-4-002 · CA-4-06.
- [ ] Aplicar o visual escolhido no tema, no login, na aba do navegador e na página de erro @"American Goodies"
  > O sistema ganha as cores, a fonte e o logo da marca, o título "PCP American Goodies", o ícone, o idioma português e a página de erro em português. SPEC-4-002 · CA-4-07 a CA-4-10.
- [ ] Rodar as leituras reais do Omie, uma por vez, quando a chave for liberada @"American Goodies"
  > Depois do aviso do dono de que o Omie liberou a chave, catálogo, 90 dias, fornecedores, pedidos de compra, entregas, clientes e históricos são lidos um por vez e conferidos. SPEC-4-007 · CA-4-27.
- [ ] Conferir no servidor todas as telas e rotas com o usuário de teste @"American Goodies"
  > Com os usuários de teste criados pelo dono, as rotas das fases 3 e 4 são chamadas no servidor, com tudo marcado como demonstração, e as provas de todas as fases rodam. SPEC-4-007 · CA-4-28.
- [ ] Preparar a sessão final: provas de ponta a ponta e roteiro de cada área @"American Goodies"
  > Provas verdes na véspera, contas reais com os acessos aprovados, roteiro de cada área e lista do que está pronto para ligar no Omie; o dono é avisado para marcar a data. SPEC-4-007 · CA-4-29.
- [ ] Fazer a sessão de validação final com a equipe @"American Goodies"
  > Com a equipe, o fluxo inteiro com dados reais, as gravações no Omie ligadas pelo dono uma por vez, a conferência do visual no aparelho de cada um e o aceite. SPEC-4-007 · CA-4-30 a CA-4-32.
