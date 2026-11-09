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
- [/] Gravar no servidor a programação publicada na tela de Planejamento @"American Goodies"
  > A programação passa a ficar no servidor, com versão e com os parâmetros aprovados; outra pessoa vê a mesma, e publicar sobre versão antiga avisa. As rotas de produção passam a exigir a área. SPEC-4-001 · CA-4-01 e CA-4-04.
  > Resultado parcial (06/11/2026, Skip v0.0.203, ref dc69d76): /planejamento lê os parâmetros aprovados e o calendário (dias de produção por recurso, novo campo editável em /parametros) e publica pela rota do servidor, com versão, 409, "Publicar" desabilitado sem parâmetros e releitura a cada 30 s e ao focar; sem constantes de demonstração. As rotas de produção passaram a exigir a área (planejamento, apontar_producao, conferir_expedicao, painel). Provas do módulo: CA-4-01 (4) e CA-4-04 (1); regressão 216 de 216. Falta a prova no servidor (usuário de teste, SPEC-4-007) e, no CA-4-04, a negação por área nas outras rotas e telas. Removido da tela o bloco de reprogramação de demonstração (dados fixos).
- [/] Gravar no servidor os apontamentos da cozinha e do encaixotamento @"American Goodies"
  > Resultado parcial (09/11/2026, Skip v0.0.204, ref f957670): /apontamentos lê a programação e os eventos do servidor e grava só por `pb.send` (cliente `pcp-producao`); o identificador do evento nasce na tela e é reaproveitado no reenvio, que mostra "já registrado" sem duplicar; retificação com motivo; resumo por item e por ponto vindo do servidor; releitura a cada 30 s e ao focar; "Não foi possível carregar" com "Tentar de novo". Saíram da tela os blocos de oráculos com dados fixos e as constantes `*_DEMO`. Provas do módulo: CA-4-02 (8) e CA-4-05 da tela (1); regressão 225 de 225. Falta a prova no servidor (usuário de teste, SPEC-4-007): continuar visível depois de fechar e abrir o navegador.
  > O apontamento fica guardado no servidor, não na tela, e o reenvio do mesmo apontamento não duplica. SPEC-4-001 · CA-4-02.
- [/] Gravar no servidor as conferências e a aprovação da consolidação @"American Goodies"
  > Resultado parcial (09/11/2026, Skip v0.0.205, ref 8cb5fd8): /conferencias lê a programação, os apontamentos, as conferências, as aprovações e a ordem preparada do servidor e grava só por `pb.send`; a expedição e a câmara conferem cada uma pela sua ação, ponto e a área `conferir_expedicao`; o PCP (ação `aprovar_consolidacao`, área `painel`) aprova com motivo e a ordem `concluir_op` fica `preparada`, sem chamada ao Omie; sem as duas conferências a aprovação é recusada com o motivo. A rota e o item de menu aceitam `conferir_expedicao` ou `painel` (guarda com alternativas "a|b") e a troca fixa `DEMO_CONFERENCIA` saiu. /consolidacoes lista, só leitura, a ordem, as conferências, a aprovação e o estado da ordem; a fila de simulação saiu. Provas do módulo: CA-4-03 (8), CA-4-04 da tela (2) e CA-4-05 (3); regressão 236 de 236. Falta a prova no servidor (usuário de teste, SPEC-4-007) e a negação por área exercitada nas rotas.
  > Conferência e aprovação passam a ser gravadas no servidor, sem dado fixo de demonstração; a aprovação prepara a ordem de produção para o Omie, sem enviar nada, e Consolidações mostra o estado. SPEC-4-001 · CA-4-03 e CA-4-05.
- [/] Levar a produção gravada no servidor para os relatórios, os alertas e a exportação @"American Goodies"
  > Resultado parcial (09/11/2026, Skip v0.0.206, ref 1ee38b8): a exportação inclui `pcp_programacoes`, `pcp_apontamentos`, `pcp_conferencias_op` e `pcp_aprovacoes_consolidacao` (a recuperação lê a mesma lista) e deixa de fora os registros marcados como demonstração, contando só os reais; o bloco de produção do relatório (planejado × produzido × conferido, `relatorioProducao`) lê a última programação real, os apontamentos e as conferências do servidor, com "sem dado" no lugar de zero; a regra de produção atrasada (`regraProducao`) passou a rodar sobre as ordens da programação real sem apontamento, ignorando demonstração. Provas do módulo: CA-4-33 (9); regressão 245 de 245. Escolhas a confirmar com o consultor (06_notas): produzido = realizado da cozinha, conferido = última conferência de câmara, unidade UN quando a ordem não tem evento. O bloco de consumo segue "sem dados" (falta a ficha técnica real). Falta a prova no servidor (usuário de teste, SPEC-4-007) e o espelho dos hooks.
  > O relatório de produção, o alerta de produção atrasada e a exportação passam a usar o que foi programado e apontado; registro de demonstração fica de fora. SPEC-4-001 · CA-4-33.
- [/] Tirar do sistema os arquivos de diagnóstico que guardam chave de acesso ao Omie @"American Goodies"
  > Os arquivos de diagnóstico com chave são apagados e nenhum outro arquivo do sistema guarda chave ou senha. SPEC-4-001 · CA-4-35.
  > Resultado parcial (06/11/2026, Skip v0.0.202, ref 9e6da11): os 3 hooks de diagnóstico (`pcp_catalogo_dirigido_run`, `pcp_diag_omie_bruto`, `pcp_diag_prod4`) estão apagados no ar, com o segredo de reserva. Falta a busca de segredo em todo o projeto (CA-4-35): não há ferramenta de busca no Skip e ler os ~170 arquivos um a um não cabe; fica para a SPEC-4-007. Lidas até aqui: migrations 0003 e 0022 (só `$secrets.get`, sem valor).
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
