# Evidência — Parâmetros e alertas (SPEC-3-010)

Data: 28/10/2026 · Skip v0.0.186 (ref 36d4ed6), aplicada com QA verde na primeira tentativa e publicada; migration 0038 aplicada.

## Construído (no Skip)
- **CA-3-30 parâmetros:** coleções `pcp_parametros_alerta` (versões aprovadas), `pcp_familias` (um produto numa família no máximo), `pcp_alertas_lacunas`. Rotas `GET /backend/v1/pcp/alertas/parametros`, `POST .../parametros/aprovar` (`editar_parametros`; versão nova a cada mudança; mesmo conteúdo = replay; versão esperada; valor negativo ou repetido recusado; campo vazio fica lacuna, nunca zero) e `POST .../familia`. O parâmetro do produto vale mais que o da família, campo a campo; a linha de família `*` guarda parâmetros gerais (tempo máximo de pedido parado). Gravidade por tipo na versão aprovada: sem ela o alerta do tipo não é calculado. Tela `/parametros/alertas` (a SPEC pedia a seção dentro de `/parametros`; ficou em rota própria para não mexer na tela de parâmetros de produção da fase 2).
- **CA-3-31 regras:** `alertas.ts` com os seis tipos. Estoque (saldo + a receber até o prazo − consumo no prazo < mínimo; antecedência = prazo do fornecedor; crítico se o projetado chega a zero), produção atrasada, entrega atrasada e compra aprovada sem pedido, preço acima da tolerância, pedido parado e divergência sem decisão. Cada alerta guarda regra, números usados, versão dos parâmetros, hora do dado e aviso de dado desatualizado (mais de 24 h).
- **CA-3-32 rodada:** `POST .../alertas/rodar` (`editar_parametros`), `GET /backend/v1/pcp/alertas`, tela `/alertas`. A chave é regra + item + referência: a mesma situação atualiza o alerta aberto (contador de atualizações) em vez de criar outro. A rota só lê dados locais e só escreve alertas e lacunas: nenhum alerta compra, publica ordem, muda parâmetro, grava no Omie ou gera ação financeira (resposta traz `acoes_executadas: 0`).

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-010, **125 de 125 passaram** (10 novos em `spec-3-010.test.mjs`).
  P3.10-01 (item sem mínimo: lacuna, zero alerta), P3.10-02 (mesma situação em duas rodadas: um alerta, atualizado), P3.10-03 (saldo 8, a receber 0, consumo 2/dia, mínimo 10, prazo 5: ruptura prevista, crítico, projetado −2), P3.10-04 (um caso de cada tipo com os números),
  além de produto sobre família, validação, compra chegando no prazo, unidade incompatível, fonte desatualizada, parâmetro ausente por regra, nova ocorrência depois de tratado e ausência de ação no alerta.
- QA do Skip verde na v0.0.186.

## Limites e pendências
- **P3.10-05 (rodada com dados reais) só em parte:** a rodada usa hoje quatro fontes locais: compra aprovada sem pedido, entrega atrasada (`pcp_entregas_compra`, vazia até a leitura real do Omie), preço (cotações escolhidas contra o último preço) e pedido manual parado. **Sem fonte ligada:** ruptura de estoque (saldo e consumo reais dependem da leitura do Omie, CL-PEND-006), produção atrasada (programação), divergência de conferência e intenção pendente da Nuvemshop (o pedido não traz data conhecida). A resposta da rodada e a tela listam isso; nenhum alerta é inventado. As regras desses tipos estão provadas só com demonstração.
- **Pedido bloqueado do Omie:** a hora em que ficou bloqueado não é guardada; só o pedido manual tem "desde". Pedido integrado parado fica para depois.
- **Parâmetros reais** não existem (CL-PEND-001, CL-PEND-008): sem versão aprovada a rodada não calcula nada.
- **Rodada agendada:** a rota existe e roda por botão; o agendamento automático não foi ligado (depende da cadência que o PCP quiser e de fontes reais).
- Alerta que sai da situação continua aberto até o tratamento (SPEC-3-011); não há fechamento automático.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); hooks repetem a lógica do módulo e só o módulo tem teste automático. Regressão das fases 1 e 2 não reexecutada. Nenhuma conta real recebeu ação nova.
