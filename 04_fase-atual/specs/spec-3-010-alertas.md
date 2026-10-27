# SPEC-3-010 — Parâmetros e alertas de estoque, produção, compra, preço, pedido e divergência

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (PCP, Compras e faturamento) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 4 (parâmetros por produto e família; alertas de estoque, produção, compra, preço e pedido; antecedência pelo prazo do fornecedor; regras "alertas não compram, não publicam OP e não alteram parâmetros" e "duplicatas não geram nova ação"); resultado da antiga fase 4 (ruptura, atraso, preço, divergência e pedidos pendentes); orientação P5 (sem refazer as sugestões da fase 2); RQ-013; CL-PEND-001  
**Degrau da solução:** reuso — a tela `/parametros` (versão aprovada) e os dados das SPECs 3-001 a 3-009; acrescenta regras de alerta determinísticas.

## Contexto e decisões fechadas

- **Estado atual:** a tela `/parametros` guarda parâmetros de produção aprovados em versão (capacidade, calendário, margem, mínimos, lotes, horizonte, prazo); as sugestões da fase 2 calculam necessidade, mas nada avisa ninguém. Não há alerta no sistema.
- **Estado desejado:** parâmetros de alerta por produto ou família, em versão aprovada; regras fixas e explicadas geram alertas de estoque (ruptura prevista), produção (atraso), compra (entrega atrasada e compra aprovada sem pedido), preço (fora da tolerância), pedido (parado para faturar e intenção pendente) e divergência (conferência sem decisão); com os dados reais, a mesma situação atualiza o alerta aberto.
- **Decisões já fechadas:**
  - As sugestões de produção e de compra da fase 2 não são recalculadas; o alerta de ruptura usa saldo, compras a receber e prazo do fornecedor.
  - Parâmetro ausente: o alerta daquele item não é calculado e a lacuna aparece; nunca valor padrão.
  - Família é um agrupamento de produtos definido pelo PCP; parâmetro do produto prevalece sobre o da família.
  - Alerta não compra, não publica ordem, não muda parâmetro e não gera ação financeira.
  - Gravidade (crítico ou atenção) é definida por regra na versão aprovada de parâmetros.
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/alertas`, cada alerta mostra tipo, item, gravidade, regra, números usados (saldo, mínimo, prazo, data prevista, preço, tolerância) e hora. Em `/parametros`, o PCP vê os parâmetros de alerta por produto e família e a lista de lacunas.

## Limites e dependências

- **Inclui:** parâmetros de alerta versionados; famílias; regras dos seis tipos; chave do alerta para não repetir; execução com dados reais.
- **Fora de escopo:** tratamento e destinatário (SPEC-3-011); sazonalidade (SPEC-3-012); aviso por WhatsApp ou e-mail; ação automática.
- **Entradas e pré-condições:** catálogo, estoque, 90 dias e sugestões (SPEC-3-001); entregas e preços (SPECs 3-004 a 3-006); pedidos preparados (SPEC-3-009); conferências da fase 2.
- **Saídas/artefatos:** coleções `pcp_parametros_alerta`, `pcp_familias`, `pcp_alertas`; rotina de cálculo; evidências em `05_entregas/fase-3/spec-3-010/`.
- **Dependências e responsáveis:** PCP e Compras informam e aprovam os parâmetros (CL-PEND-001); Maestro constrói.
- **Atores e permissões mínimas:** `editar_parametros` edita (já existe); aprovação de versão como na fase 2; consulta por área (SPEC-3-011).
- **Superfícies/arquivos/configurações afetadas:** `/parametros`, `/alertas`, rotina agendada de alertas.
- **Risco e plano B:** sem parâmetros reais, os alertas reais ficam como lacunas; a construção segue com parâmetros de demonstração.
- **Rollback ou reversão:** desligar a rotina; alertas ficam como histórico.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Parâmetros de alerta | Skip Cloud | Produto ou família, estoque mínimo, prazo do fornecedor (padrão da SPEC-3-003), tolerância de preço, atraso aceito de entrega, tempo máximo parado para faturar, gravidade por regra, versão, aprovador | `editar_parametros` | Versão aprovada; repetição idempotente | Valor ausente: lacuna |
| Alertas | Lotes ativos e registros locais | Tipo, item, regra, versão dos parâmetros, valores usados, gravidade, chave (regra + item + referência + período), estado, hora | Servidor | Mesma chave atualiza o alerta aberto | Fonte desatualizada: alerta marcado com a hora do dado |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 Estoque | Saldo + compras a receber até o prazo do fornecedor < mínimo, considerando o consumo previsto da sugestão | Alerta "ruptura prevista em N dias", com antecedência igual ao prazo do fornecedor | Sem mínimo, prazo ou consumo: lacuna | Escopo, antiga fase 4 |
| RN-02 Produção | Ordem programada não iniciada depois do dia programado | Alerta de produção atrasada | — | Escopo |
| RN-03 Compra | Data prevista vencida há mais que o atraso aceito, com restante > 0; ou compra aprovada sem pedido há mais que o prazo definido | Alerta de entrega atrasada ou de pedido não lançado | — | Escopo |
| RN-04 Preço | Cotação ou pedido acima da tolerância sobre o histórico | Alerta de preço | Sem tolerância: lacuna | Escopo |
| RN-05 Pedido | Pedido bloqueado para faturar há mais que o tempo máximo; intenção da Nuvemshop pendente há mais que o tempo máximo | Alerta de pedido parado | — | Escopo |
| RN-06 Divergência | Conferência com diferença sem decisão do PCP | Alerta de divergência | — | Escopo; fase 2 |
| RN-07 | Mesma chave de alerta aberta | Atualiza valores e hora; não cria outro | — | Escopo |

## Fluxo e regras

1. Abrir os parâmetros de alerta e as famílias em `/parametros`, com versão aprovada e lacunas.
2. Construir as regras RN-01 a RN-07 com dados de demonstração.
3. Ligar a rotina aos dados reais.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Saldo 8 KG, a receber 0, consumo 2 KG/dia, mínimo 10 KG, prazo 5 dias | Alerta crítico de ruptura prevista | — |
| Limite | Mesmo item na rodada seguinte com saldo 6 KG | Mesmo alerta atualizado | — |
| Falha | Item sem mínimo cadastrado | Lacuna; nenhum alerta | PCP cadastra |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `parametros.ts` e `sugestao.ts` no Skip; SPECs 3-001 a 3-009.
2. **Alterar somente:** parâmetros de alerta, famílias, regras, rotina e a tela `/alertas`.
3. **Não alterar:** o cálculo das sugestões; os parâmetros de produção aprovados.
4. **Executar nesta ordem:** parâmetros e famílias; regras com demonstração; dados reais.
5. **Parar e pedir validação quando:** nunca para construir; parâmetro real ausente é lacuna.
6. **Estado válido ao parar:** sugestões e parâmetros da fase 2 iguais.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Parâmetros de alerta e famílias em versão aprovada, com lacunas.
- [ ] Seis tipos de alerta com valores explicados.
- [ ] Chave de alerta sem repetição.
- [ ] Rotina com dados reais.
- [ ] Evidências em `05_entregas/fase-3/spec-3-010/`.

## Critérios de aceite

- [ ] **CA-3-30:** parâmetros de alerta por produto ou família ficam em versão aprovada; o do produto prevalece sobre o da família; parâmetro ausente aparece como lacuna e aquele alerta não é calculado.
- [ ] **CA-3-31:** com dados de demonstração, as regras geram alertas de ruptura prevista (antecedência igual ao prazo do fornecedor), produção atrasada, entrega atrasada, compra aprovada sem pedido, preço fora da tolerância, pedido parado e divergência sem decisão, cada um com os números usados.
- [ ] **CA-3-32:** com os dados reais, a mesma situação atualiza o alerta aberto em vez de criar outro; nenhum alerta compra, publica ordem, muda parâmetro ou gera ação financeira.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.10-01: item sem mínimo | `node --test tests/pcp/spec-3-010.test.mjs` | Lacuna; zero alerta | `05_entregas/fase-3/spec-3-010/` |
| RED | P3.10-02: mesma situação em duas rodadas | Fixture | Um alerta, atualizado | Idem |
| GREEN | P3.10-03: saldo 8, consumo 2/dia, mínimo 10, prazo 5 | Fixture | Ruptura prevista, crítico | Idem |
| GREEN | P3.10-04: um caso de cada tipo | Fixture | Seis tipos com os números | Idem |
| GREEN | P3.10-05: rotina com dados reais | Skip | Alertas com a hora do dado; nenhuma ação executada | Idem |
| REFACTOR/REGRESSÃO | P3.10-06: sugestões e parâmetros da fase 2 | Testes da fase 2 | Verdes | Idem |

**Dados/fixtures:** parâmetros, famílias e situações de demonstração para os seis tipos.  
**Caminhos de erro obrigatórios:** parâmetro ausente, fonte desatualizada, repetição, unidade incompatível.  
**Evidência exigida:** saída dos testes e captura da tela.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** PCP, Compras e faturamento
- **O que confere:** um alerta real de cada área que existir no dia, com os números; um item sem parâmetro aparecendo como lacuna.
- **Resultado esperado:** alertas explicados e sem repetição; nenhuma ação automática.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/alertas` com um alerta de ruptura e seus números.
- **Como operar depois:** PCP mantém os parâmetros; a rotina roda sozinha.
- **Como monitorar:** número de lacunas e hora da última rodada.
- **Pendência conhecida:** parâmetros reais (CL-PEND-001).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Cadastrar os parâmetros de alerta por produto e por família | American Goodies | SPEC-3-010 | CA-3-30 | P3.10-01 | 05_entregas/fase-3/spec-3-010/ | — | ☐ |
| pendente | Gerar alertas de estoque, produção, compra, preço, pedido e divergência | American Goodies | SPEC-3-010 | CA-3-31 | P3.10-03, P3.10-04 | 05_entregas/fase-3/spec-3-010/ | — | ☐ |
| pendente | Gerar os alertas com os dados reais, sem repetir alerta | American Goodies | SPEC-3-010 | CA-3-32 | P3.10-02, P3.10-05, P3.10-06 | 05_entregas/fase-3/spec-3-010/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
