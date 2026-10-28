# Fase 3 — Tarefas

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

- [/] Trazer o catálogo real do Omie produto a produto, sem estourar o limite de consultas @"American Goodies" !28/10/2026
  > O catálogo passa a vir do Omie consultando cada produto do estoque, em lotes pequenos, com pausa e retomada. Se o Omie bloquear, a tela mostra a hora da nova tentativa e mantém o último catálogo. SPEC-3-001 · CA-3-01.
  > Resultado 28/10: contrato e rotina no ar (Skip v0.0.173), com parada no 425; falta a leitura real e a conferência de 3 produtos, que esperam o Omie liberar a chave (CL-PEND-006). Evidência: 05_entregas/fase-3/spec-3-001/.
- [/] Mostrar ao PCP a lista do que falta cadastrar no Omie @"American Goodies" !28/10/2026
  > Produto que aparece no estoque, numa ficha ou num pedido e não está no cadastro entra na lista com o código e onde aparece. O PCP cadastra no Omie e a leitura seguinte tira da lista. SPEC-3-001 · CA-3-02.
  > Resultado 28/10: lista e tela no ar (Skip v0.0.173); cobre só o estoque, ficha e pedido ainda sem leitura guardada; sem dado real até o Omie liberar a chave. Evidência: 05_entregas/fase-3/spec-3-001/.
- [/] Importar os 90 dias reais de vendas, produção e compras a receber @"American Goodies" !29/10/2026
  > A importação já construída roda com os dados reais e os pedidos firmes pela regra aprovada em 21/10. Falha mantém a importação anterior; dado desconhecido fica pendente, nunca zero. SPEC-3-001 · CA-3-03.
  > Resultado 28/10: conversão dos pedidos de venda e de compra do Omie pronta e no ar (Skip v0.0.173); a leitura real dos 90 dias e as ordens de produção esperam o Omie liberar a chave (CL-PEND-006). Nota: 06_notas/bloqueio-omie-leitura-real-2026-10-28.md.
  > Atualização 28/10: 6 testes da conversão executados e passando; leitura real segue pendente do Omie.
- [/] Calcular as sugestões de produção e de compra com os números reais @"American Goodies" !29/10/2026
  > Pelo método aprovado em 21/10. Cada sugestão mostra de onde veio cada número; item sem dado fica pendente com o motivo. Nada é publicado nem comprado. O PCP confere os números na validação final. SPEC-3-001 · CA-3-04.
  > Resultado 28/10: o método (baseline90-v1) e a memória de cálculo já estão construídos e provados com dados de exemplo desde a fase 2; o cálculo real espera o catálogo e os 90 dias reais, que esperam o Omie liberar a chave (CL-PEND-006). Nota: 06_notas/bloqueio-omie-leitura-real-2026-10-28.md.
- [/] Usar programação, apontamentos e conferências com os produtos e as contas reais @"American Goodies" !30/10/2026
  > As telas da fase 2 passam a usar o catálogo real e as contas da matriz aprovada; o acesso de demonstração das conferências sai e a demonstração fica separada. Nada vai para o Omie. SPEC-3-001 · CA-3-05.
  > Resultado 28/10: não construída ainda. As telas de planejamento, apontamentos e conferências seguem com dados de demonstração marcados; trocar para produtos e ordens reais depende do catálogo real e das ordens de produção lidas do Omie (chave bloqueada, CL-PEND-006). O acesso de demonstração da conferência só sai junto, para a tela não ficar sem uso.
- [/] Ligar o envio da produção ao Omie com o envio desligado e provar no simulador @"American Goodies" !30/10/2026
  > A fila de envio ganha a ligação real com o Omie, mas com a chave desligada nada é gravado. No simulador, uma ordem conferida e aprovada é concluída uma vez, mesmo com clique duplo, queda ou resposta perdida. SPEC-3-002 · CA-3-06.
  > Resultado 28/10: rota de envio com chave desligada (423), simulador e contrato no ar (Skip v0.0.174); provado por teste de mesa, a suíte não pôde rodar neste computador (sem Node). Nenhuma chamada ao Omie. Evidência: 05_entregas/fase-3/spec-3-002/.
  > Atualização 28/10: 10 de 10 testes da SPEC-3-002 executados e passando (P3.02-01/03/04); falta rodar a regressão da fase 2 (P3.02-05).
- [/] Preparar a autorização do dono e a conferência depois do envio @"American Goodies" !03/11/2026
  > A tela mostra ao dono a ordem, o produto, a quantidade, a data e o efeito no estoque. Só ele autoriza, uma ordem por vez. Depois do envio, o sistema confere a ordem, a quantidade, o status e o estoque. SPEC-3-002 · CA-3-07.
  > Resultado 28/10: autorização por ordem, desfazer, conferência só leitura e tela "Envio ao Omie" no ar (Skip v0.0.175); 10 de 10 testes passando. Ainda não há ordem real para autorizar: a preparação depende das conferências reais (Omie bloqueado). Evidência: 05_entregas/fase-3/spec-3-002/.
- [/] Criar os acessos de compras e recebimento por área @"American Goodies" !03/11/2026
  > Novas ações para comprador, aprovador, almoxarifado e financeiro, conferidas no servidor. Na construção valem perfis de teste; as contas reais recebem as ações pela matriz que o dono aprovar. SPEC-3-003 · CA-3-08.
  > Resultado 28/10: oito ações e guarda no servidor, área recebimento e rota de acesso no ar (Skip v0.0.177); testes passando (P3.03-01); falta a regressão dos acessos da fase 2 e nenhuma conta real recebeu ação (matriz CL-003). Evidência: 05_entregas/fase-3/spec-3-003/.
- [/] Montar o cadastro de fornecedores com os contatos em campos separados @"American Goodies" !04/11/2026
  > O fornecedor vem do Omie; a tela acrescenta contatos (nome, função, telefone, e-mail) e o prazo de entrega, cada um no seu campo. O cadastro do Omie não é alterado. SPEC-3-003 · CA-3-09.
  > Resultado 28/10: complemento com contatos em campos próprios, prazo e versões, rotas e tela no ar (Skip v0.0.177); a lista de fornecedores do Omie espera a chave do Omie (CL-PEND-006). Evidência: 05_entregas/fase-3/spec-3-003/.
- [/] Barrar a compra de item que não está cadastrado no Omie @"American Goodies" !04/11/2026
  > Requisição, cotação ou recebimento de item sem cadastro param com o aviso 'cadastrar no Omie antes'. Exceção só com autorização e motivo, e fica pendente até o item aparecer no cadastro. SPEC-3-003 · CA-3-10.
  > Resultado 28/10: regra, exceção autorizada e rota de avaliação no ar (Skip v0.0.177); testes passando (P3.03-02); as telas de requisição, cotação e recebimento (SPECs 3-005 a 3-007) vão usar a mesma regra. Evidência: 05_entregas/fase-3/spec-3-003/.
- [/] Converter a unidade de compra para a unidade de estoque só com fator confirmado @"American Goodies" !05/11/2026
  > Ex.: saco de 25 kg vira 25 KG pelo fator confirmado por Compras. Sem fator, a quantidade fica na unidade de compra com pendência e o preço não é comparado. Mudar o fator cria versão nova. SPEC-3-003 · CA-3-11.
  > Resultado 28/10: fator versionado, conversão e tela no ar (Skip v0.0.177); testes passando (P3.03-03 e 04: 4 sacos de 25 kg a R$ 250,00 = 100 KG a R$ 10,00). Evidência: 05_entregas/fase-3/spec-3-003/.
- [/] Montar o histórico de preços por produto e por fornecedor @"American Goodies" !05/11/2026
  > Preço sempre na unidade de estoque, por fornecedor e data. Frete, serviço e N-D ficam fora do histórico de insumos, mas continuam no registro do documento. Item sem classificação fica 'a classificar'. SPEC-3-004 · CA-3-12.
  > Resultado 28/10: classificação, histórico por fornecedor na unidade de estoque, rotas e tela no ar (Skip v0.0.178); 64 testes passando (P3.04-01 a 03: 4 sacos a R$ 250,00 = R$ 10,00/KG). Falta só carregar os pedidos reais, que depende da chave do Omie. Evidência: 05_entregas/fase-3/spec-3-004/.
- [/] Trazer o histórico real dos pedidos de compra do Omie @"American Goodies" !06/11/2026
  > Reaproveita a leitura de pedidos de compra já provada na fase 2 (pedido 1514). Os campos de preço são conferidos numa amostra antes do uso; campo que não vier fica pendente, nunca zero. SPEC-3-004 · CA-3-13.
  > Resultado 28/10: conversor e chave de linha prontos e provados em fixture; a leitura de preço está desligada até os campos serem conferidos numa amostra real (chave do Omie bloqueada, CL-PEND-006). Evidência: 05_entregas/fase-3/spec-3-004/.
- [/] Transformar a necessidade de compra em requisição por fornecedor @"American Goodies" !06/11/2026
  > A sugestão de compra aceita, ou um pedido do comprador, vira requisição separada por fornecedor, com quantidade, data necessária e marca de compra emergencial com motivo. SPEC-3-005 · CA-3-14.
  > Resultado 28/10: requisição por fornecedor (manual), nas duas unidades, com emergência e sem duplicar, rota e tela no ar (Skip v0.0.179); testes passando (P3.05-01). O botão no cartão da sugestão espera as sugestões reais (chave do Omie). Evidência: 05_entregas/fase-3/spec-3-005/.
- [/] Registrar cotações com preço e prazo e comparar com o histórico @"American Goodies" !09/11/2026
  > Uma ou mais cotações por item, com preço convertido para a unidade de estoque e prazo de entrega. A tela mostra a diferença para o último preço e destaca o que passar da tolerância cadastrada. SPEC-3-005 · CA-3-15.
  > Resultado 28/10: cotações, escolha e diferença para o último preço no ar (Skip v0.0.179); testes passando (P3.05-05); a comparação usa o histórico, ainda vazio até a carga real, e a tolerância ainda não foi cadastrada (CL-PEND-001). Evidência: 05_entregas/fase-3/spec-3-005/.
- [/] Aprovar a compra pela alçada, com registro de quem aprovou @"American Goodies" !09/11/2026
  > Só quem tem a alçada aprova, com data e motivo; recusa também tem motivo. Mudança depois da aprovação pede aprovação nova. Sem alçada cadastrada, a aprovação real fica parada com o motivo. SPEC-3-005 · CA-3-16.
  > Resultado 28/10: aprovação e recusa por alçada, hash e invalidação por mudança no ar (Skip v0.0.179); testes passando (P3.05-02, 03 e 04); sem alçada cadastrada (CL-PEND-008) a aprovação real fica parada. Evidência: 05_entregas/fase-3/spec-3-005/.
- [/] Acompanhar as entregas dos pedidos de compra pelo Omie @"American Goodies" !10/11/2026
  > Por fornecedor: pedidos em aberto, data prevista, quanto chegou, quanto falta e quais estão atrasados; compras emergenciais aparecem marcadas. Só leitura do Omie. SPEC-3-006 · CA-3-17.
  > Resultado 28/10: tela de entregas com restante, atraso e emergência no ar (Skip v0.0.180); testes passando (P3.06-04); a lista fica vazia até a leitura real dos pedidos de compra (chave do Omie, CL-PEND-006). Evidência: 05_entregas/fase-3/spec-3-006/.
- [/] Preparar o lançamento da compra aprovada no Omie, com o envio desligado @"American Goodies" !10/11/2026
  > Desligado, a tela mostra os dados para o comprador lançar no Omie e liga o pedido lançado à compra aprovada pelo número. No simulador, ligado, o sistema lança uma vez e confere. SPEC-3-006 · CA-3-18.
  > Resultado 28/10: ligação por número conferido e lançamento atrás da chave desligada, com simulador de gravação única, no ar (Skip v0.0.180); testes passando (P3.06-01, 02, 03 e 05); a primeira gravação real depende do dono (CL-PEND-011). Evidência: 05_entregas/fase-3/spec-3-006/.
- [/] Conferir o recebimento contra o pedido aprovado, linha a linha @"American Goodies" !11/11/2026
  > O almoxarifado registra o que chegou e liga cada linha a um ou mais pedidos. Falta, sobra e item não pedido aparecem; nada ajusta o estoque sozinho. SPEC-3-007 · CA-3-19.
  > Resultado 28/10: conferência por linha com ligação a um ou mais pedidos, falta e sobra, no ar (Skip v0.0.182); testes passando (P3.07-01 e 04). Evidência: 05_entregas/fase-3/spec-3-007/.
- [/] Mostrar as parcelas e a compra já paga sem duplicar conta a pagar @"American Goodies" !11/11/2026
  > O financeiro vê as parcelas previstas de cada pedido e marca o que já foi pago antes. No recebimento, compra paga aparece com o aviso 'já paga: não lançar nova conta'. O sistema não lança nada no financeiro. SPEC-3-007 · CA-3-20.
  > Resultado 28/10: parcelas, pagamento antecipado e aviso de já paga, sem lançar nada no financeiro, no ar (Skip v0.0.182); testes passando (P3.07-02). Evidência: 05_entregas/fase-3/spec-3-007/.
- [/] Registrar o recebimento de item sem cadastro como exceção a regularizar @"American Goodies" !12/11/2026
  > Chegou item sem cadastro: entra só como exceção autorizada, com motivo, e fica pendente até o item ser cadastrado no Omie e ligado ao pedido. SPEC-3-007 · CA-3-21.
  > Resultado 28/10: item sem cadastro só entra por exceção autorizada e fica pendente, no ar (Skip v0.0.182); testes passando (P3.07-03). Evidência: 05_entregas/fase-3/spec-3-007/.
- [/] Montar a pré-conferência da nota de entrada com notas de demonstração @"American Goodies" !12/11/2026
  > Compara nota, pedido, recebimento e parcelas usando só notas de demonstração marcadas. A leitura das notas reais fica em revisão até o cliente dizer onde elas estão. SPEC-3-007 · CA-3-22.
  > Resultado 28/10: pré-conferência só com nota de demonstração, nota real recusada, no ar (Skip v0.0.182); testes passando (P3.07-05); leitura de nota real e escrita do recebimento seguem em revisão (CL-PEND-007). Evidência: 05_entregas/fase-3/spec-3-007/.
- [/] Criar os acessos de faturamento e expedição por área @"American Goodies" !13/11/2026
  > Novas ações para preparar pedido, conferir volumes e liberar para faturar, conferidas no servidor. Na construção valem perfis de teste; as contas reais seguem a matriz que o dono aprovar. SPEC-3-008 · CA-3-23.
  > Resultado 28/10: cinco ações na área nova faturamento, conferidas no servidor, no ar (Skip v0.0.183); testes passando (P3.08-01); nenhuma conta real recebeu ação nova (matriz CL-003). Evidência: 05_entregas/fase-3/spec-3-008/.
- [/] Montar o cadastro das unidades com o nome fantasia usado na operação @"American Goodies" !13/11/2026
  > Cada cliente do Omie ganha a unidade e o nome fantasia que a operação usa. Nome diferente vindo do canal fica 'a revisar' e não troca o cadastro sozinho. SPEC-3-008 · CA-3-24.
  > Resultado 28/10: unidades com versões, nomes de canal a revisar e telas no ar (Skip v0.0.183); testes passando (P3.08-02); a contagem de unidades reais espera a leitura de clientes do Omie (CL-PEND-006) e os dados das unidades (CL-PEND-010). Evidência: 05_entregas/fase-3/spec-3-008/.
- [/] Ligar cada pedido à tabela de preço e à origem do canal @"American Goodies" !16/11/2026
  > O pedido mostra a tabela da unidade, o subtotal recalculado e a origem (Omie, Lunet pelo Omie, Nuvemshop ou manual). Preço diferente da tabela aparece e não é trocado sozinho. SPEC-3-008 · CA-3-25.
  > Resultado 28/10: tabela de preço versionada, subtotal recalculado, origem e tela de preparação no ar (Skip v0.0.183); testes passando (P3.08-03 e 04); campos do pedido do Omie ainda sem amostra real e Lunet sem marcador. Evidência: 05_entregas/fase-3/spec-3-008/.
- [ ] Registrar o frete e os volumes conferidos pela expedição @"American Goodies" !16/11/2026
  > Cada pedido tem a modalidade de frete escolhida, sem FOB para todos, e os volumes contados pela expedição. Não há cálculo de cubagem; sem conferência o pedido fica bloqueado. SPEC-3-009 · CA-3-26.
- [ ] Montar a fila de pedidos aptos e bloqueados para faturar @"American Goodies" !17/11/2026
  > Apto só com unidade, tabela, frete, volumes e origem conferidos; bloqueado mostra o motivo. Quem tem a ação libera para faturar, e qualquer mudança depois desfaz a liberação. SPEC-3-009 · CA-3-27.
- [ ] Separar os pedidos manuais e impedir duplicata com pedido integrado @"American Goodies" !17/11/2026
  > Pedido manual entra marcado, com motivo. Antes de criar ou liberar, o sistema procura o mesmo pedido pela referência; parecido vai para revisão. Nunca junta só por cliente e valor. SPEC-3-009 · CA-3-28.
- [ ] Preparar o envio do pedido apto ao Omie, com o envio desligado @"American Goodies" !18/11/2026
  > Ligado, grava no Omie o pedido manual e os volumes e o frete do pedido liberado, uma vez, e confere. Desligado, a tela mostra o que lançar. A nota fiscal continua sendo emitida por uma pessoa no Omie. SPEC-3-009 · CA-3-29.
- [ ] Cadastrar os parâmetros de alerta por produto e por família @"American Goodies" !18/11/2026
  > Estoque mínimo, prazo do fornecedor, tolerância de preço e atrasos aceitos, por produto ou família, em versão aprovada. Parâmetro que falta aparece como lacuna e aquele alerta não é calculado. SPEC-3-010 · CA-3-30.
- [ ] Gerar alertas de estoque, produção, compra, preço, pedido e divergência @"American Goodies" !19/11/2026
  > Regras fixas e explicadas, primeiro com dados de demonstração: ruptura prevista com a antecedência do prazo do fornecedor, produção atrasada, entrega atrasada, preço fora da tolerância e pedido parado. SPEC-3-010 · CA-3-31.
- [ ] Gerar os alertas com os dados reais, sem repetir alerta @"American Goodies" !19/11/2026
  > As regras rodam com o estoque, as compras e os pedidos reais. A mesma situação atualiza o alerta aberto em vez de criar outro. Alerta não compra, não publica ordem e não muda parâmetro. SPEC-3-010 · CA-3-32.
- [ ] Abrir o ciclo de tratamento dos alertas com responsável e histórico @"American Goodies" !23/11/2026
  > Cada alerta passa por aberto, em análise e tratado; tratar exige registrar a ação tomada e quem tratou. O histórico não é apagado, e alerta que volta é ligado ao anterior. SPEC-3-011 · CA-3-33.
- [ ] Mostrar cada alerta só para quem cuida da área, agrupado @"American Goodies" !23/11/2026
  > Compras vê alertas de compra e preço, o PCP os de estoque e produção, o faturamento os de pedido. Alertas iguais ficam agrupados. Desligar uma regra guarda o histórico dela. SPEC-3-011 · CA-3-34.
- [ ] Comparar as vendas de cada produto com o histórico e a sazonalidade @"American Goodies" !24/11/2026
  > Mostra o período atual ao lado do mesmo período de anos anteriores. Sem histórico suficiente pela regra aprovada pelo PCP, mostra 'histórico insuficiente' em vez de inventar sazonalidade. SPEC-3-012 · CA-3-35.
- [ ] Sugerir antecipar compra pela sazonalidade, sem refazer a sugestão da fase 2 @"American Goodies" !24/11/2026
  > O cartão da sugestão ganha o contexto do mesmo período do ano anterior e o prazo do fornecedor. É só sugestão explicada: o cálculo aprovado em 21/10 não muda e uma pessoa decide. SPEC-3-012 · CA-3-36.
- [ ] Medir quantos alertas críticos foram tratados no ciclo @"American Goodies" !25/11/2026
  > Conta os alertas críticos tratados com ação registrada sobre os gerados no ciclo. Ciclo sem alerta crítico mostra 'não aplicável', nunca 100%. SPEC-3-013 · CA-3-37.
- [ ] Deixar o loop dos alertas configurado e desligado no Maestro @"American Goodies" !25/11/2026
  > Meta, medida, fonte e limites do LOOP-01 prontos no Maestro, sem ativar. Ele só liga com a linha de base, o alvo, a janela e quem valida, definidos pelo cliente. SPEC-3-013 · CA-3-38.
- [ ] Montar os relatórios de produção, consumo e perdas declaradas @"American Goodies" !26/11/2026
  > Planejado, produzido e conferido por período e produto; consumo pela ficha ao lado do registrado, com diferença, perda declarada, resíduo e revisão de receita separados. SPEC-3-014 · CA-3-39.
- [ ] Montar os relatórios de compras e de pedidos @"American Goodies" !26/11/2026
  > Comprado e recebido, entregas no prazo e preço médio por fornecedor; pedidos por origem e unidade, aptos e bloqueados e tempo até liberar. Cada relatório mostra período, fonte e hora. SPEC-3-014 · CA-3-40.
- [ ] Abrir o assistente de consulta, só leitura, com a fonte em cada resposta @"American Goodies" !27/11/2026
  > Dentro da plataforma, a gestão pergunta e o assistente responde com período, fonte, hora da atualização e limites. Sem dado suficiente, diz que não há. Usa a IA da própria plataforma. SPEC-3-015 · CA-3-41.
- [ ] Fazer o assistente respeitar o acesso de cada área e não executar nada @"American Goodies" !27/11/2026
  > Pergunta fora da área de quem pergunta recebe 'sem acesso'. Pedido para comprar, publicar, aprovar ou enviar ao Omie recebe a orientação da tela certa; o assistente só sugere. SPEC-3-015 · CA-3-42.
- [ ] Exportar os dados do sistema com as contagens conferidas @"American Goodies" !30/11/2026
  > A gestão baixa os registros do sistema (apontamentos, conferências, compras, recebimentos, pedidos, alertas, parâmetros) com um resumo de quantos há em cada um. Sem senha nem chave no arquivo. SPEC-3-016 · CA-3-43.
- [ ] Provar a recuperação das integrações e da cópia de segurança @"American Goodies" !30/11/2026
  > Falha simulada no Omie e na Nuvemshop mantém o último dado e retoma sem duplicar; a cópia de segurança é restaurada num ambiente separado e as contagens batem. SPEC-3-016 · CA-3-44.
- [ ] Medir as perguntas prioritárias respondidas com fonte e período @"American Goodies" !01/12/2026
  > Para as perguntas prioritárias do cliente, conta as respondidas com fonte e período e aceitas por quem valida. Sem pergunta prioritária no ciclo, mostra 'não aplicável'. SPEC-3-017 · CA-3-45.
- [ ] Deixar o loop do assistente configurado e desligado no Maestro @"American Goodies" !01/12/2026
  > Meta, medida e limites do LOOP-02 prontos no Maestro, sem ativar. Ele só liga com as perguntas prioritárias, a linha de base, o alvo e quem valida. SPEC-3-017 · CA-3-46.
- [ ] Preparar a sessão final: provas de ponta a ponta e roteiro de cada área @"American Goodies" !02/12/2026
  > Todas as provas das fases 1, 2 e 3 rodam de novo; cada área recebe o roteiro do que vai conferir; fica pronta a lista das condições cumpridas e pendentes para ligar cada gravação no Omie. SPEC-3-018 · CA-3-47.
- [ ] Fazer a sessão de validação final com a equipe @"American Goodies" !03/12/2026
  > Único teste do projeto: o fluxo inteiro com dados reais, cada área confere a sua parte e o dono autoriza, uma por vez, as gravações no Omie com a condição cumprida. Aceite e pendências ficam registrados. SPEC-3-018 · CA-3-48 a CA-3-51.
