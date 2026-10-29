# Evidência — Comparação histórica, sazonalidade e antecipação (SPEC-3-012)

Data: 29/10/2026 · Skip v0.0.188 (ref cd33dd6), aplicada com QA verde na primeira tentativa e publicada; migration 0040 aplicada. Não foi feita nenhuma chamada ao Omie.

## Construído (no Skip)
- **CA-3-35 comparação e suficiência:** `historico-vendas.ts`; coleções `pcp_historico_vendas_periodo` (vendas por produto, mês e página lida; reler a página substitui, idempotente), `pcp_historico_vendas_cobertura` (até que página cada mês foi lido; mês só é "lido" quando a última página entrou) e `pcp_regra_sazonalidade` (versões da regra do PCP). Rotas `GET /backend/v1/pcp/vendas/historico` (mês de referência ao lado do mesmo mês dos cinco anos anteriores, com cobertura de cada ciclo = meses lidos nos 12 meses que terminam no mês do ciclo, índice sobre a média do ano e variação sobre os anos anteriores), `POST .../vendas/regra` (`editar_parametros`; versão nova; replay idempotente) e `POST .../vendas/carregar` (uma página do Omie por chamada; 425 ou "consumo redundante" não repete e guarda a próxima tentativa +12 h; exige `editar_parametros`). Tela `/historico-vendas`. **Sem regra aprovada, ou com ciclos abaixo dela: "histórico insuficiente" e nenhuma sazonalidade.** Mês não lido nunca vira zero.
- **CA-3-36 antecipação:** com histórico suficiente e sazonalidade positiva, a sugestão explicada diz quanto o mês costuma vender acima da média e a data de compra = data necessária − prazo do fornecedor (prazo vem dos parâmetros de alerta, produto antes da família; sem prazo, sem data). Sazonalidade negativa: "não há o que antecipar". "Levar para a requisição" cria requisição em rascunho pela rota da SPEC-3-005 (`origem` única por produto e mês, sem duplicar); nada é comprado. O baseline90-v1 e a memória de cálculo não foram tocados. Diferença de vendas nunca é chamada de perda.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-012, **141 de 141 passaram** (8 novos em `spec-3-012.test.mjs`).
  P3.12-01 (um ano, regra de dois ciclos: histórico insuficiente), P3.12-02 (sem regra: insuficiente, sem data), P3.12-03 (dois anos, dezembro acima da média, prazo 10 dias: contexto e data sugerida 21/11/2026),
  além de sem prazo, sazonalidade negativa, meses sem leitura (cobertura 58,33% mostrada, sem sazonalidade, mês não lido = nulo), produto sem vendas em mês lido (zero), agregação do Omie (cancelado, denegado, devolvido e sem quantidade ficam de fora) e validação da regra.
- QA do Skip verde na v0.0.188.

## Limites e pendências
- **P3.12-04 (histórico real) não provado:** a leitura do Omie está bloqueada (CL-PEND-006); a rota de carga existe mas não foi chamada, então as coleções estão vazias e a tela mostra "histórico insuficiente". A profundidade do histórico de vendas no Omie continua sem medição. O filtro por data de faturamento do `ListarPedidos` não foi visto numa resposta real (contrato registrado em `07-sistemas/pcp/contratos-fase-3.md`).
- **P3.12-05 (oráculos do baseline90-v1):** o cálculo não foi alterado nem reexecutado; os testes `spec-2-006-sugestao` não foram rodados aqui.
- **Regra de suficiência:** não existe valor real (CL-PEND-001); a definição de cobertura do ciclo (12 meses terminando no mês do ciclo) é a desta construção e o PCP pode pedir outra. Resolução mensal: a semana, citada na SPEC, não foi construída.
- O bloco está em página própria (`/historico-vendas`); `/catalogo` e `/sugestoes` não foram alterados (o cartão de sugestões é uma demonstração de caso fixo desde a SPEC-3-005). O produto é digitado, sem busca no catálogo.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); os hooks repetem a lógica do módulo. Nenhuma conta real recebeu ação nova.
