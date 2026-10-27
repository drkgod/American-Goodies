# SPEC-3-012 — Comparação histórica, sazonalidade e sugestão de antecipação

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (PCP e Compras) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 4 (comparações históricas e sazonais; sugestão explicada sujeita à revisão humana; "histórico insuficiente impede inferir sazonalidade"; "variação de consumo não é perda confirmada"); fluxo-alvo 13 (sazonalidade com evidência suficiente e antecedência coerente com o prazo de compra); orientação P5 (sem refazer as sugestões da fase 2); RQ-003/013; CL-PEND-001  
**Degrau da solução:** reuso — lê o histórico de vendas do Omie e acrescenta contexto ao cartão de sugestão da fase 2, sem mudar o cálculo.

## Contexto e decisões fechadas

- **Estado atual:** as sugestões da fase 2 usam os últimos 90 dias (baseline90-v1). Não há comparação com anos anteriores. A profundidade do histórico de vendas no Omie não foi medida.
- **Estado desejado:** para cada produto, o período atual ao lado do mesmo período de anos anteriores; quando houver histórico suficiente pela regra aprovada, o cartão da sugestão mostra o contexto sazonal e, para o insumo, uma sugestão explicada de antecipar a compra pelo prazo do fornecedor.
- **Decisões já fechadas:**
  - O baseline90-v1 não muda; a sazonalidade é contexto e sugestão, não fórmula nova.
  - O mínimo de histórico para falar em sazonalidade é parâmetro aprovado pelo PCP (quantos ciclos do mesmo período e cobertura mínima, CL-PEND-001). Sem ele, ou sem histórico, a tela mostra "histórico insuficiente".
  - Sugestão de antecipação não cria requisição sozinha; a pessoa aceita e segue o fluxo da SPEC-3-005.
  - Diferença de consumo não é chamada de perda.
- **Bloqueios:** nenhum para construir. Leitura do histórico depende de o Omie aceitar consultas (CL-PEND-006).

## Resultado observável

No cartão de cada produto, um bloco "Comparação com anos anteriores" mostra as vendas do período atual e do mesmo período nos anos com dados, a variação e a cobertura. Quando o histórico basta, o cartão da sugestão de compra mostra, por exemplo: "no mesmo mês do ano passado as vendas foram 30% maiores; com prazo do fornecedor de 10 dias, considerar antecipar a compra para o dia X". Sem histórico: "histórico insuficiente".

## Limites e dependências

- **Inclui:** leitura do histórico de vendas por período; comparação com anos anteriores; regra de suficiência; contexto sazonal no cartão; sugestão de antecipação explicada.
- **Fora de escopo:** mudar o baseline90-v1; previsão estatística ou por IA; requisição automática.
- **Entradas e pré-condições:** pedidos de venda do Omie (`ListarPedidos`, mapa de firmes e data de faturamento aprovados em 21/10); prazo do fornecedor (SPEC-3-003); sugestões (SPEC-3-001).
- **Saídas/artefatos:** coleção `pcp_historico_vendas_periodo`; bloco de comparação; contexto no cartão; evidências em `05_entregas/fase-3/spec-3-012/`.
- **Dependências e responsáveis:** PCP aprova a regra de suficiência (CL-PEND-001); Maestro constrói.
- **Atores e permissões mínimas:** consulta por área; aceitar a sugestão segue `editar_requisicao`.
- **Superfícies/arquivos/configurações afetadas:** `/catalogo` (detalhe do produto), `/sugestoes`.
- **Risco e plano B:** se o Omie só tiver poucos anos de vendas, a tela mostra "histórico insuficiente" e o resto funciona.
- **Rollback ou reversão:** desligar o bloco; o cartão volta ao da fase 2.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Omie → histórico por período | Omie | `ListarPedidos` com o mapa de firmes de 21/10; agregação por produto, mês e semana na data de faturamento | Segredo no backend | Sub-lotes por período com pausa; chave = aplicativo + produto + período | Período não lido: cobertura incompleta, sem inventar |
| Regra de suficiência | Skip Cloud | Ciclos mínimos do mesmo período, cobertura mínima por ciclo, versão, aprovador | `editar_parametros` | Versão aprovada | Sem regra: "histórico insuficiente" |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Histórico abaixo da regra aprovada | "Histórico insuficiente"; nenhuma sazonalidade | — | Escopo, antiga fase 4 |
| RN-02 | Histórico suficiente e variação no período seguinte | Contexto e sugestão de antecipação explicada | — | Escopo |
| RN-03 | Data sugerida de compra | Data necessária menos o prazo do fornecedor | Sem prazo: sem data sugerida | Fluxo-alvo 13 |
| RN-04 | Pessoa aceita a sugestão | Vai para requisição (SPEC-3-005); nada é comprado | — | Escopo |
| RN-05 | Consumo diferente da ficha | Chamado de diferença, nunca de perda | — | Escopo |

## Fluxo e regras

1. Ler e agregar o histórico de vendas por período.
2. Mostrar a comparação com anos anteriores e a cobertura.
3. Aplicar a regra de suficiência; quando passar, mostrar o contexto e a sugestão de antecipação.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Dois anos completos; dezembro 30% acima da média | Contexto e data sugerida pelo prazo de 10 dias | — |
| Limite | Um ano só, com regra de dois ciclos | "Histórico insuficiente" | — |
| Falha | Meses sem leitura | Cobertura incompleta mostrada; sem sazonalidade | Ler os meses que faltam |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `07-sistemas/pcp/contratos-fase-2.md` (pedidos firmes); `sugestao.ts` no Skip.
2. **Alterar somente:** histórico por período, comparação, regra de suficiência e o bloco no cartão.
3. **Não alterar:** a fórmula baseline90-v1 e a memória de cálculo.
4. **Executar nesta ordem:** histórico; comparação; regra e sugestão de antecipação.
5. **Parar e pedir validação quando:** nunca para construir; regra de suficiência ausente mostra "histórico insuficiente".
6. **Estado válido ao parar:** sugestões da fase 2 iguais.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Histórico por período com cobertura.
- [ ] Comparação com anos anteriores.
- [ ] Regra de suficiência aprovada ou "histórico insuficiente".
- [ ] Sugestão de antecipação explicada, sem mudar o cálculo.
- [ ] Evidências em `05_entregas/fase-3/spec-3-012/`.

## Critérios de aceite

- [ ] **CA-3-35:** cada produto mostra o período atual ao lado do mesmo período nos anos com dados, com a variação e a cobertura; abaixo da regra aprovada pelo PCP, mostra "histórico insuficiente" e nenhuma sazonalidade.
- [ ] **CA-3-36:** com histórico suficiente, o cartão da sugestão mostra o contexto sazonal e a data sugerida de compra pelo prazo do fornecedor; o cálculo baseline90-v1 não muda; aceitar leva à requisição e nada é comprado.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.12-01: um ano de dados, regra de dois ciclos | `node --test tests/pcp/spec-3-012.test.mjs` | "Histórico insuficiente" | `05_entregas/fase-3/spec-3-012/` |
| RED | P3.12-02: sem regra aprovada | Fixture | "Histórico insuficiente" | Idem |
| GREEN | P3.12-03: dois anos, dezembro 30% acima, prazo 10 dias | Fixture | Contexto e data sugerida | Idem |
| GREEN | P3.12-04: histórico real | Leitura no Skip | Comparação com cobertura | Idem |
| REFACTOR/REGRESSÃO | P3.12-05: oráculos do baseline90-v1 | Testes da fase 2 | Mesmos números | Idem |

**Dados/fixtures:** séries de vendas de demonstração com um e dois anos; prazo de fornecedor.  
**Caminhos de erro obrigatórios:** sem regra, histórico curto, meses sem leitura, sem prazo do fornecedor.  
**Evidência exigida:** saída dos testes e captura do cartão.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** PCP e Compras
- **O que confere:** a comparação de dois produtos reais com anos anteriores; um produto com "histórico insuficiente"; uma sugestão de antecipação, se o histórico permitir.
- **Resultado esperado:** comparação confere com o Omie; nada de sazonalidade sem histórico.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** cartão de um produto com a comparação.
- **Como operar depois:** o PCP revê a regra de suficiência quando quiser.
- **Como monitorar:** cobertura do histórico por produto.
- **Pendência conhecida:** regra de suficiência (CL-PEND-001).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Comparar as vendas de cada produto com o histórico e a sazonalidade | American Goodies | SPEC-3-012 | CA-3-35 | P3.12-01, P3.12-02, P3.12-04 | 05_entregas/fase-3/spec-3-012/ | Leitura do Omie liberada (CL-PEND-006); bloqueio é pendência localizada | ☐ |
| pendente | Sugerir antecipar compra pela sazonalidade, sem refazer a sugestão da fase 2 | American Goodies | SPEC-3-012 | CA-3-36 | P3.12-03, P3.12-05 | 05_entregas/fase-3/spec-3-012/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
