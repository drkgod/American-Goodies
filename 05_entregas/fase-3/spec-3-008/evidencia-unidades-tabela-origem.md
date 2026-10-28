# Evidência — Acessos de faturamento, unidades, tabela de preço e origem (SPEC-3-008)

Data: 28/10/2026 · Skip v0.0.183 (ref e06ce12), publicada e provada (referência publicada = versão atual). A primeira tentativa de aplicar falhou por erro de infraestrutura do Skip ("file not found on pod"); os arquivos estavam todos no projeto e a repetição passou com o QA verde.

## Construído (no Skip)
- **CA-3-23 acessos:** `acoes-faturamento.ts` (cinco ações na área nova `faturamento`; ação E área; uma única recusa 403 sem pistas; matriz vigente para conta real = não aprovada, logo nenhuma conta real recebe ação nova),
  migration `0036_faturamento_unidades` (acrescenta a área `faturamento`; conferida no banco: 8 áreas, nenhum perfil mudou), rota `GET /backend/v1/pcp/faturamento/acesso`.
- **CA-3-24 unidades:** `unidades.ts` + coleções `pcp_unidades`, `pcp_nomes_canal`, `pcp_tabelas_preco` (regras null). Rotas `POST .../faturamento/unidade` (versão nova a cada mudança, autor e hora do servidor, versão esperada, 409),
  `POST .../nome-canal` (igual ou "a revisar"; nunca altera a unidade), `POST .../nome-canal/decidir` (aceitar grava versão nova do nome operacional com registro; recusar não muda nada), `GET .../unidades`, tela `/unidades`.
- **CA-3-25 tabela e origem:** `POST .../tabela-preco` (versão por vigência; preço da unidade vale mais que o geral `*`), `GET .../faturamento/pedidos` e tela `/pedidos/preparacao`: unidade, tabela vigente, subtotal recalculado ao lado do subtotal do pedido,
  diferença visível, preço diferente da tabela destacado e nunca trocado, item sem preço = subtotal pendente, pedido da Nuvemshop não pago como intenção, origem "a confirmar" sem referência comprovada, "Unidade não cadastrada" bloqueia o apto.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-008, **101 de 101 passaram** (10 novos).
  P3.08-01 (sem `preparar_pedido` → 403 sem pistas), P3.08-02 (nome de canal diferente: "a revisar", operacional mantido), P3.08-03 (item sem preço: subtotal pendente com o item), P3.08-04 (10 caixas a R$ 50,00: R$ 500,00 igual, origem mostrada),
  além de versões, aceitar/recusar, vigência, cliente sem unidade, origem a confirmar e Nuvemshop não paga.
- QA do Skip verde na v0.0.183; migration 0036 aplicada; sem avisos nos logs.

## Limites e pendências
- **P3.08-05 (unidades reais):** o cadastro de clientes do Omie não é lido (chave bloqueada, CL-PEND-006; método sem sonda). As unidades são cadastradas pelo faturamento a partir do código do cliente; contagem e amostra reais ficam para quando a leitura liberar e os dados das unidades chegarem (CL-PEND-010).
- **Campos do pedido do Omie** (`cabecalho.codigo_cliente`, `det[].produto.valor_unitario`, `total_pedido.valor_total_pedido`) são hipóteses não conferidas numa amostra real: campo ausente aparece como pendente, nunca zero. A tela avisa isso.
- **Lunet pelo Omie:** o marcador que identifica o pedido da Lunet ainda não foi identificado; a rota não o adivinha (sem referência de integração = Omie direto; com referência fora da Nuvemshop = a confirmar). Pendência para o faturamento/consultor.
- **Tabela do Omie:** não lida; vale a tabela operacional versionada (plano B da SPEC).
- **P3.08-06 (regressão dos canais e do painel da fase 1):** os testes `spec-1-*` não foram reexecutados; painel e classificação de origem da fase 1 não foram alterados.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste). Nenhuma conta real recebeu as ações novas (matriz CL-003). Nada grava no Omie.
