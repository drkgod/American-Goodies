# Evidência — Relatórios comparativos (SPEC-3-014)

Data: 29/10/2026 · Skip v0.0.191 (ref 7fd4d2b), aplicada com QA verde na primeira tentativa e publicada; migration 0042 aplicada. Nenhuma chamada ao Omie.

## Construído
- **`relatorios.ts` (módulo provado):** produção (planejado × produzido × conferido por produto e unidade; parcela ausente deixa o total null), consumo (previsto pela ficha × registrado com **diferença sem causa, perda declarada, resíduo e revisão de receita em colunas separadas**; consumo acima da ficha sem declaração é "diferença sem causa (não é perda)"; sem ficha compatível não calcula), taxa de perda declarada (perda ÷ produção realizada, mesma unidade, denominador escrito, ou "não calculável"), compras (comprado × recebido por unidade, entregas no prazo, preço médio ponderado por fornecedor e unidade, linhas sem preço viram lacuna), pedidos (por origem e unidade, aptos/bloqueados/liberados, horas até liberar; intenção da Nuvemshop só como contagem, fora do confirmado), acesso por bloco (sem a área, o bloco não existe) e exportação CSV com neutralização de células que começam como fórmula.
- **Rota `GET /backend/v1/pcp/relatorios?bloco=…&de=…&ate=…&produto=…` e tela `/relatorios`:** um bloco por chamada; cada bloco exige a sua área (produção/consumo: planejamento ou apontar_producao; compras: compras; pedidos: faturamento) e, sem ela, devolve a mesma recusa 403 de quem não tem perfil. Todo bloco traz período, fonte, hora da atualização, lacunas e "sem dados no período" (nunca zero). Exportação em planilha (CSV) pela tela.
- **Compras** lê requisições aprovadas, cotações escolhidas e recebimentos do sistema (a ligação do recebimento ao pedido é pelo id da requisição). **Pedidos** lê as linhas de preparação; a migration 0042 acrescentou a elas origem, unidade, situação do canal e último estado, gravados pela fila a cada leitura (cópias derivadas).

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-014, **158 de 158 passaram** (9 novos em `spec-3-014.test.mjs`).
  P3.14-01 (perda sem produção no período ou com unidade diferente: não calculável), P3.14-02 (sem a área de compras o bloco não aparece), P3.14-03 (100 UN produzidas, 4 UN de perda: 4% com "100 UN produzidas"), P3.14-04 (compras e pedidos de demonstração: totais conferem, preço médio ponderado 11,5; intenção fora do confirmado; 18 h até liberar),
  além de consumo 5,4 KG para ficha de 5 KG (diferença sem causa 0,4 KG, não é perda) e das quatro categorias separadas.
- P3.14-05 (painel da fase 1): o painel não foi alterado; seus testes `spec-1-*` não foram reexecutados.

## Limites e pendências
- **Produção e consumo sem fonte ligada:** não há no banco coleção de apontamentos ou ordens (as telas de apontamento da fase 2 não gravam no servidor), então os dois blocos respondem "sem dados no período" com a lacuna explicada, sem número inventado. As regras de cálculo estão provadas só com demonstração. Ligar a fonte exige que os apontamentos passem a ser guardados; fica como pendência para o consultor decidir.
- **Entregas do Omie** ainda não carregadas (CL-PEND-006): "entregas no prazo" usa só os recebimentos registrados no sistema. Pedidos do Omie sem frete, volumes ou liberação registrados ainda não entram no bloco de pedidos.
- O filtro por unidade citado na SPEC não foi construído (há filtro por período e produto). Produtos sem busca no catálogo.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); a rota repete a lógica do módulo. Nenhuma conta real recebeu ação nova.
